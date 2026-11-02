# IMS Client

The client is the web application for the Industry Management System, built
with React and TypeScript. It provides role-protected screens for business and
staff workflows and communicates with the IMS API.

## Technology

- React 19, TypeScript, and Vite
- Tailwind CSS 4
- React Router
- Axios for API requests and token refresh
- Formik and Zod for forms and validation
- Recharts for dashboard visualizations
- Socket.IO client for real-time notifications

## Getting started

From the `client` directory:

```bash
npm install
npm run dev
```

Vite serves the app at `http://localhost:5173`.

Create `client/.env` with the API URL:

```dotenv
VITE_API_BASE_URL=http://localhost:5000/api
```

`VITE_SOCKET_URL` is optional. When unset, the Socket.IO connection uses the
origin derived from `VITE_API_BASE_URL`.

## Application areas

- Authentication, registration, password reset, and role-based navigation
- Dashboard and business administration for users, departments, products,
  suppliers, inventory, company settings, and notifications
- Orders, purchases, sales, and expenses
- Staff directory, attendance, rooms, salary, tasks, leave requests, and
  employee assets
- Staff self-service pages for attendance, tasks, leave, and assigned assets
- API-backed chat and real-time notifications

## Source layout

```text
src/
  components/   Shared UI and feature-specific components
  constants/    Shared options and storage keys
  context/      Authentication, settings, notifications, theme, and toast state
  lib/          API client, helpers, and validation schemas
  layouts/      Authenticated application layout
  pages/        Application routes and screens
  routes/       Authentication and role guards
  services/     API service functions
  types/        TypeScript domain types
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Type-check and create the production build in `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run Oxlint |

The API uses cookie credentials for refresh-token requests. Configure the
server's `CLIENT_URL` to match the client origin; see the [server README](../server/README.md).
