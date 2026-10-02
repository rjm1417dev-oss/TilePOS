# TileCore ERP — Project Description, Skills & Deliverables

---

## Project Description

**TileCore** is a multi-tenant SaaS ERP platform purpose-built for tile businesses. It consolidates the day-to-day operations of tile retailers and distributors into a single, modern web application — eliminating the need for spreadsheets, disconnected tools, and manual processes.

The platform is designed around four core pillars:

- **Quotations & Invoicing** — Create professional quotes and invoices with automatic tile calculations (area, box count, wastage), discounts, taxes, and one-click PDF generation.
- **Inventory Management** — Track tile stock across multiple suppliers, monitor minimum stock levels, and receive automated low-stock alerts via email and WhatsApp.
- **Financial Accounts** — Maintain accounts payable (supplier) and accounts receivable (customer) with aging reports and overdue payment notifications.
- **Analytics & Reporting** — Eight built-in financial reports including Profit & Loss, aging schedules, sales-by-brand/size/tile, and stock valuation.

TileCore operates as a true multi-tenant system — each business (tenant) maintains fully isolated data, its own user roles and permissions, and can be on a trial or paid subscription. A dedicated Super Admin panel allows platform operators to manage tenants, impersonate users for support, configure global settings, and monitor system health.

---

## Skills

- **Full-Stack Web Development** — End-to-end application development using Laravel 12 (PHP 8.3) and React 19 with TypeScript
- **SaaS & Multi-Tenancy Architecture** — Designing isolated, scalable multi-tenant systems with subscription and feature-flag management
- **Database Design & ORM** — Relational schema design, Eloquent ORM, migrations, soft deletes, and audit trails
- **Authentication & Security** — 2FA (TOTP), RBAC with Spatie Permissions, IP whitelisting, login auditing, and impersonation safeguards
- **RESTful API & Inertia SPA** — Server-driven single-page applications using Inertia.js v2 without a separate API layer
- **UI/UX Development** — Responsive, accessible interfaces with Tailwind CSS v4 and component-based React architecture
- **Background Jobs & Notifications** — Queued jobs, scheduled alerts, email (SMTP), and WhatsApp/SMS via Twilio
- **PDF Generation** — Dynamic document rendering using headless Chromium (Browsershot)
- **Reporting & Analytics** — Financial reports, data aggregation, and chart-driven dashboards
- **Testing** — PHPUnit feature and unit tests covering happy paths, failure paths, and edge cases
- **DevOps & Tooling** — Docker (Laravel Sail), CI-ready code style enforcement (Pint, ESLint, Prettier), and asset bundling (Vite)

---

## Deliverables

### 1. Multi-Tenant SaaS Platform
- Tenant registration and onboarding flow
- Trial period management and subscription expiry enforcement
- Full data isolation between tenants
- Per-tenant user management with customisable roles and permissions

### 2. Product Catalog Management
- Brands, tile products (with size/spec variants), and non-tile products (accessories)
- Image uploads and soft-delete support
- Supplier management with contact details

### 3. Inventory System
- Stock tracking per tile per supplier
- Minimum stock level thresholds
- Stock movement logs (audit trail)
- Automated low-stock email and WhatsApp alerts

### 4. Quotation & Invoice Engine
- Multi-line item quotes with tile and product support
- Built-in tile calculator (area → boxes → wastage)
- Discount and tax handling
- Per-tenant sequential invoice numbering
- PDF generation and download
- Customer notification on quotation creation

### 5. Accounts Management
- Accounts Payable — record and track outstanding supplier payments
- Accounts Receivable — record and track outstanding customer payments
- Automated overdue alerts via email and WhatsApp (feature-flagged)

### 6. Tile Returns Module
- Record tile returns and exchanges per customer
- PDF return documents
- Payment reconciliation tracking

### 7. Financial Reports (8 Reports)
- Profit & Loss Statement
- Accounts Payable Aging
- Accounts Receivable Aging
- Sales by Tile
- Sales by Brand
- Sales by Size
- Sales by Customer
- Stock Valuation

### 8. Import / Export
- Bulk data import with template downloads
- Full data export for tenants

### 9. User Settings
- Profile management
- Password change
- Two-factor authentication (TOTP setup/disable)
- Appearance preferences (light/dark mode)

### 10. Super Admin Panel
- Tenant CRUD with bulk operations
- Admin impersonation (read-only mode enforced)
- Global feature flag management (per-tenant or platform-wide)
- Super admin user and permission management
- Activity log viewer with retention configuration
- System settings (SMTP, 2FA enforcement, IP whitelist, maintenance mode)
- One-click database backup generation

### 11. Security & Compliance
- Two-factor authentication support
- Failed login attempt tracking
- IP whitelisting
- Impersonation audit trail
- Request latency logging
- Read-only enforcement during admin impersonation
- Role-based access control at both platform and tenant level

### 12. Notifications & Alerts
- In-app notification system with mark-as-read
- Email notifications via configurable SMTP
- WhatsApp/SMS alerts via Twilio
- Automated scheduled jobs for overdue and low-stock conditions
