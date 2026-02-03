// src/controllers/admin.user.controller.ts

import { Request, Response } from "express";
import { UserRepository } from "../repositories/user.repository";
import bcryptjs from "bcryptjs";
import mongoose from "mongoose"; // ✅ ADD THIS

const repo = new UserRepository();

export class AdminUserController {
  async createUser(req: Request, res: Response) {
    try {
      const data = req.body;

      if (req.file) {
        data.avatarUrl = `/uploads/${req.file.filename}`;
      }

      if (data.password) {
        data.password = await bcryptjs.hash(data.password, 10);
      }

      const user = await repo.createUser(data);

      return res.status(201).json({
        success: true,
        data: user,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to create user",
      });
    }
  }

  async getAllUsers(_: Request, res: Response) {
    const users = await repo.getAllUsers();
    return res.json({ success: true, data: users });
  }

  async getUserById(req: Request, res: Response) {
    const { id } = req.params;

    // ✅ ADD THIS BLOCK
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const user = await repo.getUserById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({ success: true, data: user });
  }

  async updateUser(req: Request, res: Response) {
    const { id } = req.params;
    const data = req.body;

    // ✅ ADD THIS BLOCK
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    if (req.file) {
      data.avatarUrl = `/uploads/${req.file.filename}`;
    }

    const user = await repo.updateUser(id, data);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({ success: true, data: user });
  }

  async deleteUser(req: Request, res: Response) {
    const { id } = req.params;

    // ✅ ADD THIS BLOCK
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const deleted = await repo.deleteUser(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({ success: true });
  }
}
