import express, { Application, Request, Response } from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import cors from "cors";
import path from "path";
import fs from "fs";

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

// Middleware Imports
import errorHandler from "./middlewares/globalErrorHandler";
import { notFound } from "./middlewares/notFound";

const app: Application = express();


// --- 1. Global Middlewares ---
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      
    ],
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// --- 2. Static Folder Setup (FIXED FOR VERCEL) ---

// use /tmp for vercel, local uploads for dev
const uploadDir =
  process.env.VERCEL === "1"
    ? path.join("/tmp", "uploads")
    : path.join(process.cwd(), "uploads");

// ensure folder exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

app.use("/uploads", express.static(uploadDir));


// --- 3. Better Auth Handler ---
app.all("/api/auth/*splat", toNodeHandler(auth));


// --- 4. API Routes ---

if (authRouter) app.use("/api/auth", authRouter);
if (adminUserRouter) app.use("/api/admin/users", adminUserRouter);

app.use("/api/admin", AdminRoutes);

app.use("/api/providers", ProviderRoutes);
app.use("/api/meals", MealRoutes);
app.use("/api/orders", OrderRoutes);
app.use("/api/provider", ProviderManagementRoutes);
app.use("/api/categories", CategoryRoutes);
app.use("/api/reviews", ReviewRoutes);


// --- 5. Root Route ---
app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to Food Hub API! 🍲");
});


// --- 6. Error Handling ---
app.use(notFound);
app.use(errorHandler);


export default app;