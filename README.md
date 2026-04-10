# Bancolombia Leasing Demo

Technical demo project for Bancolombia Leasing, built as a monorepo with independent backend and frontend applications.

## Monorepo Structure

- backend: Java + Spring Boot service (Hexagonal + DDD)
- frontend: React + Vite client app (modular feature-based)
- .github/copilot-instructions.md: engineering and coding guardrails used in this repository

## Architecture Summary

### Backend

- Stack: Java 21, Spring Boot 3.x, PostgreSQL
- Style: Hexagonal Architecture + Domain-Driven Design
- Layers:
  - domain: entities, value objects, ports, domain services
  - application: use cases and DTOs
  - infrastructure: adapters, entrypoints, configuration
- Includes:
  - ACL (Anticorruption Layer) for external Core contract validation
  - SLA domain logic for `estimatedResolutionDate` calculation

### Frontend

- Stack: React (Vite), TypeScript, Tailwind CSS
- Style: Modular feature-based organization
- Data fetching and async state management via hooks (React Query style)
- Separate operational and customer-facing flows

## Folder Overview

```text
/backend
  /src/main/java/com/bancolombia/leasing
    /domain
    /application
    /infrastructure
  /src/test/java/com/bancolombia/leasing
  /db

/frontend
  /src
    /features
    /components
    /pages
    /hooks
    /lib
  /src/test
```

## Quick Start

Detailed setup and run instructions are in:

- [Backend README](backend/README.md)
- [Frontend README](frontend/README.md)

Typical local startup order:

1. Start PostgreSQL and initialize schema/data.
2. Run backend API.
3. Run frontend app.

## Additional Docs

- Database bootstrap and SQL notes: [backend/db/README.md](backend/db/README.md)
