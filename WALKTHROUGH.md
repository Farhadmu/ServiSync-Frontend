# ServiSync — Evaluator Video / Demo Walkthrough Script

> **Target Duration:** 5–10 Minutes  
> **Audience:** Programming Hero B7A7 Evaluators & Technical Reviewers  
> **Project:** ServiSync Field Service Management System (Next.js 15 App Router + Express Backend)

---

## ⏱️ Walkthrough Outline & Timeline

| Timestamp | Section | Key Highlights & Screens Demonstrated |
| :--- | :--- | :--- |
| **0:00 - 1:15** | **1. Introduction & Public Experience** | Brand identity, value proposition, responsive navbar, dynamic service catalog, workflow lifecycle. |
| **1:15 - 2:30** | **2. Customer Portal & Service Booking** | One-click demo login, dynamic category/type selection, Zod validation, request submission, and live status timeline. |
| **2:30 - 4:00** | **3. Manager Dispatch Console** | Operational overview, request review queue (`APPROVE`/`REJECT`), certified technician roster, conflict-free scheduling (`POST /assignments`). |
| **4:00 - 5:30** | **4. Technician Mobile & Field Execution** | Job acceptance (`PATCH /assignments/:id/respond`), status milestones (`ARRIVED` ➔ `IN_PROGRESS` ➔ `COMPLETED`), on-site digital service report. |
| **5:30 - 7:00** | **5. Invoicing & Real Stripe Checkout** | Itemized invoice generation, tax/discount calculation, real Stripe test-mode session redirection, truthful `/payment/success` verification. |
| **7:00 - 8:30** | **6. System Administration & Security** | User management, RBAC role updates, account activation/deactivation, category catalog administration, security audit logs. |
| **8:30 - 9:30** | **7. Architecture & Code Quality Summary** | App Router structure, TanStack Query caching, TypeScript strictness, zero build errors, Vitest test suite. |

---

## 🎙️ Step-by-Step Walkthrough Script

### 1. Introduction & Public Experience (0:00 - 1:15)
- **Action:** Open `http://localhost:3000` (or production Vercel URL).
- **Speaker Script:**
  > "Hello! Welcome to the presentation of ServiSync — a Field Service Management System engineered for the Programming Hero B7A7 assignment. ServiSync smartly connects Customers, Field Technicians, and Service Operations.
  > 
  > Notice the public landing page: designed with a clean light theme, deep navy/indigo accents, and an interactive operational preview card. As we scroll down, we see the end-to-end 4-step workflow lifecycle, core system architecture highlights, real service categories fetched from our backend database (such as Electrical, Plumbing, and HVAC), and an Evaluator Quick Access section featuring one-click demo credentials for all 4 roles."

---

### 2. Customer Portal & Service Request Booking (1:15 - 2:30)
- **Action:** Navigate to `/login`. Click the **Customer (Alice)** one-click demo button.
- **Speaker Script:**
  > "Let's click on the Customer demo card. Notice that email `customer1@example.com` and password `Customer@123` are immediately populated using our built-in demo autofill. We click **Sign In**.
  > 
  > Upon authentication, the customer is directed to `/dashboard`. Notice the customer-specific stat cards: Total Requests, Active Jobs, Pending Approvals, and Unpaid Invoices.
  > 
  > Let's create a new service ticket by clicking **New Service Request** (`/dashboard/requests/new`). When we select 'Electrical', the dropdown dynamically loads the matching service types ('AC Repair' and 'Wiring') along with the official base inspection fee (৳80) and estimated duration (120 minutes).
  > 
  > Our form is strictly validated using React Hook Form and Zod. Let's enter:
  > - Title: `AC cooling fan making loud vibrating sound`
  > - Description: `The outdoor fan does not rotate at high speed.`
  > - Location: `123 Main St, Apt 4B, Dhaka`
  > - Preferred Date & Time: Tomorrow morning at 10:00 AM.
  > 
  > We click **Submit Service Request**. The ticket is posted via real API to `POST /service-requests`, and we are redirected to `/dashboard/requests/:id`. Notice the visual **Lifecycle Progress Timeline** showing that our ticket is currently in the 'Requested' stage."

---

