import { Request, Response } from "express";
import { OrderModel } from "../models/order.model";

// USD → NPR conversion rate
const USD_TO_NPR = 133;

// helper: yyyy-mm-dd
function toDayString(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function rangeToDays(range: string) {
  const r = (range || "").toLowerCase();
  if (r === "7d") return 7;
  if (r === "90d") return 90;
  return 30;
}

// GET /api/admin/reports/sales
export async function adminSalesReport(req: Request, res: Response) {
  try {
    const days = rangeToDays(String(req.query.range ?? "30d"));
    const end = new Date();
    const start = new Date();

    start.setDate(end.getDate() - (days - 1));
    start.setHours(0, 0, 0, 0);

    const matchBase: any = {
      status: { $ne: "Cancelled" },
      createdAt: { $gte: start, $lte: end },
    };

    const [summaryAgg, dailyAgg, topBooksAgg] = await Promise.all([
      // SUMMARY
      OrderModel.aggregate([
        { $match: matchBase },
        {
          $group: {
            _id: null,
            revenue: { $sum: "$totalAmount" },
            orders: { $sum: 1 },
            delivered: {
              $sum: {
                $cond: [{ $eq: ["$status", "Delivered"] }, 1, 0],
              },
            },
          },
        },
      ]),

      // DAILY SALES
      OrderModel.aggregate([
        { $match: matchBase },
        {
          $group: {
            _id: {
              y: { $year: "$createdAt" },
              m: { $month: "$createdAt" },
              d: { $dayOfMonth: "$createdAt" },
            },
            revenue: { $sum: "$totalAmount" },
            orders: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            date: {
              $dateToString: {
                date: {
                  $dateFromParts: {
                    year: "$_id.y",
                    month: "$_id.m",
                    day: "$_id.d",
                  },
                },
                format: "%Y-%m-%d",
              },
            },
            revenue: 1,
            orders: 1,
          },
        },
        { $sort: { date: 1 } },
      ]),

      // TOP BOOKS
      OrderModel.aggregate([
        { $match: matchBase },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.title",
            qty: { $sum: "$items.qty" },
            revenue: {
              $sum: { $multiply: ["$items.price", "$items.qty"] },
            },
          },
        },
        { $sort: { qty: -1 } },
        { $limit: 5 },
        {
          $project: {
            _id: 0,
            title: "$_id",
            qty: 1,
            revenue: 1,
          },
        },
      ]),
    ]);

    const summary = summaryAgg?.[0] ?? {
      revenue: 0,
      orders: 0,
      delivered: 0,
    };

    // convert summary revenue to Rs
    const summaryRevenueRs = summary.revenue * USD_TO_NPR;

    // DAILY MAP
    const dailyMap = new Map<string, { date: string; revenue: number; orders: number }>();

    for (const d of dailyAgg) {
      dailyMap.set(d.date, {
        date: d.date,
        revenue: d.revenue * USD_TO_NPR,
        orders: d.orders,
      });
    }

    const daily: Array<{ date: string; revenue: number; orders: number }> = [];

    for (let i = 0; i < days; i++) {
      const dt = new Date(start);
      dt.setDate(start.getDate() + i);
      const key = toDayString(dt);

      daily.push(
        dailyMap.get(key) ?? {
          date: key,
          revenue: 0,
          orders: 0,
        }
      );
    }

    // convert top books revenue
    const topBooks = (topBooksAgg ?? []).map((b: any) => ({
      ...b,
      revenue: b.revenue * USD_TO_NPR,
    }));

    return res.status(200).json({
      success: true,
      currency: "Rs",
      data: {
        range: `${days}d`,
        revenue: summaryRevenueRs,
        orders: summary.orders ?? 0,
        delivered: summary.delivered ?? 0,
        cancelled: 0,
        daily,
        topBooks,
      },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err?.message || "Failed to load sales report",
    });
  }
}