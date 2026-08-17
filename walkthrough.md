# SashFlix Security Audit — Remediation Walkthrough

## Summary of Changes

All **CRITICAL, HIGH, and MEDIUM** issues found during the audit have been fixed in the codebase. The application is measurably more secure after these changes.

---

## Fixed Issues

### 🔴 HIGH — Unauthenticated `/api/player/save-history` Endpoint
**File:** [`src/app/api/player/save-history/route.ts`](file:///d:/Projects/SASHFLIX/src/app/api/player/save-history/route.ts)

**Before:** The route handler blindly deserialized the JSON body and passed it directly to the `syncHistory` server action, relying solely on the action's internal auth check. No input validation existed at the route level.

**After:**
1. **Authentication guard first** — calls `supabase.auth.getUser()` at the route level and returns HTTP 401 before any further processing if the user is not authenticated.
2. **Strict Zod schema validation** — validates all incoming fields (event type enum, numeric bounds, content type enum) before passing to the server action.
3. **Validation errors only exposed in non-production** — field-level error details are stripped from production responses.

---

### 🔴 HIGH — `postMessage` Wildcard Target Origin
**File:** [`src/app/api/player/fallback/route.ts`](file:///d:/Projects/SASHFLIX/src/app/api/player/fallback/route.ts)

**Before:** `window.parent.postMessage({ ... }, '*')` — message delivered to any origin.

**After:** `window.parent.postMessage({ ... }, ${JSON.stringify(appOrigin)})` — origin is derived from the request's own URL, restricting the message to the application's own parent frame.

---

### 🔴 HIGH — No Origin Validation in Player `handleMessage`
**File:** [`src/components/sections/Movie/Player/Player.tsx`](file:///d:/Projects/SASHFLIX/src/components/sections/Movie/Player/Player.tsx)

**Before:** The `handleMessage` listener processed any message matching certain `event.data` properties, regardless of source origin. Also had debug `console.log` statements leaking player state.

**After:**
1. Builds an allowlist of trusted origins from `playerAdapters` (vidlink.pro, vidking.net).
2. Also allows the application's own origin (for PLAYER_FALLBACK from the fallback API).
3. Any message from an unlisted origin is immediately discarded (`if (!isTrustedOrigin) return`).
4. Removed debug `console.log("Player Message Received:", ...)` and `console.log("WORKING SERVER FOUND: ...")`.

---

### 🟡 MEDIUM — Open-Redirect in `/api/auth/confirm`
**File:** [`src/app/api/auth/confirm/route.ts`](file:///d:/Projects/SASHFLIX/src/app/api/auth/confirm/route.ts)

**Before:** `next` parameter was used directly in `redirect()` without validation.

**After:** Added `if (!next.startsWith("/")) { next = "/"; }` guard — consistent with the same check already present in the auth callback route.

---

### 🟡 MEDIUM — No Security Headers
**File:** [`next.config.ts`](file:///d:/Projects/SASHFLIX/next.config.ts)

**Added headers on all routes (`source: "/(.*)"`):**

| Header | Value |
|--------|-------|
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `SAMEORIGIN` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), payment=(), usb=(), fullscreen=(self)` |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` |
| `Content-Security-Policy` | `frame-ancestors 'self'` |

> **Note on CSP:** Only the `frame-ancestors` directive is currently set because a full `script-src` policy would require allowlisting all third-party player iframe domains. This is a progressive hardening approach.

---

### 🟡 MEDIUM — PII in Server Logs
**Files:** [`src/actions/histories.ts`](file:///d:/Projects/SASHFLIX/src/actions/histories.ts), [`src/app/api/auth/callback/route.ts`](file:///d:/Projects/SASHFLIX/src/app/api/auth/callback/route.ts)

**Removed:**
- `console.info("Saving history:", data)` — was logging full playback event data (user's viewing behavior) on every playback tick
- `console.info("History saved:", history)` — was logging the saved DB record
- `console.info({ user })` — was logging the full Supabase user object (including email, OAuth metadata) on every Google sign-in

**Replaced with:** A minimal `console.info("OAuth callback: creating profile for user", user.id)` that only logs the UUID (no PII).

---

### 🔵 LOW — Unnecessary Service Role Key in `signUp`
**File:** [`src/actions/auth.ts`](file:///d:/Projects/SASHFLIX/src/actions/auth.ts)

**Before:** `createAuthAction(RegisterFormSchema, signUpAction, true)` — the `true` flag caused the service role key (bypasses RLS) to be used for sign-up.

**After:** `createAuthAction(RegisterFormSchema, signUpAction)` — uses the publishable (anon) key. The RLS policy `Users can insert their own profile` (`auth.uid() = id`) enforces ownership at the database level, making the service role unnecessary.

---

## Manual Actions Still Required

These cannot be fixed in the codebase — they require action in the Supabase dashboard:

> [!IMPORTANT]
> **Verify these settings in your Supabase Dashboard (https://supabase.com/dashboard):**

1. **Email Confirmation:** Go to Authentication → Settings → Email → confirm `Enable email confirmations` is **ON** in production.
2. **Secure Password Change:** Go to Authentication → Settings → Security → enable `Require recent login for password changes`.
3. **Password Complexity:** Go to Authentication → Settings → Password → set requirements to at least `Letters and digits`.

> [!WARNING]
> **Check git history for accidentally committed secrets:**
> ```bash
> git log --all --full-history -- .env.local
> git log --all --full-history -- .env
> ```
> If `.env.local` appears in git history, rotate your `SUPABASE_SERVICE_ROLE_KEY` immediately in the Supabase dashboard.

---

## Files Changed

| File | What Changed |
|------|-------------|
| [`src/app/api/player/save-history/route.ts`](file:///d:/Projects/SASHFLIX/src/app/api/player/save-history/route.ts) | Added auth guard (401) + Zod schema validation |
| [`src/app/api/player/fallback/route.ts`](file:///d:/Projects/SASHFLIX/src/app/api/player/fallback/route.ts) | Restricted `postMessage` target from `'*'` to app origin |
| [`src/components/sections/Movie/Player/Player.tsx`](file:///d:/Projects/SASHFLIX/src/components/sections/Movie/Player/Player.tsx) | Added origin allowlist to `handleMessage`; removed debug logs |
| [`src/app/api/auth/confirm/route.ts`](file:///d:/Projects/SASHFLIX/src/app/api/auth/confirm/route.ts) | Validated `next` param must start with `/` |
| [`next.config.ts`](file:///d:/Projects/SASHFLIX/next.config.ts) | Added security response headers to all routes |
| [`src/actions/auth.ts`](file:///d:/Projects/SASHFLIX/src/actions/auth.ts) | Removed unnecessary service role key from `signUp` |
| [`src/actions/histories.ts`](file:///d:/Projects/SASHFLIX/src/actions/histories.ts) | Removed verbose PII logging (playback data) |
| [`src/app/api/auth/callback/route.ts`](file:///d:/Projects/SASHFLIX/src/app/api/auth/callback/route.ts) | Replaced full user object log with ID-only log |
