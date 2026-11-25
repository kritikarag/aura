// Aura reflection worker (Cloudflare Workers)
// Holds your Claude API key as a secret and returns one reflection per request.
// It never stores or logs journal entries.
//
// Settings (Worker > Settings > Variables and Secrets):
//   ANTHROPIC_API_KEY (Secret) your key from the Claude Console (platform.claude.com)
//   ALLOWED_ORIGIN   (Text)    your site, e.g. https://yourname.github.io
//   MODEL            (Text, optional) default: claude-haiku-5-5
//   PER_USER_DAILY   (Text, optional) default: 15 reflections per person per day
//   GLOBAL_DAILY     (Text, optional) default: 500 reflections per day in total
// Optional but recommended: bind a KV namespace as AURA_LIMITS so limits survive restarts.

const RULES = `You are the reflection feature of Aura, a private journaling app for people in India dealing with depression, loneliness and difficult relationships. You are a mirror, not a cheerleader and not a friend.
Rules:
- Reflect back what the person wrote and felt, close to their own words. Validate feelings ("that sounds painful"), but do not confirm interpretations you cannot know from one side of the story (e.g. "they did it on purpose").
- Never minimise real harm. If they describe clear mistreatment, do not doubt them or make it their fault.
- Offer another reading only as a gentle question, never a verdict.
- If the entry shows the WRITER crossing someone's boundary or adding to a conflict (snapping, checking a partner's phone, guilt-tripping, silent treatment, harsh words), name it kindly and constructively: what happened, how it may have landed for the other person, one thing to try next time. Frame it as growth, never blame. If there is nothing like that, leave yourPart empty. Do not invent flaws.
- If the writer describes their own anger at someone, acknowledge the hurt or fear underneath it, name how it may have landed on the other person, and suggest their pause plan (stepping away, breathing, coming back later). Trauma can explain behaviour but never excuses it; say this gently if they justify hurting someone.
- No labels or diagnoses of anyone (no "narcissist", no "you have depression"). No flattery. No "I'm always here for you". You are an AI and can be wrong.
- If the same belief appears in the recent entries too, gently point out the pattern.
- The small step should involve real life where possible: rest, a real person, a listener, or the person's circle.
- If the entry suggests they may be in danger, make the step about reaching Tele-MANAS (14416) or someone they trust, warmly.
- Plain, warm, short sentences. Each field 1-3 sentences.
Return ONLY a JSON object: {"hear":"...","angle":"...","yourPart":"... or empty string","step":"..."}`;

const mem = new Map(); // fallback counter if no KV is bound

async function bump(env, key, limit) {
  if (env.AURA_LIMITS) {
    const n = parseInt((await env.AURA_LIMITS.get(key)) || "0", 10);
    if (n >= limit) return false;
    await env.AURA_LIMITS.put(key, String(n + 1), { expirationTtl: 60 * 60 * 26 });
    return true;
  }
  const n = mem.get(key) || 0;
  if (n >= limit) return false;
  mem.set(key, n + 1);
  return true;
}

function cors(env, origin) {
  const ok = origin && origin === env.ALLOWED_ORIGIN;
  return {
    "Access-Control-Allow-Origin": ok ? origin : "null",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
  };
}

function json(body, status, headers) {
  return new Response(JSON.stringify(body), { status, headers: { ...headers, "Content-Type": "application/json" } });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const h = cors(env, origin);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: h });
    if (request.method !== "POST") return json({ error: "method" }, 405, h);
    if (origin !== env.ALLOWED_ORIGIN) return json({ error: "origin" }, 403, h);

    let body;
    try { body = await request.json(); } catch { return json({ error: "bad request" }, 400, h); }
    const entry = String(body.entry || "").slice(0, 4000).trim();
    if (!entry) return json({ error: "empty" }, 400, h);
    const prompt = String(body.prompt || "").slice(0, 300);
    const recent = String(body.recent || "").slice(0, 1200);
    const lang = body.lang === "Hindi (Devanagari script)" ? "Hindi (Devanagari script)" : "English";

    const day = new Date().toISOString().slice(0, 10);
    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    const perUser = parseInt(env.PER_USER_DAILY || "15", 10);
    const global = parseInt(env.GLOBAL_DAILY || "500", 10);
    if (!(await bump(env, `g:${day}`, global))) return json({ error: "limit" }, 429, h);
    if (!(await bump(env, `u:${day}:${ip}`, perUser))) return json({ error: "limit" }, 429, h);

    const model = env.MODEL || "claude-haiku-5-5";
    const user = `Reply in ${lang}.

Recent earlier entries (for noticing patterns only):
${recent || "(none)"}

Entry to reflect on${prompt ? ` (prompt: "${prompt}")` : ""}:
${entry}`;

    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: 1200,
        system: RULES,
        messages: [{ role: "user", content: user }],
      }),
    });
    if (!r.ok) return json({ error: "upstream" }, 502, h);
    const data = await r.json();
    const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("");
    if (!text) return json({ error: "empty reply" }, 502, h);
    return json({ text }, 200, h);
  },
};
