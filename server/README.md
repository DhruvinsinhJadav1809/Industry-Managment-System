# Industry Management System (IMS) - Backend

Backend API for the **Industry Management System (IMS)** built with **Node.js**, **Express.js**, **TypeScript**, and **MongoDB**, following a scalable, modular, and production-ready architecture.

---

# 🚀 Technology Stack

- Node.js
- Express.js
- TypeScript
- MongoDB
- Mongoose
- Zod
- JWT Authentication
- bcrypt
- Nodemailer
- Swagger UI

---

# 📁 Project Structure

```text
src
├── config/
├── middleware/
├── modules/
│   ├── auth/
│   ├── users/
│   ├── departments/
│   └── products/
├── shared/
│   ├── email/
│   │   ├── interfaces/
│   │   ├── templates/
│   │   ├── mail.service.ts
│   │   └── transporter.ts
│   ├── helpers/
│   ├── responses/
│   └── errors/
├── app.ts
└── server.ts
```

---

# ⚙️ Installation

```bash
npm install
```

---

# ▶️ Running the Application

Development

```bash
npm run dev
```

Production

```bash
npm run build
npm start
```

---

# 🌍 Environment Variables

Create a `.env` file.

```env
PORT=5000

MONGODB_URI=

CLIENT_URL=

JWT_SECRET=
JWT_EXPIRES_IN=

BCRYPT_SALT_ROUNDS=10

MAIL_HOST=
MAIL_PORT=
MAIL_USER=
MAIL_PASSWORD=
MAIL_FROM=

```

---

# 📚 API Documentation

Swagger

```
http://localhost:5000/api/docs
```

---

# ✅ Features Implemented

## Project Setup

- Express + TypeScript
- Environment Configuration
- MongoDB Connection
- Modular Folder Structure
- Swagger Documentation

---

## Authentication

- User Login
- JWT Authentication
- Role-Based Authorization
- Forgot Password
- Reset Password
- Password Hashing using bcrypt
- Secure Reset Token Generation
- SHA-256 Token Hashing
- Reset Token Expiration
- Protection against User Enumeration

---

## User Module

- Create User
- Get Users (Pagination & Search)
- Get User By Id
- Update User
- Soft Delete User
- Duplicate Email Validation
- Response DTOs
- Zod Validation

---

## Department Module

- Create Department
- Assign Manager
- Get Departments
- Pagination
- Search
- Get Department By Id
- Update Department
- Soft Delete Department
- Manager Population using Mongoose Populate

---

## Product Module

- Create Product
- Get Products
- Get Product By Id
- Update Product
- Soft Delete Product
- Department Reference
- Product Type Support

---

## Email Service

Reusable email infrastructure.

Supported emails:

- Welcome Email
- Forgot Password Email

Features:

- Reusable Mail Service
- HTML Email Templates
- SMTP Connection Verification
- Mailtrap Support

---

## Error Handling

- Global Error Middleware
- Custom Error Classes
- Standard API Response
- Async Handler

---

# 📌 API Endpoints

## Authentication

| Method | Endpoint                    | Description     |
| ------ | --------------------------- | --------------- |
| POST   | `/api/auth/login`           | Login           |
| POST   | `/api/auth/forgot-password` | Forgot Password |
| POST   | `/api/auth/reset-password`  | Reset Password  |

---

## Users

| Method | Endpoint         |
| ------ | ---------------- |
| POST   | `/api/users`     |
| GET    | `/api/users`     |
| GET    | `/api/users/:id` |
| PUT    | `/api/users/:id` |
| DELETE | `/api/users/:id` |

---

## Departments

| Method | Endpoint               |
| ------ | ---------------------- |
| POST   | `/api/departments`     |
| GET    | `/api/departments`     |
| GET    | `/api/departments/:id` |
| PUT    | `/api/departments/:id` |
| DELETE | `/api/departments/:id` |

---

## Products

| Method | Endpoint            |
| ------ | ------------------- |
| POST   | `/api/products`     |
| GET    | `/api/products`     |
| GET    | `/api/products/:id` |
| PUT    | `/api/products/:id` |
| DELETE | `/api/products/:id` |

---

# 📦 Available Scripts

| Command       | Description        |
| ------------- | ------------------ |
| npm run dev   | Development Server |
| npm run build | Build Application  |
| npm start     | Production Server  |

---

# 🏗️ Architecture

```text
HTTP Request
      │
      ▼
Routes
      │
      ▼
Validation Middleware
      │
      ▼
Authentication
      │
      ▼
Authorization
      │
      ▼
Controller
      │
      ▼
Service
      │
      ▼
Database
      │
      ▼
Response Helper
      │
      ▼
HTTP Response
```

Cross-cutting concerns:

- Validation Middleware
- Authentication Middleware
- Authorization Middleware
- Async Handler
- Global Error Middleware
- Standard API Response
- Email Service

---

# 🎯 Sprint Progress

## ✅ Sprint 1

- Project Setup
- MongoDB
- User Registration
- JWT Authentication
- Swagger
- Error Handling

## ✅ Sprint 2

- User CRUD
- Department CRUD
- Product CRUD
- Pagination & Search
- Soft Delete
- Manager Population

## ✅ Sprint 3

- Forgot Password
- Reset Password
- Welcome Email
- SMTP Integration
- Reusable Email Service

---

# 👨‍💻 Development Guidelines

- Follow the existing modular architecture.
- Keep business logic inside services.
- Use DTOs for request and response models.
- Validate requests using Zod.
- Return responses using the standard response helper.
- Handle exceptions using custom error classes.
- Use Async Handler for all controllers.
- Follow soft delete instead of permanent delete.
- Use Mongoose Populate for referenced documents.
- Reuse the shared Email Service for all outgoing emails.
