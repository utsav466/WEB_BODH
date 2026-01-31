import { Request, Response } from "express";
import { UserRepository } from "../repositories/user.repository";
import bcryptjs from "bcryptjs";

const repo = new UserRepository();

export class AdminUserController {
  async createUser(req: Request, res: Response) {
    const data = req.body;

    if (req.file) {
      data.avatarUrl = `/uploads/${req.file.filename}`;
    }

    data.password = await bcryptjs.hash(data.password, 10);

    const user = await repo.createUser(data);

    res.json({ success: true, data: user });
  }

  async getAllUsers(_: Request, res: Response) {
    const users = await repo.getAllUsers();
    res.json({ success: true, data: users });
  }

  async getUserById(req: Request, res: Response) {
    const user = await repo.getUserById(req.params.id);
    res.json({ success: true, data: user });
  }

  async updateUser(req: Request, res: Response) {
    const data = req.body;

    if (req.file) {
      data.avatarUrl = `/uploads/${req.file.filename}`;
    }

    const user = await repo.updateUser(req.params.id, data);
    res.json({ success: true, data: user });
  }

  async deleteUser(req: Request, res: Response) {
    await repo.deleteUser(req.params.id);
    res.json({ success: true });
  }
}
