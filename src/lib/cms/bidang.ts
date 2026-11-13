/**
 * Skema bidang formulir dashboard + validasinya. Dipakai di klien (render formulir, cek awal)
 * dan di server (validasi akhir sebelum disimpan). Tidak boleh mengimpor modul khusus server.
 */

export type Opsi = { nilai: string; label: string };
export type Lebar = "penuh" | "setengah" | "sepertiga";

type Dasar = {
  nama: string;
  label: string;
  bantuan?: string;
  wajib?: boolean;
  lebar?: Lebar;
  /** Tampil di kolom samping (panel kanan) pada formulir koleksi. */
  sisi?: boolean;
};

export type Bidang =
  | (Dasar & { jenis: "teks"; maks?: number; placeholder?: string; format?: "tautan" | "email" | "telepon" | "url" })
  | (Dasar & { jenis: "teksPanjang"; maks?: number; baris?: number; placeholder?: string })
  | (Dasar & { jenis: "paragraf"; placeholder?: string })
  | (Dasar & { jenis: "daftarTeks"; labelItem?: string; placeholder?: string })
  | (Dasar & { jenis: "angka"; min?: number; max?: number; langkah?: number; satuan?: string })
  | (Dasar & { jenis: "tanggal" })
  | (Dasar & { jenis: "pilihan"; opsi: readonly (string | Opsi)[] })
  | (Dasar & { jenis: "saklar"; teks?: string })
  | (Dasar & { jenis: "gambar"; rasio?: string })
  | (Dasar & { jenis: "galeri" })
  | (Dasar & { jenis: "fokus"; gambar: string })
  | (Dasar & { jenis: "slug"; dari: string; awalan?: string })
  | (Dasar & { jenis: "grup"; bidang: Bidang[] })
  | (Dasar & { jenis: "daftar"; bidang: Bidang[]; labelItem: string; judulItem?: string; maksItem?: number });

export type Rekaman = Record<string, unknown>;
export type Galat = Record<string, string>;

export const opsiNormal = (o: string | Opsi): Opsi => (typeof o === "string" ? { nilai: o, label: o } : o);

export function kosong(v: unknown): boolean {
  if (v === undefined || v === null) return true;
  if (typeof v === "string") return v.trim() === "";
  if (Array.isArray(v)) return v.every(kosong);
  if (typeof v === "object") return Object.values(v as Rekaman).every(kosong);
  return false;
}

/** Nilai awal kosong untuk sebuah bidang (dipakai saat menambah item daftar). */
export function nilaiAwal(b: Bidang): unknown {
  switch (b.jenis) {
    case "paragraf":
    case "daftarTeks":
    case "galeri":
    case "daftar":
      return [];
    case "saklar":
      return false;
    case "grup":
      return objekAwal(b.bidang);
    case "pilihan":
      return b.wajib ? opsiNormal(b.opsi[0]).nilai : "";
    default:
      return "";
  }
}

export function objekAwal(bidang: Bidang[]): Rekaman {
  const o: Rekaman = {};
  for (const b of bidang) o[b.nama] = nilaiAwal(b);
  return o;
}

const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RE_TANGGAL = /^\d{4}-\d{2}-\d{2}$/;

