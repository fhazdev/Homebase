# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HomeBase is a household task and life management platform with an Android PWA frontend and .NET 8 backend API, hosted on Azure using always-free tier services. The application follows Clean Architecture principles with strict dependency inversion.

**Domain**: homebase.fhbox.xyz (web) | api.homebase.fhbox.xyz (API)

## Technology Stack

- **Backend**: .NET 8 Web API, Entity Framework Core 8, ASP.NET Identity + JWT
- **Frontend**: React 18+ with TypeScript, Vite, TanStack Query, Zustand, Tailwind CSS, shadcn/ui
- **Database**: Azure SQL Database (serverless free tier)
- **Infrastructure**: Azure Container Apps, Azure Static Web Apps, Terraform
- **CI/CD**: GitHub Actions

## Repository Structure

```
homebase/
├── .github/workflows/     # CI/CD pipeline definitions
├── infra/                 # Terraform IaC configuration
│   ├── main.tf           # Provider, backend, resource group
│   ├── database.tf       # Azure SQL Server and Database
│   ├── compute.tf        # Container Apps
│   ├── web.tf            # Static Web App
│   ├── monitoring.tf     # Application Insights, alerts
│   └── security.tf       # Key Vault, managed identities
├── src/
│   ├── HomeBase.Domain/          # Entities, value objects, domain logic (zero dependencies)
│   ├── HomeBase.Application/     # Use cases, DTOs, interfaces, validators (depends on Domain only)
│   ├── HomeBase.Infrastructure/  # EF Core, migrations, external services
│   ├── HomeBase.Api/             # Controllers, middleware, DI composition root
│   └── HomeBase.Web/             # React TypeScript PWA
├── tests/
│   ├── HomeBase.Domain.Tests/
│   ├── HomeBase.Application.Tests/
│   ├── HomeBase.Api.Tests/
│   └── HomeBase.Web.Tests/
├── docker-compose.yml    # Local dev environment (API + SQL Server)
└── Dockerfile            # Multi-stage API container build
```

## Development Commands

### Backend (.NET API)

```bash
# Restore dependencies and build
dotnet restore
dotnet build

# Run locally (development mode)
cd src/HomeBase.Api
dotnet run

# Run with watch (hot reload)
dotnet watch run

# Run tests
dotnet test

# Run specific test project
dotnet test tests/HomeBase.Api.Tests

# Code formatting check
dotnet format --verify-no-changes

# Apply code formatting
dotnet format

# Entity Framework migrations
dotnet ef migrations add <MigrationName> --project src/HomeBase.Infrastructure --startup-project src/HomeBase.Api
dotnet ef database update --project src/HomeBase.Infrastructure --startup-project src/HomeBase.Api

# Generate migration SQL script
dotnet ef migrations script --project src/HomeBase.Infrastructure --startup-project src/HomeBase.Api --output migration.sql
```

### Frontend (React PWA)

```bash
cd src/HomeBase.Web

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint
npm run lint

# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

### Local Development Environment

```bash
# Start local stack (API + SQL Server container)
docker-compose up -d

# Stop local stack
docker-compose down

# View logs
docker-compose logs -f

# Rebuild API container
docker-compose up -d --build api
```

### Infrastructure (Terraform)

```bash
cd infra

# Initialize Terraform
terraform init

# Plan changes
terraform plan

# Apply changes
terraform apply

# Destroy resources (use with caution)
terraform destroy

# Format Terraform files
terraform fmt

