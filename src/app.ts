import express, { Application, Request, Response } from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import cors from "cors";

// Router Imports
import authRouter from "./modules/auth/auth.router";
import adminUserRouter from "./modules/users/users.router";
import { MealRoutes } from "./modules/meals/meal.router";
import { ProviderRoutes } from "./modules/providers/providers.router";
import { OrderRoutes } from "./modules/orders/orders.router";
import { ProviderRoutes as ProviderManagementRoutes } from "./modules/provider-management/provider.router";
import { CategoryRoutes } from "./modules/categories/category.router";
import { AdminRoutes } from "./modules/admin/admin.router";
import { ReviewRoutes } from "./modules/review/review.router";
import { uploadDir } from "./config/uploadDir";

// Middleware Imports
import errorHandler from "./middlewares/globalErrorHandler";
import { notFound } from "./middlewares/notFound";

const app: Application = express();

// --- 1. Global Middlewares ---
app.use(
  cors({
    origin: ["https://foodhub-frontend-theta.vercel.app"],
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Static files
app.use("/uploads", express.static(uploadDir));

// --- 2. API Routes ---
app.use("/api/auth", toNodeHandler(auth as any));

if (authRouter) app.use("/api/auth", authRouter);
if (adminUserRouter) app.use("/api/admin/users", adminUserRouter);

app.use("/api/admin", AdminRoutes);
app.use("/api/providers", ProviderRoutes);
app.use("/api/meals", MealRoutes);
app.use("/api/orders", OrderRoutes);
app.use("/api/provider", ProviderManagementRoutes);
app.use("/api/categories", CategoryRoutes);
app.use("/api/reviews", ReviewRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to Food Hub API! 🍲");
});

app.use(notFound);

app.use((err: any, req: Request, res: Response, next: any) => {
  console.log("*****************************************");
  console.error("🔥 INTERNAL SERVER ERROR DETECTED:");
  console.error(err); 
  console.log("*****************************************");

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Something went wrong on the server",

    stack: process.env.NODE_ENV === "development" ? err.stack : undefined, 
  });
});

app.use(errorHandler);

export default app;