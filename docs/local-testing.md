# Testing v2 locally

For developers (and anyone testing on a computer with the code). QA tests the live test site with
[`qa-test-guide.md`](qa-test-guide.md); the checklists there work here too, with the differences
below.

## Run it

```bash
npm install
npm run dev:staging   # the real staging API, at port 5180
npm run dev           # demo mode: a fake API with sample data, at port 5173
```

| Section                    | Staging data (`dev:staging`)         | Demo data (`dev`)                    |
| -------------------------- | ------------------------------------ | ------------------------------------ |
| Public site, patient login | http://localhost:5180                | http://localhost:5173                |
| Hospital staff login       | http://hospital.localhost:5180/login | http://hospital.localhost:5173/login |
| DocuHealth admin login     | http://admin.localhost:5180/login    | http://admin.localhost:5173/login    |

Use Chrome or Edge (they open `*.localhost` without extra setup).

- **`dev:staging`** forwards every API call through your computer to staging, so it works even
  when staging's website allow-list (CORS) blocks the live site. Log in with the staging test
  accounts (from the team lead; they aren't in the repo). Same data and rules as the live site:
  shared, test patients only, never buy a plan. It's also what makes sign-in work locally: the
  session is in the API's cookies, which a browser keeps for `localhost` only when the calls go
  through this forwarding (the dev server relaxes their `Secure` flag so Safari keeps them too).
  One login per browser: use a separate browser profile per role.
- **`dev`** never touches a server: the fake API lives in the browser (`src/mocks/`). Safe for
  trying every write action. Settings are in `.env.local` (`VITE_ENABLE_MOCKS=true`).

## Demo logins (`npm run dev`)

Any password works. The part of the email before `@` picks the role:

| Email                 | Logs in as                                        |
| --------------------- | ------------------------------------------------- |
| `reception@test.com`  | Receptionist                                      |
| `doctor@test.com`     | Doctor                                            |
| `nurse@test.com`      | Nurse                                             |
| `lab@test.com`        | Lab scientist                                     |
| `pharmacy@test.com`   | Pharmacist                                        |
| `radiology@test.com`  | Radiologist                                       |
| `anything@test.com`   | Hospital admin (patient on the main site's login) |
| `firstlogin@test.com` | Hospital admin on first login (asks for details)  |
| `dhadmin@test.com`    | DocuHealth admin (on the `admin.` login)          |
| `wrong@test.com`      | Fails with "Invalid login credentials"            |

On sign-up, desk registration and password reset, two more emails try the code rules:
`exists@test.com` already has an account (after the code you're sent to log in, or at the desk
told to look the patient up by HIN), and `wait@test.com` is refused a second code, so "Resend
Code" counts down.

## What's different in demo mode

- Each dashboard has its own sample data, so the QA guide's patient journey doesn't join up: a
  patient checked in by the receptionist doesn't reach the demo nurse. Try each step on its own,
  or use `dev:staging` for the whole journey.
- There's no demo lab admin; test the lab admin with `dev:staging`.
- Demo data resets when the page reloads.
- Forms come pre-filled (`VITE_PREFILL_FORMS=true`); clear a field before typing.
- The demo patient Yemi Ojo (admission-1) has no admission note, so the nurse's admission note
  notice shows when you open them.

## Automated tests

```bash
npm run typecheck && npm run lint && npm test   # unit tests (Vitest), against the fake API
npx playwright install chromium                 # once per computer
npm run test:e2e                                # end-to-end (Playwright), against the fake API
```

The end-to-end specs are out of date with today's screens (see the migration plan, Phase 7), so
many of them fail until they're rewritten.
