# IMS Server

The IMS server is a modular REST API built with Node.js, Express 5,
TypeScript, and MongoDB with Mongoose. It also provides API documentation,
email workflows, file uploads, and Socket.IO notifications.

## Requirements

- Node.js and npm
- MongoDB database
- SMTP server credentials

## Getting started

From the `server` directory:

```bash
npm install
```

Create `server/.env` with the required configuration:

```dotenv
PORT=5000
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/ims
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USER=your-smtp-user
MAIL_PASSWORD=your-smtp-password
MAIL_FROM=IMS <no-reply@example.com>
```

`PORT` defaults to `5000`; token lifetimes default to `15m` and `7d`. Set
`CLIENT_URL` to the client origin so CORS, Socket.IO, and email links use the
correct address. The server verifies its SMTP connection during startup, so a
working mail configuration is needed to start it.

`GEMINI_API_KEY` is optional and is used by the chat integration when enabled.
Keep secrets in the local environment and never commit `.env` files.

## Run and build

```bash
npm run dev
```

The API listens at `http://localhost:5000` by default. Available scripts:

| Command | Description |
| --- | --- |
| `npm run dev` | Run the TypeScript server with automatic restarts |
| `npm run build` | Compile TypeScript into `dist/` |
| `npm start` | Run the compiled server from `dist/` |

## API

Swagger UI is served at `http://localhost:5000/api/docs`. API routes are
prefixed with `/api`:

| Prefix | Area |
| --- | --- |
| `/api/auth` | Login, token refresh, logout, and password recovery |
| `/api/users` | User accounts and administration |
| `/api/departments` | Departments and manager assignment |
| `/api/products` | Product catalog |
| `/api/suppliers` | Supplier records |
| `/api/inventory` | Stock levels, adjustments, and low-stock information |
| `/api/purchases` | Purchases and purchase documents |
| `/api/sales` | Sales and sales documents |
| `/api/orders` | Customer orders |
| `/api/expenses` | Expenses |
| `/api/dashboard` | Dashboard summaries and reports |
| `/api/settings` | Company settings and logo upload |
| `/api/staff` | Staff records, attendance, rooms, and expenses |
| `/api/staff/tasks` | Staff tasks |
| `/api/staff/leaves` | Staff leave requests |
| `/api/staff/assets` | Employee assets |
| `/api/notifications` | Notifications |
| `/api/chat` | Chat integration |

Uploaded files are served from `/uploads`. Browser clients should send
credentials for refresh-token requests; refresh tokens are stored in an
HttpOnly cookie.

## Source layout

```text
src/
  config/       Database, environment, and Swagger setup
  middleware/   Authentication, authorization, validation, and error handling
  modules/      Feature-oriented API routes, controllers, services, and models
  shared/       Email, helpers, responses, errors, exports, and uploads
  app.ts        Express application and route registration
  server.ts     Database, mail, Socket.IO, and HTTP server startup
```
