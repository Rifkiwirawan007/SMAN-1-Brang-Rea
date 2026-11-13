"use client";

import { createContext, use, useCallback, useEffect, useRef, useState } from "react";
import { CircleAlert, CircleCheck, Info, X } from "lucide-react";

/* ================= Toast (notifikasi kecil di pojok) ================= */

type JenisToast = "sukses" | "galat" | "info";
type Toast = { id: number; jenis: JenisToast; pesan: string };
type FungsiToast = (pesan: string, jenis?: JenisToast) => void;

const KonteksToast = createContext<FungsiToast | null>(null);

export function useToast(): FungsiToast {
  const f = use(KonteksToast);
  if (!f) throw new Error("useToast harus di dalam <PenyediaDasbor>");
  return f;
}

/* ================= Dialog konfirmasi ================= */

type OpsiKonfirmasi = { judul: string; pesan?: React.ReactNode; tombol?: string; bahaya?: boolean };
type FungsiKonfirmasi = (o: OpsiKonfirmasi) => Promise<boolean>;
const KonteksKonfirmasi = createContext<FungsiKonfirmasi | null>(null);

export function useKonfirmasi(): FungsiKonfirmasi {
  const f = use(KonteksKonfirmasi);
  if (!f) throw new Error("useKonfirmasi harus di dalam <PenyediaDasbor>");
  return f;
}

export function PenyediaDasbor({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<Toast[]>([]);
  const nomor = useRef(0);

  const tampil = useCallback<FungsiToast>((pesan, jenis = "sukses") => {
    const id = ++nomor.current;
    setToast((t) => [...t.slice(-3), { id, jenis, pesan }]);
    setTimeout(() => setToast((t) => t.filter((x) => x.id !== id)), jenis === "galat" ? 7000 : 4000);
  }, []);

  const [dialog, setDialog] = useState<(OpsiKonfirmasi & { selesai: (v: boolean) => void }) | null>(null);
  const refDialog = useRef<HTMLDialogElement>(null);
  const konfirmasi = useCallback<FungsiKonfirmasi>((o) => new Promise((selesai) => setDialog({ ...o, selesai })), []);

  useEffect(() => {
    if (dialog && refDialog.current && !refDialog.current.open) refDialog.current.showModal();
  }, [dialog]);

  const tutup = (v: boolean) => {
    dialog?.selesai(v);
    refDialog.current?.close();
    setDialog(null);
  };

  return (
    <KonteksToast value={tampil}>
      <KonteksKonfirmasi value={konfirmasi}>
        {children}

        <dialog
          ref={refDialog}
          className="d-dialog w-[min(92vw,440px)]"
          onCancel={(e) => {
            e.preventDefault();
            tutup(false);
          }}
          aria-labelledby="judul-konfirmasi"
        >
          {dialog && (
            <div className="p-6">
              <h2 id="judul-konfirmasi" className="text-lg font-semibold text-ink">
                {dialog.judul}
              </h2>
              {dialog.pesan && <div className="mt-2 text-sm leading-relaxed text-ink-2">{dialog.pesan}</div>}
              <div className="mt-6 flex justify-end gap-2">
                <button type="button" className="d-btn d-btn-garis" onClick={() => tutup(false)} autoFocus>
                  Batal
                </button>
                <button type="button" className={`d-btn ${dialog.bahaya ? "d-btn-bahaya" : "d-btn-utama"}`} onClick={() => tutup(true)}>
                  {dialog.tombol ?? "Lanjutkan"}
                </button>
              </div>
            </div>
          )}
        </dialog>

        <div className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex flex-col items-end gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6" aria-live="polite">
          {toast.map((t) => {
            const Ikon = t.jenis === "sukses" ? CircleCheck : t.jenis === "galat" ? CircleAlert : Info;
            return (
              <div
                key={t.id}
                role={t.jenis === "galat" ? "alert" : "status"}
                className="d-toast pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink shadow-[0_16px_40px_-16px_rgb(6_16_11/0.35)]"
              >
                <Ikon
                  size={18}
                  aria-hidden="true"
                  className={`mt-0.5 shrink-0 ${t.jenis === "sukses" ? "text-brand" : t.jenis === "galat" ? "text-[#b42318]" : "text-sky"}`}
                />
                <p className="min-w-0 flex-1 leading-snug">{t.pesan}</p>
                <button
                  type="button"
                  className="-mr-1 shrink-0 rounded p-0.5 text-muted hover:text-ink"
                  onClick={() => setToast((x) => x.filter((y) => y.id !== t.id))}
                  aria-label="Tutup notifikasi"
                >
                  <X size={16} aria-hidden="true" />
                </button>
              </div>
            );
          })}
        </div>
      </KonteksKonfirmasi>
    </KonteksToast>
  );
}