### 3. Manager Dispatch Console (2:30 - 4:00)
- **Action:** Sign out, click **MANAGER** one-click demo button (`manager@servisync.com`), and sign in.
- **Speaker Script:**
  > "Now let's sign in as the Operations Manager. Notice the dashboard dynamically transforms: we now see operational KPI cards, including pending requests and total invoiced amount.
  > 
  > In the **Service Requests Queue**, we see Alice's newly submitted request. The manager can click **Approve** directly from the dashboard, executing `POST /service-requests/:id/review` with `{ action: 'APPROVE' }`.
  > 
  > Now let's open the **Dispatch Console** (`/dashboard/dispatch`). We select the approved ticket, view our roster of certified technicians, verify that Rahim Technician holds the required `ELECTRICAL` and `HVAC` skills, set the scheduled start and end window, and click **Confirm & Dispatch Technician**.
  > 
  > This calls `POST /assignments`. The backend checks for schedule overlaps, prevents double-booking, and transitions the service request to `ASSIGNED`."

---

### 4. Technician Mobile & Field Execution (4:00 - 5:30)
- **Action:** Sign out, click **TECHNICIAN** one-click demo button (`tech1@servisync.com`), and sign in.
- **Speaker Script:**
  > "Next, let's switch to Rahim Technician. Notice the on-duty status bar: technicians can toggle their live availability with one click (`PATCH /technicians/me/availability`).
  > 
  > In the **Assigned Jobs** queue (`/dashboard/jobs`), Rahim sees the newly dispatched job. He clicks **Accept Job**, which calls `PATCH /assignments/:id/respond` with `{ action: 'ACCEPT' }`. This automatically creates an official Work Order with status `SCHEDULED`.
  > 
  > Rahim clicks **Open Work Order**. As he drives to the site, he clicks **Mark Arrived**, which updates the work order to `ARRIVED` via `PATCH /work-orders/:id/status`. He then clicks **Start Work** (`IN_PROGRESS`), and upon finishing, clicks **Complete Work** (`COMPLETED`).
  > 
  > Once completed, the **Submit Service Report** modal unlocks. Rahim documents:
  > - Summary: `Replaced faulty start capacitor and lubricated fan bearings.`
  > - Findings: `Capacitor capacitance was below threshold.`
  > - Actions: `Installed OEM 45uF capacitor and tested airflow.`
  > 
  > He clicks **Save Service Report**, executing `PUT /service-reports/work-orders/:id`."

---

### 5. Invoicing & Real Stripe Checkout (5:30 - 7:00)
- **Action:** Switch to Manager, navigate to `/dashboard/work-orders/:id`. Click **Generate Invoice**.
- **Speaker Script:**
  > "Back in the Manager portal, the completed work order is ready for billing. The manager clicks **Generate Invoice**, adds line items ('Capacitor Replacement' - 1x ৳45; 'Labor & Diagnostic' - 1x ৳80), sets tax, and clicks **Issue Invoice**. This calls `POST /invoices/work-orders/:id/invoice`.
  > 
  > Now, let's switch back to Alice Customer and open `/dashboard/invoices/:id`. We see the official itemized invoice totaling ৳125.
  > 
  > Alice clicks **Pay with Stripe**. The frontend calls `POST /payments/initiate` on our backend, which uses the official Stripe SDK to create a verified checkout session. The browser redirects directly to Stripe Checkout.
  > 
  > After completing the test card checkout (or returning to `/payment/success?session_id=...`), our callback calls `POST /payments/success`, which verifies the Stripe session with the gateway, marks the payment as `SUCCESS`, updates the invoice to `PAID`, and closes the service request. Notice that the invoice badge now proudly displays 'PAID & SETTLED'!"

---

### 6. System Administration & Security (7:00 - 8:30)
- **Action:** Sign in as **ADMIN** (`admin@servisync.com`).
- **Speaker Script:**
  > "Finally, let's log in as the System Admin. The admin overview surfaces total customer counts, active technicians, and aggregate revenue collected.
  > 
  > In **User Management** (`/dashboard/admin/users`), the admin can search users, filter by role, activate or deactivate accounts with immediate effect, and update user roles.
  > 
  > In **Service Categories** (`/dashboard/admin/categories`), the admin can create, edit, or archive service departments.
  > 
  > In **Audit Logs** (`/dashboard/admin/audit-logs`), the admin can inspect the complete audit trail: every login, role change, work order update, and payment initiation is permanently timestamped with user ID and IP address."

---

### 7. Architecture & Code Quality Summary (8:30 - 9:30)
- **Action:** Open terminal and show `npm run typecheck`, `npm test`, and `npm run build`.
- **Speaker Script:**
  > "To wrap up:
  > - **Type Safety:** `npm run typecheck` passes with zero errors across all components and API layers.
  > - **Automated Testing:** `npm test` executes our Vitest suite, testing validation schemas, currency formatters, and API client token handling.
  > - **Production Readiness:** `npm run build` compiles all 24 static and dynamic routes for Vercel deployment.
  > 
  > Thank you for reviewing ServiSync!"
