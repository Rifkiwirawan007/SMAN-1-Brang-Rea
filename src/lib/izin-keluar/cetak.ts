"use client";

/**
 * Cetak resi izin keluar ke printer thermal 58 mm.
 * 1. Bluetooth langsung (Web Bluetooth + perintah ESC/POS) — Chrome/Edge di Android, Windows, macOS, ChromeOS. Tidak ada di iPhone.
 * 2. Cadangan: resi sebagai gambar (bagikan ke aplikasi printer / unduh), atau dialog cetak browser.
 */
import { jamWita, ZONA } from "@/lib/absensi/tipe";
import type { DataResi } from "@/lib/izin-keluar/tipe";

/* ---------- Isi resi (dipakai semua cara cetak) ---------- */

const KOLOM = 32; // 58 mm, font A = 32 karakter per baris

const tanggalResi = (tgl: string) =>
  new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "short", year: "numeric", timeZone: ZONA }).format(new Date(`${tgl}T08:00:00+08:00`));

/** Baris "label : nilai" yang dipecah bila nilai panjang. */
export function barisResi(d: DataResi): { label: string; nilai: string }[] {
  return [
    { label: "No", nilai: d.nomor },
    { label: "Nama", nilai: d.siswa.nama },
    { label: "Kelas", nilai: d.siswa.kelas },
    { label: "Tanggal", nilai: tanggalResi(d.tanggal) },
    { label: "Jam keluar", nilai: `${jamWita(d.jamKeluar)} WITA` },
    { label: "Keperluan", nilai: d.keperluan },
    { label: "Diberi izin", nilai: d.oleh.nama },
  ];
}

const PESAN_BAWAH = "Tunjukkan resi ini ke satpam";

/** Hilangkan huruf yang tidak dikenal printer (é → e, “ → "). */
const ascii = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[–—]/g, "-")
    .replace(/[^\x20-\x7e]/g, "?");

function pecah(teks: string, lebar: number): string[] {
  const hasil: string[] = [];
  let baris = "";
  for (const kata of teks.split(" ")) {
    let k = kata;
    while (k.length > lebar) {
      if (baris) {
        hasil.push(baris);
        baris = "";
      }
      hasil.push(k.slice(0, lebar));
      k = k.slice(lebar);
    }
    if (!baris) baris = k;
    else if (baris.length + 1 + k.length <= lebar) baris += ` ${k}`;
    else {
      hasil.push(baris);
      baris = k;
    }
  }
  if (baris) hasil.push(baris);
  return hasil.length ? hasil : [""];
}

/** Resi sebagai teks polos 32 kolom (untuk ESC/POS). */
export function teksResi(d: DataResi): { judul: string[]; badan: string[] } {
  const lebarLabel = 12; // "Diberi izin " + ": "
  const badan: string[] = [];
  for (const { label, nilai } of barisResi(d)) {
    const isi = pecah(ascii(nilai), KOLOM - lebarLabel - 2);
    badan.push(`${label.padEnd(lebarLabel)}: ${isi[0]}`);
    for (const lanjut of isi.slice(1)) badan.push(`${" ".repeat(lebarLabel + 2)}${lanjut}`);
  }
  return { judul: pecah(ascii(d.namaSekolah.toUpperCase()), KOLOM / 2), badan };
}

/* ---------- ESC/POS ---------- */

function escpos(d: DataResi): Uint8Array {
  const b: number[] = [];
  const tulis = (s: string) => {
    for (const c of s) b.push(c.charCodeAt(0));
  };
  const ESC = 0x1b,
    GS = 0x1d,
    LF = 0x0a;
  const garis = "-".repeat(KOLOM);
  const { judul, badan } = teksResi(d);

  b.push(ESC, 0x40); // reset
  b.push(ESC, 0x61, 1); // tengah
  b.push(ESC, 0x45, 1, GS, 0x21, 0x11); // tebal + 2x
  for (const j of judul) tulis(j + "\n");
  b.push(GS, 0x21, 0x00);
  tulis("SURAT IZIN KELUAR");
  b.push(LF, ESC, 0x45, 0);
  b.push(ESC, 0x61, 0); // kiri
  for (const baris of [garis, ...badan, garis]) tulis(baris + "\n");
  b.push(ESC, 0x61, 1);
  tulis(PESAN_BAWAH + "\n");
  b.push(ESC, 0x64, 4); // dorong kertas 4 baris supaya mudah disobek
  return new Uint8Array(b);
}

/* ---------- Web Bluetooth (tipe minimal; lib.dom belum memuatnya) ---------- */

