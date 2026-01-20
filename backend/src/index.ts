import express, { Application, Request, Response } from "express";
import cors from "cors";
import { connectDB } from "./database/mongodb";
import authRoutes from "./routes/auth.route";
import { PORT } from "./config";


const app: Application = express()

let corsOptions ={
  origin: ["https://localhost:3000", "http://localhost:3005"],
    //which domain can access your backend server
    //add frontend domain in origin
}
//origin: "*" allow all domain to access your backend server
app.use(cors(corsOptions)); // implement cors middleware

// const PORT:number=3000

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.get("/", (req: Request, res: Response) => {
  return res.status(200).json({ success: true, message: "Welcome to the API" });
});

// Start server
async function startServer() {
  console.log("Starting backend...");
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
}

startServer();
