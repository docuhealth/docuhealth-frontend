# Backend handoff — staging auth issues (18 Nov 2026)

From frontend QA of the v2 auth flows against `https://api-staging.docuhealthservices.net`.
Two items block testing (1 and 2). The rest are smaller fixes and questions.

| #   | Issue                                             | Severity        | Endpoint(s)                      |
| --- | ------------------------------------------------- | --------------- | -------------------------------- |
| 1   | Patient sign-up step 3 crashes with a 500         | Blocker         | `POST /api/auth/signup/complete` |
| 2   | CORS rejects the v2 test site and the subdomains  | Blocker         | All endpoints                    |
| 3   | Staging returns Django debug pages                | High (security) | All endpoints                    |
| 4   | Error body shape isn't consistent                 | Medium          | All endpoints                    |
| 5   | Contract questions for auth/session               | Needs an answer | `login`, `refresh`, `logout`     |
| 6   | Use the links the frontend sends, per environment | Check           | Sign-up and facility endpoints   |
| 7   | Dashboard endpoints don't exist yet               | Planning        | `/hospital/...`                  |

---

## 1. `POST /api/auth/signup/complete` → 500 `AttributeError`

```
AttributeError at /api/auth/signup/complete
'NoneType' object has no attribute 'encode'
Exception Location: /app/accounts/services.py, line 268, in keyed_nin_hash
Raised during: accounts.views.CompletePatientSignupView
Django 5.2.3 · Python 3.13.18 · Server time: Wed, 18 Nov 2026 16:35:46 +0000
```

**What the frontend sends** (after a successful `signup/verify-code`):

```json
{ "signup_token": "<token from verify-code>", "nin": "12345678901", "password": "<password>" }
```

`nin` is always a string of exactly 11 digits. The client strips anything else and validates the
length before sending. So the `None` being `.encode()`d is almost certainly **the hash key, not
the NIN**.

**Likely cause:** the secret that `keyed_nin_hash` reads (a setting or env var such as a NIN
hashing or HMAC key) isn't set on the staging deployment.

**Asks:**

- [ ] Set the NIN-hash secret on staging (and check prod has it too).
- [ ] Fail at startup if that setting is missing, rather than at request time.
- [ ] If the NIN really can be `None` there (for example, when it's read from the signup token
      instead of the body), return a 400 with a `detail` instead of a 500.

---

## 2. CORS: the v2 test site and subdomain origins aren't allowed

The app serves each audience from its own subdomain, and in development the same split runs on
`*.localhost`. The v2 frontend is deployed for testing at `v2.docuhealthservices.net`, with its
sections at `hospital.v2.docuhealthservices.net` and so on. The staging API returns **no
`Access-Control-Allow-Origin`** for several of these origins. The browser shows the preflight as
`200` and then blocks the real request with "CORS error".

Checked with an `OPTIONS` preflight on 18 Nov 2026:

| Origin                                            | Allowed? |
| ------------------------------------------------- | -------- |
| `http://localhost:5173`                           | Yes      |
| `http://127.0.0.1:5173`                           | Yes      |
| `https://docuhealthservices.net`                  | Yes      |
| `https://www.docuhealthservices.net`              | Yes      |
| `https://hospital.docuhealthservices.net`         | Yes      |
| `https://staging.docuhealthservices.net`          | Yes      |
| `https://hospital.staging.docuhealthservices.net` | Yes      |
| `https://v2.docuhealthservices.net`               | **No**   |
| `https://hospital.v2.docuhealthservices.net`      | **No**   |
| `https://agent.v2.docuhealthservices.net`         | **No**   |
| `http://hospital.localhost:5173`                  | **No**   |
| `http://agent.localhost:5173`                     | **No**   |
| `http://admin.localhost:5173`                     | **No**   |
| `https://agent.docuhealthservices.net`            | **No**   |
| `https://admin.docuhealthservices.net`            | **No**   |

To reproduce:

```bash
curl -s -o /dev/null -D - -X OPTIONS https://api-staging.docuhealthservices.net/api/auth/facility-applications -H "Origin: http://hospital.localhost:5173" -H "Access-Control-Request-Method: POST" -H "Access-Control-Request-Headers: content-type"
```

The response has `Vary: origin` but no `access-control-allow-*` headers. Changing the origin to
`http://localhost:5173` returns them.

**Asks** (assuming `django-cors-headers`):

- [ ] **First, to unblock testing:** allow `https://v2.docuhealthservices.net`,
      `https://hospital.v2.docuhealthservices.net`, `https://agent.v2.docuhealthservices.net` and
      `https://admin.v2.docuhealthservices.net` on the staging API.
