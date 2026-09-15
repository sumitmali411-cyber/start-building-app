# Security Policy

## Supported Versions

Use this section to tell people about which versions of your project are
currently being supported with security updates.

| Version | Supported          |
| ------- | ------------------ |
| 5.1.x   | :white_check_mark: |
| 5.0.x   | :x:                |
| 4.0.x   | :white_check_mark: |
| < 4.0   | :x:                |

## Reporting a Vulnerability

Use this section to tell people how to report a vulnerability.

Tell them where to go, how often they can expect to get an update on a
reported vulnerability, what to expect if the vulnerability is accepted or
declined, etc.

---

## Configuration requirements

This project reads all secrets from environment variables. Nothing sensitive
belongs in `application.properties` or any other tracked file.

Required before running the backend:

| Variable | Purpose |
| --- | --- |
| `FLOW_JWT_SECRET` | HMAC-SHA256 signing key for flow session tokens. Generate with `openssl rand -base64 48`. |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Payment provider credentials. |
| `ADUMO_MERCHANT_ID` | Payment provider merchant id. |
| `DB_USERNAME` / `DB_PASSWORD` | Database credentials. |
| `FRONTEND_ORIGIN` | Origin allowed by CORS and as a payment redirect target. |
| `H2_CONSOLE_ENABLED` | Leave `false`. The H2 console is an unauthenticated SQL shell. |

See `.env.example`.

## Known gaps

The following are **not** fixed and need a design decision:

- **Order creation is not tied to a completed payment.** `POST /api/orders`
  accepts a `sessionId` and creates an order; nothing verifies that money moved.
  A Razorpay signature check (`razorpay_payment_id` + `razorpay_order_id` +
  `razorpay_signature`, verified with the key secret) or an equivalent
  server-side payment-state check is required before this is safe to deploy.
- **There is no authentication.** The app has no Spring Security dependency and
  no login. Session ids are client-generated and unauthenticated, so the
  ownership check on order lookup is a speed bump, not access control.
- **The Adumo hosted page collects card data** (PAN, CVV) and POSTs it to this
  server, which discards it. Even as a simulation, do not point it at real cards.
