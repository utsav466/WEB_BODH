import mongoose from "mongoose";
import { BookModel } from "../models/book.model";
import { OrderRepository } from "../repositories/order.repository";
import { CreateOrderDTO, UpdateOrderStatusDTO } from "../dtos/order.dto";

export class OrderService {
  constructor(private repo = new OrderRepository()) {}

  async createOrder(userId: string, dto: CreateOrderDTO) {
    if (!dto.items?.length) throw new Error("No items provided");
    if (!dto.address?.trim()) throw new Error("Address is required");

    // Fetch books and compute prices
    const bookIds = dto.items.map((i) => new mongoose.Types.ObjectId(i.bookId));
    const books = await BookModel.find({ _id: { $in: bookIds }, status: "active" });

    if (books.length !== dto.items.length) {
      throw new Error("One or more books not found");
    }

    // Build items
    const items = dto.items.map((i) => {
      const book = books.find((b) => String(b._id) === String(i.bookId));
      if (!book) throw new Error("Book missing");
      if (book.stock < i.qty) throw new Error(`Not enough stock for ${book.title}`);
      return {
        bookId: book._id,
        title: book.title,
        qty: i.qty,
        price: book.price,
      };
    });

    const subtotal = items.reduce((sum, it) => sum + it.qty * it.price, 0);
    const shipping = subtotal > 40 ? 0 : 3.99;
    const total = subtotal + shipping;

    // Reduce stock (simple approach)
    for (const it of items) {
      await BookModel.updateOne({ _id: it.bookId }, { $inc: { stock: -it.qty } });
    }

    return this.repo.create({
      userId: new mongoose.Types.ObjectId(userId),
      items,
      subtotal,
      shipping,
      total,
      status: "Pending",
      address: dto.address,
      phone: dto.phone || "",
      paymentMethod: dto.paymentMethod || "COD",
      paid: false,
      txnId: "",
    } as any);
  }

  async listAdmin(params: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, Number(params.page || 1));
    const limit = Math.min(50, Math.max(1, Number(params.limit || 10)));
    const skip = (page - 1) * limit;

    const q: any = {};
    if (params.status) q.status = params.status;

    if (params.search?.trim()) {
      const s = params.search.trim();
      // Search by id OR item title (basic)
      q.$or = [
        { _id: { $regex: s, $options: "i" } },
        { "items.title": { $regex: s, $options: "i" } },
      ];
    }

    const { items, total } = await this.repo.list(q, skip, limit, { createdAt: -1 });

    return { items, page, limit, total, totalPages: Math.ceil(total / limit) };
  }

  async getAdminOrder(id: string) {
    return this.repo.findById(id);
  }

  async updateStatusAdmin(id: string, dto: UpdateOrderStatusDTO) {
    return this.repo.updateById(id, dto as any);
  }

  async listMyOrders(userId: string, page = 1, limit = 10) {
    const p = Math.max(1, Number(page));
    const l = Math.min(50, Math.max(1, Number(limit)));
    const skip = (p - 1) * l;

    const { items, total } = await this.repo.list({ userId }, skip, l, { createdAt: -1 });
    return { items, page: p, limit: l, total, totalPages: Math.ceil(total / l) };
  }

  async getMyOrder(userId: string, id: string) {
    return this.repo.findByIdForUser(id, userId);
  }
}