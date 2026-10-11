# ShopTrove E-Commerce Platform

[![Coverage Status](https://coveralls.io/repos/github/atlp-rwanda/hackers-ec-be/badge.svg?branch=develop)](https://coveralls.io/github/atlp-rwanda/hackers-ec-be?branch=develop)
[![Maintainability](https://api.codeclimate.com/v1/badges/0f9cac2f0a2f7a9/maintainability)](https://codeclimate.com/github/atlp-rwanda/hackers-ec-be/maintainability)
![Testing](https://img.shields.io/badge/Testing-Jest-brown?style=flat-square&labelColor=green)
![Auth](https://img.shields.io/badge/Auth-Passport.js-yellow?style=flat-square&labelColor=%2327c2a0)
![Code style](https://img.shields.io/badge/ESLint-Code%20style-%232796C2?style=flat-square&labelColor=%2396c900)
![GitHub Actions](https://img.shields.io/badge/CI-GitHub%20Actions-2088FF?style=flat-square&logo=github-actions&logoColor=white)

[![TypeScript](https://skillicons.dev/icons?i=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://skillicons.dev/icons?i=nodejs)](https://nodejs.org/)
[![PostgreSQL](https://skillicons.dev/icons?i=postgres)](https://www.postgresql.org/)
[![Docker](https://skillicons.dev/icons?i=docker)](https://www.docker.com/)
[![Jest](https://skillicons.dev/icons?i=jest)](https://jestjs.io/)

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
