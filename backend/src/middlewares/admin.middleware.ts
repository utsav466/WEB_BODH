
// import { Request, Response, NextFunction } from "express";
// import jwt from "jsonwebtoken";
// import { JWT_SECRET } from "../config";

// interface AdminAuthRequest extends Request {
//   user?: {
//     id: string;
//     role: string;
//   };
// }

// export function requireAdmin(
//   req: AdminAuthRequest,
//   res: Response,
//   next: NextFunction
// ) {
//   const header = req.headers.authorization;

//   if (!header || !header.startsWith("Bearer ")) {
//     return res.status(401).json({
//       success: false,
//       message: "Missing or invalid token",
//     });
//   }

//   const token = header.split(" ")[1];

//   try {
//     const decoded = jwt.verify(token, JWT_SECRET) as {
//       id?: string;
//       userId?: string;
//       role?: string;
//     };

//     if (!decoded || decoded.role !== "admin") {
//       return res.status(403).json({
//         success: false,
//         message: "Admin access only",
//       });
//     }

//     req.user = {
//       id: decoded.id || decoded.userId!,
//       role: decoded.role,
//     };

//     next();
//   } catch {
//     return res.status(401).json({
//       success: false,
//       message: "Invalid or expired token",
//     });
//   }
// }


import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middlewares";
// import { AuthRequest } from "./auth.middleware";

export function requireAdmin(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  if (req.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access only",
    });
  }

  next();
}
