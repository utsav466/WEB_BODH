import { BookModel, IBook } from "../models/book.model";

export class BookRepository {
  async create(data: Partial<IBook>) {
    return BookModel.create(data);
  }

  async findById(id: string) {
    return BookModel.findById(id);
  }

  async updateById(id: string, data: Partial<IBook>) {
    return BookModel.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteById(id: string) {
    return BookModel.findByIdAndDelete(id);
  }

  async list(query: any, skip: number, limit: number, sort: any) {
    const [items, total] = await Promise.all([
      BookModel.find(query).sort(sort).skip(skip).limit(limit),
      BookModel.countDocuments(query),
    ]);
    return { items, total };
  }
}