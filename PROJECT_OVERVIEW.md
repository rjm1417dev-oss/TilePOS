# TilePOS — Project Overview

## What this product is

**TilePOS** is a web-based business management platform built specifically for **tile retailers, distributors, and construction-material suppliers**. Instead of juggling spreadsheets, notebooks, and generic accounting tools, businesses can run their day-to-day operations — from the first customer quotation to the final invoice and stock movement — inside one clean, modern application.

The system is delivered as a **multi-tenant SaaS** (Software as a Service). That means many independent tile businesses can each have their own isolated workspace, user accounts, and data, while running from a single shared installation. It is ideal for a single tile shop, a growing distributor, or a franchise-style operation that wants to onboard multiple branches under one platform.

## Core philosophy

- **Built for tiles, not generic retail** — every screen, calculation, and report understands tile-specific concepts such as box quantity, area coverage, wastage, sizes, brands, and finishes.
- **All-in-one, modular** — twelve connected modules cover the full business cycle, but each tenant can turn modules on or off as needed.
- **Simple first, powerful underneath** — the interface is intentionally clean and mobile-friendly, while the backend handles multi-tenancy, roles, permissions, PDF generation, and bulk data import/export.

---

## Business features

### 1. Dashboard & business overview
A visual landing page after login that shows the numbers that matter most:

- Total receivables, payables, earnings, and orders.
- Sales trend charts over custom periods.
- Top-selling tiles and recent orders.
- Quick-action buttons to add stock, create quotations, or process returns.

### 2. Quotations & invoices
- Create professional quotations with auto-generated numbers.
- Built-in tile area calculations, wastage handling, and box-to-quantity conversion.
- Apply discounts, taxes, and line-item adjustments.
- Convert approved quotations directly into invoices.
- Download PDFs for quotations, invoices, and return receipts.

### 3. Tile catalog & inventory
- Maintain a full catalog of tiles with brand, size, finish, and box quantity.
- Track stock per warehouse with real-time quantity updates.
- Low-stock and out-of-stock alerts.
- Full stock movement history for traceability and audits.

### 4. Customers & suppliers
- Centralized contact directory for customers and vendors.
- Quick-create shortcuts while creating orders.
- Order history and regular-customer detection.
- Link suppliers directly to purchase batches and payables.

### 5. Returns & exchanges
- Issue return receipts with unique numbers.
- Handle exchanges and calculate payment differences.
- Download PDF return receipts for records.

### 6. Accounts payable & receivable
- Track money owed to suppliers and money owed by customers.
- Aging reports to see overdue balances at a glance.
- Tie payments back to invoices and quotations.

### 7. Reports & analytics
Built-in reports designed for management decisions:

- Profit & loss summary.
- Sales by product, brand, and customer.
- Aging payables and receivables.
- Stock valuation.

### 8. Bulk import & export
- Import customers, suppliers, and products from CSV using downloadable templates.
- Export any module to CSV for backups, accountants, or external tools.
- Reduce manual data entry when migrating from spreadsheets.

### 9. Roles & permissions
- Create custom roles such as Salesperson, Accountant, Warehouse Manager, or Admin.
- Control who can create quotations, view reports, import/export data, or change settings.
- Permissions are enforced across every screen and action.

### 10. Per-tenant feature flags
- Turn modules on or off per tenant — for example, enable returns only for businesses that need them.
- Keep the interface simple by hiding features a business does not use.

### 11. Multi-tenant workspaces
- Each business gets its own isolated workspace with separate data, users, branding, and settings.
- A single installation can serve many independent tile companies.
- Great for distributors, franchises, or SaaS operators reselling the platform.

### 12. Super-admin control panel
A dedicated administration area for platform owners to manage:

- Tenants: create, activate, deactivate, impersonate, and export tenant data.
- Super-admin users and permissions.
- Global settings: branding, data privacy, retention policies, SMTP, feature flags, and appearance.
- Activity logs and system-level analytics such as tenant growth, revenue trends, trial conversions, and churn.
- Security alerts, including failed login monitoring.
- Database backup and activity-log export.

### 13. Authentication & security
- Secure login and registration flows.
- Two-factor authentication (2FA) support.
- Password reset and email verification.
- User impersonation for safe support sessions, with a clear banner and stop control.
- Role-based access control for every module and report.

### 14. Subscription & billing awareness
- Trial management with an expired-subscription screen.
- Placeholder pricing tiers (Starter, Growth, Enterprise) for future billing integration.

### 15. Public marketing website
The same application also serves the public-facing website with:

- A modern home page with hero, features, modules, pricing, FAQ, and call-to-action sections.
- About Us, FAQs, Contact Us, and Privacy Policy pages.
- A unified design system with teal/ink branding that matches the application experience.

---

## Who it is for

- **Single tile shops** that want to replace spreadsheets with proper quotations, invoices, and stock tracking.
- **Growing retailers** with multiple staff who need role-based access and sales reports.
- **Distributors and franchise operators** who need to manage several independent branches or tenants from one platform.
- **SaaS founders** looking for a ready-to-deploy, industry-specific ERP solution.

---

## Technical summary (high level)

- **Backend:** Laravel 12 (PHP) with a relational database.
- **Frontend:** React + Inertia.js, rendered as a single-page application experience while keeping server-side routing and security.
- **Styling:** Tailwind CSS with a custom design system built around teal (`brand`) and dark ink (`ink`) colors.
- **PDFs:** generated in the browser using DOMPDF / browser-based tools for receipts and invoices.
- **Real-time feel:** charts, notifications, and live data updates without page reloads.

---

## How the experience feels

From the marketing site, a visitor can learn about the platform, see pricing, read FAQs, and start a free trial. After registration, the new business lands in its own private workspace. Staff members see only the modules they are allowed to access. Owners and managers get dashboards, reports, and export tools. Admins can manage the whole platform from the super-admin panel. The visual language — clean white surfaces, teal accents, rounded cards, and subtle animations — stays consistent across the public site, the tenant application, and the admin panel.