function tanggalSah(s: string) {
  if (!RE_TANGGAL.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

const sebagaiTeks = (v: unknown) => (v === undefined || v === null ? "" : String(v));

/**
 * Validasi + rapikan nilai sesuai skema. Kunci galat berupa jalur, mis. "judul", "aksi.href", "jalur.2.nama".
 * Bidang kosong yang tidak wajib menjadi undefined (dihapus saat disimpan).
 */
export function validasi(bidang: Bidang[], masukan: unknown, galat: Galat = {}, jalur = ""): Rekaman {
  const src = (masukan && typeof masukan === "object" ? masukan : {}) as Rekaman;
  const hasil: Rekaman = {};
  for (const b of bidang) {
    const kunci = jalur + b.nama;
    const v = src[b.nama];
    const salah = (pesan: string) => {
      if (!galat[kunci]) galat[kunci] = pesan;
    };

    switch (b.jenis) {
      case "teks":
      case "teksPanjang":
      case "slug":
      case "fokus":
      case "gambar": {
        let s = sebagaiTeks(v);
        s = b.jenis === "teksPanjang" ? s.replace(/\r\n/g, "\n").trim() : s.replace(/\s+/g, " ").trim();
        if (!s) {
          if (b.wajib) salah(b.jenis === "gambar" ? "Pilih atau unggah foto." : "Wajib diisi.");
          hasil[b.nama] = undefined;
          break;
        }
        if ((b.jenis === "teks" || b.jenis === "teksPanjang") && b.maks && s.length > b.maks) salah(`Maksimal ${b.maks} karakter (sekarang ${s.length}).`);
        if (b.jenis === "slug") {
          s = s.toLowerCase();
          if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s)) salah("Hanya huruf kecil, angka, dan tanda hubung (-).");
        }
        if (b.jenis === "gambar" && !/^(\/|https?:\/\/)/.test(s)) salah("Alamat foto tidak sah.");
        if (b.jenis === "teks" && b.format) {
          if (b.format === "email" && !RE_EMAIL.test(s)) salah("Alamat email tidak sah.");
          if (b.format === "url" && !/^https?:\/\/\S+$/.test(s)) salah("Awali dengan https://");
          if (b.format === "tautan" && !/^(\/|#|https?:\/\/|mailto:|tel:)\S*$/.test(s)) salah("Awali dengan / untuk halaman situs, atau https:// untuk situs lain.");
          if (b.format === "telepon") {
            s = s.replace(/[^\d+]/g, "");
            if (!/^\+?\d{8,15}$/.test(s)) salah("Nomor tidak sah (8–15 digit).");
          }
        }
        hasil[b.nama] = s;
        break;
      }
      case "tanggal": {
        const s = sebagaiTeks(v).trim();
        if (!s) {
          if (b.wajib) salah("Pilih tanggal.");
          hasil[b.nama] = b.wajib ? undefined : "";
          break;
        }
        if (!tanggalSah(s)) salah("Tanggal tidak sah.");
        hasil[b.nama] = s;
        break;
      }
      case "angka": {
        const s = sebagaiTeks(v).trim().replace(",", ".");
        if (!s) {
          if (b.wajib) salah("Wajib diisi.");
          hasil[b.nama] = undefined;
          break;
        }
        const n = Number(s);
        if (!Number.isFinite(n)) {
          salah("Harus berupa angka.");
          break;
        }
        if (b.min !== undefined && n < b.min) salah(`Minimal ${b.min}.`);
        if (b.max !== undefined && n > b.max) salah(`Maksimal ${b.max}.`);
        hasil[b.nama] = n;
        break;
      }
      case "pilihan": {
        const s = sebagaiTeks(v).trim();
        const daftar = b.opsi.map((o) => opsiNormal(o).nilai);
        if (!s) {
          if (b.wajib) salah("Pilih salah satu.");
          hasil[b.nama] = undefined;
          break;
        }
        if (!daftar.includes(s)) salah("Pilihan tidak tersedia.");
        hasil[b.nama] = s;
        break;
      }
      case "saklar":
        hasil[b.nama] = v === true || v === "true" || v === "on";
        break;
      case "paragraf":
      case "daftarTeks":
      case "galeri": {
        const arr = (Array.isArray(v) ? v : typeof v === "string" ? [v] : [])
          .map((x) => (b.jenis === "paragraf" ? sebagaiTeks(x).replace(/\r\n/g, "\n").trim() : sebagaiTeks(x).replace(/\s+/g, " ").trim()))
          .filter(Boolean);
        if (b.wajib && arr.length === 0) salah(b.jenis === "galeri" ? "Tambahkan minimal satu foto." : "Isi minimal satu baris.");
        hasil[b.nama] = arr;
        break;
      }
      case "grup": {
        if (!b.wajib && kosong(v)) {
          hasil[b.nama] = undefined;
          break;
        }
        hasil[b.nama] = validasi(b.bidang, v, galat, `${kunci}.`);
        break;
      }
      case "daftar": {
        const arr = Array.isArray(v) ? v : [];
        const bersih: Rekaman[] = [];
        arr.forEach((item) => {
          if (kosong(item)) return;
          bersih.push(validasi(b.bidang, item, galat, `${kunci}.${bersih.length}.`));
        });
        if (b.wajib && bersih.length === 0) salah(`Tambahkan minimal satu ${b.labelItem.toLowerCase()}.`);
        if (b.maksItem && bersih.length > b.maksItem) salah(`Maksimal ${b.maksItem} ${b.labelItem.toLowerCase()}.`);
        hasil[b.nama] = bersih;
        break;
      }
    }
  }
  return hasil;
}

/** Gabungkan hasil validasi ke objek lama: kunci yang tak dikenal skema tetap dipertahankan. */
export function gabung<T extends Rekaman>(lama: T | Rekaman, baru: Rekaman): T {
  const hasil: Rekaman = { ...lama };
  for (const [k, v] of Object.entries(baru)) {
    if (v === undefined) delete hasil[k];
    else hasil[k] = v;
  }
  return hasil as T;
}

/** Semua bidang (rata) dari daftar bagian, untuk validasi dokumen. */
export const ratakan = (bagian: { bidang: Bidang[] }[]) => bagian.flatMap((b) => b.bidang);
