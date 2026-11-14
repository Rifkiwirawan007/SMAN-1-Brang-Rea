import { bolehLanjut } from "@/lib/server/batas";
import { idBaru, kodeBaru, nomorBerikut, ubahSemuaLaporan } from "@/lib/server/laporan";
import { tanggalIni } from "@/lib/absensi/tipe";
import { JENIS_LAPORAN, type JenisLaporan, type Laporan } from "@/lib/laporan/tipe";

const teks = (fd: FormData, k: string, maks: number) => String(fd.get(k) ?? "").trim().replace(/\s+\n/g, "\n").slice(0, maks);
const gagal = (pesan: string, status = 400, galat?: Record<string, string>) => Response.json({ pesan, galat }, { status });

/**
 * Siswa mengirim laporan ke guru BK (halaman /lapor). Body: multipart/form-data.
 * Kolom: nama, kelas, telepon?, jenis, terlibat?, isi, setuju, situs (jebakan bot).
 */
export async function POST(request: Request) {
  // Hanya dari situs ini sendiri.
  const asal = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (asal && host && new URL(asal).host !== host) return gagal("Permintaan ditolak.", 403);

  let fd: FormData;
  try {
    fd = await request.formData();
  } catch {
    return gagal("Data laporan tidak terbaca. Coba kirim lagi.");
  }
  if (teks(fd, "situs", 100)) return Response.json({ nomor: "LP-0000-0000", kode: "XXXXXX" }); // bot: abaikan diam-diam

  const nama = teks(fd, "nama", 80).replace(/\s+/g, " ");
  const kelas = teks(fd, "kelas", 20).replace(/\s+/g, " ").toUpperCase();
  const telepon = teks(fd, "telepon", 20).replace(/[^\d+]/g, "");
  const jenis = teks(fd, "jenis", 20) as JenisLaporan;
  const terlibat = teks(fd, "terlibat", 300);
  const isi = teks(fd, "isi", 4000);

  const galat: Record<string, string> = {};
  if (nama.length < 3) galat.nama = "Tulis nama lengkap kamu.";
  if (!kelas) galat.kelas = "Tulis kelas kamu, mis. XI-2.";
  if (telepon && (telepon.replace(/\D/g, "").length < 9 || telepon.replace(/\D/g, "").length > 15)) galat.telepon = "Nomor HP tidak sah.";
  if (!JENIS_LAPORAN.some((j) => j.kunci === jenis)) galat.jenis = "Pilih jenis laporan.";
  if (isi.length < 20) galat.isi = "Ceritakan kejadiannya minimal satu-dua kalimat (20 huruf).";
  if (fd.get("setuju") !== "ya") galat.setuju = "Centang pernyataan ini untuk mengirim.";
  if (Object.keys(galat).length) return gagal("Periksa lagi isian yang ditandai.", 400, galat);

  // Dihitung hanya untuk laporan yang lolos pemeriksaan. Satu wifi sekolah = satu IP untuk banyak siswa, jadi batasnya longgar.
  const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || request.headers.get("x-real-ip") || "lokal";
  if (!bolehLanjut(`lapor:${ip}`, 12, 60 * 60_000)) return gagal("Terlalu banyak laporan dari jaringan ini. Coba lagi dalam satu jam, atau temui guru BK langsung.", 429);

  const id = idBaru();
  const kini = new Date().toISOString();
  let nomor = "";
  let kode = "";
  await ubahSemuaLaporan((semua) => {
    nomor = nomorBerikut(semua, tanggalIni().slice(0, 4));
    // Kode dipakai sendirian untuk cek status, jadi harus unik.
    do kode = kodeBaru();
    while (semua.some((l) => l.kode === kode));
    const baru: Laporan = {
      id,
      nomor,
      kode,
      dibuat: kini,
      nama,
      kelas,
      telepon: telepon || undefined,
      jenis,
      terlibat: terlibat || undefined,
      isi,
      status: "baru",
      riwayat: [{ waktu: kini, oleh: nama, status: "baru" }],
      catatan: [],
    };
    return [baru, ...semua];
  });

  return Response.json({ nomor, kode });
}
