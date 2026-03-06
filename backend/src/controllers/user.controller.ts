import { Response } from "express";
import { UserModel } from "../models/user.model";
import { AuthRequest } from "../middlewares/auth.middlewares";

const ALLOWED_CURRENCY = ["USD", "NPR", "INR"] as const;

export class UserController {
  
  async updateMe(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const updateData: any = {};

      if (typeof req.body.fullName === "string") {
        const fullName = req.body.fullName.trim();
        if (!fullName) {
          return res.status(400).json({ success: false, message: "fullName cannot be empty" });
        }
        updateData.fullName = fullName;
      }

      if (typeof req.body.email === "string") {
        const email = req.body.email.trim().toLowerCase();
        if (!/\S+@\S+\.\S+/.test(email)) {
          return res.status(400).json({ success: false, message: "Invalid email format" });
        }

   
        const exists = await UserModel.findOne({
          email,
          _id: { $ne: req.userId },
        });

        if (exists) {
          return res.status(409).json({ success: false, message: "Email already in use" });
        }

        updateData.email = email;
      }

      // preferredCurrency
      if (typeof req.body.preferredCurrency === "string") {
        const cur = req.body.preferredCurrency.trim().toUpperCase();
        if (!ALLOWED_CURRENCY.includes(cur as any)) {
          return res.status(400).json({
            success: false,
            message: "Invalid preferredCurrency",
            allowed: ALLOWED_CURRENCY,
          });
        }
        updateData.preferredCurrency = cur;
      }


      if (req.file) {
        updateData.avatarUrl = `/uploads/avatars/${req.file.filename}`;
      }

      // nothing to update?
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          message: "No valid fields provided to update",
        });
      }

      const user = await UserModel.findByIdAndUpdate(req.userId, updateData, {
        new: true,
      }).select("-password");

      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      return res.status(200).json({
        success: true,
        message: "Profile updated",
        data: user,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error?.message || "Internal Server Error",
      });
    }
  }

  // ✅ avatar-only (unchanged)
  async updateMyAvatar(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "avatar file is required",
        });
      }

      const avatarUrl = `/uploads/avatars/${req.file.filename}`;

      const user = await UserModel.findByIdAndUpdate(
        req.userId,
        { avatarUrl },
        { new: true }
      ).select("-password");

      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      return res.status(200).json({
        success: true,
        message: "Avatar updated",
        data: user,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error?.message || "Internal Server Error",
      });
    }
  }

  // ✅ current user
  async me(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const user = await UserModel.findById(req.userId).select("-password");
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      return res.status(200).json({ success: true, data: user });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error?.message || "Internal Server Error",
      });
    }
  }
}