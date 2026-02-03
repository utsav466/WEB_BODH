// import express, { Application, Request, Response } from "express";
// import cors from "cors";
// import path from "path";
// import { connectDB } from "./database/mongodb";
// import authRoutes from "./routes/auth.route";
// import userRoutes from "./routes/user.route";
// import adminUserRoutes from "./routes/admin.user.routes";
// import { PORT } from "./config";

// const app: Application = express();

// const corsOptions = {
//   origin: ["http://localhost:3000", "http://localhost:3005"],
// };

// // ✅ middleware first
// app.use(cors(corsOptions));
// app.use(express.json());

// // ✅ static uploads
// app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// // ✅ routes
// app.use("/api/auth", authRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/admin/users", adminUserRoutes);

// app.get("/", (req: Request, res: Response) => {
//   res.status(200).json({ success: true, message: "Welcome to the API" });
// });

// async function startServer() {
//   console.log("Starting backend...");
//   await connectDB();

//   app.listen(PORT, () => {
//     console.log(`🚀 Server running at http://localhost:${PORT}`);
//   });
// }

// startServer();


// src/index.ts
import express, { Application, Request, Response } from "express";
import cors from "cors";
import path from "path";
import cookieParser from "cookie-parser"; 
import { connectDB } from "./database/mongodb";
import authRoutes from "./routes/auth.route";
import userRoutes from "./routes/user.route";
import adminUserRoutes from "./routes/admin.user.routes";
import { PORT } from "./config";

const app: Application = express();

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3005"],
    credentials: true,
  })
);

// ✅ REQUIRED for auth cookie
app.use(cookieParser());

app.use(express.json());

// serve uploaded images
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin/users", adminUserRoutes);

app.get("/", (_: Request, res: Response) => {
  res.json({ success: true, message: "Welcome to the API" });
});

async function startServer() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
}

startServer();
