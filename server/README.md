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

### Inventory Module

- Added Inventory module with complete CRUD operations.
- Inventory record is automatically created whenever a new product is created.
- Added stock adjustment API to increase or decrease stock.
- Added low stock API to retrieve products below minimum stock level.
- Implemented inventory pagination, searching, sorting, and filtering.
- Added inventory DTOs, validations, mappers, and response models.

### Supplier Module

- Implemented complete Supplier CRUD APIs.
- Added supplier search, pagination, sorting, and active/inactive filtering.
- Implemented soft delete for suppliers.
- Added supplier validation, DTOs, and response mapping.

### Excel Export

- Integrated **ExcelJS** for Excel generation.
- Implemented generic Excel service for reusable exports.
- Added Supplier Excel export API.
- Configured downloadable Excel response with proper headers.
- Generic implementation can be reused for Purchase, Sales, Inventory, Product, and other reports.

### Settings Module

- Added Settings module for single-company ERP configuration.
- Implemented Settings Create, Get, and Update APIs.
- Stores company information including:
  - Company Name
  - GST Number
  - Email
  - Phone
  - Address
  - City
  - State
  - Country
  - Postal Code

- Designed as a singleton configuration (only one settings record).

### File Upload

- Integrated **Multer** for file uploads.
- Added company logo upload API.
- Configured disk storage for uploaded files.
- Added image validation (PNG, JPG, JPEG).
- Added file size validation.
- Configured Express static middleware to serve uploaded files.
- Stored relative file paths in the database and exposed logo URLs through the Settings API.

### Shared Components

- Added reusable Excel generation service.
- Added reusable upload middleware for future modules.
- Upload infrastructure is designed to support:
  - Company Logo
  - Product Images
  - User Profile Images
  - Supplier Documents
  - Future file attachments

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
