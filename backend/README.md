# Backend - Bancolombia Leasing Demo

Spring Boot backend implementing a Hexagonal + DDD architecture for leasing request management.

## Tech Stack

- Java 21
- Spring Boot 3.x
- Spring Web
- Spring Data JPA
- PostgreSQL

## Architecture

Source root:

- `src/main/java/com/bancolombia/leasing`

Layer organization:

- domain
  - model: entities and value objects (`Request`, `RequestStatus`, etc.)
  - port: input/output ports (`IRequestRepository`, `ILeasingCoreClient`, `INotifier`)
  - service: domain services (for example SLA logic)
- application
  - usecase: business use cases (`FileRequest`, `GetStatus`, operational actions)
  - dto: command/query DTOs
- infrastructure
  - adapter: concrete implementations (JPA repository, ACL REST client)
  - entrypoint: API controllers (`RequestController`)
  - config: bean and security configuration

## Database

- PostgreSQL schema: `leasing`
- Bootstrap SQL and details:
  - [db/README.md](db/README.md)

## Run Locally

### 1. Prerequisites

- JDK 21 installed
- Maven available in PATH
- PostgreSQL running

### 2. Initialize Database

Use the SQL scripts documented in [db/README.md](db/README.md).

### 3. Start the API

From `backend`:

```bash
mvn clean spring-boot:run
```

By default, the API is available at:

- `http://localhost:8080`

## Tests

Testing stack:

- JUnit 5
- Mockito (via `spring-boot-starter-test`)

Run unit tests:

```bash
mvn test
```


Base test package:

- `src/test/java/com/bancolombia/leasing`
