import { Request, Response } from "express";
import crypto from "crypto";
import mongoose from "mongoose";
import { AuthRequest } from "../middlewares/auth.middlewares";
import { OrderModel } from "../models/order.model";

const FRONTEND_BASE = process.env.FRONTEND_URL || "http://localhost:3000";
const BACKEND_BASE = process.env.BACKEND_URL || "http://localhost:5050";

const ESEWA_URL = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";

const PRODUCT_CODE = process.env.ESEWA_PRODUCT_CODE || "EPAYTEST";
const SECRET_KEY = process.env.ESEWA_SECRET_KEY || "8gBm/:&EnhH.1/q";

function sign(secret: string, message: string) {
  return crypto.createHmac("sha256", secret).update(message).digest("base64");
}

function num(v: any) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/* ===================================================== */
/* INIT PAYMENT */
/* POST /api/payments/esewa/init */
/* ===================================================== */

export async function esewaInitDemo(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Login required" });
    }

    const { orderId } = req.body;

    if (!mongoose.isValidObjectId(orderId)) {
      return res.status(400).json({ success: false, message: "Invalid orderId" });
    }

    const order = await OrderModel.findOne({ _id: orderId, userId });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.paymentMethod !== "ESEWA") {
      return res.status(400).json({ success: false, message: "Order not ESEWA payment" });
    }

    order.paymentStatus = "Pending";
    await order.save();

    const total = num(order.totalAmount);
    const transaction_uuid = String(order._id);

    const success_url = `${BACKEND_BASE}/api/payments/esewa/success?oid=${transaction_uuid}`;
    const failure_url = `${BACKEND_BASE}/api/payments/esewa/failure?oid=${transaction_uuid}`;

    const signed_field_names = "total_amount,transaction_uuid,product_code";

    const message = `total_amount=${total},transaction_uuid=${transaction_uuid},product_code=${PRODUCT_CODE}`;

    const signature = sign(SECRET_KEY, message);

    const payload = {
      amount: total,
      tax_amount: 0,
      total_amount: total,
      transaction_uuid,
      product_code: PRODUCT_CODE,
      product_service_charge: 0,
      product_delivery_charge: 0,
      success_url,
      failure_url,
      signed_field_names,
      signature,
    };

    return res.json({
      success: true,
      paymentUrl: ESEWA_URL,
      payload,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err?.message || "Server error",
    });
  }
}

/* ===================================================== */
/* SUCCESS CALLBACK */
/* GET /api/payments/esewa/success */
/* ===================================================== */

export async function esewaSuccessDemo(req: Request, res: Response) {
  try {
    console.log("ESEWA SUCCESS QUERY:", req.query);

    let oidRaw = String(req.query.oid || "").trim();

    /* FIX: oid sometimes comes like
       69aa24906cd5cce51e770c53?data=xxxx
    */

    if (oidRaw.includes("?")) {
      oidRaw = oidRaw.split("?")[0];
    }

    let dataParam = typeof req.query.data === "string" ? req.query.data : "";

    if (!dataParam && String(req.query.oid || "").includes("data=")) {
      const after = String(req.query.oid).split("data=")[1];
      dataParam = after || "";
    }

    const orderId = oidRaw;

    console.log("FINAL ORDER ID:", orderId);

    if (!mongoose.isValidObjectId(orderId)) {
      return res.redirect(`${FRONTEND_BASE}/user/payment/failed?reason=invalid_order`);
    }

    const order = await OrderModel.findById(orderId);

    if (!order) {
      return res.redirect(`${FRONTEND_BASE}/user/payment/failed?reason=not_found`);
    }

    let decoded: any = null;

    if (dataParam) {
      try {
        const decodedStr = Buffer.from(dataParam, "base64").toString("utf-8");
        decoded = JSON.parse(decodedStr);
      } catch {
        decoded = null;
      }
    }

    const paidAmount =
      Number(decoded?.total_amount) ||
      Number(decoded?.amount) ||
      Number(order.totalAmount);

    const orderAmount = Number(order.totalAmount);

    if (Math.round(orderAmount) !== Math.round(paidAmount)) {
      order.paymentStatus = "Failed";
      await order.save();

      return res.redirect(`${FRONTEND_BASE}/user/payment/failed?reason=amount_mismatch`);
    }

    const refId = String(decoded?.transaction_code || "ESEWA_DEMO");

    order.paymentStatus = "Paid";
    order.paymentRef = refId;

    if (order.status === "Pending") {
      order.status = "Processing";
    }

    await order.save();

    return res.redirect(`${FRONTEND_BASE}/user/payment/success?orderId=${order._id}`);
  } catch (err) {
    console.log("ESEWA SUCCESS ERROR:", err);

    return res.redirect(`${FRONTEND_BASE}/user/payment/failed?reason=server_error`);
  }
}

/* ===================================================== */
/* FAILURE CALLBACK */
/* GET /api/payments/esewa/failure */
/* ===================================================== */

export async function esewaFailureDemo(req: Request, res: Response) {
  try {
    const oidRaw = String(req.query.oid || "");

    const orderId = oidRaw.includes("?") ? oidRaw.split("?")[0] : oidRaw;

    if (mongoose.isValidObjectId(orderId)) {
      const order = await OrderModel.findById(orderId);

      if (order) {
        order.paymentStatus = "Failed";
        await order.save();
      }
    }

    return res.redirect(`${FRONTEND_BASE}/user/payment/failed?reason=cancelled`);
  } catch (err) {
    console.log("ESEWA FAILURE ERROR:", err);

    return res.redirect(`${FRONTEND_BASE}/user/payment/failed?reason=server_error`);
  }
}