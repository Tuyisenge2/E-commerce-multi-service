# Services

This directory contains the future independently deployable services for ShopTrove.

The existing `src/` application remains the current production/reference application while the domains are migrated incrementally. Services must communicate through HTTP or events; they should not import files from another service.

## Planned boundaries

- `user-service`: users, profiles, roles, authentication, password reset
- `catalog-service`: products, categories, search, reviews, wishes
- `cart-service`: shopping carts and cart items
- `order-service`: orders, sales, order status, invoices
- `payment-service`: payment providers and payment status
- `notification-service`: email, notifications, password-expiry jobs, realtime notifications

Each service currently exposes a health endpoint and is intentionally small. Domain code will be moved from `src/` one boundary at a time.
