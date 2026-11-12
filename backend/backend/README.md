# Backend authentication setup

## Local configuration (PowerShell)

Set these variables in the same PowerShell window used to run Maven. Generate a fresh signing key; do not reuse a key committed to source control.

```powershell
$jwtBytes = [byte[]]::new(32)
$rng = [Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($jwtBytes)
$rng.Dispose()
$env:JWT_SECRET_BASE64 = [Convert]::ToBase64String($jwtBytes)

$env:BOOTSTRAP_ADMIN_EMAIL = "admin@example.com"
$env:BOOTSTRAP_ADMIN_PASSWORD = "use-a-unique-password-of-at-least-8-characters"
$env:BOOTSTRAP_ADMIN_RESET_PASSWORD = "false"
$env:SMTP_USERNAME = "your-sender@gmail.com"
$env:SMTP_PASSWORD = "your-google-app-password"
$env:APP_MAIL_TO = "your-team@example.com"
$env:APP_FRONTEND_URL = "http://localhost:5173"

mvn spring-boot:run
```

The database URL and credentials can be overridden with `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, and `SPRING_DATASOURCE_PASSWORD`. A configured admin account is created only if it does not already exist. To explicitly reset the password of that existing admin account, set `BOOTSTRAP_ADMIN_RESET_PASSWORD` to `true` for one startup, then unset it or set it back to `false`. The reset applies only when the configured email already belongs to an admin. The public registration endpoint accepts only `CLIENT` and `COACH`; coaches remain pending until an administrator approves them.

## Authentication endpoints

- `POST /api/auth/register` — create a client or request coach access.
- `POST /api/auth/login` — return a short-lived HS256 bearer token.
- `GET /api/auth/me` — return the authenticated account, role, and permissions.
- `POST /api/auth/forgot-password` — send a generic response and, for an existing account, a one-time reset link.
- `POST /api/auth/reset-password` — accept the reset token and a new password.
- `GET /api/admin/coaches/pending` and `PATCH /api/admin/coaches/{id}/approve` — administrator-only coach approval.

Tokens expire after 15 minutes by default. Role and permission claims are included in the token. `/api/admin/**` requires `ADMIN`, `/api/coach/**` requires `COACH` or `ADMIN`, and `/api/client/**` requires `CLIENT` or `ADMIN`. Public access is limited to authentication endpoints, `GET /api/home`, and existing lead-submission POST routes.

Password reset tokens are random, expire after 30 minutes, and are stored only as SHA-256 hashes. The frontend keeps the access token in tab-scoped `sessionStorage` and sends it as a bearer token.

The default permission claims are:

- `CLIENT`: `PROFILE_READ`, `PROFILE_UPDATE`, `BOOKINGS_MANAGE`, `PROGRESS_READ`
- `COACH`: `PROFILE_READ`, `PROFILE_UPDATE`, `CLIENTS_READ`, `AVAILABILITY_MANAGE`, `PROGRESS_MANAGE`
- `ADMIN`: `USERS_MANAGE`, `COACHES_APPROVE`, `LEADS_READ`, `PLANS_MANAGE`

Apply these permission authorities to individual handlers with `@PreAuthorize("hasAuthority('PERM_PERMISSION_NAME')")` when implementing those domain APIs. Password-reset endpoints should also be rate-limited at the reverse proxy or API gateway in a production deployment.
