// Reset kata sandi akun dashboard dari terminal (kalau lupa sandi).
// Pakai:  node scripts/reset-sandi.mjs            -> tampilkan daftar username
//         node scripts/reset-sandi.mjs rifkiadmin -> ganti sandi akun itu
import { readFile, writeFile } from "node:fs/promises";
import { randomBytes, scrypt } from "node:crypto";
import { fileURLToPath } from "node:url";
import path from "node:path";

const FILE = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "data", "privat", "pengguna.json");
const N = 16384, R = 8, P = 1, PANJANG = 64;

function hashSandi(sandi) {
  const garam = randomBytes(16);
  return new Promise((ok, gagal) =>
    scrypt(sandi.normalize("NFKC"), garam, PANJANG, { N, r: R, p: P, maxmem: 64 * 1024 * 1024 }, (e, k) =>
      e ? gagal(e) : ok(`scrypt$${N}$${R}$${P}$${garam.toString("base64")}$${k.toString("base64")}`),
    ),
  );
}

// Input tersembunyi (sandi tidak terlihat saat diketik).
function tanyaRahasia(label) {
  return new Promise((ok) => {
    const { stdin, stdout } = process;
    stdout.write(label);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");
    let isi = "";
    const dengar = (c) => {
      if (c === "\r" || c === "\n") {
        stdin.setRawMode(false); stdin.pause(); stdin.off("data", dengar);
        stdout.write("\n"); ok(isi);
      } else if (c === "\u0003") { stdout.write("\nBatal.\n"); process.exit(1); }
      else if (c === "\u007f" || c === "\b") isi = isi.slice(0, -1);
      else isi += c;
    };
    stdin.on("data", dengar);
  });
}

const semua = JSON.parse(await readFile(FILE, "utf8"));
const username = (process.argv[2] ?? "").trim().toLowerCase();

if (!username) {
  console.log("Akun yang terdaftar:");
  for (const p of semua) console.log(`  - ${p.username}  (${p.nama}, ${p.peran}${p.aktif ? "" : ", NONAKTIF"})`);
  console.log("\nGanti sandi:  node scripts/reset-sandi.mjs <username>");
  process.exit(0);
}

const p = semua.find((x) => x.username === username);
if (!p) { console.error(`Username "${username}" tidak ada.`); process.exit(1); }

const sandi = await tanyaRahasia("Sandi baru: ");
if (sandi.length < 8 || !/[a-zA-Z]/.test(sandi) || !/\d/.test(sandi)) {
  console.error("Sandi minimal 8 karakter dan harus ada huruf + angka."); process.exit(1);
}
if ((await tanyaRahasia("Ulangi sandi: ")) !== sandi) { console.error("Sandi tidak sama."); process.exit(1); }

p.hashSandi = await hashSandi(sandi);
p.versiSesi = (p.versiSesi ?? 1) + 1; // keluarkan sesi lama
p.aktif = true;
await writeFile(FILE, JSON.stringify(semua, null, 2));
console.log(`Sandi akun "${username}" berhasil diganti. Silakan masuk di /masuk.`);
