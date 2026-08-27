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
import dashBoardRoutes from "./modules/dashboard/routes/dashboard.routes";
import path from "path";
import helmet from "helmet";
import { apiRateLimiter } from "./middleware/rate-limit.middleware";

const app = express();
app.use(helmet());
//CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);
//Rate limiter
app.use(apiRateLimiter);
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
app.use("/api/dashboard", dashBoardRoutes);
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
// Error Middleware (Always Last)
app.use(errorMiddleware);

export default app;
