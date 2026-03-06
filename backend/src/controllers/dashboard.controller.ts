import { Request, Response } from "express";
import { UserModel } from "../models/user.model";
import { BookModel } from "../models/book.model";
import { OrderModel } from "../models/order.model";

export async function adminDashboardStats(_: Request, res: Response) {
  try {
    const [
      totalUsers,
      totalBooks,
      totalOrders,
      revenueAgg,
      recentOrders,
      lowStockBooks,
    ] = await Promise.all([
      UserModel.countDocuments(),
      BookModel.countDocuments(),
      OrderModel.countDocuments(),

      // ✅ FIX: your model uses totalAmount (not total)
      OrderModel.aggregate([
        { $match: { status: { $ne: "Cancelled" } } },
        { $group: { _id: null, revenue: { $sum: "$totalAmount" } } },
      ]),

      OrderModel.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("_id status totalAmount createdAt customerName customerEmail"),

      BookModel.find({ stock: { $lte: 5 } })
        .sort({ stock: 1 })
        .limit(5)
        .select("_id title stock price"),
    ]);

    const totalRevenue = revenueAgg?.[0]?.revenue ?? 0;

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalBooks,
        totalOrders,
        totalRevenue,
        recentOrders,
        lowStockBooks,
      },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err?.message || "Failed to load dashboard stats",
    });
  }
}