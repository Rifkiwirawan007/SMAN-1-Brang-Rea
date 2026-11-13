import { catatKunjungan } from "@/lib/server/kunjungan";

const BOT = /bot|crawl|spider|slurp|headless|lighthouse|preview|facebookexternalhit|whatsapp|telegram|curl|wget|python|axios/i;
const HP = /android|iphone|ipad|ipod|mobile/i;

/** Pencatat kunjungan halaman publik (dipanggil PencatatKunjungan di browser). */
export async function POST(request: Request) {
  const ua = request.headers.get("user-agent") ?? "";
  if (!ua || BOT.test(ua)) return new Response(null, { status: 204 });

  let body: { p?: unknown; v?: unknown; r?: unknown };
  try {
    body = await request.json();
  } catch {
    return new Response(null, { status: 400 });
  }

  const path = String(body.p ?? "").split(/[?#]/)[0].slice(0, 120).replace(/\/+$/, "") || "/";
  const pengunjung = String(body.v ?? "").slice(0, 40);
  if (!path.startsWith("/") || /^\/(dashboard|masuk|api|_next|media)(\/|$)/.test(path) || pengunjung.length < 8) {
    return new Response(null, { status: 204 });
  }

  let rujukan = "Langsung";
  try {
    const r = String(body.r ?? "");
    if (r) {
      const host = new URL(r).hostname.replace(/^www\./, "");
      const sendiri = new URL(request.url).hostname.replace(/^www\./, "");
      if (host && host !== sendiri) rujukan = host.slice(0, 60);
    }
  } catch {
    /* rujukan tidak valid: anggap langsung */
  }

  catatKunjungan({ path, pengunjung, rujukan, hp: HP.test(ua), waktu: Date.now() });
  return new Response(null, { status: 204 });
}
