import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { cookies, headers } from "next/headers";
import { DIR_PRIVAT } from "@/lib/server/penyimpanan";

/**
 * Sesi login dashboard: cookie httpOnly berisi {id pengguna, versi sesi, kedaluwarsa} yang ditandatangani HMAC.
 * Kunci rahasia diambil dari env ADMIN_RAHASIA, atau dibuat otomatis di data/privat/rahasia.txt.
 */
export const NAMA_COOKIE = "sesi_dasbor";
const JAM = 60 * 60;

type Global = typeof globalThis & { __rahasiaSesi?: Buffer };
const g = globalThis as Global;

function rahasia(): Buffer {
  if (g.__rahasiaSesi) return g.__rahasiaSesi;
  const env = process.env.ADMIN_RAHASIA;
  if (env && env.length >= 32) return (g.__rahasiaSesi = Buffer.from(env));
  const file = path.join(DIR_PRIVAT, "rahasia.txt");
  try {
    const isi = readFileSync(file, "utf8").trim();
    if (isi.length >= 32) return (g.__rahasiaSesi = Buffer.from(isi));
  } catch {
    /* belum ada: buat baru */
  }
  const baru = randomBytes(48).toString("hex");
  mkdirSync(DIR_PRIVAT, { recursive: true });
  writeFileSync(file, baru + "\n", { mode: 0o600 });
  return (g.__rahasiaSesi = Buffer.from(baru));
}

export type IsiSesi = { u: string; v: number; e: number };

const b64 = (b: Buffer | string) => Buffer.from(b).toString("base64url");
const tanda = (data: string) => createHmac("sha256", rahasia()).update(data).digest();

export function buatToken(isi: IsiSesi): string {
  const data = b64(JSON.stringify(isi));
  return `${data}.${b64(tanda(data))}`;
}

export function bacaToken(token: string | undefined): IsiSesi | null {
  if (!token) return null;
  const [data, sig] = token.split(".");
  if (!data || !sig) return null;
  const harap = tanda(data);
  const dapat = Buffer.from(sig, "base64url");
  if (dapat.length !== harap.length || !timingSafeEqual(dapat, harap)) return null;
  try {
    const isi = JSON.parse(Buffer.from(data, "base64url").toString("utf8")) as IsiSesi;
    if (typeof isi.u !== "string" || typeof isi.e !== "number" || isi.e < Date.now()) return null;
    return isi;
  } catch {
    return null;
  }
}

async function pakaiHttps() {
  const h = await headers();
  const proto = h.get("x-forwarded-proto");
  if (proto) return proto.split(",")[0].trim() === "https";
  return (h.get("origin") ?? h.get("referer") ?? "").startsWith("https:");
}

/** Pasang cookie sesi. `ingat` = 30 hari, selain itu 12 jam. */
export async function pasangSesi(idPengguna: string, versi: number, ingat: boolean) {
  const umur = ingat ? 30 * 24 * JAM : 12 * JAM;
  const token = buatToken({ u: idPengguna, v: versi, e: Date.now() + umur * 1000 });
  (await cookies()).set(NAMA_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: await pakaiHttps(),
    path: "/",
    maxAge: umur,
  });
}

export async function bacaSesi(): Promise<IsiSesi | null> {
  return bacaToken((await cookies()).get(NAMA_COOKIE)?.value);
}

export async function hapusSesi() {
  (await cookies()).delete(NAMA_COOKIE);
}
