"use server";

import { updateTag } from "next/cache";
import { bacaDokumen, idBaru, tulisDokumen, ubahKoleksi } from "@/lib/server/penyimpanan";
import { penggunaSaatIni, type PenggunaAman } from "@/lib/server/pengguna";
import { catatAktivitas } from "@/lib/server/aktivitas";
import { ukuranGambar } from "@/lib/server/media";
import { boleh } from "@/lib/cms/peran";
import { DOKUMEN, KOLEKSI, type ModulKoleksi } from "@/lib/cms/modul";
import { gabung, ratakan, validasi, type Galat, type Rekaman } from "@/lib/cms/bidang";
import { jadikanSlug } from "@/lib/konten/util";
import { NAMA_DOKUMEN, NAMA_KOLEKSI, tagKonten, type NamaDokumen, type NamaKoleksi, type Status } from "@/lib/konten/tipe";

export type HasilAksi = { ok: true; id?: string; pesan: string; data?: Rekaman } | { ok: false; pesan: string; galat?: Galat };

/** Pengguna yang sah untuk modul ini, atau pesan galat (string). */
async function akses(modul: string): Promise<PenggunaAman | string> {
  const p = await penggunaSaatIni();
  if (!p) return "Sesi Anda berakhir. Muat ulang halaman, lalu masuk lagi.";
  if (!boleh(p.peran, modul)) return "Akun Anda tidak punya akses ke bagian ini.";
  return p;
}

const koleksiSah = (k: string): k is NamaKoleksi => (NAMA_KOLEKSI as string[]).includes(k);
const dokumenSah = (k: string): k is NamaDokumen => (NAMA_DOKUMEN as string[]).includes(k);
const gagal = (pesan: string, galat?: Galat): HasilAksi => ({ ok: false, pesan, galat });

type ItemTersimpan = Rekaman & { id: string; dibuat?: string; diubah?: string; oleh?: string; status?: Status };

/** Pastikan slug unik di antara item lain (menambah -2, -3, ... bila perlu). */
function slugUnik(dasar: string, daftar: ItemTersimpan[], kecualiId: string | null) {
  const terpakai = new Set(daftar.filter((x) => x.id !== kecualiId).map((x) => String(x.slug ?? "")));
  let slug = dasar || "tanpa-judul";
  for (let i = 2; terpakai.has(slug); i++) slug = `${dasar}-${i}`;
  return slug;
}

function terapkanSlug(modul: ModulKoleksi, item: Rekaman, daftar: ItemTersimpan[], id: string | null) {
  for (const b of modul.bidang) {
    if (b.jenis !== "slug") continue;
    const dasar = jadikanSlug(String(item[b.nama] || item[b.dari] || ""));
    item[b.nama] = slugUnik(dasar, daftar, id);
  }
}

const judulItem = (modul: ModulKoleksi, x: Rekaman) => {
  try {
    return modul.judul(x as never) || "(tanpa judul)";
  } catch {
    return "(tanpa judul)";
  }
};

/** Galeri: isi ukuran asli foto (w, h) supaya tata letak galeri tidak melompat. */
async function lengkapiUkuran(nama: NamaKoleksi, item: Rekaman, lama?: Rekaman) {
  if (nama !== "galeri" || !item.src) return;
  if (lama && lama.src === item.src && lama.w) return;
  const u = await ukuranGambar(String(item.src));
  item.w = u?.w ?? 1200;
  item.h = u?.h ?? 900;
}

