# Bancolombia Leasing Demo - Copilot Instructions

## Project Scope

This repository is a technical demo for Bancolombia Leasing.
All generated code must follow the architecture, quality, and naming standards defined below.

## 1. Technical Execution and Architecture (Critical)

### Repository Structure

- Monorepo with two root folders:
  - /backend
  - /frontend

### Engineering Style

- Design for microservice-ready evolution.
- Keep modules highly decoupled, testable, and cohesive.
- Apply SOLID, DRY, and KISS principles at all times.

### Backend Architecture (Hexagonal + DDD)

- Stack:
  - Java 17+
  - Spring Boot 3.x
  - PostgreSQL
- Mandatory layered separation:
  - domain
  - application
  - infrastructure

### Backend Functional Constraints

- Implement an Anticorruption Layer (ACL) to validate leasing contracts against an external Core simulation.
- Implement a Domain Service responsible for calculating request estimatedResolutionDate based on:
  - request type
  - granular SLA stages and status transitions

### Frontend Architecture (Modular Feature-Based)

- Stack:
  - React (Vite)
  - TypeScript
  - Tailwind CSS
- Organize by feature modules.
- Handle async fetching state with hooks following a React Query style approach.

## 2. Non-Negotiable Coding Instructions

### Language

- All code and documentation must be in English.
- Includes: class names, variables, methods, logs, commit-related texts, and technical docs.

### Naming

- Use short, concise, meaningful names.
- Avoid unnecessary prefixes.
- Naming conventions:
  - Classes: CamelCase
  - Variables and methods: camelCase

### Comments

- Only block comments are allowed, using this style:
  - /* ... */
- Allowed only at the top of classes or complex methods.
- Inline comments are forbidden.
- Code should be self-explanatory.

### Testing

- Include test folders in both projects with placeholders for unit tests.

## 3. Required Folder Structure

### Backend

Path:
/backend/src/main/java/com/bancolombia/leasing

Expected modules:

- domain/
  - model/
    - Entities and Value Objects (Request, ContractId, RequestStatus, etc.)
    - Respect DDD diagram types and states, including IN_SINIESTRO and datetime semantics
  - port/
    - Input and output ports (IRequestRepository, ILeasingCoreClient for ACL, INotifier)
  - service/
    - Domain Services (example: SlaEngine)

- application/
  - usecase/
    - Use cases such as FileRequest and GetStatus
  - dto/

- infrastructure/
  - adapter/
    - Concrete implementations (JpaRequestRepository, RestLeasingCoreClient for ACL)
  - entrypoint/
    - Transactional API controllers (RequestController)
  - config/
    - Spring beans and security configuration

Test placeholder path:
/backend/src/test/java/com/bancolombia/leasing

### Frontend

Path:
/frontend/src

Expected modules:

- features/requests/
  - components/
    - RequestForm.tsx
    - RequestStatusTracker.tsx
  - hooks/
  - services/api.ts

- components/common/
  - Reusable UI components with Bancolombia visual style
  - Color direction: Yellow-400, Black, White

Test placeholder path:
/frontend/src/test

## 4. Quality Standards

- Keep architecture explicit and easy to explain.
- Prefer clarity over cleverness.
- Avoid dead code, duplicated logic, and unclear abstractions.
- Ensure backend and frontend remain aligned through stable contracts.
- Keep naming and module boundaries consistent across the monorepo.
