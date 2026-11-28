# docduniya-frontend

Next.js 16 frontend for the DocDuniya backend (`../docduniya-backend`): a public doctor
directory with live booking, and signed-in areas for patients, doctors and platform admins.

## Run it with the backend

Both apps default to port 3000, so move the API:

```bash
# docduniya-backend/.env
PORT=5000
FRONTEND_URL=http://localhost:3000   # used in password-reset and email links

# docduniya-frontend/.env.local  (see .env.example)
API_URL=http://127.0.0.1:5000/api/v1
```

```bash
cd ../docduniya-backend && npm run dev     # plus `npm run worker` for payments, emails, scans
cd ../docduniya-frontend && npm run dev    # http://localhost:3000
```

## How the integration works

The server-side client reads `API_URL`, not `NEXT_PUBLIC_API_URL`. Set it in the frontend's `.env.local` to the backend's actual port. Restart `npm run dev` after changing environment settings if an existing process still uses the old address. Check `<API_URL>/health/ready` to confirm the API and database are ready.

- **Only the Next.js server calls the API** (server components, server actions, `src/proxy.ts`).
  Backend tokens remain in HTTP-only cookies. Existing server-rendered screens call
  `src/lib/api/server.ts`, which adds the bearer token, a fresh `Idempotency-Key` for each
  mutation, the visitor's IP and user agent, and turns errors into `ApiError`.
- **Sessions:** sign-in stores the backend access token (`dd_at`, ~13 min) and rotating refresh
  token (`dd_rt`, 7 days) as httpOnly cookies on the frontend's domain. The proxy refreshes
  them before pages render. Concurrent refreshes are shared, because the backend revokes a
  session when a rotated refresh token is replayed. A rejected session goes to `/session-expired`.
- **Roles:** backend accounts are role-neutral. "Patient" means the account owns a patient
  profile (`/me/patients`), "doctor" a doctor profile (`/doctors/me`), "admin" any platform
  permission (`/auth/me`). Sign-up creates the account, verifies the email code, signs in and
  creates the profile in one flow; accounts without a profile go to `/onboarding/*`.
- **Public data** (directory, specialities, reviews) is cached for a few minutes with
  `use cache`. Booking always re-reads live availability and the backend re-checks every hold.

## Redux workspaces

The dashboard sidebars link to three additional connected workspaces:

- `/workspace/patient`: care services, consent, insurance, documents and messaging.
- `/workspace/provider`: clinic/hospital organization operations, staff, facilities, patient registrations, scheduling, clinical records, diagnostics, pharmacy, inpatient care, procedures, billing and claims. Independent doctors and clinic owners use the same organization model.
- `/workspace/admin`: platform governance, verification, support, catalogs, account administration and operational tools. The server checks platform access before rendering this area.

`src/lib/store` creates a Redux Toolkit store per workspace mount. RTK Query performs reads and mutations through the same-origin `/api/platform` server bridge. Tokens never enter Redux or browser storage; Redux DevTools and persistence are disabled. Successful commands invalidate query data. Organization switches clear cached data and selected references. The backend remains authoritative for organization, facility, patient and permission checks.

Choose an organization and facility by name. Find registered patients by MRN or browse the paginated patient selector; patients can switch between their own authorized profiles. Lists also let you select records to carry references into subsequent workflows. Forms support nested objects, repeatable items, union choices, dates, enums and multipart file uploads. Commands have a review step and retain the same idempotency key when retrying unchanged input. Versioned commands require the current version shown in the record results; reload after a conflict. Some operational workflows use reference fields rather than dedicated pickers.

The workflow catalog is generated from all 404 published backend operations. Authentication uses the dedicated account screens; health checks and payment webhooks are deliberately not offered as user commands. Every other operation is reachable through at least one workspace. This is contract coverage, not a claim that every business scenario has passed end-to-end testing. Specialized booking, Razorpay checkout and document upload screens remain available alongside the operational workspaces. Asset file replacement has a documented multipart override because its controller and current OpenAPI content type differ.

## Checks and contract updates

```bash
npm run api:sync   # reads the sibling backend OpenAPI file; run after API changes
npm test          # coverage, routing safety, multipart override and form defaults
npm run lint
npm run typecheck
npm run build
```

The API bridge rejects cross-origin requests, unknown operations and invalid path segments. It forwards only declared query parameters and uses a fixed server-side API base URL. Deploy behind HTTPS with the frontend's public origin preserved by the reverse proxy. Keep `API_URL` server-only. Google fonts are fetched during the Next.js build, so build environments need access to Google's font endpoints.

For an isolated local preview, set `FRONTEND_BUILD_DIR=.next-preview` and choose a separate port; normal development and production use `.next`. Production builds must use the same build directory at startup.

Verification performed with a temporary synthetic database: patient login, organization selection, facility creation and subsequent list read, named facility selection, nested patient registration, patient lookup, messaging permission errors and successful front-desk conversation creation. Lint, TypeScript, contract tests and production build are separate checks. Live Razorpay capture, S3 upload/scanning, email delivery and every clinical transition require configured integrations and acceptance testing with appropriate authorized roles before launch.

## What each area uses

| Area | Backend endpoints |
| --- | --- |
| Directory and profile | `/discovery/doctors`, `/specialties`, `/doctors/:id/reviews`, `/offerings/:id/availability` |
| Booking and payment | `/appointments/holds`, `…/confirm`, `…/cancel`, `/appointments/:id/payment-intents`, `/payment-intents/:id/verify` (Razorpay Checkout) |
| Patient | `/me/appointments`, `/patients/:id/clinical-records`, `…/diagnostic-reports`, `…/documents`, `/documents/upload-intents`, `/patients/:id/profile`, `/support-tickets`, `/reviews` |
| Doctor | `/doctors/me`, `/practitioners/me/{qualifications,registrations}`, `/doctors/me/verification-requests`, `/doctors/me/publication`, `/doctors/me/affiliations`, `/me/memberships`, `/organizations/:id/appointments` (+ check-in/start/complete), `/doctors/me/time-blocks` |
| Admin | `/platform/doctor-verifications`, `/platform/provider-verifications`, `/platform/reviews`, `/platform/support-tickets`, `/users`, `/platform/operations/health`, `/platform/outbox/*` |
| Everyone | `/auth/*` (login, MFA, OTP, password reset, sessions), `/me/notifications` |

## Deployment notes

- Document uploads `PUT` directly to the presigned URL of `PRIVATE_DOCUMENTS_BUCKET`, so that
  bucket's CORS must allow `PUT` from the frontend origin. Without a ClamAV scanner, uploads stay
  in "Security scan" (backend behaviour).
- Online payment needs an active Razorpay merchant account for the clinic and the backend worker.
- The home page lead form and the contact form are not connected to the backend: it has no
  public endpoint for them.
