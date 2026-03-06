import { PaymentMethod } from "../models/order.model";

export type CreateOrderDTO = {
  items: { bookId: string; qty: number }[];
  address: string;
  phone?: string;
  paymentMethod?: PaymentMethod;
};

export type UpdateOrderStatusDTO = {
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  paid?: boolean;
  txnId?: string;
};