# Validate configuration
terraform validate
```

## Architecture Principles

### Clean Architecture Layers

HomeBase follows Clean Architecture with four concentric layers. **Dependencies point inward only**:

1. **Domain Layer** (`HomeBase.Domain`)
   - Entities: `TrackedTask`, `CompletionLog`, `Category`, `User`
   - Value objects, enums, domain exceptions
   - Business rules (e.g., next due date computation)
   - **Zero external dependencies**

2. **Application Layer** (`HomeBase.Application`)
   - Use cases (services/handlers)
   - DTOs for API contracts
   - Repository interfaces: `ITaskRepository`, `IUnitOfWork`
   - Input validation via FluentValidation
   - **Depends only on Domain**

3. **Infrastructure Layer** (`HomeBase.Infrastructure`)
   - EF Core `DbContext` and repository implementations
   - Database migrations
   - Azure Key Vault integration
   - External service implementations
   - **Implements Application interfaces**

4. **Presentation Layer** (`HomeBase.Api` + `HomeBase.Web`)
   - API controllers (thin, map HTTP to use cases)
   - Dependency injection composition root
   - React PWA frontend
   - **Depends on Application and Infrastructure**

### Key Architectural Patterns

- **Repository Pattern**: Data access abstracted via interfaces in Application layer
- **Unit of Work**: Transaction management for multi-entity operations
- **CQRS-lite**: Separate DTOs for commands and queries (no full event sourcing)
- **Modular Architecture**: Each functional domain is a self-contained module (Task Tracker, Restaurant, Financial)

## Domain Model (Task Tracker Module)

### Core Entities

- **User**: Application user account (ASP.NET Identity)
- **Category**: Task grouping (Home, Vehicle, Yard, etc.) with emoji icon
- **TrackedTask**: Recurring task definition with recurrence interval (value + unit)
- **CompletionLog**: Individual completion record with timestamp, notes, optional photo

### Recurrence Logic

- **Supported units**: Days, Weeks, Months, Years, Miles
- **Next due date calculation**: `LastCompletion.CompletedAt + RecurrenceInterval`
- Tasks with no completions use `FirstDueDate` field (nullable)
- Modifying recurrence or deleting completions triggers immediate recalculation

## Authentication & Security

### JWT Authentication Flow

1. User logs in via `POST /api/auth/login`
2. API returns short-lived access token (15 min) + HTTP-only refresh token cookie (7 days)
3. Frontend stores access token in memory (not localStorage)
4. On 401, frontend calls `POST /api/auth/refresh` for new token
5. Refresh token rotation invalidates previous token

### Secret Management

- All secrets stored in **Azure Key Vault**
- Accessed via managed identity (no credentials in code)
- Secrets: DB connection string, JWT signing key, Application Insights key

### Security Requirements

- HTTPS only (TLS 1.2+, HSTS enabled)
- CORS restricted to homebase.fhbox.xyz
- Rate limiting: 100 req/min per authenticated user
- Passwords hashed via ASP.NET Identity (bcrypt/Argon2)
- Container image vulnerability scanning (Trivy) in CI
- SQL firewall rules restrict access to Container Apps subnet only

## API Endpoints (v1)

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login, returns JWT + refresh cookie
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Invalidate refresh token

### Categories
- `GET /api/categories` - List all categories
- `POST /api/categories` - Create category
- `PUT /api/categories/{id}` - Update category
- `DELETE /api/categories/{id}` - Delete category (requires task reassignment)

### Tasks
- `GET /api/tasks` - List tasks (filterable by category, status)
- `GET /api/tasks/{id}` - Get task detail with completion history
- `POST /api/tasks` - Create tracked task
- `PUT /api/tasks/{id}` - Update tracked task
- `DELETE /api/tasks/{id}` - Delete task and history
- `POST /api/tasks/{id}/complete` - Log task completion
- `PUT /api/tasks/{id}/completions/{logId}` - Update completion date/notes
- `DELETE /api/tasks/{id}/completions/{logId}` - Delete completion log entry

### Dashboard
- `GET /api/dashboard` - Dashboard summary (overdue, upcoming, recent)

### Health
- `GET /health` - Liveness probe
- `GET /health/ready` - Readiness probe (checks DB connectivity)

## Observability

### Logging
- Structured JSON logging via **Serilog**
- Sinks: Azure Application Insights, console (local dev)
- All logs include correlation IDs
- Sensitive data (passwords, tokens) excluded via destructuring policies

### Metrics
- OpenTelemetry metrics collected by Application Insights
- Key metrics: HTTP duration (p50/p95/p99), request count by endpoint, DB query duration, auth success/failure rates

### Distributed Tracing
- End-to-end tracing via OpenTelemetry SDK
- W3C Trace Context headers for correlation
- Visualized in Application Insights transaction search

### Health Checks
- `/health` - Process alive check
- `/health/ready` - DB connectivity check (returns 503 if unavailable)
- Used by Azure Container Apps for liveness/readiness probes

### Alerting
- Error rate exceeding 5% over 5 minutes
- API response time p95 exceeding 2 seconds
- Database DTU consumption exceeding 80%
- Container restart events

## Testing Strategy

### Backend Testing
- **Unit Tests**: xUnit + Moq for services, validators, domain logic (target 80%+ coverage)
- **Integration Tests**: WebApplicationFactory for API endpoints with in-memory DB
- Run: `dotnet test`

### Frontend Testing
- **Unit Tests**: Vitest + Testing Library for components, hooks, utilities (target 70%+ coverage)
- **E2E Tests**: Playwright for critical user journeys (login, create task, complete task)
- Run: `npm test`

### Security Testing
- Container image CVE scanning via Trivy (CI gate)
- OWASP Top 10 checks (manual testing with OWASP ZAP)

## CI/CD Pipeline

### CI (on every push/PR)
1. Restore & build (.NET + npm)
2. Lint (dotnet format, ESLint, Prettier)
3. Run tests (backend + frontend)
4. Build Docker image
5. Scan image for vulnerabilities (Trivy)
6. Terraform plan (PR comment)

### CD (on merge to main)
1. Build & push Docker image (tagged with commit SHA + "latest")
2. Terraform apply (infrastructure changes)
3. Run EF Core migrations
4. Deploy API to Azure Container Apps
5. Deploy web to Azure Static Web Apps
6. Smoke tests (/health endpoint verification)
7. Tag release with semantic version

## Branching Strategy

- **Trunk-based development** with short-lived feature branches
- `main` branch protected: requires PR approval, passing CI, linear history
- **Conventional Commits**: Use `feat:`, `fix:`, `chore:`, `docs:`, etc.

## Cost Considerations

- Target: ~$0.02/month (within Azure free tier limits)
- Monitor Azure SQL vCore consumption (100K vCore-sec/mo free allocation)
- Container Apps: 180K vCPU-sec, 2M requests/mo free
- Application Insights: 5 GB ingestion/mo free
- Set alerts at 80% threshold to prevent overages

## Module Architecture (Future)

The application is designed for modular growth:
- **Core Module**: Auth, user profile, shared services
- **Task Tracker Module** (v1.0): Current implementation
- **Restaurant Module** (planned): Restaurant cataloguing, visit tracking
- **Financial Module** (planned): Account summaries, budget tracking

Each module is self-contained with its own domain models, services, and API endpoints.

## Important Notes

- **Cold start latency**: 3-10 seconds on first request after idle (acceptable for personal app)
- **Serverless DB wake-up**: 30-60 seconds on first query after auto-pause
- **PWA offline support**: Service worker caches task data for offline read access
- **No staging environment**: Automated smoke tests gate production deployments
- **Single-user initially**: Architecture supports multi-user but v1.0 is single-tenant
