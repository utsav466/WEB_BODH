import { Response } from "express";
import mongoose from "mongoose";
import { OrderModel, OrderStatus } from "../models/order.model";
import { AuthRequest } from "../middlewares/auth.middlewares";

const STATUSES: OrderStatus[] = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

const firstNames = ["Utsav", "Aarav", "Mia", "Sophia", "Emily", "Mark", "John", "Sita", "Ramesh", "Anita"];
const lastNames = ["Thapa", "Sharma", "Khan", "Wilson", "Davis", "Johnson", "Smith", "Adhikari", "Gurung", "Rai"];

const bookTitles = [
  "Atomic Habits",
  "Rich Dad Poor Dad",
  "Think Like a Monk",
  "The Silent Forest",
  "Mystery of the Lost City",
  "Dream Beyond",
  "The Alchemist",
  "Deep Work",
  "Start With Why",
  "The Psychology of Money",
];

function pick<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randPrice() {
  return Number((Math.random() * (29.99 - 7.99) + 7.99).toFixed(2));
}

function randomEmail(name: string) {
  const safe = name.toLowerCase().replace(/\s+/g, ".");
  return `${safe}${rand(10, 99)}@example.com`;
}

function randomDateWithin(daysBack: number) {
  const d = new Date();
  d.setDate(d.getDate() - rand(0, daysBack));
  d.setHours(rand(8, 21), rand(0, 59), rand(0, 59), 0);
  return d;
}

// POST /api/admin/seed/orders?count=15
export async function seedOrders(req: AuthRequest, res: Response) {
  try {
    const count = Math.min(50, Math.max(1, Number(req.query.count ?? 10)));

    // ✅ use the logged-in admin's id from token/cookie
    const userId = req.userId;
    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const docs = Array.from({ length: count }).map(() => {
      const fullName = `${pick(firstNames)} ${pick(lastNames)}`;
      const customerEmail = randomEmail(fullName);

      const itemsCount = rand(1, 4);
      const items = Array.from({ length: itemsCount }).map(() => {
        const title = pick(bookTitles);
        const price = randPrice();
        const qty = rand(1, 3);
        return { title, price, qty };
      });

      const totalAmount = Number(items.reduce((sum, it) => sum + it.price * it.qty, 0).toFixed(2));

      // make delivered more common for a nice demo
      const weightedStatus: OrderStatus =
        Math.random() < 0.35 ? "Delivered" : Math.random() < 0.15 ? "Shipped" : pick(STATUSES);

      const createdAt = randomDateWithin(30);

      return {
        userId: new mongoose.Types.ObjectId(userId),
        customerName: fullName,
        customerEmail,
        items,
        totalAmount,
        status: weightedStatus,
        createdAt,
        updatedAt: createdAt,
      };
    });

    const inserted = await OrderModel.insertMany(docs);

    return res.status(201).json({
      success: true,
      message: `Seeded ${inserted.length} orders`,
      count: inserted.length,
      data: inserted,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err?.message || "Internal Server Error",
    });
  }
}