# Tile Product Management

A Laravel 12 multi-tenant application for managing tile products, quotations, stock, accounts payable/receivable, and related business operations.

## Requirements

- PHP 8.2+
- Composer
- Node.js 18+
- MySQL 8+ or SQLite 3+

## Installation

```bash
# Install PHP dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Run migrations
php artisan migrate

# Seed database (Super Admin + Admin user)
php artisan db:seed

# Install frontend dependencies
npm install

# Build assets
npm run build
```

## Running the Application

```bash
# Option 1: Laravel dev server + Vite
composer run dev

# Option 2: Separate terminals
php artisan serve    # Backend on http://127.0.0.1:8000
npm run dev          # Vite dev server (hot reload)
```

## Database Seeding

| Seeder | Purpose |
|--------|---------|
| `SuperAdminSeeder` | Creates super admin user (`superadmin@gmail.com`) |
| `DatabaseSeeder` | Seeds admin user (`admin@gmail.com`) and runs PermissionSeeder, RoleSeeder |

Default password: `password`

## Configuration

### Environment Variables

- `DB_CONNECTION` - Database driver (`mysql` or `sqlite`)
- `APP_URL` - Base URL for the application

### Super Admin (optional)

- Super admins bypass all permission checks via `Gate::before`
- IP whitelist and forced 2FA can be configured in `EnsureSuperAdmin` middleware

## Testing

```bash
# Run all tests
php artisan test --compact

# Run specific test file
php artisan test --compact tests/Feature/Auth/AuthenticationTest.php
```

**Note:** Tests use MySQL with database `laravel_test`. Create it before running tests:
```bash
mysql -u root -e "CREATE DATABASE IF NOT EXISTS laravel_test;"
```
Credentials (host, username, password) are taken from `.env`.

## Project Structure

- `app/Http/Controllers/` - Tenant-scoped controllers
- `app/Http/Controllers/SuperAdmin/` - Super admin controllers (tenants, users, roles, permissions)
- `app/Policies/` - Authorization policies (Spatie permissions)
- `resources/js/pages/` - Inertia React pages

## Tech Stack

- Laravel 12, Inertia.js v2, React 19, Tailwind CSS v4
- Spatie Laravel Permission (teams = tenant_id)
- Laravel Fortify (auth, 2FA, registration)
