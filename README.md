# ServiSync — Field Service Management System

> **Tagline:** Smartly Connecting Customers, Field Technicians, and Service Operations.  
> **Backend Repository:** [Farhadmu/ServiSync-Backend-](https://github.com/Farhadmu/ServiSync-Backend-)  
> **Live Backend Base URL:** `https://servisync-backend.onrender.com/api/v1`  
> **Postman API Documentation:** [ServiSync API Collection](https://documenter.getpostman.com/view/56403424/2sBYAvwqwU)

---

## 🌟 Executive Overview

ServiSync is a production-oriented, full-stack field service management web application built with **Next.js 15 App Router**, **TypeScript**, **Tailwind CSS**, and **TanStack Query**. It connects four distinct operational roles into a unified real-time workflow:

1. **Customers:** Browse certified service catalogs, submit repair requests with problem descriptions and preferred times, track status progress in real-time, view technician profiles, settle invoices via Stripe Checkout, and rate service quality.
2. **Technicians:** Manage daily dispatch schedules, accept or decline assignments, record on-site milestone transitions (`ARRIVED` ➔ `IN_PROGRESS` ➔ `COMPLETED`), toggle live dispatch availability, and author comprehensive field service reports.
3. **Operations Managers:** Review new customer requests (`APPROVE` / `REJECT`), inspect technician certifications, prevent scheduling conflicts, dispatch field specialists, and generate itemized customer invoices.
4. **System Administrators:** Oversee platform governance, toggle user account activation, modify authorization roles, manage master service categories, and inspect system audit logs.

---

## 🔑 Evaluator Demo Credentials

Pre-seeded database accounts available in the ServiSync backend. The login screen (`/login`) includes **one-click autofill buttons** for each role:

| Role | Email | Password | Name | Permissions |
| :--- | :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@servisync.com` | `Admin@123` | System Admin | Full system governance, user roles, catalog, audit logs |
| **MANAGER** | `manager@servisync.com` | `Manager@123` | Operations Manager | Request review, conflict-free dispatching, invoice issuance |
| **TECHNICIAN** | `tech1@servisync.com` | `Tech@123` | Rahim Technician | Job queue, schedule, arrival/work status updates, service reports |
| **CUSTOMER** | `customer1@example.com` | `Customer@123` | Alice Customer | Service requests, live timeline, Stripe payments, ratings |

---

## 🛠️ Technology Stack

- **Framework:** Next.js 15.1 (App Router, Server Components default, Client Components where interactive)
- **Language:** TypeScript 5.7 (Strict type-checking)
- **Styling & UI:** Tailwind CSS, Radix UI accessible primitives (Dialog, Tabs, DropdownMenu, Avatar, Slot, Label)
- **Server State & Caching:** TanStack Query v5 (Automatic invalidation on mutations, cold start retries)
- **Client State:** Zustand v5 (Session management and role state)
- **Forms & Validation:** React Hook Form + Zod (Strict validation matching backend Express schemas)
- **Payments:** Real Stripe Checkout integration (Provider session generation, redirection, and verified backend status checks)
- **Icons & Feedback:** Lucide React & Sonner Toast Notifications
- **Testing:** Vitest & React Testing Library (Form schemas, API client tokens, status mappers)

---

## 🗺️ Complete API Inventory

Mapping each implemented endpoint directly from backend source code:

| Method | Endpoint | Auth Required | Permitted Roles | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/health` | No | Public | Backend health check |
| `POST` | `/auth/register` | No | Public | Register customer or technician account |
| `POST` | `/auth/login` | No | Public | Authenticate user & receive access/refresh tokens |
| `POST` | `/auth/refresh-token`| No | Public | Rotate expired access token |
| `POST` | `/auth/logout` | Yes | All | Revoke session and log out |
| `GET` | `/users/me` | Yes | All | Retrieve current user profile & profile relations |
| `PATCH`| `/users/me` | Yes | All | Update name, phone, address, or avatar |
| `PATCH`| `/users/me/password`| Yes | All | Update user password |
| `GET` | `/service-categories`| Yes | All | List master service categories |
| `GET` | `/service-categories/:id`| Yes | All | Fetch category with active service types |
| `POST` | `/service-categories`| Yes | ADMIN, MANAGER | Create new service category |
| `PATCH`| `/service-categories/:id`| Yes | ADMIN, MANAGER | Edit service category |
| `DELETE`| `/service-categories/:id`| Yes| ADMIN, MANAGER | Soft-delete category |
| `GET` | `/service-requests` | Yes | All (Role-Filtered) | Customer gets own; Manager/Admin gets all |
| `POST` | `/service-requests` | Yes | CUSTOMER | Create service request with category & service type |
| `GET` | `/service-requests/:id`| Yes | All (Authorized) | View request details and lifecycle status |
| `POST` | `/service-requests/:id/review`| Yes | MANAGER, ADMIN | Approve or reject customer ticket |
| `POST` | `/service-requests/:id/cancel`| Yes | CUSTOMER | Cancel pending / unassigned service request |
| `GET` | `/technicians` | Yes | All | List field technicians with skills & availability |
| `GET` | `/technicians/:id` | Yes | All | View individual technician profile |
| `GET` | `/technicians/me/jobs` | Yes | TECHNICIAN | View assigned jobs queue |
| `GET` | `/technicians/me/schedule` | Yes | TECHNICIAN | View chronological appointment calendar |
| `PATCH`| `/technicians/me/availability`| Yes | TECHNICIAN | Toggle on-duty / off-duty status |
| `PATCH`| `/technicians/me/profile` | Yes | TECHNICIAN | Update hourly rate, experience years, bio |
| `POST` | `/assignments` | Yes | MANAGER, ADMIN | Assign technician with schedule conflict check |
| `PATCH`| `/assignments/:id/respond`| Yes | TECHNICIAN | Accept or decline assignment (creates Work Order) |
| `PATCH`| `/assignments/:id/reschedule`| Yes| MANAGER, ADMIN | Reschedule assigned timeslot |
| `GET` | `/work-orders` | Yes | All (Role-Filtered) | List field work orders |
| `GET` | `/work-orders/:id` | Yes | All (Authorized) | Work order execution details & reports |
| `PATCH`| `/work-orders/:id/status`| Yes | TECHNICIAN, MANAGER | Transition: ARRIVED ➔ IN_PROGRESS ➔ COMPLETED |
| `PUT` | `/service-reports/work-orders/:id`| Yes| TECHNICIAN | Author / update digital field service report |
| `GET` | `/service-reports/work-orders/:id`| Yes| All (Authorized) | Inspect submitted service report |
| `GET` | `/invoices` | Yes | All (Role-Filtered) | Customer gets own; Manager/Admin gets all |
| `GET` | `/invoices/:id` | Yes | All (Authorized) | Detailed invoice with itemized line items |
| `POST` | `/invoices/work-orders/:id/invoice`| Yes| MANAGER, ADMIN | Generate itemized bill for completed order |
| `POST` | `/payments/initiate` | Yes | CUSTOMER | Create real Stripe Checkout session |
| `POST` | `/payments/success` | No | Public (Callback) | Verify Stripe checkout and mark invoice PAID |
| `POST` | `/feedback/work-orders/:id/feedback`| Yes| CUSTOMER | Submit 1–5 star rating and comment |
| `GET` | `/notifications` | Yes | All | Retrieve user notifications & unread count |
| `PATCH`| `/notifications/:id/read`| Yes | All | Mark notification as read |
| `GET` | `/admin/dashboard-stats` | Yes | ADMIN, MANAGER | Aggregated operational KPI metrics |
| `GET` | `/admin/users` | Yes | ADMIN | List all system accounts with pagination |
| `PATCH`| `/admin/users/:id/role` | Yes | ADMIN | Change user role |
| `PATCH`| `/admin/users/:id/status`| Yes | ADMIN | Activate or deactivate account |
| `GET` | `/admin/audit-logs` | Yes | ADMIN | Searchable system security audit logs |

---

## 🚀 Local Development Setup

### 1. Prerequisites
- Node.js >= 18 (Tested on v24.14.1)
- npm >= 9

### 2. Installation
Navigate into the `frontend` folder and install dependencies:
```bash
cd frontend
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Configure your backend URL:
```env
NEXT_PUBLIC_API_URL=https://servisync-backend.onrender.com/api/v1
```
*(If running the backend locally on port 5000, use: `NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1`)*

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Running Tests & Quality Checks
```bash
npm run typecheck   # Strict TypeScript verification (0 errors)
npm test            # Run Vitest unit & component test suite (21 tests across 4 suites)
npm run test:e2e    # Run Playwright end-to-end smoke tests
npm run build       # Build optimized Next.js 15 production bundle
```

---

## 📈 Git Commit Milestone Log (20 Incremental Commits)

| # | Hash / Commit | Scope | Description |
| :- | :--- | :--- | :--- |
| 1 | `chore(init)` | Architecture | Bootstrap Next.js 15 App Router with Tailwind, TypeScript, and TanStack Query |
| 2 | `feat(ui)` | Components | Implement accessible Radix and Tailwind design system primitives |
| 3 | `feat(landing)` | Public | Build responsive landing page with workflow, features, and demo quick-access |
| 4 | `feat(auth)` | Security | Add secure login and registration forms with evaluator demo autofill |
| 5 | `feat(dashboard)` | Dashboard | Implement role-aware dashboard shell, navigation, and overview hubs |
| 6 | `feat(requests)` | Customer | Implement service request creation, filtering, timeline, review, and cancel flows |
| 7 | `feat(payments)` | Stripe/WorkOrders | Integrate real Stripe payment flow, work order transitions, and technician jobs |
| 8 | `feat(admin)` | Administration | Add user management, category administration, audit logs, and feedback module |
| 9 | `test(unit)` | QA | Add vitest test suite for form validations, utility formatters, and api client session state |
| 10 | `docs` | Documentation | Add comprehensive README with API mapping and 5-10 minute evaluator walkthrough script |
| 11 | `feat(seo)` | SEO | Add dynamic sitemap, robots.txt, and web app manifest |
| 12 | `feat(notifications)` | UI/UX | Add global sonner toast provider and api mutation toast hooks |
| 13 | `feat(ui)` | Resiliency | Add system health indicator and Render cold-start status banner |
| 14 | `feat(accessibility)` | A11y | Add skip-to-content link, keyboard shortcuts, and semantic aria landmarks |
| 15 | `feat(export)` | Utility | Add receipt printing and CSV data export utility for invoices and work orders |
| 16 | `test(e2e)` | QA | Configure Playwright and add end-to-end smoke tests for critical user journeys |
| 17 | `test(components)` | QA | Expand unit tests for UI primitives and dashboard status timeline |
| 18 | `feat(security)` | Security | Configure production security headers, CSP, and Vercel edge deployment config |
| 19 | `feat(error-handling)` | Resiliency | Enhance 404 not-found and global error recovery pages with diagnostic logs |
| 20 | `docs(evaluator)` | Polish | Finalize deployment documentation, project presentation, and verification summary |

---

## ☁️ Deployment Instructions (Vercel)

1. Push this repository to GitHub.
2. In the [Vercel Dashboard](https://vercel.com), select **Add New Project** and import the repository.
3. If deploying from a monorepo workspace, set **Root Directory** to `frontend`.
4. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_API_URL`: `https://servisync-backend.onrender.com/api/v1`
5. Click **Deploy**. Next.js App Router will generate all 24 static and dynamic routes.

---

## 📌 Architecture Decisions & Notes

- **Real API First:** Every user action communicates directly with the Express/Prisma backend. No mock data or fake payment states are used in production paths.
- **Render Cold-Start & Downtime Handling:** The frontend API client includes a 35-second timeout controller and specialized error normalization (`isBackendSuspendedOrCold`) that renders a clear, non-blocking notification with instructions if the remote Render free-tier service is sleeping or suspended.
- **Conflict Prevention:** When scheduling technicians, the frontend validates time ranges (`start < end`) and accurately surfaces any backend 409 conflict errors if a technician is already booked for that time window.
- **Stripe Integration Flow:** Payments redirect customers to Stripe Checkout; the return page `/payment/success?session_id=...` contacts the backend to query Stripe's API before marking invoices as paid.
