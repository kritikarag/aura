# Aura (test version)

Aura is a private journaling and support web app for people dealing with depression, loneliness, childhood trauma and strained relationships. It works in English and Hindi and runs in any phone browser.

> **Early prototype.** Aura is for adults (18+) and isn't a replacement for therapy, a doctor or emergency help.
> In India, if you're in danger, call **112**. To talk to a trained counsellor (free, 24×7), call **Tele-MANAS: 14416** or **1-800-891-4416**.

## Why Aura exists

Many people struggle alone. Therapy is expensive and often taboo, retelling your past to every new person is exhausting, and most tools either take sides or just tell you what you want to hear. Aura is a neutral space to understand yourself, calm down in hard moments, and find your way back to real people and real help, whether you're healing from what was done to you or changing patterns you want to leave behind.

## Features

### Journal
- Write, or tap the mic and talk (voice typing works in Chrome; other browsers can use the keyboard's own mic).
- Guided prompts or free writing, with a daily mood check-in.
- Look back at older entries to see how far you've come.

### Reflect with Aura (AI)
- An opt-in reflection on a single entry, written by an AI.
- It mirrors what you wrote, validates feelings without confirming one-sided interpretations, and asks gentle questions.
- When it's relevant, it kindly points out the writer's own part (for example, snapping or crossing a boundary), framed as growth, never blame.
- It never diagnoses, labels anyone, flatters, or acts as a companion.
- If an entry suggests danger, it points to Tele-MANAS and trusted people.

### My Story
- Write your history once, in three layers: short, fuller and private.
- Choose which layer a listener sees, so you never have to start from the beginning.
- Optional tags for things that are hard to put into words.

### Calm now
- 13 short exercises in four groups:
  - **Breathing:** long-exhale breath, box breathing, double sigh
  - **Body and senses:** 5-4-3-2-1, tense and release, butterfly hug, hand on heart, looking around slowly
  - **Imagery:** leaves on a stream, a calm place, Just watch (animated scenes)
  - **Thinking:** count back by 7, worry later
- Star the ones that help, and they become your go-to on Today and Help now.
- Eyes-closed mode, with voice or soft-tone guidance.

### Pause plan
- A personal plan for when anger rises: triggers, early warning signs, what to do instead, and what to say.
- Opens in one tap from Today or Help now.

### Body check-in
- Optional daily chips: sleep, appetite, energy, hair fall, headaches, stomach, unintended weight loss.
- Shows recurring patterns, and a "worth showing a doctor" card based on fixed rules.
- Generates an editable doctor summary. It never gives medicine advice, has no weight targets, and never praises weight loss.

### Learn
- Short cards, an article and book picks based on research and books by researchers, not pop psychology.
- Each card names its source and its strength of evidence, and ends with a journal prompt.
- Optional suggestions based on your entries (matched on the device, never during a crisis).

### The Wall (preview)
- Share entries anonymously, choose the kind of response you want, reply kindly, and ask to talk (both people must agree).
- Same-theme groups, with phone numbers, links and handles blocked.
- *In this test version, Wall activity stays on each tester's own device.*

### Support (preview)
- Waitlists for support circles, hosted in-person gatherings (reviewed by facilitators, held in public venues) and a step-by-step therapy ladder.

### Safety and privacy
- A **Help now** button on every screen, with calm tools, Tele-MANAS and 112.
- A gentle, on-device check that offers help if an entry suggests someone may be in danger. No one else is alerted.
- Optional PIN lock.
- **Journals are stored only on the device** (browser storage). There are no accounts and no analytics.
- Only entries a user chooses to "Reflect" on are sent to the AI (Anthropic's Claude), through the Worker. The Worker doesn't store or log them, and Anthropic doesn't use API data for training by default.

## Project structure

| File | What it is |
|---|---|
| `index.html` | The whole app: HTML, CSS and JavaScript in one file, served by GitHub Pages |
| `worker.js` | Cloudflare Worker that holds the API key, applies daily limits and returns reflections |
| `SETUP.md` | Step-by-step deployment guide |

## Running it

1. **App:** enable GitHub Pages (Settings → Pages → Deploy from branch → `main` / root). The app is served at `https://<user>.github.io/aura/`.
2. **Reflection (optional):** deploy `worker.js` on Cloudflare Workers with these settings:
   - `ANTHROPIC_API_KEY` (secret)
   - `ALLOWED_ORIGIN` (e.g. `https://<user>.github.io`)
   - Optional: `MODEL` (default `claude-haiku-5-5`), `PER_USER_DAILY` (default 15), `GLOBAL_DAILY` (default 500), and a KV binding `AURA_LIMITS`
3. Set `REFLECT_URL` (your Worker address) and `FEEDBACK_URL` (your form link) at the top of the script in `index.html`.

See `SETUP.md` for details.

## Known limitations

- The Wall, circles and meetups are previews only. There's no shared backend yet.
- The Learn content and the doctor-alert thresholds still need review by a clinician.
- The welcome screen and the long-form article are in English only.
- Voice input depends on browser support.

## Feedback

Testers can use the in-app feedback link. Issues and suggestions are also welcome in this repo.