- [ ] Then allow every app subdomain, including two levels deep (`hospital.v2.…`), for example:

  ```python
  CORS_ALLOWED_ORIGIN_REGEXES = [
      r"^https://([a-z0-9-]+\.){0,2}docuhealthservices\.net$",
  ]
  # staging only — local dev on any subdomain of localhost:
  CORS_ALLOWED_ORIGIN_REGEXES += [r"^http://([a-z0-9-]+\.){0,2}localhost:5173$"]
  CORS_ALLOW_CREDENTIALS = True
  ```

- [ ] Optional: Vercel preview deploys (`https://*.vercel.app` for our project) on staging only.
- [ ] Add the same origins to `CSRF_TRUSTED_ORIGINS` if any cookie-authenticated endpoint is
      CSRF-protected (the refresh cookie, for example).

Already correct: credentials allowed, `authorization` and `content-type` headers allowed,
methods `GET/POST/PUT/PATCH/DELETE/OPTIONS`.

---

## 3. Staging returns Django debug pages

The 500 above came back as Django's full technical error page, with the stack, file paths,
Python path and server details. That means `DEBUG = True` on a publicly reachable host.

**Asks:**

- [ ] Set `DEBUG = False` on staging and send errors to logging or Sentry instead.
- [ ] Return a JSON body for 500s too (`{"detail": "Something went wrong", "status": "error"}`),
      so the app can show a sensible message.

---

## 4. Error body shape

The app now reads all of the following, but one documented shape would be better:

- `{"detail": "Invalid OTP", "status": "error"}` — current for most auth errors
- `{"message": "..."}`
- DRF field errors: `{"official_email": ["Already registered."]}` and `{"non_field_errors": [...]}`

**Ask:**

- [ ] Confirm `detail` is the standard for non-field errors and DRF's default for field errors,
      so we can tighten the client.

---

## 5. Auth contract questions

These block finishing the session handling on the frontend:

1. **Login response.** Is it always `{status, message, data: {access_token, acting_as[], next_step, user}}`?
   The client also accepts `access`, `accessToken`, and an unwrapped body. Which is canonical?
2. **Refresh token.** Is it only an httpOnly cookie, or also in the body? If a cookie: what are
   its `Domain`, `SameSite` and `Secure` settings? It needs `Domain=.docuhealthservices.net`,
   `SameSite=None` and `Secure`, so the hospital and main subdomains share one session.
3. **`POST /api/auth/refresh` body.** Is it empty (cookie only), or `{refreshToken}`?
4. **Staff roles.** What's the full list of `acting_as[].staff_role` values, and which ones get
   their own dashboard? (The client knows `receptionist`, `radiologist`, `doctor`, `nurse`,
   `lab_scientist`, `pharmacist` and `radiographer`, plus `is_admin`.)
5. **Gates.** Besides `nin_not_verified` and `admin_details_required`, are there other
   `next_step` values, or other 403 `code`s we should route on?
6. **Test accounts on staging.** We need one each: patient, hospital admin, receptionist,
   radiologist, a patient with `nin_not_verified`, and an admin with `admin_details_required`.

---

## 6. Links the frontend sends: use them as-is

Three requests carry a full URL that the backend puts in an email. The frontend now builds each
one for the site the user is on, so a request from the v2 test site carries v2 links:

| Field          | Endpoint                                | Example from v2                                     |
| -------------- | --------------------------------------- | --------------------------------------------------- |
| `login_url`    | `POST /api/auth/signup`                 | `https://v2.docuhealthservices.net/login`           |
| `redirect_url` | `POST /api/auth/facility-applications`  | `https://hospital.v2.docuhealthservices.net/verify` |
| `login_url`    | `POST /api/auth/facility-registrations` | `https://hospital.v2.docuhealthservices.net/login`  |

**Asks:**

- [ ] Build the email links from these fields, not from a hard-coded domain. For the facility
      verification email, append `?token=<token>&application=<application sqid>` to
      `redirect_url`. The page shows "Link expired" if either is missing.
- [ ] If you validate these URLs, allow any `https://…docuhealthservices.net` host (including
      `hospital.v2.…`) and `http://…localhost:5173` on staging.

---

## 7. Dashboard endpoints

The hospital admin, receptionist and radiologist dashboards run on a mock API for now. They call
`/hospital/...` paths (for example `/hospital/profile`, `/hospital/staff`,
`/hospital/radiology/scan-orders`). With mocks off, these 404 on staging, so the dashboards can't
be tested against the real API yet.

- [ ] Share the planned v2 endpoints for the staff dashboards (paths and response shapes), or an
      OpenAPI schema, so we can switch from the mocks.
