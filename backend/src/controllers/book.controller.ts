import { Request, Response } from "express";
import { BookService } from "../services/book.services";

const service = new BookService();

export async function listPublicBooks(req: Request, res: Response) {
  const data = await service.listBooks({
    search: String(req.query.search || ""),
    category: req.query.category ? String(req.query.category) : undefined,
    status: "active",
    page: Number(req.query.page || 1),
    limit: Number(req.query.limit || 10),
    sort: (req.query.sort as any) || "newest",
  });

  return res.json({ success: true, ...data });
}

export async function getPublicBook(req: Request, res: Response) {
  const book = await service.getBookById(req.params.id);
  if (!book || book.status !== "active") {
    return res.status(404).json({ success: false, message: "Book not found" });
  }
  return res.json({ success: true, book });
}

/* Admin */

export async function adminListBooks(req: Request, res: Response) {
  const data = await service.listBooks({
    search: String(req.query.search || ""),
    category: req.query.category ? String(req.query.category) : undefined,
    status: req.query.status ? (String(req.query.status) as any) : undefined,
    page: Number(req.query.page || 1),
    limit: Number(req.query.limit || 10),
    sort: (req.query.sort as any) || "newest",
  });

  return res.json({ success: true, ...data });
}

export async function adminCreateBook(req: Request, res: Response) {
  const { title, author, category, isbn, price, stock, status, description, coverUrl } = req.body || {};

  if (!title || !author || !category) {
    return res.status(400).json({ success: false, message: "title, author, category are required" });
  }
  const p = Number(price);
  const s = Number(stock);
  if (!Number.isFinite(p) || p < 0) return res.status(400).json({ success: false, message: "Invalid price" });
  if (!Number.isFinite(s) || s < 0) return res.status(400).json({ success: false, message: "Invalid stock" });

  const book = await service.createBook({
    title,
    author,
    category,
    isbn,
    price: p,
    stock: s,
    status,
    description,
    coverUrl,
  });

  return res.status(201).json({ success: true, book });
}

export async function adminGetBook(req: Request, res: Response) {
  const book = await service.getBookById(req.params.id);
  if (!book) return res.status(404).json({ success: false, message: "Book not found" });
  return res.json({ success: true, book });
}

export async function adminUpdateBook(req: Request, res: Response) {
  const patch = req.body || {};
  if (patch.price !== undefined) patch.price = Number(patch.price);
  if (patch.stock !== undefined) patch.stock = Number(patch.stock);

  if (patch.price !== undefined && (!Number.isFinite(patch.price) || patch.price < 0)) {
    return res.status(400).json({ success: false, message: "Invalid price" });
  }
  if (patch.stock !== undefined && (!Number.isFinite(patch.stock) || patch.stock < 0)) {
    return res.status(400).json({ success: false, message: "Invalid stock" });
  }

  const book = await service.updateBook(req.params.id, patch);
  if (!book) return res.status(404).json({ success: false, message: "Book not found" });

  return res.json({ success: true, book });
}

export async function adminDeleteBook(req: Request, res: Response) {
  const deleted = await service.deleteBook(req.params.id);
  if (!deleted) return res.status(404).json({ success: false, message: "Book not found" });
  return res.json({ success: true, message: "Book deleted" });
}