type Karakteristik = {
  properties: { write: boolean; writeWithoutResponse: boolean };
  writeValueWithResponse?: (v: BufferSource) => Promise<void>;
  writeValueWithoutResponse?: (v: BufferSource) => Promise<void>;
  writeValue: (v: BufferSource) => Promise<void>;
};
type Layanan = { getCharacteristics: () => Promise<Karakteristik[]> };
type Gatt = { connected: boolean; connect: () => Promise<Gatt>; getPrimaryServices: () => Promise<Layanan[]> };
type PerangkatBT = { name?: string; gatt?: Gatt; addEventListener: (e: string, f: () => void) => void };
type BluetoothNav = { requestDevice: (o: unknown) => Promise<PerangkatBT> };

/** Layanan BLE yang umum dipakai printer thermal murah (harus didaftarkan agar boleh diakses). */
const LAYANAN_PRINTER = [
  "000018f0-0000-1000-8000-00805f9b34fb",
  "e7810a71-73ae-499d-8c15-faa9aef0c3f2",
  "49535343-fe7d-4ae5-8fa9-9fafd205e455",
  "0000ff00-0000-1000-8000-00805f9b34fb",
  "0000ffe0-0000-1000-8000-00805f9b34fb",
  "0000fee7-0000-1000-8000-00805f9b34fb",
  "0000ae30-0000-1000-8000-00805f9b34fb",
  "0000ae00-0000-1000-8000-00805f9b34fb",
];

const bt = () => (globalThis.navigator as Navigator & { bluetooth?: BluetoothNav }).bluetooth;

/** Browser bisa mencetak langsung lewat Bluetooth? */
export const bluetoothTersedia = () => typeof window !== "undefined" && window.isSecureContext && !!bt();

type Sambungan = { perangkat: PerangkatBT; kar: Karakteristik };
let sambungan: Sambungan | null = null;
const pendengar = new Set<(nama: string | null) => void>();
const kabari = () => pendengar.forEach((f) => f(sambungan?.perangkat.name ?? (sambungan ? "Printer" : null)));

/** Berlangganan nama printer yang tersambung (null = belum). */
export function pantauPrinter(f: (nama: string | null) => void) {
  pendengar.add(f);
  f(sambungan?.perangkat.name ?? (sambungan ? "Printer" : null));
  return () => void pendengar.delete(f);
}

async function cariKarakteristik(gatt: Gatt): Promise<Karakteristik> {
  for (const l of await gatt.getPrimaryServices()) {
    for (const k of await l.getCharacteristics().catch(() => [] as Karakteristik[])) {
      if (k.properties.write || k.properties.writeWithoutResponse) return k;
    }
  }
  throw new Error("Printer tersambung, tetapi jalur cetaknya tidak ditemukan. Printer ini mungkin hanya bisa lewat aplikasinya — pakai “Simpan gambar”.");
}

/** Pilih printer (wajib dari klik tombol). Sekali pilih, tersimpan selama halaman tidak dimuat ulang. */
export async function hubungkanPrinter(): Promise<string> {
  const b = bt();
  if (!b) throw new Error("Browser ini tidak mendukung Bluetooth. Pakai Chrome di Android/laptop, atau “Simpan gambar”.");
  const perangkat = await b.requestDevice({ acceptAllDevices: true, optionalServices: LAYANAN_PRINTER });
  if (!perangkat.gatt) throw new Error("Perangkat ini tidak bisa dipakai mencetak.");
  const gatt = await perangkat.gatt.connect();
  const kar = await cariKarakteristik(gatt);
  sambungan = { perangkat, kar };
  perangkat.addEventListener("gattserverdisconnected", kabari);
  kabari();
  return perangkat.name || "Printer";
}

export function lupakanPrinter() {
  sambungan = null;
  kabari();
}

const tidur = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function kirim(data: Uint8Array) {
  if (!sambungan) throw new Error("Printer belum dihubungkan.");
  const { perangkat } = sambungan;
  if (perangkat.gatt && !perangkat.gatt.connected) {
    // Printer sempat tidur/mati: sambung ulang tanpa memilih lagi.
    const gatt = await perangkat.gatt.connect();
    sambungan = { perangkat, kar: await cariKarakteristik(gatt) };
  }
  const k = sambungan.kar;
  // Utamakan tulis-berbalasan (printer mengatur laju sendiri); tanpa balasan hanya bila printer tidak mendukungnya.
  const tanpaBalasan = !k.properties.write && k.properties.writeWithoutResponse && !!k.writeValueWithoutResponse;
  const ukuran = tanpaBalasan ? 20 : 180;
  for (let i = 0; i < data.length; i += ukuran) {
    const potong = data.slice(i, i + ukuran);
    if (tanpaBalasan) {
      await k.writeValueWithoutResponse!(potong);
      await tidur(10);
    } else if (k.writeValueWithResponse) await k.writeValueWithResponse(potong);
    else await k.writeValue(potong);
  }
}

