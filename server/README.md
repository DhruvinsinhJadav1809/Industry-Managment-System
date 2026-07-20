# Industry Management System (IMS) - Backend

Backend API for the **Industry Management System (IMS)** built with **Node.js**, **Express**, **TypeScript**, and **MongoDB** following a scalable and modular architecture.

---

## 🚀 Technology Stack

- Node.js
- Express.js
- TypeScript
- MongoDB
- Mongoose
- Zod
- Swagger UI
- bcrypt

---

## 📁 Project Structure

```text
src
├── config/             # Database & Swagger configuration
├── middleware/         # Validation & Error middleware
├── modules/
│   └── users/
│       ├── controllers/
│       ├── dto/
│       ├── routes/
│       ├── schemas/
│       ├── services/
│       ├── types/
│       └── validations/
├── shared/
│   ├── helpers/
│   ├── responses/
│   └── errors/
├── app.ts
└── server.ts
```

---

## ⚙️ Installation

Clone the repository and install dependencies.

```bash
npm install
```

---

## ▶️ Running the Application

Development

```bash
npm run dev
```

Production Build

```bash
npm run build
npm start
```

---

## 🌍 Environment Variables

Create a `.env` file in the project root.

Example:

```env
PORT=5000

MONGODB_URI=mongodb://localhost:27017/industry-management-system

CLIENT_URL=http://localhost:5173

JWT_SECRET=your-secret-key

BCRYPT_SALT_ROUNDS=10
```

---

## 📚 API Documentation

Swagger UI is available at:

```
http://localhost:5000/api/docs
```

---

## ✅ Features Implemented

### Project Setup

- Express + TypeScript
- Environment Configuration
- MongoDB Connection using Mongoose
- Modular Folder Structure

### User Module

- Create User API
- Email Duplicate Validation
- Password Hashing using bcrypt
- Response DTO
- Zod Request Validation

### Error Handling

- Global Error Middleware
- Custom Error Classes
- Standard API Response
- Async Handler

### Developer Tools

- Swagger Configuration
- TypeScript Support

---

## 📌 API Endpoints

### User

| Method | Endpoint     | Description       |
| ------ | ------------ | ----------------- |
| POST   | `/api/users` | Create a new user |

---

## 📦 Available Scripts

| Command         | Description            |
| --------------- | ---------------------- |
| `npm run dev`   | Run development server |
| `npm run build` | Build the application  |
| `npm start`     | Run production build   |

---

## 🏗️ Architecture

The project follows a layered architecture.

```text
Request
   │
Routes
   │
Controller
   │
Service
   │
Database
   │
Response
```

Cross-cutting concerns:

- Validation Middleware
- Async Handler
- Error Middleware
- Standard API Response

---

## 🎯 Sprint Progress

### ✅ Sprint 1

- Project Initialization
- MongoDB Configuration
- User Registration API
- Request Validation
- Password Hashing
- Duplicate Email Validation
- Global Error Handling
- Async Handler
- Swagger Configuration

---

## 👨‍💻 Development Guidelines

- Follow the existing project structure.
- Use DTOs for request and response models.
- Validate all incoming requests using Zod.
- Handle exceptions using custom error classes.
- Return responses using the standard API response helper.
- Use the Async Handler for all controllers.
- Keep business logic inside services.

---
