"use client";

import { createContext, use } from "react";
import type { Sekolah } from "@/lib/konten/tipe";

/**
 * Data sekolah + pengaturan tampilan untuk komponen klien situs publik.
 * Disediakan sekali di app/(situs)/layout.tsx dari ambilSekolah().
 */
const KonteksSitus = createContext<Sekolah | null>(null);

export function SitusProvider({ sekolah, children }: { sekolah: Sekolah; children: React.ReactNode }) {
  return <KonteksSitus value={sekolah}>{children}</KonteksSitus>;
}

/** Data sekolah (nama, kontak, alamat, dst.). Hanya untuk komponen di dalam SitusProvider. */
export function useSekolah(): Sekolah {
  const s = use(KonteksSitus);
  if (!s) throw new Error("useSekolah() harus dipakai di dalam <SitusProvider>");
  return s;
}

/** true bila label "Contoh" boleh tampil. Di luar provider (mis. halaman 404 tanpa data) dianggap true. */
export function useLabelContoh(): boolean {
  const s = use(KonteksSitus);
  return s ? s.tampilkanLabelContoh !== false : true;
}
