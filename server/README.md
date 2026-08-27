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
- Socket.IO
- Multer
- ExcelJS
- PDFKit
- express-rate-limit

---

# 📁 Project Structure

```text
src
├── config/
│
├── middleware/
│
├── modules/
│   ├── auth/
│   ├── users/
│   ├── departments/
│   ├── products/
│   ├── suppliers/
│   ├── inventory/
│   ├── purchase/
│   ├── settings/
│   └── socket/
│
├── shared/
│   ├── email/
│   │   ├── interfaces/
│   │   ├── templates/
│   │   ├── mail.service.ts
│   │   └── transporter.ts
│   │
│   ├── helpers/
│   ├── responses/
│   ├── errors/
│   ├── excel/
│   ├── pdf/
│   └── upload/
│
├── app.ts
└── server.ts
⚙️ Installation
npm install
▶️ Running the Application
Development
npm run dev
Production
npm run build
npm start
🌍 Environment Variables

Create a .env file in the root directory.

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
📚 API Documentation

Swagger documentation is available at:

http://localhost:5000/api/docs
✅ Features Implemented
Project Setup
Express + TypeScript
Environment Configuration
MongoDB Connection
Modular Folder Structure
Swagger Documentation
Global Error Handling
Standard API Response Structure
Async Handler
Authentication
User Login
JWT Authentication
Role-Based Authorization
Forgot Password
Reset Password
Password Hashing using bcrypt
Secure Reset Token Generation
SHA-256 Token Hashing
Reset Token Expiration
Protection against User Enumeration
User Module
Create User
Get Users
Pagination
Search
Sorting
Get User By ID
Update User
Soft Delete User
Duplicate Email Validation
Response DTOs
Zod Validation
Department Module
Create Department
Assign Manager
Get Departments
Pagination
Search
Get Department By ID
Update Department
Soft Delete Department
Manager Population using Mongoose Populate
Product Module
Create Product
Get Products
Get Product By ID
Update Product
Soft Delete Product
Department Reference
Product Type Support
Product Image Support
Supplier Module
Create Supplier
Get Suppliers
Get Supplier By ID
Update Supplier
Soft Delete Supplier
Search
Pagination
Sorting
Active/Inactive Filtering
Supplier Validation
Supplier DTOs
Response Mapping
Inventory Module
Automatic Inventory Creation when a Product is Created
Get Inventory
Get Inventory By ID
Update Inventory
Soft Delete Inventory
Inventory Pagination
Inventory Search
Inventory Sorting
Inventory Filtering
Stock Adjustment
Low Stock API
Minimum Stock Level Support
Inventory DTOs
Inventory Validation
Inventory Response Mapping
Purchase Module
Create Purchase
Get Purchases
Get Purchase By ID
Update Purchase
Soft Delete Purchase
Purchase Pagination
Search
Sorting
Supplier Reference
Product Reference
Purchase Item Support
Purchase Amount Calculation
Discount Support
GST Calculation
Grand Total Calculation
Inventory Stock Update
Purchase PDF Generation
Purchase PDF Download
PDF Generation
Integrated PDFKit
Reusable PDF Helper
Reusable PDF Theme
Purchase Invoice PDF
Downloadable PDF Response
Configured PDF headers
Currency formatting
Date formatting
Structured PDF tables
Company/ERP footer information

PDF infrastructure is designed to be reused for:

Purchase Invoice
Sales Invoice
Reports
Future documents
Excel Export
Integrated ExcelJS
Generic Excel Generation Service
Supplier Excel Export
Downloadable Excel Response
Reusable Excel infrastructure

The generic implementation can be reused for:

Purchase
Sales
Inventory
Products
Suppliers
Reports
Settings Module
Settings Create API
Settings Get API
Settings Update API
Singleton Company Configuration

Stores company information including:

Company Name
GST Number
Email
Phone
Address
City
State
Country
Postal Code
Company Logo
File Upload
Integrated Multer
Company Logo Upload
Disk Storage Configuration
Image Validation
PNG Support
JPG Support
JPEG Support
File Size Validation
Express Static File Serving
Relative File Path Storage
Public File URL Support

Upload infrastructure is designed to support:

Company Logo
Product Images
User Profile Images
Supplier Documents
Future Attachments
Email Service

Reusable email infrastructure.

Supported Emails
Welcome Email
Forgot Password Email
Features
Reusable Mail Service
HTML Email Templates
SMTP Connection Verification
Mailtrap Support
Configurable SMTP Transporter
Real-Time Notifications
Integrated Socket.IO
HTTP Server integration with Socket.IO
User-specific Socket Rooms
User Join Support
Connection Handling
Disconnect Handling
Real-time Notification Infrastructure

Current infrastructure supports future notifications such as:

New Stock Arrived
Low Stock Alert
Purchase Created
Sale Created
Inventory Updates
Rate Limiting
Integrated express-rate-limit
Global API Rate Limiting
Login-specific Rate Limiting
Email + IP based Login Rate Limiting
HTTP 429 response for excessive requests
Current Limits
Global API
100 requests / 15 minutes

Login
5 attempts / 15 minutes

The current implementation uses application memory.

For a multi-instance production deployment, Redis-based rate limiting can be introduced.

📌 API Endpoints
Authentication
Method	Endpoint	Description
POST	/api/auth/login	Login
POST	/api/auth/forgot-password	Forgot Password
POST	/api/auth/reset-password	Reset Password
Users
Method	Endpoint	Description
POST	/api/users	Create User
GET	/api/users	Get Users
GET	/api/users/:id	Get User
PUT	/api/users/:id	Update User
DELETE	/api/users/:id	Soft Delete User
Departments
Method	Endpoint	Description
POST	/api/departments	Create Department
GET	/api/departments	Get Departments
GET	/api/departments/:id	Get Department
PUT	/api/departments/:id	Update Department
DELETE	/api/departments/:id	Soft Delete Department
Products
Method	Endpoint	Description
POST	/api/products	Create Product
GET	/api/products	Get Products
GET	/api/products/:id	Get Product
PUT	/api/products/:id	Update Product
DELETE	/api/products/:id	Soft Delete Product
Suppliers
Method	Endpoint	Description
POST	/api/suppliers	Create Supplier
GET	/api/suppliers	Get Suppliers
GET	/api/suppliers/:id	Get Supplier
PUT	/api/suppliers/:id	Update Supplier
DELETE	/api/suppliers/:id	Soft Delete Supplier
GET	/api/suppliers/export	Export Suppliers to Excel
Inventory
Method	Endpoint	Description
GET	/api/inventory	Get Inventory
GET	/api/inventory/:id	Get Inventory By ID
PUT	/api/inventory/:id	Update Inventory
DELETE	/api/inventory/:id	Soft Delete Inventory
PUT	/api/inventory/:id/adjust	Adjust Stock
GET	/api/inventory/low-stock	Get Low Stock Items
Purchase
Method	Endpoint	Description
POST	/api/purchases	Create Purchase
GET	/api/purchases	Get Purchases
GET	/api/purchases/:id	Get Purchase
PUT	/api/purchases/:id	Update Purchase
DELETE	/api/purchases/:id	Soft Delete Purchase
GET	/api/purchases/:id/pdf	Download Purchase PDF
Settings
Method	Endpoint	Description
POST	/api/settings	Create Settings
GET	/api/settings	Get Settings
PUT	/api/settings	Update Settings
POST	/api/settings/logo	Upload Company Logo
🔔 Real-Time Socket Events
Client → Server
join

Used to join a user-specific Socket.IO room.

Server → Client

Notification events can be added as business modules require them.

Example:

purchase.created
stock.low
sale.created
🛡️ Security

The backend currently includes:

JWT Authentication
Role-Based Authorization
Password Hashing with bcrypt
Secure Password Reset Tokens
SHA-256 Token Hashing
Token Expiration
User Enumeration Protection
Zod Request Validation
CORS Configuration
Helmet Security Headers
Global Rate Limiting
Login Rate Limiting
Soft Delete
❗ Error Handling
Global Error Middleware
Custom Error Classes
Standard API Error Response
Async Handler
Validation Error Handling
MongoDB/Mongoose Error Handling

Example:

{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email address"
    }
  ]
}
🏗️ Architecture
HTTP Request
      │
      ▼
Routes
      │
      ▼
Rate Limiting
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
Mapper / DTO
      │
      ▼
Response Helper
      │
      ▼
HTTP Response
🔄 Purchase Business Flow
Create Purchase
       │
       ▼
Validate Request
       │
       ▼
Validate Supplier
       │
       ▼
Validate Products
       │
       ▼
Calculate Purchase Amount
       │
       ▼
Calculate GST
       │
       ▼
Create Purchase
       │
       ▼
Update Inventory
       │
       ▼
Generate Notification
       │
       ▼
Return Response
📊 Dashboard

The backend architecture supports dashboard APIs for:

Inventory Summary
Low Stock
Purchase Summary
Sales Summary
Financial Summary

The financial dashboard is designed around the Indian financial year:

April 1 → March 31
📦 Available Scripts
Command	Description
npm run dev	Development Server
npm run build	Build Application
npm start	Production Server
👨‍💻 Development Guidelines
Follow the existing modular architecture.
Keep business logic inside services.
Keep controllers thin.
Use DTOs for request and response models.
Validate requests using Zod.
Return responses using the standard response helper.
Handle exceptions using custom error classes.
Use Async Handler for all controllers.
Follow soft delete instead of permanent delete.
Use Mongoose Populate for referenced documents.
Reuse shared services wherever possible.
Keep reusable infrastructure inside shared.
Do not trust calculated financial values from the client.
Perform important business calculations on the backend.
Use database transactions for operations that modify multiple related collections.
Keep authentication and authorization separate.
Use environment variables for secrets and configuration.
Avoid duplicating business logic across modules.
Keep APIs backward-compatible when possible.
Add validation before database operations.
Use appropriate indexes for frequently queried fields.
```
