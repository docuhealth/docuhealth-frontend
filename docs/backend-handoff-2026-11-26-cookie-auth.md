# Frontend handoff: cookie sessions

**Summary.** Sign-in no longer gives the frontend a token. The session lives in two httpOnly cookies that the browser stores and sends by itself, so your code never sees the token. Every call must send credentials, and every call that changes data must also send an `X-Requested-With` header. The access token lasts 5 minutes, so you need a refresh-and-retry step, and there is a new logout endpoint. It all goes live in one release, so the frontend switches at the same time.

## Changed: every call

- **Send credentials.** `credentials: "include"` (fetch) or `withCredentials: true` (axios).
- **Add `X-Requested-With: XMLHttpRequest` on every POST, PUT, PATCH and DELETE.** It is required on logged-in calls, so send it on all non-GET calls. Without it the answer is 403 `{"detail": "Send an X-Requested-With header with this request."}`. Leave it off GET calls, where it only adds an extra preflight.
  - Why: a browser attaches cookies even to a request started by another website. A page on another site cannot add a custom header, because the browser checks our allowed sites first. So the header tells us the call came from our app. Only its presence matters, not its value.
- **Stop sending `Authorization`.** It is ignored, and the call gets 401.

## Changed: sign-in responses

No response carries a token any more. The browser gets the cookies from the response. Remove any code that stores or reads `data.access_token`.

- `POST /api/auth/login`: `data` still has `role`, `acting_as`, `next_step` and the rest, minus `access_token`.
- `POST /api/auth/signup/complete` and `POST /api/auth/signup/upgrade/complete`: same, they start the session.
- `POST /api/auth/nin/verify`: also replaces the cookies, and has no token in the body.

## Changed: expiry and refresh

- The access cookie lasts 5 minutes and the refresh cookie 24 hours. Both are set by the server.
- On a 401 from any logged-in call: `POST /api/auth/refresh` (no body), then retry the original call once.
  - Success is 200 with `data: {}` and new cookies.
  - 400 (no cookie) or 401 (expired or cancelled) means the session is over: go to login.
  - An invalid refresh token now gives 401. It used to be a 500.
- **Refresh from one place only.** Each refresh cancels the previous refresh token, so two at the same moment (parallel calls or two tabs) can make one fail with 401. In testing, 2 of 24 simultaneous refreshes failed. Share one in-flight refresh across calls, and use a lock across tabs (Web Locks API or BroadcastChannel).

## New: logout

`POST /api/auth/logout`, no body. It works even when the access token has expired and always answers 200 `{"detail": "Logged out", "status": "success"}`. It cancels the refresh token and clears both cookies. Call it, then clear your own state. You cannot clear the cookies yourself, because they are httpOnly.

## Changed: password reset

- `POST /api/auth/forgot-password/verify-otp` no longer returns `data.access_token`. It sets an access cookie (5 minutes, no refresh cookie).
- `PATCH /api/auth/reset-password` then sends only `new_password`, with credentials and `X-Requested-With`. No header token.
- The user must finish within 5 minutes.

## Changed: staging errors

Debug pages are off on staging. A 500 now returns a plain HTML "Server Error (500)" page, not JSON. Do not parse 5xx bodies as JSON without checking.

## Changed: Swagger and Postman

The Swagger Authorize button is gone, because the schema now describes a cookie. In Postman, turn on the cookie jar and add `X-Requested-With` by hand on write calls.

## Heads-up: one session per browser

Cookies belong to the API host, so every app (patient, hospital, agent, admin, v2) in the same browser shares one session. Logging in as another account replaces it in every tab. QA that needs several roles at once needs separate browser profiles.

## Flag: reload and route guards

The frontend cannot read the token, and there is no endpoint yet to restore `role`, `next_step` and `acting_as` after a page reload. A "who am I" endpoint is planned next. Until it lands, keep the non-secret login `data` in your own state or storage.

## Flag: local development

