# DocuHealth v2

The rebuilt DocuHealth web app (patients, hospitals and their staff roles, partners and
platform admins), built from the React Setup starter for the new design.

Status: foundations, design system (`/design-system`), the landing page, auth/onboarding connected
to the v2 API (patient login, sign-up, password reset, the NIN and admin-details gates, hospital
registration & verification, and field-agent hospital registration), and the hospital admin,
receptionist and radiologist dashboards (on the mock API until their endpoints exist).

## Stack

- **Vite 8** + **React 19** + **TypeScript 7** (strict) + **React Compiler**
- **TanStack Router** — file-based, type-safe routes with auth/role guards in `beforeLoad`
  and Zod-validated URL search params
- **TanStack Query** — server state; **axios** client with JWT + single-flight token refresh
- **Zod 4** — every API response is validated; forms via **React Hook Form**
- **Zustand** — client state (session)
- **shadcn/ui** (Radix, `radix-nova`) + **Tailwind CSS 4** — tokens live in `src/index.css`
- **Sonner** toasts, **Phosphor** icons
- **Sentry** (enabled when `VITE_SENTRY_DSN` is set)
- **Vitest** + Testing Library + **MSW** (mock API), **Playwright** e2e
- **oxlint** (type-aware) + **Prettier**, **Husky** + lint-staged, **Knip**, GitHub Actions CI

Add when a screen needs them: `@tanstack/react-table`, `date-fns`, `recharts` (via
`npx shadcn@latest add chart`), `motion`,
`@tiptap/react`.

## Getting started

```bash
npm install
cp .env.example .env.local   # mocks are on by default
npm run dev
```

With `VITE_ENABLE_MOCKS=true` the dev server runs against the MSW fake API in
`src/mocks/handlers.ts` (one file per feature, e.g. `src/mocks/hospital-admin.ts`) instead of the backend. Set `VITE_PREFILL_FORMS=true` in dev to pre-populate auth forms with sample data.
Neither ever applies to a production build: `npm run build` leaves the mocks and their service
worker out, whatever the env vars say.

The mock login picks a scenario from the email's first part (any password works):

| Email          | Patient login             | Hospital login            |
| -------------- | ------------------------- | ------------------------- |
| `wrong@…`      | 401 "Invalid credentials" | 401 "Invalid credentials" |
| `nin@…`        | `/verify-nin` gate        | —                         |
| `firstlogin@…` | —                         | `/first-login` gate       |
| `reception@…`  | —                         | Receptionist dashboard    |
| `radiology@…`  | —                         | Radiologist dashboard     |
| `lab@…`        | —                         | Lab scientist dashboard   |
| anything else  | Patient portal            | Admin dashboard (doctor)  |

Any verification code works except `000000`, which returns "Invalid OTP". On the dev server with
mocks on, the dashboards also open without logging in; production builds always require a session.

### Against the staging API

`npm run dev:staging` serves the app on port 5180 against the real staging API, with mocks off
(settings in `.env.staging`). The dev server proxies `/api` to staging, so the `hospital.` and
`admin.` sections work on `*.localhost` even though staging's CORS doesn't allow those origins.
Log in with a real staging account. The local URLs, demo logins and how demo mode differs are in
[`docs/local-testing.md`](docs/local-testing.md); QA's checklist for the live test site is
[`docs/qa-test-guide.md`](docs/qa-test-guide.md).

The backend's OpenAPI schema is the reference for every feature's `api/` folder. `npm run
api:schema` saves it to `docs/api/` (`openapi.json`, plus `endpoints.md` to grep). The migration
from v1 is tracked in `docs/v2-migration-plan.md`.

## Scripts

| Command                           | Does                                         |
| --------------------------------- | -------------------------------------------- |
| `npm run dev`                     | Dev server                                   |
| `npm run dev:staging`             | Dev server on the staging API, mocks off     |
| `npm run api:schema`              | Save the backend's OpenAPI schema to `docs/` |
| `npm run build` / `preview`       | Type-check + production build / serve it     |
| `npm run typecheck`               | `tsc -b`                                     |
| `npm run lint` / `lint:fix`       | oxlint (warnings fail)                       |
| `npm test` / `test:watch`         | Vitest (`test:coverage` for coverage)        |
| `npm run test:e2e`                | Playwright against the dev server + mock API |
| `npm run format` / `format:check` | Prettier                                     |
| `npm run knip`                    | Unused files, exports and dependencies       |