/** Cetak lewat Bluetooth. Melempar Error berbahasa Indonesia bila gagal. */
export async function cetakBluetooth(d: DataResi) {
  try {
    await kirim(escpos(d));
  } catch (e) {
    const pesan = (e as Error).message || "";
    if (/^(Printer|Browser|Perangkat)/.test(pesan)) throw e;
    throw new Error("Gagal mengirim ke printer. Pastikan printer menyala & dekat, lalu coba lagi.");
  }
}

/* ---------- Cadangan: gambar & dialog cetak ---------- */

/** Gambar resi 384 px (lebar cetak 58 mm @203 dpi). */
export async function gambarResi(d: DataResi): Promise<Blob> {
  const L = 384,
    pad = 12,
    fs = 22,
    jarak = 30;
  const kanvas = document.createElement("canvas");
  const ctx = kanvas.getContext("2d")!;
  const { judul, badan } = teksResi(d);
  const tinggi = pad * 2 + judul.length * 40 + 34 + 24 + badan.length * jarak + 24 + 40 + 30;
  kanvas.width = L;
  kanvas.height = tinggi;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, L, tinggi);
  ctx.fillStyle = "#000";
  ctx.textBaseline = "top";
  let y = pad;
  ctx.textAlign = "center";
  ctx.font = "bold 32px monospace";
  for (const j of judul) {
    ctx.fillText(j, L / 2, y);
    y += 40;
  }
  ctx.font = `bold ${fs}px monospace`;
  ctx.fillText("SURAT IZIN KELUAR", L / 2, y);
  y += 34;
  ctx.fillRect(pad, y, L - pad * 2, 2);
  y += 14;
  ctx.textAlign = "left";
  ctx.font = `${fs - 3}px monospace`;
  for (const b of badan) {
    ctx.fillText(b, pad, y);
    y += jarak;
  }
  y += 6;
  ctx.fillRect(pad, y, L - pad * 2, 2);
  y += 16;
  ctx.textAlign = "center";
  ctx.fillText(PESAN_BAWAH, L / 2, y);
  return new Promise((r, j) => kanvas.toBlob((b) => (b ? r(b) : j(new Error("Gagal membuat gambar."))), "image/png"));
}

/** Bagikan gambar resi (HP: pilih aplikasi printer). Bila tidak bisa dibagikan, gambar diunduh. */
export async function bagikanGambar(d: DataResi): Promise<"dibagikan" | "diunduh"> {
  const blob = await gambarResi(d);
  const file = new File([blob], `${d.nomor}.png`, { type: "image/png" });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: d.nomor });
      return "dibagikan";
    } catch (e) {
      if ((e as Error).name === "AbortError") return "dibagikan";
    }
  }
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement("a"), { href: url, download: file.name });
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  return "diunduh";
}

const html = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

/** Dialog cetak browser dengan ukuran kertas 58 mm (untuk printer yang terpasang di laptop). */
export function cetakBrowser(d: DataResi) {
  const baris = barisResi(d)
    .map((b) => `<tr><td>${html(b.label)}</td><td>: ${html(b.nilai)}</td></tr>`)
    .join("");
  const isi = `<!doctype html><html><head><meta charset="utf-8"><title>${html(d.nomor)}</title><style>
@page{size:58mm auto;margin:0}*{box-sizing:border-box}body{margin:0;padding:2mm 3mm 6mm;width:58mm;font:9pt/1.35 ui-monospace,Menlo,Consolas,monospace;color:#000}
h1{font-size:11pt;margin:0;text-align:center}h2{font-size:9pt;margin:0 0 1.5mm;text-align:center}
table{width:100%;border-collapse:collapse;border-top:1px dashed #000;border-bottom:1px dashed #000;margin:1mm 0}td{vertical-align:top;padding:.4mm 0}td:first-child{white-space:nowrap;padding-right:1mm}
p{text-align:center;margin:1.5mm 0 0}</style></head><body><h1>${html(d.namaSekolah.toUpperCase())}</h1><h2>SURAT IZIN KELUAR</h2><table>${baris}</table><p>${PESAN_BAWAH}</p></body></html>`;
  const f = document.createElement("iframe");
  f.style.cssText = "position:fixed;width:0;height:0;border:0;right:0;bottom:0";
  document.body.appendChild(f);
  const doc = f.contentDocument!;
  doc.open();
  doc.write(isi);
  doc.close();
  setTimeout(() => {
    f.contentWindow?.focus();
    f.contentWindow?.print();
    setTimeout(() => f.remove(), 1000);
  }, 150);
}
