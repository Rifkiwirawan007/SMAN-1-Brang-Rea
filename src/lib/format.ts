import { SEKOLAH } from "@/data/sekolah";

const zonaSekolah = "Asia/Makassar"; // WITA

export function formatTanggal(iso: string, opsi?: { pendek?: boolean }) {
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

export function waLink(pesan: string, nomor: string = SEKOLAH.kontak.whatsapp) {
  return `https://wa.me/${nomor}?text=${encodeURIComponent(pesan)}`;
}

export function cx(...kelas: Array<string | false | null | undefined>) {
  return kelas.filter(Boolean).join(" ");
}
