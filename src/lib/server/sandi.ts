import "server-only";
import { randomBytes, scrypt, timingSafeEqual, type ScryptOptions } from "node:crypto";

/** Hash kata sandi dengan scrypt (bawaan Node, tanpa dependensi tambahan). */
const N = 16384;
const R = 8;
const P = 1;
const PANJANG = 64;

function turunkan(sandi: string, garam: Buffer, opsi: ScryptOptions): Promise<Buffer> {
  return new Promise((ok, gagal) =>
    scrypt(sandi.normalize("NFKC"), garam, PANJANG, { ...opsi, maxmem: 64 * 1024 * 1024 }, (e, kunci) => (e ? gagal(e) : ok(kunci))),
  );
}

export async function hashSandi(sandi: string): Promise<string> {
  const garam = randomBytes(16);
  const kunci = await turunkan(sandi, garam, { N, r: R, p: P });
  return `scrypt$${N}$${R}$${P}$${garam.toString("base64")}$${kunci.toString("base64")}`;
}

export async function cocokSandi(sandi: string, tersimpan: string): Promise<boolean> {
  const [algo, n, r, p, garam, hash] = tersimpan.split("$");
  if (algo !== "scrypt" || !garam || !hash) return false;
  const harap = Buffer.from(hash, "base64");
  const kunci = await turunkan(sandi, Buffer.from(garam, "base64"), { N: Number(n), r: Number(r), p: Number(p) });
  return kunci.length === harap.length && timingSafeEqual(kunci, harap);
}

/** Aturan kata sandi: minimal 8 karakter, ada huruf dan angka. Mengembalikan pesan galat atau null. */
export function cekKekuatanSandi(sandi: string): string | null {
  if (sandi.length < 8) return "Kata sandi minimal 8 karakter.";
  if (sandi.length > 128) return "Kata sandi terlalu panjang (maks. 128 karakter).";
  if (!/[a-zA-Z]/.test(sandi) || !/\d/.test(sandi)) return "Kata sandi harus memuat huruf dan angka.";
  return null;
}
