import { NextResponse, type NextRequest } from "next/server";

/**
 * Pemeriksaan cepat untuk halaman dashboard: tanpa cookie sesi langsung diarahkan ke /masuk.
 * Keabsahan sesi dan hak akses tetap diperiksa ulang di setiap halaman, Server Action, dan Route Handler.
 */
export function proxy(request: NextRequest) {
  if (!request.cookies.has("sesi_dasbor")) {
    const tujuan = new URL("/masuk", request.url);
    const ke = request.nextUrl.pathname + request.nextUrl.search;
    if (ke !== "/dashboard") tujuan.searchParams.set("ke", ke);
    return NextResponse.redirect(tujuan);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*"],
};
