# Madushan Chathuranga — portfolio

A portfolio for a senior engineer who is also a wildlife photographer. The
interface is monochrome; photographs are the only source of colour.

**The point of the build: content changes without a deploy.** Projects, career
history and the bio live in Sanity and are edited at `/studio`. Articles come
from Medium's RSS feed at request time. Photographs come from the Instagram
Graph API at request time. Pages are ISR, and publishing in Studio fires a
webhook that revalidates the affected cache tag within seconds.

- `DESIGN.md` — the design system and the reasoning behind it. Read it before
  touching anything visual.
- `CLAUDE.md` — the brief, the hard constraints and the quality floor.
- `/styleguide` — the type scale, palette and marks, rendered. Not indexed.

## Stack

Next.js 16 (App Router), TypeScript, Tailwind v4, Motion, Sanity v6, Vercel.


## Running it

```bash
npm install
cp .env.example .env.local   # optional — see below
npm run dev
```

It runs with **no environment variables at all**. `lib/content.ts` reads Sanity
when it is configured and otherwise falls back to the seed documents in
`content/seed/`, which are the same documents `npm run seed` pushes into Sanity.
Components never see the difference, so nothing in the component tree is coupled
to the CMS being up.

## The blog

`/blog` merges two sources. Technical articles are fetched from the Medium feed
at request time, sanitised through a strict allowlist and rendered here in full,
with a canonical link pointing back at Medium. Everything else is written in
Studio as a `post` document.

The feed only carries roughly the ten most recent articles. Anything older
drops off this site when it drops off the feed. If the archive starts to
matter, those articles need storing in Sanity instead — there is a TODO on it
in `lib/medium.ts`.

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run seed` | Pushes `content/seed/` into your Sanity dataset |

## Environment

Only the two `NEXT_PUBLIC_` values reach the browser. Everything else stays
server-side; `lib/instagram.ts` is marked `server-only`, so importing it from a
client component fails the build rather than leaking a token.

```
NEXT_PUBLIC_SANITY_PROJECT_ID     from sanity.io/manage
NEXT_PUBLIC_SANITY_DATASET        production
NEXT_PUBLIC_SITE_URL              https://yourdomain.com
SANITY_API_READ_TOKEN             Viewer token (optional; published content is public)
SANITY_API_WRITE_TOKEN            Editor token — local seeding only, never in Vercel
SANITY_WEBHOOK_SECRET             shared secret pasted into the Sanity webhook
INSTAGRAM_ACCESS_TOKEN            long-lived token, server-side only
INSTAGRAM_TOKEN_ISSUED_AT         YYYY-MM-DD, so expiry can be warned about
CRON_SECRET                       protects /api/ig-refresh
```

## Sanity

1. Create a project at [sanity.io/manage](https://sanity.io/manage), note the
   project id, and set the two `NEXT_PUBLIC_SANITY_*` values.
2. Add `http://localhost:3000` and your production domain to the project's CORS
   origins, with credentials allowed.
3. Create an Editor token, put it in `SANITY_API_WRITE_TOKEN`, and run
   `npm run seed`. That writes the singleton, six roles and eight projects.
4. Open `/studio` and edit. Photographs have to be uploaded by hand — they are
   the one thing that cannot be seeded.

### Webhook: publishing updates the live site in seconds

In Sanity → API → Webhooks, create one:

| Field | Value |
|---|---|
| URL | `https://yourdomain.com/api/revalidate` |
| Dataset | `production` |
| Trigger on | Create, Update, Delete |
| Filter | `_type in ["siteSettings","role","project","photo"]` |
| Projection | `{_type, _id, slug}` |
| HTTP method | `POST` |
| API version | `v2021-03-25` or later |
| Secret | the same string as `SANITY_WEBHOOK_SECRET` |

