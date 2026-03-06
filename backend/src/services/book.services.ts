import { BookRepository } from "../repositories/book.repository";
import { CreateBookDTO, UpdateBookDTO } from "../dtos/book.dto";

export class BookService {
  constructor(private repo = new BookRepository()) {}

  async createBook(dto: CreateBookDTO) {
    return this.repo.create(dto as any);
  }

  async getBookById(id: string) {
    return this.repo.findById(id);
  }

  async updateBook(id: string, dto: UpdateBookDTO) {
    return this.repo.updateById(id, dto as any);
  }

  async deleteBook(id: string) {
    return this.repo.deleteById(id);
  }

  async listBooks(params: {
    search?: string;
    category?: string;
    status?: "active" | "draft";
    page?: number;
    limit?: number;
    sort?: "newest" | "priceAsc" | "priceDesc";
  }) {
    const page = Math.max(1, Number(params.page || 1));
    const limit = Math.min(50, Math.max(1, Number(params.limit || 10)));
    const skip = (page - 1) * limit;

    const q: any = {};

    if (params.status) q.status = params.status;
    if (params.category) q.category = params.category;

    if (params.search?.trim()) {
      const s = params.search.trim();
      q.$or = [
        { title: { $regex: s, $options: "i" } },
        { author: { $regex: s, $options: "i" } },
        { category: { $regex: s, $options: "i" } },
        { isbn: { $regex: s, $options: "i" } },
      ];
    }

    const sort =
      params.sort === "priceAsc"
        ? { price: 1 }
        : params.sort === "priceDesc"
        ? { price: -1 }
        : { createdAt: -1 };

    const { items, total } = await this.repo.list(q, skip, limit, sort);

    return {
      items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }
}