/** Simpan item baru (id = null) atau ubah item lama. `status` hanya untuk modul yang punya draf/terbit. */
export async function simpanItem(kunci: string, id: string | null, data: Rekaman, status?: Status): Promise<HasilAksi> {
  if (!koleksiSah(kunci)) return gagal("Modul tidak dikenal.");
  const p = await akses(kunci);
  if (typeof p === "string") return gagal(p);
  const modul = KOLEKSI[kunci];

  const galat: Galat = {};
  const bersih = validasi(modul.bidang, data, galat);
  Object.assign(galat, modul.cek?.(bersih) ?? {});
  if (Object.keys(galat).length) return gagal("Ada isian yang perlu diperbaiki.", galat);

  const kini = new Date().toISOString();
  let hasilId = id;
  let lamaAda = true;
  let lamaItem: ItemTersimpan | undefined;
  let tersimpan: ItemTersimpan | undefined;
  if (kunci === "galeri") {
    // Ukuran foto dihitung di luar kunci file (membaca gambar bisa agak lama).
    await lengkapiUkuran(kunci, bersih);
  }

  await ubahKoleksi(kunci, (daftarAsli) => {
    const daftar = daftarAsli as unknown as ItemTersimpan[];
    terapkanSlug(modul, bersih, daftar, id);
    if (id) {
      const i = daftar.findIndex((x) => x.id === id);
      if (i < 0) {
        lamaAda = false;
        return daftarAsli;
      }
      lamaItem = daftar[i];
      const baru = gabung<ItemTersimpan>(daftar[i], bersih);
      baru.diubah = kini;
      baru.oleh = p.nama;
      if (modul.status && status) baru.status = status;
      daftar[i] = baru;
      tersimpan = baru;
    } else {
      const baru: ItemTersimpan = { id: idBaru(), dibuat: kini, diubah: kini, oleh: p.nama, ...bersih };
      for (const k of Object.keys(baru)) if (baru[k] === undefined) delete baru[k];
      if (modul.status) baru.status = status ?? "draf";
      hasilId = baru.id;
      tersimpan = baru;
      if (modul.urutan === "manual") daftar.unshift(baru);
      else daftar.push(baru);
    }
    return daftar as never;
  });

  if (!lamaAda) return gagal("Item tidak ditemukan. Mungkin sudah dihapus oleh pengguna lain.");
  updateTag(tagKonten(kunci));

  const judul = judulItem(modul, bersih);
  const aksi = !id ? "buat" : status && lamaItem?.status !== status ? (status === "terbit" ? "terbit" : "draf") : "ubah";
  await catatAktivitas(p, aksi, kunci, { target: judul, targetId: hasilId ?? undefined });

  const pesan =
    aksi === "terbit" || (!id && status === "terbit")
      ? `“${judul}” diterbitkan.`
      : !id
        ? modul.status && status !== "terbit"
          ? `Draf “${judul}” tersimpan.`
          : `“${judul}” ditambahkan.`
        : aksi === "draf"
          ? `“${judul}” dijadikan draf (tidak tampil di situs).`
          : "Perubahan tersimpan.";
  return { ok: true, id: hasilId ?? undefined, pesan, data: tersimpan };
}

export async function hapusItem(kunci: string, ids: string[]): Promise<HasilAksi> {
  if (!koleksiSah(kunci)) return gagal("Modul tidak dikenal.");
  const p = await akses(kunci);
  if (typeof p === "string") return gagal(p);
  const modul = KOLEKSI[kunci];
  const set = new Set(ids);
  const terhapus: Rekaman[] = [];
  await ubahKoleksi(kunci, (daftar) =>
    daftar.filter((x) => {
      if (!set.has(x.id)) return true;
      terhapus.push(x as unknown as Rekaman);
      return false;
    }),
  );
  if (!terhapus.length) return gagal("Tidak ada item yang dihapus.");
  updateTag(tagKonten(kunci));
  for (const x of terhapus) await catatAktivitas(p, "hapus", kunci, { target: judulItem(modul, x), targetId: String(x.id) });
  return { ok: true, pesan: terhapus.length === 1 ? `“${judulItem(modul, terhapus[0])}” dihapus.` : `${terhapus.length} ${modul.satuan} dihapus.` };
}

export async function aturStatus(kunci: string, ids: string[], status: Status): Promise<HasilAksi> {
  if (!koleksiSah(kunci)) return gagal("Modul tidak dikenal.");
  const p = await akses(kunci);
  if (typeof p === "string") return gagal(p);
  const modul = KOLEKSI[kunci];
  if (!modul.status) return gagal("Modul ini tidak memakai draf.");
  const set = new Set(ids);
  const kini = new Date().toISOString();
  const berubah: Rekaman[] = [];
  await ubahKoleksi(kunci, (daftar) =>
    daftar.map((x) => {
      const item = x as unknown as ItemTersimpan;
      if (!set.has(item.id) || item.status === status) return x;
      berubah.push(item);
      return { ...item, status, diubah: kini, oleh: p.nama } as never;
    }),
  );
  updateTag(tagKonten(kunci));
  for (const x of berubah) await catatAktivitas(p, status === "terbit" ? "terbit" : "draf", kunci, { target: judulItem(modul, x), targetId: String(x.id) });
  const n = berubah.length;
  return { ok: true, pesan: n === 0 ? "Tidak ada perubahan." : status === "terbit" ? `${n} ${modul.satuan} diterbitkan.` : `${n} ${modul.satuan} dijadikan draf.` };
}

