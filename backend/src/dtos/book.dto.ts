export type CreateBookDTO = {
  title: string;
  author: string;
  category: string;
  isbn?: string;
  price: number;
  stock: number;
  status?: "active" | "draft";
  description?: string;
  coverUrl?: string;
};

export type UpdateBookDTO = Partial<CreateBookDTO>;