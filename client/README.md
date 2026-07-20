# IMS — Industry Management System

React + TypeScript starter with Register and Login pages, ready to wire up more pages as APIs come in.

## Stack
- **Vite + React + TypeScript**
- **Tailwind CSS v4** — custom "industrial blueprint" design system (steel blues + amber accent), light/dark mode
- **Formik + Zod** — form state + schema validation (Zod schemas adapted to Formik via a small bridge)
- **Axios** — central API client with interceptors (auth token attach, normalized error shape)
- **lucide-react** — icons
- **react-router-dom** — routing

## Getting started
```bash
cd ims-app
npm install
npm run dev
```
App runs at `http://localhost:5173`.

Set your backend URL in `.env`:
```
VITE_API_BASE_URL=http://localhost:5000/api
```

## What's wired up
- **Register page** (`/register`) -> `POST /api/users` with `{ fullName, email, password }`, matches your Postman sample exactly.
- **Login page** (`/login`) -> calls `authService.login`, currently pointed at `POST /api/auth/login`. Update the path in `src/services/authService.ts` once you share the real endpoint, nothing else needs to change.
- **Password policy**: min 8 characters, 1 uppercase, 1 lowercase, 1 special character, enforced by Zod and shown live via a strength meter.
- **Dashboard** (`/`) — placeholder landing page after auth, so navigation has somewhere to go. Replace as you add real pages.

## Project structure
```
src/
  components/common/   # Button, TextField, PasswordField, Alert, ThemeToggle, Logo, AuthLayout
  context/              # ThemeContext (light/dark, persisted to localStorage)
  lib/
    axios.ts            # API client + interceptors + error normalization
    validations/        # Zod schemas + zod-to-formik bridge
  services/              # authService (register/login API calls)
  types/                 # shared TS types
  pages/                 # Register, Login, Dashboard
```

## Design notes
- Favicon and in-app logo are the same hex-plate "gauge" mark — a nod to industrial control panels.
- Light and dark mode both use the same steel/amber palette, just inverted, so contrast stays readable in both.
- The `AuthLayout` component is shared by Register and Login (and any future auth pages) — one place to change the split-screen layout.
- All common components (`Button`, `TextField`, `PasswordField`, `Alert`, etc.) are Formik-aware and themed, so new pages can reuse them directly.

## Next steps
Send over the login endpoint contract when ready, and any additional pages (forgot password, dashboard modules, etc.) — the architecture (common components, axios client, validation pattern) is built to extend without rework.
