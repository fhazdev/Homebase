# HomeBase

A household task and life management platform built as a mobile-first PWA with a .NET 8 backend API, hosted on Azure using always-free tier services.

**Domain**: [homebase.fhbox.xyz](https://homebase.fhbox.xyz) | API: [api.homebase.fhbox.xyz](https://api.homebase.fhbox.xyz)

## Features

- **Task Tracking** — Recurring and one-time tasks with configurable intervals (days, weeks, months, years, miles), due date tracking, overdue alerts, and full completion history
- **Lists** — General-purpose lists for tracking movies, restaurants, travel ideas, and more. Each item supports optional URL, phone, and details fields with expandable rows
- **Categories** — Organize tasks with custom categories and emoji icons
- **Dashboard** — At-a-glance view of overdue tasks, upcoming items, and recent completions
- **Dark/Light Mode** — System-aware theme with manual toggle, persisted to localStorage
- **PWA** — Installable on mobile with offline-capable service worker

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | .NET 8 Web API, Entity Framework Core 8, ASP.NET Identity + JWT |
| **Frontend** | React 18, TypeScript, Vite, TanStack Query, Zustand, Tailwind CSS v4 |
| **Database** | Azure SQL Database (serverless free tier) |
| **Infrastructure** | Azure Container Apps, Azure Static Web Apps, Terraform |
| **CI/CD** | GitHub Actions |

## Architecture

The backend follows **Clean Architecture** with four layers:

```
Domain          — Entities, enums, domain logic (zero dependencies)
Application     — Services, DTOs, interfaces, validators (depends on Domain)
Infrastructure  — EF Core, repositories, migrations (implements Application)
Api             — Controllers, middleware, DI root (composition layer)
```

```
homebase/
├── .github/workflows/      # CI/CD pipelines
├── infra/                   # Terraform IaC
├── src/
│   ├── HomeBase.Domain/     # Entities, enums, exceptions
│   ├── HomeBase.Application/# Services, DTOs, validators, interfaces
│   ├── HomeBase.Infrastructure/ # EF Core, repositories, migrations
│   ├── HomeBase.Api/        # Controllers, middleware, Program.cs
│   └── HomeBase.Web/        # React TypeScript PWA
├── tests/
│   ├── HomeBase.Domain.Tests/
│   ├── HomeBase.Application.Tests/
│   └── HomeBase.Api.Tests/
├── Dockerfile               # Multi-stage API build
└── docker-compose.yml       # Local dev (API + SQL Server)
```

## Getting Started

### Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 18+](https://nodejs.org/)
- [Docker](https://www.docker.com/) (for local SQL Server)

### Local Development

**1. Start the database and API:**

```bash
docker-compose up -d
```

This starts SQL Server on port 1433 and the API on port 5000. The database is automatically migrated on startup.

**2. Start the frontend dev server:**

```bash
cd src/HomeBase.Web
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` and proxies API requests to port 5000.

**3. Access Swagger UI:**

If running the API directly (`dotnet run`), Swagger is available at `http://localhost:5058/swagger`.

### Running Tests

```bash
# All tests
dotnet test

# Frontend
cd src/HomeBase.Web && npm test
```

### Useful Commands

```bash
# Build
dotnet build

# EF migrations
dotnet ef migrations add <Name> --project src/HomeBase.Infrastructure --startup-project src/HomeBase.Api
dotnet ef database update --project src/HomeBase.Infrastructure --startup-project src/HomeBase.Api

# Frontend build
cd src/HomeBase.Web && npm run build

# Lint
dotnet format
cd src/HomeBase.Web && npm run lint
```

## API Endpoints

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login (returns JWT) |
| POST | `/api/auth/refresh` | Refresh token |
| POST | `/api/auth/logout` | Logout |

### Tasks
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/tasks` | List tasks (filterable by category) |
| GET | `/api/tasks/{id}` | Task detail with completion history |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/{id}` | Update task |
| DELETE | `/api/tasks/{id}` | Delete task |
| POST | `/api/tasks/{id}/complete` | Log completion |
| PUT | `/api/tasks/{id}/completions/{logId}` | Update completion |
| DELETE | `/api/tasks/{id}/completions/{logId}` | Delete completion |

### Lists
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/lists` | List all user lists |
| GET | `/api/lists/{id}` | List detail with items |
| POST | `/api/lists` | Create list |
| PUT | `/api/lists/{id}` | Update list |
| DELETE | `/api/lists/{id}` | Delete list |
| POST | `/api/lists/{id}/items` | Add item |
| PUT | `/api/lists/{id}/items/{itemId}` | Update item |
| DELETE | `/api/lists/{id}/items/{itemId}` | Delete item |

### Other
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/categories` | List categories |
| POST | `/api/categories` | Create category |
| GET | `/api/dashboard` | Dashboard summary |
| GET | `/health` | Liveness probe |
| GET | `/health/ready` | Readiness probe |

## License

Private project.
