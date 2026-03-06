import { Request, Response } from "express";
import mongoose from "mongoose";
import { AuthRequest } from "../middlewares/auth.middlewares";
import { OrderModel, OrderStatus } from "../models/order.model";

const ADMIN_STATUSES: OrderStatus[] = [
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

// =========================
// USER: CREATE ORDER
// POST /api/orders
// body: { customerName, customerEmail, items, paymentMethod, shippingAmount }
// =========================
export async function createOrder(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const { customerName, customerEmail, items, paymentMethod, shippingAmount } = req.body;

    const pm: "COD" | "ESEWA" = paymentMethod === "ESEWA" ? "ESEWA" : "COD";
    const ship = Math.max(0, Number(shippingAmount ?? 0));

    if (!customerName?.trim()) {
      return res.status(400).json({ success: false, message: "customerName is required" });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "items is required" });
    }

    const normalizedItems = items.map((it: any) => ({
      bookId: it.bookId ? new mongoose.Types.ObjectId(it.bookId) : undefined,
      title: String(it.title ?? "").trim(),
      price: Number(it.price ?? 0),
      qty: Number(it.qty ?? 1),
    }));

    if (
      normalizedItems.some(
        (it) =>
          !it.title ||
          !Number.isFinite(it.price) ||
          it.price < 0 ||
          !Number.isFinite(it.qty) ||
          it.qty < 1
      )
    ) {
      return res.status(400).json({ success: false, message: "Invalid items format" });
    }

    const itemsTotal = normalizedItems.reduce((sum, it) => sum + it.price * it.qty, 0);
    const totalAmount = itemsTotal + ship;

    const order = await OrderModel.create({
      userId: new mongoose.Types.ObjectId(userId),
      customerName: customerName.trim(),
      customerEmail: customerEmail?.trim() ?? "",
      items: normalizedItems,
      shippingAmount: ship,
      totalAmount,
      status: "Pending",
      paymentMethod: pm,
      paymentStatus: pm === "COD" ? "Unpaid" : "Pending",
      paymentRef: "",
    });

    return res.status(201).json({ success: true, message: "Order created", data: order });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || "Internal Server Error" });
  }
}

// =========================
// USER: MY ORDERS
// GET /api/orders/me
// =========================
export async function myOrders(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ success: false, message: "Authentication required" });

    const orders = await OrderModel.find({ userId }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: orders });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || "Internal Server Error" });
  }
}

// =========================
// USER: ORDER DETAIL (only own)
// GET /api/orders/:id
// =========================
export async function myOrderDetail(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ success: false, message: "Authentication required" });

    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid order id" });
    }

    const order = await OrderModel.findOne({ _id: id, userId });
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    return res.status(200).json({ success: true, data: order });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || "Internal Server Error" });
  }
}

// =========================
// USER: CANCEL OWN ORDER (demo)
// PATCH /api/orders/:id/cancel
// =========================
export async function cancelMyOrder(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ success: false, message: "Authentication required" });

    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid order id" });
    }

    const order = await OrderModel.findOne({ _id: id, userId });
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    if (order.status === "Shipped" || order.status === "Delivered") {
      return res.status(400).json({ success: false, message: "Order cannot be cancelled now" });
    }

    if (order.status === "Cancelled") {
      return res.status(200).json({ success: true, message: "Already cancelled", data: order });
    }

    order.status = "Cancelled";
    await order.save();

    return res.status(200).json({ success: true, message: "Order cancelled", data: order });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || "Internal Server Error" });
  }
}

// =========================
// ADMIN LIST/GET/UPDATE STATUS (your existing admin routes can keep using these)
// =========================
export async function adminListOrders(req: Request, res: Response) {
  try {
    const q = String(req.query.q ?? "").trim().toLowerCase();
    const status = String(req.query.status ?? "").trim() as OrderStatus | "";
    const page = Math.max(1, Number(req.query.page ?? 1));
    const limit = Math.min(50, Math.max(1, Number(req.query.limit ?? 10)));
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (status && ADMIN_STATUSES.includes(status)) filter.status = status;

    if (q) {
      filter.$or = [
        { customerName: { $regex: q, $options: "i" } },
        { customerEmail: { $regex: q, $options: "i" } },
      ];
    }

    const [items, total] = await Promise.all([
      OrderModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      OrderModel.countDocuments(filter),
    ]);

    return res.status(200).json({ success: true, data: items, meta: { total, page, limit } });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || "Internal Server Error" });
  }
}

export async function adminGetOrder(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ success: false, message: "Invalid order id" });

    const order = await OrderModel.findById(id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    return res.status(200).json({ success: true, data: order });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || "Internal Server Error" });
  }
}

export async function adminUpdateOrderStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const status = String(req.body?.status ?? "").trim() as OrderStatus;

    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ success: false, message: "Invalid order id" });
    if (!ADMIN_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status", allowed: ADMIN_STATUSES });
    }

    const updated = await OrderModel.findByIdAndUpdate(id, { status }, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: "Order not found" });

    return res.status(200).json({ success: true, message: "Status updated", data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || "Internal Server Error" });
  }
}