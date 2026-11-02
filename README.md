# Industry Management System

Industry Management System (IMS) is a web application for managing day-to-day
industry operations. It includes a React and TypeScript client and a modular
Express API backed by MongoDB.

## Features

- Role-aware authentication, account registration, password recovery, and
  session refresh
- Dashboard, user, department, product, supplier, and inventory management
- Purchase, sales, order, and expense workflows
- Staff management, attendance, rooms, salary, tasks, leave, and assigned assets
- Notifications, company settings, reports, and data exports
- API documentation and real-time notifications

## Repository layout

```text
client/   React, TypeScript, and Vite application
server/   Express, TypeScript, and MongoDB API
README.md Project overview and setup
```

See the [client README](client/README.md) and [server README](server/README.md)
for the application-specific setup, configuration, and scripts.

## Requirements

- Node.js and npm
- MongoDB connection string
- SMTP account for server email (including account and password recovery email)

## Run locally

Install dependencies and configure each application in separate terminals:

```bash
cd server
npm install
npm run dev
```

```bash
cd client
npm install
npm run dev
```

Create `server/.env` and `client/.env` as described in their README files. The
development client runs at `http://localhost:5173`; the API defaults to
`http://localhost:5000`. API documentation is available at
`http://localhost:5000/api/docs`.

## Build

Run each build from its own application directory:

```bash
npm run build
```

The client build outputs to `client/dist`. The server build outputs compiled
JavaScript to `server/dist`; run it with `npm start` from `server`.
