# Backend handoff: v2 launch (24 Nov 2026)

From the frontend team. The v2 web app is built: every staff dashboard, the DocuHealth admin
section and the public pages now run on the staging API (`https://api-staging.docuhealthservices.net`).
This note lists what we need from the backend, most urgent first. Each item has a number in
[`backend-gaps-v2-migration.md`](backend-gaps-v2-migration.md) (shown as **§**), which has the
details and a way to reproduce it.

## A. Blocks launch

| #   | What                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Where (§) |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| 1   | **CORS allows no website at all.** Since about 24 Nov, staging answers no browser origin, not even `localhost:5173`, which worked before. No deployed site can call the API. Please allow `*.docuhealthservices.net` (two levels deep, e.g. `hospital.v2.…`) on staging, and the new subdomains on production. With it: expose `Retry-After` (`CORS_EXPOSE_HEADERS`), and allow the same sites in the email-link check, or sign-ups from v2 get "This link must point to a Docuhealth site." | §1        |
| 2   | **Which API is production?** v2 is built on staging's paths (`api/auth/staff…`, `api/hospital-ops/…`). The old `api/hospitals/*` paths are gone on staging. Does production have the new paths, and what's its URL?                                                                                                                                                                                                                                                                          | §4        |
| 3   | **Debug pages are public.** Staging still shows Django's debug page (URL list, stack traces). Set `DEBUG = False` and return JSON errors.                                                                                                                                                                                                                                                                                                                                                    | §2        |

## B. Forms that fail today because the API asks for more than the screen does

Your onboarding guide settled three of these, and the forms now ask for what the API needs: the
receptionist's registration asks for a date of birth, Add Facility asks for the facility's name and
address, and Add Staff no longer sets a password (the API emails a temporary one). These remain:

| #   | Screen                                  | The API's error / what's wrong                                                                                 | §                                       |
| --- | --------------------------------------- | -------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| 4   | Receptionist: book an appointment       | `staff: This field is required.` Please make `staff` optional on `appointments/book`.                          | §7 Receptionist 7                       |
| 5   | Doctor/nurse/receptionist: shared notes | `GET /api/records/patients/{hin}/soap-notes/shared` returns **500** (ValueError).                              | §7 Receptionist 15, Doctor and nurse 18 |
| 6   | Pharmacy: walk-in customer              | Every drug order needs a check-in or admission, so a walk-in can't be served. Not built until this is decided. | §7 Pharmacy 1                           |
| 7   | Public site: contact and newsletter     | v1's `/api/…/inquiries` return 404; there's no newsletter endpoint.                                            | §7 Public site 1                        |

## C. Missing data: the screen shows "—" or "Not available yet"

None of these stop a user from working, but each leaves part of a screen empty. The full list,
call by call, is in §7. The main ones:

- **Everyone:** unread counts for the bell and Messages (§6).
- **Receptionist:** overview figures, reschedule and cancel an appointment, follow-up requests,
  linking an existing child as a dependant, search appointments by HIN.
- **Hospital admin:** grant or revoke admin access, joining dates, facility count, check-in
  stats, patient filters and sorting, staff activity, patient visit history, wallet balance.
- **Lab and radiology:** look up a patient by HIN (403 today), date filters, one order by ID,
  "New" badge fields.
- **Doctor and nurse:** one admission or check-in by ID, search by HIN, doctors reading charts,
  care plans and vitals (403 today), notes filtered by admission, the patient on lab results to
  review.
- **DocuHealth admin:** the admin's own name and email (the login returns none), who reviewed an
  application.

## D. Questions to answer

1. Activating and deactivating users (DocuHealth admin): the schema says `{facilities: [sqid]}`
   for hospitals and `{hins: []}` for patients; v1 sent other shapes. Which is right? (§7 DocuHealth admin 6)
2. Subscribing: does `POST /api/payments/subscribe` return a Paystack `authorization_url`, and
   does `plan` take the `paystack_plan_code` or the plan's `sqid`? (§7 Hospital admin 15)
3. Discharge: the follow-up rules and the `condition_at_discharge` values. (§7 Doctor and nurse 26)
4. Fix the OpenAPI schema where it doesn't match real replies: 15 endpoints have no response
   schema, and several fields typed as strings are objects (§3, and noted per dashboard in §7).
5. Still open from our 18 Nov note, unless you've fixed them since:
   - Patient sign-up step 3 (`POST /api/auth/signup/complete`) returned a 500 in
     `keyed_nin_hash` (`'NoneType' object has no attribute 'encode'`), most likely a NIN-hashing
     secret missing on staging.
   - Errors come back as `{detail}`, `{message}` or DRF field errors. Is `detail` the standard?
   - The refresh token: is it only an httpOnly cookie, and with which `Domain`/`SameSite`? It needs
     `Domain=.docuhealthservices.net`, `SameSite=None` and `Secure` so the main site and the
     `hospital.` site share one session.
   - Emails should use the links we send (`login_url`, `redirect_url`), not a fixed domain, so a
     sign-up on v2 gets v2 links. The facility email appends `?token=…&application=…` to
     `redirect_url`.

## E. Your four handoffs of 24 Nov

- **Records placement** and **pharmacy partner removal:** nothing to change in v2. It already uses
  the new records addresses, reads none of the removed drug fields, and never had partner screens.
  v1 (still live) does call the old addresses and has partner pages.
- **Onboarding:** v2 already followed it. Changed since: new staff and facility admins are sent the
  hospital login (they were sent the patients' one), and registering a facility in person moved
  into the DocuHealth admin section, since only DocuHealth admins may do it. Still to build: detach
  an arm, link an existing facility, name an admin for a facility without one.
- **SMS and one-time codes:** done in v2. Forgot password sends `identifier` (patients can use a
  phone; staff use their email), sign-up no longer sends `login_url` and shows `destination`, a
  409 `account_exists` sends the patient to log in (or, at the desk, to look them up by HIN), and
  "Resend code" waits and counts down after a 429. Two asks: `destination` isn't in the schema
  (we read it from the body or `data`), and the browser can only read `Retry-After` once CORS
  exposes it (until then we wait 60 seconds).

## How we checked

- Each dashboard's reads were called on staging with that role's test account (admin,
  receptionist, doctor, nurse, lab scientist, lab admin, pharmacist, radiologist, DocuHealth
  admin), and the replies were checked against what the app expects.
- We didn't create, approve, reject or delete anything on staging, so the shared test data is
  unchanged. Write actions are covered by the app's tests against a mock API.
