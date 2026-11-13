const zonaSekolah = "Asia/Makassar"; // WITA

export function formatTanggal(iso: string, opsi?: { pendek?: boolean }) {
  if (!iso) return "";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: opsi?.pendek ? "short" : "long",
    year: "numeric",
    timeZone: zonaSekolah,
  }).format(new Date(`${iso}T08:00:00+08:00`));
}

export function bagianTanggal(iso: string) {
  const d = new Date(`${iso}T08:00:00+08:00`);
  const hari = new Intl.DateTimeFormat("id-ID", { day: "2-digit", timeZone: zonaSekolah }).format(d);
  const bulan = new Intl.DateTimeFormat("id-ID", { month: "short", timeZone: zonaSekolah }).format(d);
  const tahun = new Intl.DateTimeFormat("id-ID", { year: "numeric", timeZone: zonaSekolah }).format(d);
  const namaHari = new Intl.DateTimeFormat("id-ID", { weekday: "long", timeZone: zonaSekolah }).format(d);
  return { hari, bulan, tahun, namaHari };
}

export function formatAngka(n: number) {
  return new Intl.NumberFormat("id-ID").format(n);
}

const KATA_ANGKA = ["nol", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan", "sepuluh", "sebelas"];

/**
 * Bilangan 0–99 dalam huruf ("sepuluh", "dua belas", "dua puluh satu"), selebihnya angka biasa.
 * Dipakai untuk jumlah di awal kalimat, misalnya "Sepuluh ekstrakurikuler ...".
 */
export function angkaHuruf(n: number, opsi?: { kapital?: boolean }) {
  let teks: string;
  if (!Number.isInteger(n) || n < 0 || n > 99) teks = formatAngka(n);
  else if (n < 12) teks = KATA_ANGKA[n];
  else if (n < 20) teks = `${KATA_ANGKA[n - 10]} belas`;
  else teks = `${KATA_ANGKA[Math.floor(n / 10)]} puluh${n % 10 ? ` ${KATA_ANGKA[n % 10]}` : ""}`;
  return opsi?.kapital ? teks.charAt(0).toUpperCase() + teks.slice(1) : teks;
}

/**
 * Jam layanan dalam satu baris: "Senin–Kamis 07.00–14.30, Jumat 07.00–11.30, Sabtu 07.00–12.30 WITA".
 * Bila semua baris berakhir dengan zona waktu yang sama, zona cukup ditulis sekali di akhir.
 */
export function ringkasJamLayanan(jam: { hari: string; jam: string }[]) {
  const baris = jam.map((j) => `${j.hari} ${j.jam}`.trim()).filter(Boolean);
  const pola = /\s+(WITA|WIB|WIT)$/;
  const zona = baris.map((b) => b.match(pola)?.[1]);
  const sama = baris.length > 1 && zona.every((z) => z && z === zona[0]);
  return baris.map((b, i) => (sama && i < baris.length - 1 ? b.replace(pola, "") : b)).join(", ");
}

/** Tautan wa.me. Nomor dirapikan: hanya angka, awalan 0 diganti kode negara 62. */
export function waLink(pesan: string, nomor: string) {
  const angka = nomor.replace(/\D/g, "").replace(/^0/, "62");
  return `https://wa.me/${angka}?text=${encodeURIComponent(pesan)}`;
}

export function cx(...kelas: Array<string | false | null | undefined>) {
  return kelas.filter(Boolean).join(" ");
}
