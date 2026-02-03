// import { Request, Response, NextFunction } from "express";
// import jwt from "jsonwebtoken";
// import { JWT_SECRET } from "../config";

// export type AuthRequest = Request & {
//   userId?: string;
//   role?: string;
// };

// export function requireAuth(
//   req: AuthRequest,
//   res: Response,
//   next: NextFunction
// ) {
//   const header = req.headers.authorization;

//   if (!header?.startsWith("Bearer ")) {
//     return res.status(401).json({
//       success: false,
//       message: "Missing token",
//     });
//   }

//   const token = header.substring("Bearer ".length);

//   try {
//     const decoded = jwt.verify(token, JWT_SECRET) as {
//       userId?: string;
//       id?: string;
//       _id?: string;
//       role?: string;
//     };

//     const userId = decoded.userId || decoded.id || decoded._id;

//     if (!userId) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid token payload",
//       });
//     }

//     req.userId = userId;
//     req.role = decoded.role; 

//     next();
//   } catch {
//     return res.status(401).json({
//       success: false,
//       message: "Invalid/expired token",
//     });
//   }
// }


// import { Request, Response, NextFunction } from "express";
// import jwt from "jsonwebtoken";
// import { JWT_SECRET } from "../config";

// export type AuthRequest = Request & {
//   userId?: string;
//   role?: string;
// };

// export function requireAuth(
//   req: AuthRequest,
//   res: Response,
//   next: NextFunction
// ) {
//   // ✅ CHANGE 1: Read token from cookie OR header
//   const token =
//     req.cookies?.auth_token ||
//     req.headers.authorization?.replace("Bearer ", "");

//   if (!token) {
//     return res.status(401).json({
//       success: false,
//       message: "Missing token",
//     });
//   }

//   try {
//     const decoded = jwt.verify(token, JWT_SECRET) as {
//       userId?: string;
//       id?: string;
//       _id?: string;
//       role?: string;
//     };

//     const userId = decoded.userId || decoded.id || decoded._id;

//     if (!userId) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid token payload",
//       });
//     }

//     // ✅ SAME AS BEFORE
//     req.userId = userId;
//     req.role = decoded.role;

//     next();
//   } catch {
//     return res.status(401).json({
//       success: false,
//       message: "Invalid/expired token",
//     });
//   }
// }

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
  // ✅ 1. Read token from COOKIE first
  const token =
    req.cookies?.auth_token ||
    req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id?: string;
      userId?: string;
      role?: string;
    };

    const userId = decoded.id || decoded.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload",
      });
    }

    req.userId = userId;
    req.role = decoded.role;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
}
