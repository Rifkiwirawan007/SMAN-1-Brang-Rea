import "server-only";

/**
 * Pembatas laju sederhana di memori (per proses server).
 * Cukup untuk satu server sekolah; data hilang saat server dimulai ulang.
 */
type Global = typeof globalThis & { __batasLaju?: Map<string, number[]> };
const g = globalThis as Global;
const catatan: Map<string, number[]> = (g.__batasLaju ??= new Map<string, number[]>());

/**
 * Catat satu percobaan untuk `kunci`. Mengembalikan false bila sudah melewati `maks` percobaan
 * dalam `jendelaMs` terakhir.
 */
export function bolehLanjut(kunci: string, maks: number, jendelaMs: number): boolean {
  const kini = Date.now();
  const daftar = (catatan.get(kunci) ?? []).filter((t) => kini - t < jendelaMs);
  if (daftar.length >= maks) {
    catatan.set(kunci, daftar);
    return false;
  }
  daftar.push(kini);
  catatan.set(kunci, daftar);
  return true;
}

/** Sisa waktu tunggu (ms) sampai percobaan tertua keluar dari jendela. */
export function sisaTunggu(kunci: string, jendelaMs: number): number {
  const daftar = catatan.get(kunci) ?? [];
  if (!daftar.length) return 0;
  return Math.max(0, jendelaMs - (Date.now() - daftar[0]));
}

export function hapusBatas(kunci: string) {
  catatan.delete(kunci);
}
