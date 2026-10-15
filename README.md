# Meloria Shop

Meloria is a Ukrainian-language shop for gifts, home products and accessories.
It started as the author's first online business project and is also used for
DCI Web Development coursework and preparation for the IHK Frontend assessment.

The first target market is Ukraine. The catalogue currently presents products
from the Ukrainian brand Презентвіль, referred to as Presentwill on the website.
The longer-term idea is to support more Ukrainian manufacturers. Expansion to
Germany is a future possibility, not an implemented localisation feature.

**Main website:** [www.meloria.pp.ua](https://www.meloria.pp.ua/)

The old [GitHub Pages address](https://olhakhodakivska.github.io/meloria-shop/)
is now intended only to redirect visitors to the main website.

## Implemented features

- Product catalogue loaded asynchronously from `public/products.json`.
- Category browsing, text search and express/made-to-order filters.
- Product details with image navigation and a fallback for failed product images.
- Separate catalogue loading, empty, no-results and error states.
- Shopping cart with quantities, item selection and `localStorage` persistence.
- Guest checkout with contact, delivery and payment-method validation.
- Server-side validation of product IDs, availability, prices and order totals.
- Order storage in Supabase and Telegram notifications for the shop owner.
- Retry protection using a stable request UUID and the database primary key.
- Clerk sign-in, sign-up and profile components. Checkout does not require login.
- Responsive navigation, keyboard handling for dialogs and labelled form errors.
- Information pages, route-specific metadata and generated static SEO pages.

Payment is a **manual bank transfer** using displayed card or IBAN details.
There is no payment gateway, automatic charge or automatic confirmation of payment.
Delivery choices are form fields, not a live postal-service API integration.

## Technology

| Tool | Responsibility |
| --- | --- |
| React 19 | Components, hooks and interface state |
| TypeScript 6 | Application and API types |
| Vite 8 | Frontend development and production builds |
| React Router 7 | Client-side routes and catalogue URL parameters |
| CSS Modules and global CSS | Component styles, shared colours and responsive layouts |
| Supabase / PostgreSQL | Order storage, permissions and unique order IDs |
| Clerk | Authentication and profile UI |
| Vercel | Main website hosting and the serverless orders API |
| Telegram Bot API | Notifications after an order is saved |
| Node.js test runner and ESLint | Automated checks and linting |

## Architecture and data flow

```text
public/products.json -> Home -> category/search filters -> ProductCard
                                                           |
                                                           v
Header / CartDrawer <-> CartProvider <-> localStorage
                              |
                              v
                          Checkout
                              |
                        submitOrder()
                              |
                       POST /api/orders
                              |
                   validate fields and prices
                   against public/products.json
                              |
                              v
                    Supabase public.orders
                              |
                    Telegram notification
                              |
                   order receipt -> ThankYou
```

`App` provides the shared header, footer, cart and route layout. Pages are loaded
with `React.lazy`. `CartProvider` owns cart state; components access it through
`useCart`. Cart persistence uses the `meloria_cart` localStorage key.

The browser sends selected products and customer details to the orders API.
The server validates the request, rebuilds product information from the catalogue,
and calculates totals in integer kopiykas before converting back to hryvnias.
Initial order and payment statuses are assigned by the server.

For an unresolved submission, the browser keeps a UUID under a payload hash in
`sessionStorage`. The stored retry marker contains no plaintext contact details.
The server uses that UUID as the order's primary key. A matching retry returns the
existing receipt; a reused ID with different purchase details is rejected.
Simultaneous identical calls in the same client module share one pending promise.

After confirmation, only the submitted quantities are subtracted from the current
cart. Later additions and selection changes are preserved. A Telegram error does
not turn an already saved order into a failed database write.

## Project structure

```text
api/orders.ts                 Server-side checkout endpoint
src/App.tsx                   Routes and shared application layout
src/main.tsx                  React entry point and optional Clerk provider
src/pages/                    Catalogue, checkout, auth and information pages
src/components/               Header, product cards, cart, SEO and shared UI
src/context/                  Cart state and useCart
src/hooks/useModalFocus.ts     Dialog focus, Escape and scroll handling
src/lib/                      Submission and cart-cleanup helpers
src/types/                    Product and cart types
public/products.json          Catalogue used by both frontend and API
scripts/                      Catalogue import, SEO build, redirects and SQL checks
tests/                        Node.js unit and integration tests
docs/qa/                      Dated verification evidence and limitations
vercel.json                   Main-host routing and API catalogue inclusion
supabase-orders.sql           Database bootstrap/reference SQL
```

## Local setup

Development checks have been run with **Node.js 24.14.0** and npm.
The tests import TypeScript directly through Node's built-in TypeScript support.

```bash
git clone https://github.com/OlhaKhodakivska/meloria-shop.git
cd meloria-shop
npm ci
```

For a new checkout, copy `.env.example` to an untracked `.env.local` and replace
the placeholders before starting. Preserve an existing environment file.
To browse without Clerk, leave `VITE_CLERK_PUBLISHABLE_KEY` unset; do not use the
placeholder as a real key.

```bash
npm run dev
```

Use the local address printed by Vite. This command serves the **frontend only**;
it does not run `api/orders.ts`. `npm run preview` also serves only built frontend
files. Full local Vercel-function development has not been configured or verified
in this repository. Use the automated API tests for isolated local checks.

The order endpoint runs in the Vercel deployment. Do not point local tests at
production or submit production orders as part of an automated test run.

## Environment variables

See [.env.example](.env.example) for placeholder values.

| Variable | Use |
| --- | --- |
| `VITE_CLERK_PUBLISHABLE_KEY` | Public Clerk key; enables authentication components |
| `VITE_PAYMENT_RECIPIENT` | Public payment recipient displayed to customers |
| `VITE_PAYMENT_CARD_NUMBER` | Public bank-transfer details displayed to customers |
| `VITE_PAYMENT_IBAN` | Public bank-transfer details displayed to customers |
| `SUPABASE_URL` | Server-side Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Private server key; accepts a modern Supabase secret key or legacy service-role key |
| `TELEGRAM_BOT_TOKEN` | Private server-side bot token; needed for notifications |
| `TELEGRAM_CHAT_ID` | Server-side destination chat; needed for notifications |
| `VITE_SUPABASE_URL` | Legacy browser-helper setting; also accepted as a server URL fallback |
| `VITE_SUPABASE_ANON_KEY` | Legacy browser-helper setting; not required by the current checkout flow |

All `VITE_` values can appear in the browser bundle. Never give a private key a
`VITE_` prefix. Configure server variables in the appropriate Vercel environment.
Environment files are ignored by Git, except the placeholder `.env.example`.

## Orders API and database

`POST /api/orders` accepts a UUID v4 `request_id`, customer name/email/phone,
delivery method/city/branch, payment method, selected items and a total.
Each item includes a product ID, price and positive integer quantity.

The API checks the supplied data against the server catalogue and returns only an
order receipt: `id` and, when available, `order_number`. It does not return customer
contact details. The current production schema uses a UUID `id`; `order_number`
is optional. `payment_details` is stored as JSON text in the existing text column.

| HTTP status | Meaning |
| --- | --- |
| `201` | New order saved |
| `200` | Existing matching order confirmed on retry |
| `400` | Invalid request fields |
| `405` | Unsupported request method |
| `409` | Catalogue/total conflict or reused ID with different purchase details |
| `503` | Missing server configuration or failed retry lookup |
| `500` | Order processing or storage failure |

The orders table has RLS enabled and public browser roles have no table access.
Only the server uses the private key. These permissions do not replace API input
validation. Customer orders are not associated with Clerk users by the current
checkout flow, and there is no customer order-history page or admin dashboard.

SQL files have different purposes:

- `scripts/check-order-schema.sql`, `check-order-permissions.sql` and
  `check-order-id-constraint.sql` inspect metadata without selecting customer rows.
- `scripts/secure-order-access.sql` changes permissions and policies; review its
  effect on the deployed API before executing it.
- `supabase-orders.sql` includes schema changes and an order-number backfill.
  It is not a migration to run blindly on an existing production database.
- `tests/fixtures/orders-production-schema.sql` is a synthetic local test fixture,
  not a production setup command.

## Catalogue maintenance

The application uses a committed JSON catalogue, not a live supplier request on
every page visit. The import script appends previously unseen IDs and preserves
existing entries; it does **not** refresh existing prices, stock or descriptions.

```bash
npm run import:prom
# Or supply a local XML file:
npm run import:prom -- /path/to/catalogue.xml
```

Importing writes `public/products.json`. Review its diff and product data before
committing and deploying. The “new” view sorts numeric product IDs, not publication
dates. Featured products are a selection, not a measured bestseller ranking.

## Quality checks

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run preview
```

The build runs frontend/Vite type checks, produces `dist`, and generates static
SEO pages. The API is outside those frontend TypeScript configurations; check it
separately after server changes:

```bash
node node_modules/typescript/bin/tsc --ignoreConfig --noEmit --target es2023 --module nodenext --moduleResolution nodenext --skipLibCheck --types node api/orders.ts
```

The suite currently contains 73 passing tests. It covers validation, catalogue
price checks, currency totals, Telegram failures, uncertain responses, retry
recovery, concurrent requests, cart cleanup and legacy URL redirects. Network
requests in the order tests are intercepted and use synthetic data.

Browser checks are manual/agent-assisted, not a committed automated E2E suite.
They have covered desktop/mobile navigation, catalogue states, forms, dialogs,
cart updates during a delayed request, direct routes and redirect behaviour.
Local PostgreSQL checks were also performed against the reported column types.
The owner has confirmed a saved production order and a received Telegram message.
This is evidence for that checked flow, not a claim that every scenario is tested.
Dated QA records describe the evidence available when they were written.

## Accessibility and responsive design

The interface uses semantic page landmarks, heading levels, associated form labels,
field-specific error descriptions and status/alert messages. Shared dialog handling
moves focus inside, supports Tab/Escape and restores focus when a dialog closes.
The header uses a compact menu at widths up to 900 px. The city field keeps the
browser's native `datalist`, so its popup appearance depends on the browser.

Screen-reader testing and a complete contrast audit remain open. No Lighthouse
score or full accessibility conformance is claimed. Clerk's embedded forms still
include English text; full Ukrainian localisation of those forms is not implemented.

## Deployment

The main site is hosted on **Vercel**, connected to the GitHub `main` branch.
A push triggers its configured deployment. `vercel.json` keeps `/api/orders`
separate from SPA route fallback and includes the catalogue in the server function.
Direct routes such as `/checkout` and `/auth` have been checked after the routing fix.

**GitHub Pages is a separate redirect-only deployment.** It cannot run this server
endpoint. The following commands prepare or publish that legacy redirect:

```bash
npm run build:github  # Creates dist-github/index.html and 404.html only.
npm run deploy       # Builds and publishes the redirect to gh-pages.
```

The redirect preserves paths, query parameters and fragments, using a fixed target
origin. Without JavaScript, a manual link is available. Existing carts and login
sessions do not transfer between origins. A push to `main` does not itself publish
the GitHub Pages redirect. The project owner performs commits, pushes and deployments.

## Known limitations and next steps

- The large JSON catalogue and images still need performance work.
- Retry continuity depends on the same payload and the same tab's sessionStorage;
  closing the tab or clearing browser storage can lose an unresolved request ID.
- Authentication components are present, but a complete sign-in/sign-up/sign-out
  journey has not been independently verified. Clerk is currently in development mode.
- Payment, stock confirmation and fulfilment require manual work.
- Automated browser E2E tests, notification delivery retries and abuse/rate-limit
  protection are not implemented.
- Support for more Ukrainian manufacturers and German localisation are future ideas.
- Final assessment checks and documentation updates are still required after changes.

## AI assistance disclosure

AI assistance was used for technical review, debugging, incremental code changes,
test preparation, documentation and English presentation practice. The author
remains responsible for reviewing changes, checking their behaviour and learning
to explain the implementation independently. Assistance does not replace the
author's own understanding or the assessment's disclosure requirements.