## Layout

```
src/
  routes/                File-based routes — thin; they compose features
    __root.tsx           Outlet, toaster, 404
    index.tsx            "/" — home page
    design-system.tsx    "/design-system" — live color, typography & component reference
    _auth/               Patient auth layout + login, register, forgot-password
    hospital/, agent/    Sections on their own subdomain (see "Sections and subdomains")
  features/<name>/       Domain code: api/ (schemas, requests, query options, mutations),
                         components/, lib/ (auth/, hospital-admin/, landing/, receptionist/,
                         radiologist/, lab-scientist/)
  components/            Shared app components (file-dropzone, success-dialog, required-mark)
    ui/                  shadcn components = the design system (generated; edit freely)
    dashboard/           The hospital dashboards' shared shell and blocks (sidebar, top bar,
                         stat cards, tables, tabs), driven by props — every role's feature
                         (hospital-admin, receptionist, radiologist, …) builds its pages from them
  lib/                   http client, request(), query client
  stores/                Zustand stores (auth session)
  assets/fonts/          Self-hosted variable fonts (Space Grotesk, Inter)
  assets/logos/          DocuHealth logo (also the favicon)
  mocks/                 MSW handlers — shared by dev mode and tests
  test/                  Vitest setup + renderWithProviders
  env.ts                 Validated VITE_* env vars
  router.ts / main.tsx   Router + app bootstrap (Sentry, mocks, providers)
e2e/                     Playwright specs
```

`src/routeTree.gen.ts` is generated by the router plugin when the dev server or build runs —
don't edit it.

## Sections and subdomains

One app serves every audience; the subdomain picks the section (`src/lib/sections.ts`):

| Section                   | Production                        | Dev (`npm run dev`)       | Routes                  |
| ------------------------- | --------------------------------- | ------------------------- | ----------------------- |
| Public site + patients    | `docuhealthservices.net`          | `localhost:5173`          | `src/routes/*`          |
| Hospitals and their staff | `hospital.docuhealthservices.net` | `hospital.localhost:5173` | `src/routes/hospital/*` |
| DocuHealth admins         | `admin.docuhealthservices.net`    | `admin.localhost:5173`    | `src/routes/admin/*`    |
| Field agents              | `agent.docuhealthservices.net`    | `agent.localhost:5173`    | `src/routes/agent/*`    |

The router rewrites between the two forms (`hospital.<domain>/register` ⇄ `/hospital/register`),
so links are written with the internal path — `<Link to="/hospital/register">` — and become a
full URL on the right subdomain. `VITE_ROOT_DOMAIN` names the production domain; on any other host
(e.g. preview deploys) nothing is rewritten and the prefixed paths are used directly. In
production, point all four domains at the same deployment.

An environment can sit between the section and the root domain: with
`VITE_ROOT_DOMAIN=docuhealthservices.net`, `v2.docuhealthservices.net` is the v2 environment's main
site and `hospital.v2.docuhealthservices.net` its hospital site. Links that leave the app (the
`login_url` / `redirect_url` the backend puts in emails) are built with `absoluteUrl()` from
`src/lib/sections.ts`, so they always point at the environment the request came from.

## Links and user flows

Paths below are what appears in the browser, on the base URL from the table above. For example,
`/register` under Hospitals is `hospital.docuhealthservices.net/register` in production and
`hospital.localhost:5173/register` in dev.

Guards live in `src/lib/auth-guards.ts`. A dashboard needs a session for its role (anyone else is
sent to their own dashboard), a pending gate step (`/verify-nin`, `/first-login`) comes before any
dashboard, and login/sign-up pages send anyone already signed in to their dashboard. A hospital's
admins get the admin dashboard; everyone else gets their role's (radiographers share the
radiologist's), and a role with none yet gets `/no-dashboard`, never the admin's.

