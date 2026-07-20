import express from "express";
import { successResponse } from "./shared/response/response.helper";
import { errorMiddleware } from "./middleware/error.middleware";
import { NotFoundError } from "./shared/errors/not-found.error";
import userRoutes from "./modules/users/routes/user.routes";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import cors from "cors";
import authRoutes from "./modules/auth/routes/auth.routes";
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

// Error Middleware (Always Last)
app.use(errorMiddleware);

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

export default app;
