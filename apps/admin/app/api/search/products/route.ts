import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { neonSql } from "@/lib/neon";

export const runtime = "nodejs";

type ProductSearchRow = {
  id: string;
  title: string;
  category_label: string;
};

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!neonSql) {
    return NextResponse.json(
      { error: "Database is not configured." },
      { status: 500 }
    );
  }

  const rawQuery = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (rawQuery.length < 2) {
    return NextResponse.json({ items: [] });
  }

  const query = rawQuery.toLowerCase();
  const prefix = `${query}%`;
  const contains = `%${query}%`;

  const rows = (await neonSql`
    SELECT
      id,
      title,
      category_label
    FROM products
    WHERE
      LOWER(id) = ${query}
      OR LOWER(id) LIKE ${prefix}
      OR LOWER(title) LIKE ${prefix}
      OR LOWER(category_label) LIKE ${prefix}
      OR LOWER(title) LIKE ${contains}
      OR LOWER(category_label) LIKE ${contains}
    ORDER BY
      CASE
        WHEN LOWER(id) = ${query} THEN 0
        WHEN LOWER(id) LIKE ${prefix} THEN 1
        WHEN LOWER(title) LIKE ${prefix} THEN 2
        WHEN LOWER(category_label) LIKE ${prefix} THEN 3
        ELSE 4
      END,
      updated_at DESC
    LIMIT 10
  `) as ProductSearchRow[];

  return NextResponse.json({
    items: rows.map((row) => ({
      id: row.id,
      title: row.title,
      categoryLabel: row.category_label
    }))
  });
}
