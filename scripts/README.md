# The Instagram token

The `/field` gallery reads photographs from `@_wild_diary` at request time. This
is the one moving part of the site that will stop working on its own, so it is
documented here rather than in anyone's head.

## Which API this is

**Instagram API with Instagram Login.** The host is `graph.instagram.com`, not
`graph.facebook.com`, and there is no Facebook Page in the chain. Meta shut down
Basic Display and personal-account access in December 2024; this is the
successor, and it needs the account to be a **Creator** or **Business** account.
`@_wild_diary` is a Creator account.

The Meta app runs in **Development mode**. That is correct and sufficient: an app
in development can read the accounts of users added to it as testers, and the
only account being read is the owner's own. App Review is for reading *other
people's* accounts, which this site never does.

## How the token was obtained

1. Convert the Instagram account to Creator or Business in the Instagram app.
   Free, reversible, invisible to followers.
2. developers.facebook.com → create an app → add the **Instagram** product →
   choose **Instagram API with Instagram Login**.
3. Under **Roles**, add yourself as an Instagram Tester, then accept the
   invitation from instagram.com → Settings → Website permissions → Tester
   invites.
4. Complete the OAuth flow. This returns a **short-lived** token, good for one
   hour.
5. Exchange it for a **long-lived** token, good for roughly 60 days:

   ```bash
   curl -s "https://graph.instagram.com/access_token\
   ?grant_type=ig_exchange_token\
   &client_secret=APP_SECRET\
   &access_token=SHORT_LIVED_TOKEN"
   ```

6. Put the result in `INSTAGRAM_ACCESS_TOKEN`, and put today's date in
   `INSTAGRAM_TOKEN_ISSUED_AT` (`YYYY-MM-DD`). The second one is what lets the
   app warn you before the first one lapses.

## Verifying a token

```bash
curl -s "https://graph.instagram.com/me?fields=id,username&access_token=$INSTAGRAM_ACCESS_TOKEN"
```

A working token returns `{"id":"...","username":"_wild_diary"}`. An expired one
returns an `OAuthException`. To check the media endpoint the site actually uses:

```bash
curl -s "https://graph.instagram.com/me/media\
?fields=id,caption,media_type,media_url,permalink,timestamp,thumbnail_url\
&limit=3&access_token=$INSTAGRAM_ACCESS_TOKEN"
```

## It expires every 60 days

A long-lived token lasts about 60 days and can be refreshed any time after day
one. `app/api/ig-refresh/route.ts` calls:

```
GET https://graph.instagram.com/refresh_access_token
    ?grant_type=ig_refresh_token
    &access_token=CURRENT_TOKEN
```

The response carries a new token and `expires_in` in seconds. The route is
protected by `CRON_SECRET` (or Vercel's own `x-vercel-cron` header) so it cannot
be triggered from outside.

`vercel.json` runs it monthly. Cron has no way to say "every 45 days"; monthly is
more frequent than that and stays comfortably inside the 60-day window.

### The refreshed token is not saved automatically

**Vercel environment variables cannot be written at runtime.** The route mints a
new token and logs it, but it cannot store it. Nothing about this step is
automatic. After each run, take the token out of the deployment logs and put it
back yourself:

```bash
vercel env rm INSTAGRAM_ACCESS_TOKEN production
echo "<new token>" | vercel env add INSTAGRAM_ACCESS_TOKEN production
vercel env rm INSTAGRAM_TOKEN_ISSUED_AT production
echo "$(date +%F)" | vercel env add INSTAGRAM_TOKEN_ISSUED_AT production
```

Then redeploy so the new value is picked up.

If that becomes tiresome, the fix is to move the token out of the environment
and into Sanity, where the route *can* write it. That is a schema change and a
deliberate decision about storing a credential in your CMS, so it has not been
done for you.

## Caching

The media call is cached for **24 hours** (`lib/instagram.ts`, `REVALIDATE`).
That is the *fetch* cache, so it holds even when the page around it regenerates
for some other reason — the blog feed revalidates every 30 minutes and no longer
drags Instagram along with it.

Measured on a production build: six page requests across `/` and `/photography`
made **zero** calls to the API.

To pick up a new photograph before the day is out:

```bash
curl -X POST -H "Authorization: Bearer $CRON_SECRET" \
  "https://yourdomain.com/api/revalidate?tag=instagram"
```

`medium` works the same way. Anything else returns 400, and a missing or wrong
secret returns 401.

`next dev` does not use that persistent cache, so without help every local
refresh would hit the API. `lib/instagram.ts` keeps the last response in memory
for ten minutes **in development only** — production relies on the Next cache,
because an in-process cache would survive the purge above and serve stale
photographs.

## When it does lapse

Nothing on the site breaks. `lib/gallery.ts` falls back to the `photo` documents
in Sanity, the gallery renders those instead, and the failure is logged server
side with the status code. No API error ever reaches the page.

The app also warns ahead of time: `lib/instagram.ts` reads
`INSTAGRAM_TOKEN_ISSUED_AT`, and from ten days out it logs at error level on
every render.

---

# scripts/seed.ts

`npm run seed` pushes the documents in `content/seed/` into Sanity: the site
settings singleton, the roles, the projects and any posts. It needs
`NEXT_PUBLIC_SANITY_PROJECT_ID` and a write token in `SANITY_API_WRITE_TOKEN`.

Photographs and the opening portrait are binary uploads, not documents, so they
are not seeded. Upload those at `/studio`.
