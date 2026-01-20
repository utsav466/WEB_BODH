import dotenv from "dotenv";
dotenv.config();

export const PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 3000;

export const MONGODB_URI: string =
  process.env.MONGODB_URI || "mongodb+srv://utsavthapa901_db_user:UTSAV123@cluster0.vipkhri.mongodb.net/bodh_auth?retryWrites=true&w=majority";

export const JWT_SECRET: string =
  process.env.JWT_SECRET || "super_secret_change_me";