The route verifies the signature before doing anything —
`next-sanity/webhook`'s `parseBody` checks it against the secret. Without that,
anyone could force your whole site to regenerate. It then calls
`revalidateTag(_type)`, and any page that read that type regenerates on the next
request. `revalidate = 3600` on each page is only a backstop in case the webhook
is ever misconfigured.

To confirm it works: publish a change in Studio, then reload the site. If
nothing changes, check the webhook's delivery log in Sanity for a 401 (wrong
secret) or 400 (missing projection).

## Instagram

Meta shut down personal-account API access in December 2024, so this needs a
**Creator** (or Business) account:

1. Convert `@_wild_diary` to a Creator account. Free, reversible, invisible to
   followers.
2. Create an app at developers.facebook.com and add the **Instagram** product.
3. Use **Instagram API with Instagram Login** — the lighter path, no Facebook
   Page required.
4. Add yourself as a tester and complete OAuth.
5. Exchange the short-lived token for a long-lived one (~60 days).
6. Set `INSTAGRAM_ACCESS_TOKEN`, and set `INSTAGRAM_TOKEN_ISSUED_AT` to today's
   date so the app can warn you before it lapses.

**Token expiry is what will break this.** `vercel.json` runs `/api/ig-refresh`
monthly, which extends the token for another 60 days and logs the new value.

**Vercel environment variables cannot be written at runtime, so this is not
automatic.** The route can mint a new token but it cannot store one. After each
run, copy the token out of the deployment logs yourself:

```bash
vercel env rm INSTAGRAM_ACCESS_TOKEN production
echo "<new token>" | vercel env add INSTAGRAM_ACCESS_TOKEN production
vercel env rm INSTAGRAM_TOKEN_ISSUED_AT production
echo "2026-09-03" | vercel env add INSTAGRAM_TOKEN_ISSUED_AT production
```

Then redeploy so the new value is picked up. If that becomes tiresome the fix is
to move the token into Sanity, where the route can write it — that is a schema
change and a decision about keeping a credential in your CMS, so it has not been
made for you.

The media call is cached for **24 hours**, so the API is hit roughly once a day
however much traffic the site gets. To pick up a new photograph before then:

```bash
curl -X POST -H "Authorization: Bearer $CRON_SECRET" \
  "https://yourdomain.com/api/revalidate?tag=instagram"
```

If it does lapse anyway, nothing breaks visibly: `lib/gallery.ts` falls back to
the `photo` documents in Sanity, and the failure is logged loudly.

Full detail on how the token was obtained, how to regenerate it and how to
verify it is in [`scripts/README.md`](scripts/README.md).

## Deploying

Push to GitHub, import the repository in Vercel, add the environment variables,
deploy. `vercel.json` registers the cron. Then set the webhook URL in Sanity to
the production domain, and add that domain to Sanity's CORS origins.

## How the pieces fit

```
content/seed/*  ──seed──▶  Sanity  ◀──edit──  /studio
       │                     │
       └── fallback ───▶ lib/content.ts ──▶ components
                             ▲
        Medium RSS ──────────┤ lib/medium.ts     (cached 30 min)
        Instagram ───────────┘ lib/instagram.ts  (cached 24 h)
                                    │
                              lib/gallery.ts → Sanity photos on failure
```

## Notes for whoever works on this next

- **Never hardcode project or career content into components.** Everything goes
  through `lib/content.ts`.
- The focus-pull cursor (`components/cursor/FocusCursor.tsx`) writes styles
  directly in one rAF loop and never touches React state. It caps how many
  images are blurred at once and drops the cap further if it measures slow
  frames. It does not mount at all under `prefers-reduced-motion` or on a coarse
  pointer.
- Sections carry `data-ground="paper" | "hide"`, which swaps four CSS variables.
  Anything that paints must use `bg-ground` / `text-fg` / `border-rule` so it
  works on both grounds.
- Italic is reserved for binomial species names and photographic captions.
- No arrows in link text, no ALL-CAPS eyebrows, no middle-dot meta strings.
