# ShopTrove service migration plan

## Current state

The repository currently runs one Express application in `src/`, backed by PostgreSQL. This is the baseline that must keep working during the migration.

## Target state

The platform will have a gateway plus six independently deployable services:

```text
client -> gateway -> user | catalog | cart | order | payment | notification
                              \---------- PostgreSQL (initial migration) ----------/
```

The shared database is temporary. Once boundaries are stable, each service can own its schema/database without changing the client-facing API.

## Migration order

1. Add service health checks and local Compose wiring.
2. Extract user/auth because other services depend on identity.
3. Extract catalog (products/categories/search/reviews/wishes).
4. Extract cart.
5. Extract orders and sales.
6. Extract payments and connect it to order events.
7. Extract notifications, email, chat, and scheduled jobs.
8. Put gateway routing in front of the migrated services.
9. Add service-specific tests, migrations, and database ownership.
10. Remove migrated routes from the monolith only after contract tests pass.

## Rules

- Keep the current API contract while extracting.
- A service owns its controllers, routes, business logic, and data access.
- Services communicate through HTTP/events, never by importing another service's files.
- Add a health endpoint and contract tests before moving a domain.
- Do not split tables or introduce a message broker until the first extraction is understood.