The cookies are `SameSite=None; Secure`. From `http://localhost:5173` calling the staging API (a different site), some browsers may refuse or drop them. Suggested fix: proxy `/api` through the Vite dev server and call relative `/api/...` paths.

```js
server: { proxy: { "/api": { target: "https://api-staging.docuhealthservices.net", changeOrigin: true } } }
```

Safari does not accept `Secure` cookies on `http://localhost`.

## Flag: mobile app

A native app has no browser cookie jar, and the Authorization header is not accepted. How mobile signs in is not decided yet. Do not start the mobile sign-in work until the backend confirms.

---

# Follow-up: who am I (GET /api/auth/me)

**Summary.** There is a new endpoint that tells the app who is signed in. It returns the same `role`, `acting_as` and `next_step` that login returns, so the app can restore its state after a page reload. This replaces any workaround that kept the login data in your own storage. It uses the cookie session from the earlier handoff, so it needs credentials on the call, and nothing else changes.

## New: `GET /api/auth/me`

- **Call it with credentials** (`credentials: "include"` or `withCredentials: true`). It is a GET, so it needs no `X-Requested-With` header and no body.
- **Success is 200:**

```json
{ "data": { "role": "…", "acting_as": [ … ], "next_step": null, … }, "status": "success" }
```

- `data` is exactly what login returns in its `data`. Use the same code to read both.
- The envelope is slightly different from login: there is no `detail` field.
- **No cookie, or an expired one, is 401.** Do the usual: `POST /api/auth/refresh` once, then call `/me` again. If the refresh fails, go to the login page.
- **It works for an account with a required `next_step`.** Use it to send the user to that step (`nin_not_verified` or `admin_details_required`). Every other endpoint refuses such an account until the step is done, but this one does not.
- **It is read fresh each time.** If a staff member's membership has ended, `acting_as` comes back empty. Decide what the app shows in that case.
- **It does not refresh the session.** It sets no cookies and does not extend the 5-minute access cookie, so it is not a keep-alive.

## Changed: loading the app and route guards

On app load, and after a reload:

1. `GET /api/auth/me`.
2. On 200, store `role`, `acting_as` and `next_step` in app state and route from them.
3. On 401, `POST /api/auth/refresh`, then retry `/me` once.
4. If that fails too, show the login page.

Remove the code that saved the login `data` in local storage to survive a reload.

## Changed: after sign-up, upgrade and NIN verify

These calls still return only `role` and `next_step`, as before:

- `POST /api/auth/signup/complete`
- `POST /api/auth/signup/upgrade/complete`
- `POST /api/auth/nin/verify`

They start a session, so call `GET /api/auth/me` right after one of them if you need the rest, such as `acting_as`.

## Not included yet

- **No name.** `/me` does not return the person's name, and neither does login. More fields will be added later. Do not build on a name coming from this call.

## Dependencies

It needs the cookie session already described in the earlier handoff: credentials on every call and refresh-and-retry on a 401. Login's response is unchanged.

---

# Follow-up: name and email on /me and login

`GET /api/auth/me` now returns the signed-in person's `email`, `firstname` and `lastname`. The login response returns the same three fields, because `/me` and login always give the same `data`. You can show the user's name and email after a page reload without another call. Nothing else changed and nothing was removed.

## Changed

### `GET /api/auth/me`

Three new fields in `data`:

| Field       | Value                |
| ----------- | -------------------- |
| `email`     | The account's email. |
| `firstname` | First name, or `""`. |
| `lastname`  | Last name, or `""`.  |

- Always present, never `null`. An empty name is `""`.
- Names are blank for a DH admin, and for a hospital admin who has not finished first login. Fall back to `email` for display.
- Existing fields (`role`, `acting_as`, `next_step`, role extras) are unchanged.

### Login response

`data` carries the same three fields with the same values. If you build the signed-in user from the login response, read them there. After a reload, read them from `/me`.

## What to do

1. Read `email`, `firstname` and `lastname` from `data` in the login and `/me` responses.
2. Show the full name when either name is non-empty, otherwise show `email`.
