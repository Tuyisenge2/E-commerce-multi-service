# Frontend integration with the ShopTrove microservices

This document is the handoff for migrating the existing frontend from the old
monolith API to the extracted services.

## 1. API topology

The frontend no longer has one backend base URL unless an API gateway is added.
For the current local setup, use one URL per domain:

```env
VITE_USER_API_URL=http://localhost:3001
VITE_CATALOG_API_URL=http://localhost:3002
VITE_CART_API_URL=http://localhost:3003
VITE_ORDER_API_URL=http://localhost:3004
VITE_PAYMENT_API_URL=http://localhost:3005
VITE_NOTIFICATION_API_URL=http://localhost:3006
```

For production, replace each value with that service's Render URL:

```env
VITE_USER_API_URL=https://<user-service>.onrender.com
VITE_CATALOG_API_URL=https://<catalog-service>.onrender.com
VITE_CART_API_URL=https://<cart-service>.onrender.com
VITE_ORDER_API_URL=https://<order-service>.onrender.com
VITE_PAYMENT_API_URL=https://<payment-service>.onrender.com
VITE_NOTIFICATION_API_URL=https://<notification-service>.onrender.com
```

Never put Neon credentials, JWT secrets, or service-to-service secrets in the
frontend environment. Every `VITE_*` variable is public in the browser bundle.

## 2. Domain routing

| Frontend feature | Base URL | Public route prefix |
| --- | --- | --- |
| Registration, login, users, roles | `VITE_USER_API_URL` | `/api/v1/users` |
| Current user's profile | `VITE_USER_API_URL` | `/api/v1/profile` |
| Products, categories, reviews, wishes | `VITE_CATALOG_API_URL` | `/api/v1/...` |
| Shopping cart | `VITE_CART_API_URL` | `/api/v1/carts` |
| Orders | `VITE_ORDER_API_URL` | `/api/v1/orders` |
| Payments | `VITE_PAYMENT_API_URL` | `/api/v1/payments` |
| Notifications and chats | `VITE_NOTIFICATION_API_URL` | `/api/v1/...` |

Routes beginning with `/internal/` are for backend-to-backend communication.
The frontend must never call them directly.

## 3. Frontend API client

Keep service selection in one module instead of writing URLs inside pages:

```ts
export const serviceUrls = {
  user: import.meta.env.VITE_USER_API_URL,
  catalog: import.meta.env.VITE_CATALOG_API_URL,
  cart: import.meta.env.VITE_CART_API_URL,
  order: import.meta.env.VITE_ORDER_API_URL,
  payment: import.meta.env.VITE_PAYMENT_API_URL,
  notification: import.meta.env.VITE_NOTIFICATION_API_URL,
} as const;

export async function apiRequest<T>(
  service: keyof typeof serviceUrls,
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = localStorage.getItem("accessToken");
  const response = await fetch(`${serviceUrls[service]}${path}`, {
    ...options,
    headers: {
      ...(options.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(body?.message ?? `Request failed (${response.status})`);
  }

  return body as T;
}
```

Do not set `Content-Type: application/json` for profile-image uploads; the
browser must generate the multipart boundary for `FormData`.

## 4. Current public endpoints

### User service (`3001`)

```text
POST  /api/v1/users/register
POST  /api/v1/users/login
POST  /api/v1/users/logout
POST  /api/v1/users/forgot-password
POST  /api/v1/users/reset-password/:token
PATCH /api/v1/users/password-update
GET   /api/v1/users/account/verify/:token
POST  /api/v1/users/2fa/:token
GET   /api/v1/users/auth/google
GET   /api/v1/users/auth/google/callback
GET   /api/v1/profile
PATCH /api/v1/profile
GET   /api/v1/users                    (admin)
PATCH /api/v1/users/:userId/account-status (admin)
GET   /api/v1/roles                    (admin)
POST  /api/v1/roles                    (admin)
PATCH /api/v1/roles/:id                (admin)
POST  /api/v1/users/:userId/roles      (admin)
```

### Catalog service (`3002`)

```text
GET    /api/v1/categories
GET    /api/v1/categories/:id
POST   /api/v1/categories
PATCH  /api/v1/categories/:id
GET    /api/v1/products/search
GET    /api/v1/products/guest-products
GET    /api/v1/products
GET    /api/v1/products/:id
POST   /api/v1/products
PATCH  /api/v1/products/:id
DELETE /api/v1/products/:id
GET    /api/v1/products/:id/reviews
POST   /api/v1/products/recommended
GET    /api/v1/reviews
POST   /api/v1/reviews
PATCH  /api/v1/reviews/:id
DELETE /api/v1/reviews/:id
GET    /api/v1/wishes
POST   /api/v1/wishes
```

### Cart service (`3003`)

```text
POST  /api/v1/carts
GET   /api/v1/carts
PATCH /api/v1/carts
PUT   /api/v1/carts    (clear cart)
```

### Order service (`3004`)

```text
GET /api/v1/orders
GET /api/v1/orders/:id
```

Order checkout is currently exposed only as an internal endpoint and should be
initiated through the payment flow, not called by the browser directly.

### Payment service (`3005`)

```text
POST /api/v1/payments
GET  /api/v1/payments/success
POST /api/v1/payments/cancel
```

### Notification service (`3006`)

```text
GET   /api/v1/notifications
PATCH /api/v1/notifications/:id/read
GET   /api/v1/chats
POST  /api/v1/chats
```

## 5. Authentication rule

Cart, checkout, and order history require authentication. All authenticated
roles can shop: `BUYER`, `SELLER`, and `ADMIN`.

After login/2FA returns an access token, authenticated requests must send:

```http
Authorization: Bearer <access-token>
```

Catalog, cart, order, payment, and notification validate that token through the
user service. They must be configured with `USER_SERVICE_URL` in deployment.

Handle these responses globally:

```text
401: token missing, invalid, or expired -> clear session and show login
403: authenticated but role is not allowed -> show forbidden message
5xx: service unavailable -> show retryable error, do not log the user out
```

## 6. Required backend work before browser testing

Postman does not enforce browser CORS rules. Every public service must allow the
frontend origin, for example:

```env
FRONTEND_URL=http://localhost:5173
```

In production, this must be the deployed frontend origin. Allow at least the
`Authorization` and `Content-Type` headers and the HTTP methods used above.

The frontend should never use Docker hostnames such as `user-service:3001`.
Those names work only between containers. From the browser, use `localhost`
while developing and public HTTPS Render URLs in production.

## 7. Recommended migration sequence

1. Create the six environment variables and central API client.
2. Migrate registration, login, 2FA, logout, and profile screens.
3. Migrate catalog pages.
4. Migrate cart pages.
5. Migrate order history and order detail pages.
6. Migrate checkout/payment redirects.
7. Migrate notifications and chats.
8. Remove the old monolith API base URL only after searching for every use.
9. Test the complete buyer and seller journeys in a browser.

During migration, search for hard-coded monolith URLs and direct API calls:

```bash
rg "localhost|API_URL|BASE_URL|axios|fetch\(" src
```
