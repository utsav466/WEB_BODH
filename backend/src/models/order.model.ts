import mongoose, { Schema, InferSchemaType } from "mongoose";

export type OrderStatus =
  | "Pending"
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

export type PaymentMethod = "COD" | "ESEWA";
export type PaymentStatus = "Unpaid" | "Pending" | "Paid" | "Failed";

const OrderItemSchema = new Schema(
  {
    bookId: { type: Schema.Types.ObjectId, ref: "Book", required: false },
    title: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    qty: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const OrderSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    customerName: { type: String, required: true, trim: true },
    customerEmail: { type: String, default: "", trim: true },

    items: { type: [OrderItemSchema], required: true, default: [] },

    shippingAmount: { type: Number, required: true, default: 0, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },

    status: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
      required: true,
    },

    paymentMethod: {
      type: String,
      enum: ["COD", "ESEWA"],
      default: "COD",
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["Unpaid", "Pending", "Paid", "Failed"],
      default: "Unpaid",
      required: true,
    },

    paymentRef: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export type OrderDocument = InferSchemaType<typeof OrderSchema>;

// ✅ compatibility fix for old files importing IOrder
export type IOrder = OrderDocument;

export const OrderModel =
  mongoose.models.Order || mongoose.model("Order", OrderSchema);