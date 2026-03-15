import { NextResponse } from "next/server";

export function success(data: unknown, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function created(data: unknown) {
  return success(data, 201);
}

export function error(message: string, code = 400) {
  return NextResponse.json({ success: false, error: message, code }, { status: code });
}

export function paginated(data: unknown[], total: number, page: number, limit: number) {
  return NextResponse.json({
    success: true,
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

export function parseSearchParams(url: string) {
  const { searchParams } = new URL(url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
  const search = searchParams.get("search") || undefined;
  return { page, limit, search, searchParams };
}