### Patients and public site

| Path                                                            | Page                                           |
| --------------------------------------------------------------- | ---------------------------------------------- |
| `/`                                                             | Landing page                                   |
| `/our-mission`, `/our-vision`                                   | Mission and vision                             |
| `/docuhealth-news`                                              | News (`#slug` for one story)                   |
| `/docuhealth-api`                                               | The DocuHealth API, and how to ask for it      |
| `/terms-and-conditions`                                         | Terms (`?for=patient` or `?for=hospital`)      |
| `/privacy-policy`, `/legal-notice`, `/api-terms-and-conditions` | Legal pages                                    |
| `/login`                                                        | Patient login                                  |
| `/register`                                                     | Choose an account type                         |
| `/register?type=individual`                                     | Patient sign-up                                |
| `/forgot-password`                                              | Patient password reset                         |
| `/design-system`                                                | Live color, typography and component reference |

```
Sign up:   / → /register → choose an account type
             ├─ Individual: /register?type=individual
             │    your info → verify email code → account details → HIN shown → /login
             └─ Health Provider: hospital /register (see Hospitals)

Log in:    /login → /patient  (or /verify-nin first if the NIN isn't verified → /patient)

Reset:     /forgot-password → email → code → new password → /login

Log out:   /patient → clears the session → /login
```

The landing page's "Partner with Us" and contact section links go to the hospital `/register`. A
"Switch" link in the auth header moves between the patient and hospital versions of login and
sign-up. Anyone with a session who opens a patient auth page is sent to their dashboard.

### Hospitals and their staff

| Path                             | Page                                                      |
| -------------------------------- | --------------------------------------------------------- |
| `/`                              | The staff member's dashboard, or `/login`                 |
| `/first-login`                   | Admin details gate for migrated accounts                  |
| `/login`                         | Hospital login                                            |
| `/register`                      | Facility registration request                             |
| `/verify?token=…`                | Facility documents and admin details, from the email link |
| `/forgot-password`               | Hospital password reset                                   |
| `/admin`                         | Hospital admin dashboard                                  |
| `/admin/staff`                   | Staff list (`/admin/staff/:staffId` for one)              |
| `/admin/patients`                | Patient list (`/admin/patients/:patientId` for one)       |
| `/admin/appointments`            | Appointments                                              |
| `/admin/messages`                | Messages                                                  |
| `/admin/personnel`               | Health personnel                                          |
| `/admin/settings`, `/admin/help` | Settings and help                                         |
| `/receptionist`                  | Receptionist dashboard                                    |
| `/receptionist/…`                | Same sections as admin, except a single `/staff` page     |
| `/radiologist`                   | Radiologist dashboard                                     |
| `/radiologist/scan-orders`       | Scan orders (`/radiologist/scan-orders/:orderId` for one) |
| `/radiologist/…`                 | Appointments, messages, personnel, settings, help         |
| `/lab-scientist`                 | Lab scientist dashboard                                   |
| `/lab-scientist/test-orders`     | Test orders (`/lab-scientist/test-orders/:orderId`)       |
| `/lab-scientist/…`               | Appointments, messages, personnel, settings, help         |

```
Register:  /register → submit facility details → approval → verification email
             → /verify?token=… → documents → admin details → done → main site /
           (a link without its token or application shows a "Link expired" notice)

Log in:    /login → the role's dashboard: /admin (the hospital's admins), /receptionist,
           /radiologist (and radiographers), /lab-scientist, /pharmacy, /doctor, /nurse, or
           /no-dashboard for a role without one  (or /first-login first if admin details are
           missing)

Reset:     /forgot-password → email → code → new password → /login

Log out:   any dashboard → clears the session → /login
```

`hospital.<domain>/admin` is the **hospital's** admin dashboard. It isn't the DocuHealth admin
section, which is `admin.<domain>`.

### Field agents

The API only lets DocuHealth's admins register a facility in person for now, so the page is in
the admin section (`admin.<domain>/register-facility`, behind their login). Every path on
`agent.<domain>` (e.g. an old `/register-hospital` link) redirects there. When field agents get
their own login, the page can move back.