export async function duplikatItem(kunci: string, id: string): Promise<HasilAksi> {
  if (!koleksiSah(kunci)) return gagal("Modul tidak dikenal.");
  const p = await akses(kunci);
  if (typeof p === "string") return gagal(p);
  const modul = KOLEKSI[kunci];
  const kini = new Date().toISOString();
  let baruId: string | null = null;
  let judul = "";
  await ubahKoleksi(kunci, (daftarAsli) => {
    const daftar = daftarAsli as unknown as ItemTersimpan[];
    const i = daftar.findIndex((x) => x.id === id);
    if (i < 0) return daftarAsli;
    const salinan: ItemTersimpan = { ...structuredClone(daftar[i]), id: idBaru(), dibuat: kini, diubah: kini, oleh: p.nama };
    for (const b of modul.bidang) {
      if (b.jenis === "slug") salinan[b.nama] = slugUnik(`${String(daftar[i][b.nama] ?? "salinan")}-salinan`, daftar, null);
    }
    const kunciJudul = ["judul", "nama"].find((k) => typeof salinan[k] === "string");
    if (kunciJudul) salinan[kunciJudul] = `${salinan[kunciJudul]} (salinan)`;
    if (modul.status) salinan.status = "draf";
    if (kunci === "hero") salinan.aktif = false;
    daftar.splice(i + 1, 0, salinan);
    baruId = salinan.id;
    judul = judulItem(modul, salinan);
    return daftar as never;
  });
  if (!baruId) return gagal("Item tidak ditemukan.");
  updateTag(tagKonten(kunci));
  await catatAktivitas(p, "duplikat", kunci, { target: judul, targetId: baruId });
  return { ok: true, id: baruId, pesan: `Salinan dibuat${modul.status ? " sebagai draf" : ""}.` };
}

/** Simpan urutan baru (untuk modul berurutan manual). */
export async function simpanUrutan(kunci: string, ids: string[]): Promise<HasilAksi> {
  if (!koleksiSah(kunci)) return gagal("Modul tidak dikenal.");
  const p = await akses(kunci);
  if (typeof p === "string") return gagal(p);
  const modul = KOLEKSI[kunci];
  await ubahKoleksi(kunci, (daftar) => {
    const peta = new Map(daftar.map((x) => [x.id, x]));
    const urut = ids.map((i) => peta.get(i)).filter((x): x is (typeof daftar)[number] => !!x);
    const sisa = daftar.filter((x) => !ids.includes(x.id));
    return [...urut, ...sisa];
  });
  updateTag(tagKonten(kunci));
  await catatAktivitas(p, "urutkan", kunci, { ket: `Urutan ${modul.label.toLowerCase()} diubah` });
  return { ok: true, pesan: "Urutan tersimpan. Situs memakai urutan ini." };
}

/** Tambah banyak item sekaligus (unggah massal galeri). */
export async function tambahBanyak(kunci: string, items: Rekaman[]): Promise<HasilAksi> {
  if (!koleksiSah(kunci)) return gagal("Modul tidak dikenal.");
  const p = await akses(kunci);
  if (typeof p === "string") return gagal(p);
  const modul = KOLEKSI[kunci];
  if (!modul.unggahMassal) return gagal("Modul ini tidak mendukung unggah massal.");
  const kini = new Date().toISOString();
  const siap: ItemTersimpan[] = [];
  for (const data of items.slice(0, 100)) {
    const galat: Galat = {};
    const bersih = validasi(modul.bidang, data, galat);
    if (Object.keys(galat).length) return gagal("Sebagian data foto tidak lengkap.", galat);
    await lengkapiUkuran(kunci, bersih);
    siap.push({ id: idBaru(), dibuat: kini, diubah: kini, oleh: p.nama, ...bersih });
  }
  await ubahKoleksi(kunci, (daftar) => [...(siap as never[]), ...daftar]);
  updateTag(tagKonten(kunci));
  await catatAktivitas(p, "buat", kunci, { ket: `${siap.length} ${modul.satuan} ditambahkan sekaligus` });
  return { ok: true, pesan: `${siap.length} ${modul.satuan} ditambahkan.` };
}

export async function simpanDokumen(kunci: string, data: Rekaman): Promise<HasilAksi> {
  if (!dokumenSah(kunci)) return gagal("Halaman tidak dikenal.");
  const p = await akses(kunci);
  if (typeof p === "string") return gagal(p);
  const modul = DOKUMEN[kunci];
  const galat: Galat = {};
  const bersih = validasi(ratakan(modul.bagian), data, galat);
  if (Object.keys(galat).length) return gagal("Ada isian yang perlu diperbaiki.", galat);
  const lama = (await bacaDokumen(kunci)) as unknown as Rekaman;
  const baru = gabung<Rekaman>(lama, bersih);
  await tulisDokumen(kunci, baru as never);
  updateTag(tagKonten(kunci));
  await catatAktivitas(p, "ubah", kunci, { target: modul.label });
  return { ok: true, pesan: `${modul.label} tersimpan.`, data: baru };
}
