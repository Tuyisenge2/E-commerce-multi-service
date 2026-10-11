# User service

Owns users, profiles, roles, authentication, password reset, and session/token concerns.

## Migration source

- `src/controllers/userController.ts`
- `src/controllers/resetPasswort.ts`
- `src/routes/userRoutes.ts`
- `src/routes/profileRouter.ts`
- `src/routes/roleRoutes.ts`
- `src/middlewares/passport.ts`
- `src/middlewares/auth.ts`
- `src/database/models/User.ts`, `role.ts`, `token.ts`, `blacklist.ts`, and `resetPassword.ts`

The service has its own process and health endpoint and uses Sequelize against the existing monolith-compatible tables: `users`, `roles`, `tokens`, and `blacklisted_tokens`. It provides standalone implementations of registration, login, logout, profile access/update, JWT authentication, and admin user listing.

This service does not import the old `src/` directory.