```
Register a facility:  admin.<domain>/register-facility
  details → location → admin details → done (the admin is emailed a temporary password) → /admin
```

### DocuHealth admins

DocuHealth's own admins (the `dhadmin` role), on `admin.<domain>` (`src/features/dh-admin/`).

| Path                         | Page                                                    |
| ---------------------------- | ------------------------------------------------------- |
| `/login`, `/forgot-password` | Log in and reset the password (no account type is sent) |
| `/`                          | Overview: totals, registrations, subscriptions, revenue |
| `/users`                     | Individuals and hospitals; deactivate and activate them |
| `/applications`              | Facility applications by status; approve or reject      |
| `/plans`                     | Subscription plans; add and edit                        |
| `/settings`, `/help`         | Settings (change password) and help                     |

```
Log in:    /login → / (a dhadmin who logs in elsewhere is sent here too)
Reset:     /forgot-password → email → code → new password → /login
```

With the mock API, log in as `dhadmin@…` with any password.

## Conventions

- **Imports** use the `@/` alias; no `../`. Enforced by lint:
  - features never import routes;
  - `components/`, `lib/`, `stores/`, `hooks/` never import features or routes.
  - Features shouldn't import each other's internals either (not lint-enforced — catch it in
    review). Move shared code down into `components/` or `lib/`.
- **API calls**: only from a feature's `api/` folder, only via `request(schema, config)`. A
  response that doesn't match its Zod schema throws `ApiSchemaError` naming the endpoint.
- **Queries**: export `queryOptions` per endpoint; one key factory per feature; mutations
  invalidate that feature's keys. Route loaders prefetch with `ensureQueryData`.
- **Forms**: React Hook Form + `zodResolver`; shadcn `Field` / `FieldError` for markup.
- **Guards**: protect routes in `beforeLoad` (throw `redirect(...)`), not in components.
- **Styling**: Tailwind classes using tokens from `src/index.css`; no hex values in components.
  `short:` targets viewports under 480px tall (a phone held sideways), e.g. to tighten a
  dialog's padding.
