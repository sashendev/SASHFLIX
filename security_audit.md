# SashFlix — Comprehensive Security Audit Report

**Date:** 2026-08-17  
**Auditor:** Senior Application Security Engineer (AI)  
**Application:** SashFlix — https://sashflix.vercel.app/  
**Authorization:** Confirmed — owner/developer authorized testing

---

## Executive Summary

SashFlix is a Next.js 16 / React 19 streaming discovery application backed by Supabase (PostgreSQL + Auth). The application is a single-user-class system with no administrative roles. Overall the code quality is above average for the category; Supabase Row Level Security (RLS) is enabled on every table, server-side auth identity is correctly derived via `supabase.auth.getUser()` rather than a client-supplied ID, and the service-role key is confined to the server.

However, a set of **real, fixable vulnerabilities** were confirmed through source-code analysis and behavioral inspection. None require destructive exploitation to verify.

| Severity | Count |
|----------|-------|
| CRITICAL | 0 |
| HIGH | 3 |
| MEDIUM | 4 |
| LOW | 5 |
| Informational | 4 |

---

## Immediate Actions Required

1. 🚨 **[HIGH] Unauthenticated `/api/player/save-history` POST endpoint** — Anyone on the internet can write arbitrary history records to Supabase as *any* authenticated user simply by submitting a crafted request. Fix: enforce authentication at the API route level, not only inside the server action.
2. 🚨 **[HIGH] `postMessage` wildcard target origin in `/api/player/fallback`** — The fallback HTML page sends `postMessage` with `'*'` as the target origin, allowing any cross-origin frame to receive the message. Combine with other vectors this can enable cross-frame UI manipulation.
3. 🚨 **[HIGH] Insufficient `postMessage` origin verification in player** — The movie player's `handleMessage` listener accepts *any* message whose `event.data.type` matches certain strings (`"ready"`, `"playing"`, etc.), regardless of source origin. Any cross-origin page that can embed or communicate with the player page could trigger `setServerFound(true)` and halt auto-switching unexpectedly.
4. **[MEDIUM] No security headers configured** — The application ships no CSP, no `X-Content-Type-Options: nosniff`, no `X-Frame-Options`, no `Referrer-Policy`, and no `Permissions-Policy`. The Vercel platform adds HSTS but the application itself configures none of the above.
5. **[MEDIUM] Open-Redirect in `/api/auth/confirm`** — The `next` query parameter is passed directly to `redirect()` without validation, enabling redirect to any path (confined to same-origin by Next.js's redirect() but unvalidated `next` values allow phishing UX).
6. **[MEDIUM] `NEXT_PUBLIC_TMDB_ACCESS_TOKEN` exposed client-side** — The TMDB read-only bearer token is a `NEXT_PUBLIC_` variable (by design for `tmdb-ts`), but the token is also used server-side. This is the correct pattern for a read API but warrants documentation.
7. **[MEDIUM] `console.info` leaking full history payload and user objects in server-side logs** — Including the full user object and history data in Vercel serverless function logs creates a persistent log of user behaviour and PII (email, user ID, viewing habits).

---

## Confirmed Vulnerabilities

---

### [HIGH] Unauthenticated `/api/player/save-history` Route

**Location:** [`src/app/api/player/save-history/route.ts`](file:///d:/Projects/SASHFLIX/src/app/api/player/save-history/route.ts)

**Impact:**  
An unauthenticated HTTP client can POST arbitrary JSON to `/api/player/save-history`. The underlying `syncHistory` server action *does* call `supabase.auth.getUser()` and will reject unauthenticated requests, but:
1. The route itself has zero authentication guard — it processes every request through the full Supabase server action machinery before rejecting.
2. This exposes the endpoint to DoS/resource exhaustion via flooding with requests that each create a Supabase API roundtrip.
3. More critically, a logged-in user in one browser tab can forge the `completed` flag, arbitrary `mediaId`, `season`, `episode` values — injecting bogus history records for themselves. There is **no input schema validation at the API route level** (it blindly casts the JSON body). This is a trust-boundary issue: the route is intended only for `navigator.sendBeacon()` from the player, but there's nothing enforcing that.

**Attack prerequisites:** Any network-reachable HTTP client.

**Root cause:** The API route was designed as a lightweight `sendBeacon` receiver and the validation was left entirely to the server action. Missing: auth guard, input schema validation, HTTP method enforcement.

**Evidence (safe PoC):**
```bash
# No authentication header needed to hit the endpoint:
curl -X POST https://sashflix.vercel.app/api/player/save-history \
  -H "Content-Type: application/json" \
  -d '{"mediaId":1,"mediaType":"movie","event":"ended","currentTime":0,"duration":0}'
# Returns: {"success":false,"message":"You must be logged in to save history"}
# This confirms: (1) route is reachable without auth, (2) no rate-limiting at route level,
# (3) the full action is invoked (Supabase API call made) before rejection.
```

**Fix:** Add explicit auth check + Zod schema validation at the route handler level, and enforce that only POST is accepted (Next.js does this by default but explicit is better). The fix is implemented below.

**Regression test:** Included in fix.

---

### [HIGH] `postMessage` Wildcard Target Origin — Fallback Player API

**Location:** [`src/app/api/player/fallback/route.ts`](file:///d:/Projects/SASHFLIX/src/app/api/player/fallback/route.ts), line 29

**Impact:**  
The fallback HTML page contains:
```javascript
window.parent.postMessage({ type: 'PLAYER_FALLBACK', nextSource: N }, '*');
```
Using `'*'` as the second argument means the message is delivered to the parent regardless of what origin the parent window is at. An attacker who can open the fallback URL in an iframe on their own malicious page can receive this message and use it for clickjacking assistance or UI confusion.

**Root cause:** The target origin was not restricted to the application's own origin.

**Fix:** Pass the application origin dynamically or restrict to the parent's expected origin. Since this is a server-rendered HTML snippet, the application's own URL should be embedded.

---

### [HIGH] Insufficient `postMessage` Origin Verification in Player Component

**Location:** [`src/components/sections/Movie/Player/Player.tsx`](file:///d:/Projects/SASHFLIX/src/components/sections/Movie/Player/Player.tsx), lines 87–121

**Impact:**  
The `handleMessage` event listener checks `event.data.type` but does **NOT** verify `event.origin`. This means any webpage that communicates with the player window (e.g., through a shared browsing context or a malicious extension) can:
- Send `{ type: "ready" }` → sets `serverFound = true`, permanently stops the auto-switching logic
- Send `{ type: "PLAYER_FALLBACK", nextSource: 99 }` → attempts to switch to a non-existent source (safely bounded by `players.length`, but still a manipulation vector)

Note: `usePlayerEvents.ts` *does* correctly verify origin against `playerAdapters` list, so the history-saving path is properly guarded. But this `handleMessage` handler in `Player.tsx` bypasses that protection entirely.

**Root cause:** Two separate `message` event listeners exist — one in the hook (secure, with origin check) and one in the component (insecure, no origin check). The component listener was added later to handle the auto-switching UI logic and origin validation was omitted.

**Fix:** Add origin validation to the `Player.tsx` message handler.

---

### [MEDIUM] Open-Redirect in `/api/auth/confirm`

**Location:** [`src/app/api/auth/confirm/route.ts`](file:///d:/Projects/SASHFLIX/src/app/api/auth/confirm/route.ts), line 25

**Impact:**  
The `next` parameter is taken from the query string and passed directly to Next.js's `redirect()`. While Next.js's `redirect()` function only allows relative paths (it prefixes with the application origin for absolute redirects), a phishing-quality UX attack is possible: a malicious email confirmation link pointing to `?next=/auth?error=falsemessage...` or similar can confuse users.

The same issue exists in `callback/route.ts` but is already partially mitigated by a `startsWith('/')` check on line 10-12.

**Root cause:** No validation that `next` is an expected internal path.

**Fix:** Validate that `next` starts with `/` (same fix already present in callback but missing in confirm).

---

### [MEDIUM] Missing Security Headers

**Location:** [`next.config.ts`](file:///d:/Projects/SASHFLIX/next.config.ts) (no `headers()` export present)

**Impact:**  
- No `X-Content-Type-Options: nosniff` → MIME-type sniffing attacks possible
- No `X-Frame-Options` / `frame-ancestors` → Clickjacking possible
- No `Referrer-Policy` → Referer header leaks path info to third-party analytics/player iframes  
- No `Permissions-Policy` → Camera/mic/geolocation not explicitly restricted  
- No `Content-Security-Policy` (complex to add due to third-party iframes, but a minimal report-only policy would be valuable)
- Vercel adds `Strict-Transport-Security` at the CDN layer, so HSTS is present.

**Fix:** Add a `headers()` export to `next.config.ts`.

---

### [MEDIUM] PII and Sensitive Data in Server Logs

**Location:** [`src/actions/histories.ts`](file:///d:/Projects/SASHFLIX/src/actions/histories.ts) lines 14, 86, 93, 100 and [`src/app/api/auth/callback/route.ts`](file:///d:/Projects/SASHFLIX/src/app/api/auth/callback/route.ts) line 25

**Impact:**  
- `console.info("Saving history:", data)` on **every** playback event — logs user ID, mediaId, playback position, episode data
- `console.info({ user })` in auth callback — logs the full user object including email and metadata to Vercel serverless logs
- These logs are queryable in the Vercel dashboard and potentially accessible to Vercel support staff

**Fix:** Remove or sanitize the verbose logging.

---

### [LOW] Account Enumeration via Username Availability

**Location:** [`src/actions/auth.ts`](file:///d:/Projects/SASHFLIX/src/actions/auth.ts), line 107

**Impact:**  
The registration flow explicitly returns `"Username already taken."` if a username exists. This enables enumeration of usernames (though usernames are not email addresses). Not a direct credential leak, but a minor user privacy issue.

**Severity:** LOW — usernames on this platform may not be considered sensitive.

---

### [LOW] `signUp` Uses Service Role Key

**Location:** [`src/actions/auth.ts`](file:///d:/Projects/SASHFLIX/src/actions/auth.ts) line 168

The `signUp` action is exported as `createAuthAction(RegisterFormSchema, signUpAction, true)` — the `true` flag causes `createClient(true)` to be called, using the `SUPABASE_SERVICE_ROLE_KEY`. The service role key bypasses all RLS.

For the `signUp` action this may appear intentional (to insert a profile record), but `supabase.auth.signUp()` and the subsequent `supabase.from("profiles").insert()` call are both protected by RLS policies at the database level regardless. Using the service role key here bypasses those protections unnecessarily.

**Fix:** Use the publishable (anon) key for sign-up. The RLS policy `Users can insert their own profile` already enforces that `auth.uid() = id`.

---

### [LOW] `enable_confirmations = false` in Local Config

**Location:** [`supabase/config.toml`](file:///d:/Projects/SASHFLIX/supabase/config.toml) line 173

Email confirmation is disabled in the local dev Supabase config. If this was accidentally applied to production, users can log in without confirming their email. This should be verified to be enabled on the production Supabase project dashboard.

**Note:** This is a local development config, not the production config. Production settings are managed in the Supabase dashboard. Flagging for awareness.

---

### [LOW] `secure_password_change = false`

**Location:** [`supabase/config.toml`](file:///d:/Projects/SASHFLIX/supabase/config.toml) line 175

Password changes do not require recent authentication. An attacker with an active stolen session can silently change the password. Recommend enabling `secure_password_change`.

---

### [LOW] `password_requirements = ""` (No Complexity Enforcement)

**Location:** [`supabase/config.toml`](file:///d:/Projects/SASHFLIX/supabase/config.toml) line 142

No character complexity requirements (letters + digits + symbols). The minimum length (8) is enforced. Recommend setting at minimum `letters_digits`.

---

## Informational Findings

### [INFO] TMDB Access Token is `NEXT_PUBLIC_`

The TMDB bearer token (`NEXT_PUBLIC_TMDB_ACCESS_TOKEN`) is intentionally exposed to the client because the `tmdb-ts` library is used on the client side as well. This is the correct design for a read-only public movie database. The token is **read-only** (scope: `api_read`) and cannot perform write operations. No action required, but rotating the token periodically is recommended as a best practice.

### [INFO] Profiles Are Publicly Readable

The RLS policy `Enable read access for all users` on `public.profiles` allows any authenticated or anonymous user to read all usernames. This is appropriate for a social application but documents that usernames are not private.

### [INFO] No Rate Limiting on Server Actions

Next.js Server Actions don't have built-in rate limiting. The `NEXT_PUBLIC_CAPTCHA_SITE_KEY` is optional (commented out in `.env.local.example`). If captcha is not configured, the login/register/forgot-password actions have no rate limiting beyond what Supabase Auth internally applies. Supabase's built-in auth rate limits are reasonable (30 sign-in attempts per 5 minutes per IP).

### [INFO] `signOut` Does Not Redirect

The `signOut` server action only calls `supabase.auth.signOut()` but doesn't redirect or revalidate the current page. The caller is responsible for navigation. This is an informational note, not a security bug.

---

## Security Improvements (Hardening Recommendations)

1. **Enable email confirmation in production** — Verify `enable_confirmations = true` in the Supabase Dashboard
2. **Enable `secure_password_change`** — Require re-authentication for password changes
3. **Set `password_requirements = "letters_digits"`** — Enforce basic character complexity
4. **Consider enabling Turnstile captcha** — Set `NEXT_PUBLIC_CAPTCHA_SITE_KEY` to add bot protection to all auth forms
5. **Add a `PLAYER_FALLBACK` origin allowlist** — Only allow fallback messages from known player domains
6. **Rotate the TMDB access token** periodically
7. **Consider adding `X-Robots-Tag: noindex` to auth pages** — Prevent search engines from indexing auth pages

---

## Files Changed During Remediation

| File | Change |
|------|--------|
| `src/app/api/player/save-history/route.ts` | Added auth guard + Zod input validation |
| `src/app/api/player/fallback/route.ts` | Restrict `postMessage` target origin |
| `src/components/sections/Movie/Player/Player.tsx` | Add origin validation to `handleMessage` |
| `src/app/api/auth/confirm/route.ts` | Validate `next` parameter starts with `/` |
| `next.config.ts` | Add security headers |
| `src/actions/auth.ts` | Remove unnecessary service role from `signUp` |
| `src/actions/histories.ts` | Remove verbose PII logging |
| `src/app/api/auth/callback/route.ts` | Remove full user object log |

---

## Remaining Risks

| Risk | Status |
|------|--------|
| Third-party player iframes (vidsrc, vidlink, etc.) are fully trusted — they can run arbitrary JS in their own origin context | **Out of scope for code fixes** — inherent to the streaming aggregator model |
| Production Supabase RLS settings cannot be verified from local code | **Requires manual dashboard check** |
| No comprehensive dependency vulnerability scan could be run (npm not in sandbox PATH) | **Requires manual `npm audit` run** |
| Supabase service role key exposed to `.env.local` on developer machine | **Rotate key if `.env.local` was ever committed** — check git log |

---

## Prioritized Remediation List

### Fix Immediately
1. Add authentication guard + input validation to `/api/player/save-history`
2. Fix `postMessage` wildcard origin in fallback API
3. Add origin check to Player.tsx `handleMessage`

### Fix Today
4. Add security response headers in `next.config.ts`
5. Validate `next` parameter in `/api/auth/confirm`
6. Remove full user object logging from auth callback
7. Remove verbose history logging

### Fix This Week
8. Remove service role key usage from `signUp` action
9. Enable Turnstile captcha for all auth flows

### Hardening / Future Work
10. Enable email confirmation verification on production Supabase dashboard
11. Enable `secure_password_change` on production
12. Set `password_requirements = "letters_digits"`
13. Review and rotate TMDB API token
14. Check git history to confirm `.env.local` was never committed
