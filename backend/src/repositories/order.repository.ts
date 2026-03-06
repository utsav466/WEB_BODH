import { IOrder, OrderModel } from "../models/order.model";

export class OrderRepository {
  async create(data: Partial<IOrder>) {
    return OrderModel.create(data);
  }

  async findById(id: string) {
    return OrderModel.findById(id);
  }

  async findByIdForUser(id: string, userId: string) {
    return OrderModel.findOne({ _id: id, userId });
  }

  async updateById(id: string, data: Partial<IOrder>) {
    return OrderModel.findByIdAndUpdate(id, data, { new: true });
  }

  async list(query: any, skip: number, limit: number, sort: any) {
    const [items, total] = await Promise.all([
      OrderModel.find(query).sort(sort).skip(skip).limit(limit),
      OrderModel.countDocuments(query),
    ]);
    return { items, total };
  }
}