- **Colors** (from the design's color guide, light only):
  - Brand: `bg-primary` (= `brand`), `bg-brand-hover`, `bg-brand-pressed`.
  - Text: headings get `fg-heading` automatically; body text defaults to `fg-body`; captions
    use `fg-caption` (`text-caption` / `text-muted-foreground`).
  - Surfaces: page `bg-background` (#FAFAFA), cards/popovers white, borders `border-border`.
    Vertical dividers use `bg-divider` (#DFDCD7).
  - Status: `warning` / `success` / `error` / `info`, each `-100` (tint background), `-500`
    (main), `-700` (text on the tint) — e.g. `bg-success-100 text-success-700`.
- **Fonts**: `font-heading` (Space Grotesk) for headings and buttons; `font-sans` (Inter, the
  default) for body text, labels and links.
- **Text**: every piece of text uses one type role from the design's typography guide instead
  of mixing size/weight/leading classes. Body text defaults to `type-body`.

  | Class                         | Guide name                 | Font · size / line height · tracking                |
  | ----------------------------- | -------------------------- | --------------------------------------------------- |
  | `type-h1`                     | Heading/H1                 | Space Grotesk · 64px / 110%                         |
  | `type-h2`                     | Heading/H2                 | Space Grotesk · 48px / 110%                         |
  | `type-h3`                     | Heading/H3                 | Space Grotesk Bold · 24px / 135%                    |
  | `type-h4`                     | Heading/H4                 | Space Grotesk Bold · 20px / 140%                    |
  | `type-h5`                     | Heading/H5                 | Space Grotesk Bold · 16px / 140%                    |
  | `type-stat`                   | Heading/Stat               | Space Grotesk Bold · 24px / 125%                    |
  | `type-heading-sm`             | Heading/Small              | Space Grotesk Medium · 14px / 140%                  |
  | `type-heading-sm-regular`     | Heading/Small Regular      | Space Grotesk Regular · 14px / 140%                 |
  | `type-quote`                  | Header/Quote               | Space Grotesk · 32px / 125%                         |
  | `type-section`                | Landing/Section            | Space Grotesk · 40px / 110% · -2.5% (30px mobile)   |
  | `type-statement`              | Landing/Statement          | Inter Regular · 56px / 117% · -2.5% (28px mobile)   |
  | `type-stat-lg`                | Landing/Stat               | Space Grotesk Semi Bold · 96px / 100% (64px mobile) |
  | `type-title-xl`               | Landing/Title XL           | Space Grotesk · 28px / 130%                         |
  | `type-title-lg`               | Landing/Contact            | Space Grotesk Semi Bold · 22px / 135%               |
  | `type-title`                  | Landing/Title              | Space Grotesk Medium · 20px / 130%                  |
  | `type-title-sm`               | Landing/Title Small        | Space Grotesk Medium · 18px / 140%                  |
  | `type-lead`                   | Landing/Lead               | Inter Regular · 18px / 135% · -2.5%                 |
  | `type-body-tight`             | Landing/Body               | Inter Regular · 16px / 140% · -2%                   |
  | `type-body-lg`                | Landing/Body Large         | Inter Regular · 20px / 140%                         |
  | `type-accent-h1`              | Accent/H1                  | Inter Semi Bold · 32px / 120% · -2.5%               |
  | `type-accent-h2`              | Accent/H2                  | Inter Semi Bold · 24px / 135% · -2.5%               |
  | `type-accent-h3`              | Accent/H3                  | Inter Semi Bold · 20px / 140% · -2.5%               |
  | `type-accent-h4`              | Accent/H4                  | Inter Regular · 18px / 135%                         |
  | `type-body`                   | Body/Medium                | Inter Regular · 16px / 140%                         |
  | `type-body-sm`                | Body/Small                 | Inter Medium · 14px / 150%                          |
  | `type-body-sm-tight`          | Body/Small Tight           | Inter Regular · 14px / 140% · -2.5%                 |
  | `type-body-sm-tight-semibold` | Body/Small Tight Semi Bold | Inter Semi Bold · 14px / 140% · -2.5%               |
  | `type-link-sm`                | Link/Small                 | Inter Medium · 14px / 140% · -2.5%                  |
  | `type-body-sm-regular`        | Body/Small Regular         | Inter Regular · 14px / 140%                         |
  | `type-body-sm-medium`         | Body/Small Medium          | Inter Medium · 14px / 140%                          |
  | `type-caption`                | Body/Caption               | Inter Regular · 12px / 135%                         |
  | `type-caption-medium`         | Body/Caption Medium        | Inter Medium · 12px / 135%                          |
  | `type-caption-semibold`       | Body/Caption Semi Bold     | Inter Semi Bold · 12px / 135% · -0.5%               |
  | `type-caption-tight`          | Body/Caption Tight         | Inter Regular · 12px / 135% · -2.5%                 |
  | `type-label`                  | Label                      | Inter Semi Bold · 12px / 135% · 8%, caps            |

  Roles set only typography, so add a color class alongside (`type-caption text-fg-caption`).
  Always write class names in full — Tailwind only generates classes it finds literally in the
  source, so `type-${size}` won't work.

- **Page titles**: render `<title>` inside the page (React 19 hoists it).
- **Files** are kebab-case; components PascalCase; hooks `use-*`.
- **Tests**: next to the code (`*.test.tsx`). Network goes through MSW; unhandled requests fail.

## Notes

- Deploys on Vercel; `vercel.json` rewrites all paths to `index.html` for client routing.
- The session (including tokens) is persisted in `localStorage`. If the backend can issue
  httpOnly cookies instead, prefer that and drop the token handling in `src/lib/http.ts`.
- ESLint is not used: typescript-eslint doesn't support TypeScript 7 yet, and oxlint runs
  type-aware rules natively on it.
- `npm audit` reports moderate issues inside the `shadcn` CLI's own dependencies (dev-time
  tooling only; nothing ships to the browser). The suggested "fix" is a major downgrade, so
  it's not applied.
