import express from "express";
import { errorMiddleware } from "./middleware/error.middleware";
import userRoutes from "./modules/users/routes/user.routes";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import cors from "cors";
import authRoutes from "./modules/auth/routes/auth.routes";
import departmentRotes from "./modules/departments/routes/department.routes";
import productRoutes from "./modules/products/routes/product.routes";
import inventoryRoute from "./modules/inventory/routes/inventory.route";
import supplierRoute from "./modules/supplier/routes/supplier.route";
import settingRoute from "./modules/settings/routes/setting.route";
import purchaseRoutes from "./modules/purchase/routes/purchase.route";
import path from "path";
const app = express();
//CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);
// Middleware
app.use(express.json());

// Swagger
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/departments", departmentRotes);
app.use("/api/products", productRoutes);
app.use("/api/inventory", inventoryRoute);
app.use("/api/suppliers", supplierRoute);
app.use("/api/settings", settingRoute);
app.use("/api/purchases", purchaseRoutes);
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
// Error Middleware (Always Last)
app.use(errorMiddleware);

export default app;

// Default Route
// app.get("/", (req, res) => {
//   res.send("Welcome to HandleFlow ERP API 🚀");
// });
// app.get("/api/error", () => {
//   throw new NotFoundError("Product not found.");
//   // throw new Error("Testing Error Middleware");
// });
// app.get("/api/health", (req, res) => {
//   return res.status(200).json(
//     successResponse(
//       {
//         version: "1.0.0",
//         environment: "development",
//       },
//       "HandleFlow ERP API is running.",
//     ),
//   );
// });
