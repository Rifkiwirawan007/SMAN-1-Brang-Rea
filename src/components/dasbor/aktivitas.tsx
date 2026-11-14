import { FilePen, FilePlus2, FileX2, ImageUp, KeyRound, ListOrdered, LogIn, LogOut, Mail, Copy, Send, EyeOff, ShieldAlert, type LucideIcon } from "lucide-react";
import { cariModul } from "@/lib/cms/modul";
import type { Aktivitas, JenisAksi } from "@/lib/server/aktivitas";
import { waktuLengkap, waktuRelatif } from "@/components/dasbor/ui";

const IKON: Record<JenisAksi, LucideIcon> = {
  buat: FilePlus2,
  ubah: FilePen,
  hapus: FileX2,
  terbit: Send,
  draf: EyeOff,
  urutkan: ListOrdered,
  duplikat: Copy,
  unggah: ImageUp,
  masuk: LogIn,
  keluar: LogOut,
  "gagal-masuk": ShieldAlert,
  akun: KeyRound,
  pesan: Mail,
};

export const KATA_AKSI: Record<JenisAksi, string> = {
  buat: "menambahkan",
  ubah: "mengubah",
  hapus: "menghapus",
  terbit: "menerbitkan",
  draf: "menarik ke draf",
  urutkan: "mengatur urutan",
  duplikat: "menggandakan",
  unggah: "mengunggah foto",
  masuk: "masuk ke dashboard",
  keluar: "keluar dari dashboard",
  "gagal-masuk": "gagal masuk",
  akun: "mengelola akun",
  pesan: "memproses pesan",
};

const LABEL_LAIN: Record<string, string> = { akun: "Akun", pengguna: "Pengguna", pesan: "Pesan masuk", media: "Pustaka foto", absensi: "Absensi", siswa: "Data siswa", laporan: "Laporan siswa" };
export const labelModul = (k: string) => cariModul(k)?.label ?? LABEL_LAIN[k] ?? k;

export function BarisAktivitas({ a, ringkas = false }: { a: Aktivitas; ringkas?: boolean }) {
  const Ikon = IKON[a.aksi] ?? FilePen;
  const bahaya = a.aksi === "hapus" || a.aksi === "gagal-masuk";
  return (
    <li className="flex gap-3 py-3">
      <span className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg ${bahaya ? "bg-[#fef3f2] text-[#b42318]" : "bg-paper-3 text-ink-2"}`}>
        <Ikon size={16} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1 text-sm">
        <p className="leading-snug text-ink-2">
          <span className="font-semibold text-ink">{a.oleh?.nama ?? (a.aksi === "gagal-masuk" ? "Seseorang" : "Sistem")}</span> {KATA_AKSI[a.aksi]}
          {a.aksi !== "masuk" && a.aksi !== "keluar" && a.aksi !== "gagal-masuk" && (
            <>
              {" "}
              <span className="text-muted">di {labelModul(a.modul)}</span>
            </>
          )}
          {a.target && (
            <>
              {": "}
              <span className={`font-medium text-ink ${ringkas ? "line-clamp-1 inline" : ""}`}>{a.target}</span>
            </>
          )}
        </p>
        <p className="mt-0.5 text-xs text-muted" title={waktuLengkap(a.waktu)}>
          {waktuRelatif(a.waktu)}
          {a.ket && !ringkas && <> · {a.ket}</>}
        </p>
      </div>
    </li>
  );
}
