# ShopTrove E-Commerce Platform

ShopTrove is an e-commerce platform being reorganized from a single Express application into a modular monorepo of independently deployable services.

## Architecture

```text
Client -> Traefik gateway -> user | catalog | cart | order | payment | notification
```

During migration, services reuse the existing PostgreSQL schema and user IDs. Database separation will happen after service behavior is stable.

## Services

| Service | Responsibility | Port |
|---|---|---:|
| user-service | Users, authentication, roles, profiles | 3001 |
| catalog-service | Products, categories, search, reviews, wishlists | 3002 |
| cart-service | Shopping carts | 3003 |
| order-service | Orders, sales, invoices, statistics | 3004 |
| payment-service | Stripe and MTN MoMo payments | 3005 |
| notification-service | Notifications, email, chat, realtime events | 3006 |

The original monolith remains in `src/` as the reference implementation while extraction work continues.

## Technology

- Node.js, TypeScript, and Express
- PostgreSQL and Sequelize
- Docker Compose and Traefik
- JWT and Passport authentication
- Stripe, MTN MoMo, and Socket.IO
- Jest and Prometheus configuration

## Repository structure

```text
services/       Independent service code
gateway/        Traefik gateway configuration
monitoring/     Prometheus configuration
src/            Original monolith during migration
docs/           Architecture and migration documentation
docker-compose.yml
```

## Running locally

Create an environment file and configure the database and secrets:

```bash
cp .env-example .env
docker compose up --build
```

The gateway is available at `http://localhost`. Prometheus is available at `http://localhost:9090`.

Every service exposes a health endpoint, for example:

```bash
curl http://localhost:3001/health
```

## Migration status

The business-domain code has been copied into the service boundaries. Import cleanup, independent builds, integration tests, and separate database ownership are part of the integration phase.

See [the service migration plan](docs/service-migration-plan.md).

## Security

Never commit `.env` or real credentials. Use `.env-example` only as a template for required variables.
