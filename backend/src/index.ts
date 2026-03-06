import express, { Application, Request, Response } from "express";
import cors from "cors";
import path from "path";
import cookieParser from "cookie-parser";
import { connectDB } from "./database/mongodb";
import authRoutes from "./routes/auth.route";
import userRoutes from "./routes/user.route";
import adminUserRoutes from "./routes/admin.user.routes";
import { PORT } from "./config";

import bookRoutes from "./routes/book.route";
import adminBookRoutes from "./routes/admin.book.routes";
import orderRoutes from "./routes/order.route";
import adminOrderRoutes from "./routes/admin.order.routes";
import adminDashboardRoutes from "./routes/admin.dashboard.routes";

import adminSeedRoutes from "./routes/admin.seed.routes";

import adminSettingsRoutes from "./routes/admin.settings.routes";
import adminReportsRoutes from "./routes/admin.reports.routes"; 

import paymentRoutes from "./routes/payment.route";


const app: Application = express();

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3005"],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

// Serve uploaded images
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ✅ ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin/users", adminUserRoutes);

app.use("/api/books", bookRoutes);
app.use("/api/admin/books", adminBookRoutes);

app.use("/api/orders", orderRoutes);
app.use("/api/admin/orders", adminOrderRoutes);

app.use("/api/admin/dashboard", adminDashboardRoutes);

app.use("/api/admin/seed", adminSeedRoutes);
app.use("/api/admin/settings", adminSettingsRoutes);

app.use("/api/admin/reports", adminReportsRoutes);
app.use("/api/payments", paymentRoutes);

app.get("/", (_: Request, res: Response) => {
  res.json({ success: true, message: "Welcome to the API" });
});

async function startServer() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
}

// startServer();

if (process.env.NODE_ENV !== "test") {
  startServer();
}

export default app;