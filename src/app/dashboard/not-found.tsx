import Link from "next/link";
import { SearchX } from "lucide-react";

export default function TidakDitemukanDasbor() {
  return (
    <div className="d-kartu flex flex-col items-center px-6 py-16 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-paper-3 text-muted">
        <SearchX size={26} aria-hidden="true" />
      </span>
      <h1 className="mt-4 text-xl font-semibold text-ink">Halaman tidak ditemukan</h1>
      <p className="mt-1 max-w-[46ch] text-sm text-muted">Data mungkin sudah dihapus, atau alamatnya salah ketik.</p>
      <Link href="/dashboard" className="d-btn d-btn-utama mt-6">
        Kembali ke ringkasan
      </Link>
    </div>
  );
}
