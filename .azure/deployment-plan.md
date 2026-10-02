# TilePOS Azure Deployment Plan

Status: Ready for Validation

## Scope
Prepare the existing Laravel 12 / React 19 application for containerized deployment to Azure App Service for Linux using Azure Container Registry and GitHub Actions.

## Workspace Mode
MODERNIZE existing application. No application business logic changes are planned unless required for container compatibility.

## Findings
- Laravel 12 / PHP 8.3 application using Inertia React 19 and Vite 7.
- `vite.config.ts` builds `resources/css/app.css` and `resources/js/app.tsx` into `public/build`; Wayfinder files are generated during the build and are ignored by Git.
- The application is configured for PHP-FPM-compatible hosting and must expose `public/` through a web server. No Octane or WebSocket server is present.
- Composer has no direct Azure runtime dependency. Production dependencies require PHP core extensions plus database support; the Azure target should use `pdo_mysql` or `pdo_pgsql` according to the selected managed database.
- `package.json` includes Puppeteer and the PDF controllers invoke Node plus Chromium. The runtime image must include Node, Chromium, and the required shared libraries; `BROWSERSHOT_CHROME_PATH` will be set explicitly.
- Local defaults use SQLite, database sessions, database cache, and database queues. Azure should use an external managed relational database and retain database-backed state, or explicitly provision Redis if the operator changes those drivers.
- `routes/console.php` schedules activity-log archiving, failed-login cleanup, notification dispatch, and database backup. Queued notification jobs are dispatched by the application. Web, queue-worker, and scheduler roles must be independently operable from the same image.
- Public uploads use Laravel's `public` filesystem disk and `public/storage` symbolic link. The image will create the link at startup; durable production uploads should use object storage rather than ephemeral App Service local storage.
- No Docker, Compose, Azure IaC, or active deployment workflow currently exists. The prior non-container Azure workflow and startup script are already deleted in the worktree.
- Docker 29.5.2 is available locally, so image build and container smoke tests can be attempted.

## Proposed Architecture
- GitHub Actions authenticates to Azure using OIDC, builds a multi-stage image, pushes immutable SHA and optional `latest` tags to Azure Container Registry, and updates Azure App Service for Linux.
- The image uses a Node build stage, a Composer dependency stage, and a PHP 8.3 Debian runtime containing Nginx, PHP-FPM, Node, Chromium, and production Composer dependencies.
- Nginx listens on `${PORT}` with an 8080 fallback and serves only `/public`; PHP-FPM handles dynamic requests.
- The entrypoint supports `web`, `worker`, and `scheduler` roles. The App Service web container uses `web`; queue and scheduler roles are documented as separate worker deployments or controlled platform jobs.
- A health check calls Laravel's unauthenticated `/up` endpoint through Nginx.

## Infrastructure
- Add `infra/` Bicep for an Azure Container Registry, App Service Linux plan, Web App, system-assigned identity, and scoped `AcrPull` role assignment.
- The Bicep template will accept resource names, location, image tag, and sizing parameters and will not contain credentials.
- Database, SMTP, Groq, WhatsApp, and storage credentials remain external managed settings/secrets and are not provisioned in source.

## Container
- Add `Dockerfile`, `.dockerignore`, `docker/nginx/default.conf.template`, `docker/php/www.conf`, and `docker/entrypoint.sh`.
- Build with `composer install --no-dev --prefer-dist` and `npm ci`; do not run Composer or database migrations against a live environment during build.
- Runtime directories `storage/` and `bootstrap/cache/` will be writable by the unprivileged web user without `chmod 777`.

## CI/CD
- Replace the deleted legacy workflow with `.github/workflows/docker-deployment.yml`.
- Trigger on pushes to `main` and manual dispatch; run application validation, build/push the image, and update App Service using Azure CLI.
- Required GitHub secrets: `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID`, `AZURE_RESOURCE_GROUP`, `AZURE_ACR_NAME`, and `AZURE_WEBAPP_NAME`.

## Runtime Configuration
- Required Azure settings include `APP_ENV=production`, `APP_DEBUG=false`, `APP_KEY`, `APP_URL`, database connection settings, database-backed session/cache/queue settings, mail settings, and optional Groq/WhatsApp/PDF/storage settings.
- `WEBSITES_PORT=8080`, `BROWSERSHOT_NODE_PATH=/usr/local/bin/node`, and `BROWSERSHOT_CHROME_PATH=/usr/bin/chromium` will be configured for the container.
- No `.env` file or secret value will be copied into the image or committed.

## Migration and Operations
- Do not run migrations during image build or on every web startup. Run `php artisan migrate --force` as an explicit release operation after the database backup/approval process.
- Run `php artisan storage:link` during startup because public uploads use the local public disk; use persistent/object storage for production durability.
- Use separate worker/scheduler process instances or an equivalent Azure scheduling mechanism; do not rely on App Service's web process to execute queue and scheduled work.

## Risks and Open Questions
- Azure subscription, resource group, region, registry name, database engine, and existing App Service details are not yet confirmed.
- App Service local storage is not durable across restarts/scale-out; uploaded logos/images and generated backups need an object-storage or external backup policy.
- The repository's PHPUnit configuration targets MySQL for tests, so test execution requires a reachable test database or an existing CI database service.

## Validation Plan
- Run `docker build -t tilepos:test .`, start the web role with safe local environment values, verify `/up`, inspect the Vite manifest, and run Laravel cache commands where the local database is available.
- Run the focused PHPUnit suite and Pint after implementation; run Azure preflight validation only after the plan is approved and artifacts are generated.

## Local and static validation results
- Core local validation: Docker image build and `/up` smoke test passed.
- Laravel validation: Composer metadata, route loading, environment boot, Pint, and PHPUnit passed.
- Azure template validation: `az bicep build` and `az bicep build-params` passed with safe placeholder names.
- Workflow validation: GitHub Actions YAML parsed successfully.
- Azure subscription validation and policy checks remain pending until subscription, resource group, location, and authentication context are supplied.

### Validation Steps
- [ ] Core Azure CLI validation, deployment validation, and what-if against the target resource group.
- [ ] Bicep linting.
- [ ] Azure Policy validation for the target subscription.

## Section 7: Validation Proof
- `docker build -t tilepos:test .`: passed.
- Container `/up` smoke test: passed with HTTP 200 through Nginx and PHP-FPM.
- `vendor/bin/pint --dirty --format agent`: passed.
- `composer validate --no-check-publish`: passed.
- `php artisan route:list --except-vendor`: passed.
- `php artisan about --only=environment`: passed.
- `php artisan test --compact`: passed, 118 tests, 2 skipped, 419 assertions.
- `az bicep build --file infra/main.bicep`: passed.
- `az bicep build-params --file infra/main.bicepparam`: passed with safe placeholder environment values.
- `az bicep lint --file infra/main.bicep`: passed.
- GitHub Actions workflow YAML parsing: passed.
- `az account show`: not available because this environment is not authenticated with Azure; resource-group deployment validation, what-if, and policy checks require the operator's Azure context.

## Implementation Progress
- Approved by user.
- Docker and runtime files generated.
- Azure Bicep and GitHub Actions artifacts generated.
- Local Docker build, container startup, Laravel checks, Bicep compilation, workflow parsing, formatting, and PHPUnit validation completed.
