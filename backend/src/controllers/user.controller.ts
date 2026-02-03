import { Response } from "express";
import { UserModel } from "../models/user.model";
import { AuthRequest } from "../middlewares/auth.middlewares";

export class UserController {

  // ✅ UPDATE profile (fullName + optional avatar)
  async updateMe(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const updateData: any = {
        fullName: req.body.fullName,
      };

      if (req.file) {
        updateData.avatarUrl = `/uploads/avatars/${req.file.filename}`;
      }

      const user = await UserModel.findByIdAndUpdate(
        req.userId,
        updateData,
        { new: true }
      ).select("-password");

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
