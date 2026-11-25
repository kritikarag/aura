# Putting Aura online for testers

You'll set up two free pieces:

1. **The app**: `index.html` on GitHub Pages.
2. **The reflection helper**: `worker.js` on Cloudflare Workers. It holds your Claude API key so the key is never in the app.

You never need to share your API key with anyone, including Claude.

---

## Step 1: Get a Claude API key

You'll use the credit already on your Claude Console account.

1. Go to **platform.claude.com** → **API keys** → **Create key**. Name it `aura-reflect`.
2. Copy the key and keep it somewhere safe. You'll paste it into Cloudflare in Step 2, and nowhere else.
3. Under **Limits** (or **Billing**), set a monthly spend limit, for example $10, so a busy week can't drain your credit.

Anthropic doesn't use API inputs or outputs to train its models by default, which matters for journal entries.

## Step 2: Deploy the reflection helper on Cloudflare

1. Sign up at **dash.cloudflare.com** (free).
2. Go to **Workers & Pages → Create → Create Worker**. Name it `aura-reflect` and click **Deploy**.
3. Click **Edit code**, delete the sample code, paste in all of `worker.js`, and click **Deploy**.
4. Go to the Worker's **Settings → Variables and Secrets** and add:
   - `ANTHROPIC_API_KEY`: type **Secret**, value = your key
   - `ALLOWED_ORIGIN`: type **Text**, value = your site address from Step 3, e.g. `https://yourname.github.io` (no slash at the end, no `/aura`)
   - Optional: `MODEL` (default `claude-haiku-5-5`), `PER_USER_DAILY` (default 15), `GLOBAL_DAILY` (default 500)
5. Recommended: go to **Storage & Databases → KV → Create namespace** called `aura-limits`. Then in the Worker's **Settings → Bindings → Add → KV namespace**, set the variable name to `AURA_LIMITS` and choose `aura-limits`. This makes the daily limits reliable.
6. Copy your Worker's address, for example `https://aura-reflect.yourname.workers.dev`.

## Step 3: Put the app on GitHub Pages

1. Open `index.html` in a text editor. Near the top of the script, fill in:
   ```js
   const REFLECT_URL="https://aura-reflect.yourname.workers.dev";
   const FEEDBACK_URL="https://forms.gle/your-form";
   ```
2. Create a **public** GitHub repo called `aura` and upload `index.html` to it.
3. Go to **Settings → Pages**, set Source to **Deploy from a branch**, choose `main` and `/ (root)`, and click **Save**.
4. After a minute your app is live at `https://yourname.github.io/aura/`.

## Step 4: Test it yourself first

- Open the link on your phone in Chrome. You should see the welcome screen.
- Write an entry and tap **Reflect with Aura**. If you see "isn't switched on," `REFLECT_URL` is empty. If you see "Couldn't reflect," check that `ALLOWED_ORIGIN` exactly matches your site (for example `https://yourname.github.io`).
- Try the mic in Chrome. Other browsers can still use the keyboard's own mic button.

## Step 5: The feedback form

Make a short Google Form or Tally form. Useful questions:
- Which theme did you like most? Which Just watch scene?
- Which calm exercise helped, if any?
- Did the reflection feel fair: not too agreeable, not too harsh?
- Was anything confusing, or did anything feel unsafe?
- Would you use this again? Why or why not?

## Before posting on Reddit

- Post in feedback communities (r/SideProject, r/alphaandbetausers, r/UXDesign, Indian tech subreddits), not in mental health support communities.
- Read each subreddit's rules about self-promotion first.
- Say clearly that it's an early prototype, it's 18+, journals stay on the phone, and reflections are written by Anthropic's Claude.

## What testers won't get yet

- The Wall, replies and requests only live on each tester's own phone, so testers won't see each other.
- Support circles and in-person gatherings are waitlist screens only.
- The doctor-alert rules and the Learn cards haven't been reviewed by a clinician yet.
