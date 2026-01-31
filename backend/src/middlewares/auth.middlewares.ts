import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";

export type AuthRequest = Request & {
  userId?: string;
  role?: string;
};

export function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Missing token",
    });
  }

  const token = header.substring("Bearer ".length);

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId?: string;
      id?: string;
      _id?: string;
      role?: string;
    };

    const userId = decoded.userId || decoded.id || decoded._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload",
      });
    }

    req.userId = userId;
    req.role = decoded.role; 

    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid/expired token",
    });
  }
}
