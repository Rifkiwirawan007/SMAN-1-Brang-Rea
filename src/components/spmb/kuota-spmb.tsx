import type { Spmb } from "@/lib/konten/tipe";

/** Warna irisan grafik (gradasi hijau sekolah), berurutan sesuai daftar kuota di dashboard. */
const WARNA = ["#7cc49a", "#d4ecdd", "#4f9a6c", "#a9d8bb", "#3a8257", "#eef7f1", "#96cfad", "#5fae80"];

const persen = (n: number, total: number) => {
  const p = total ? (n / total) * 100 : 0;
  return `${p.toLocaleString("id-ID", { maximumFractionDigits: 1 })}%`;
};

/** Daya tampung SPMB: angka total, grafik donat (SVG murni, tanpa JS), dan rincian per jalur. */
export function KuotaSpmb({ spmb }: { spmb: Spmb }) {
  const kuota = (spmb.kuota ?? []).filter((k) => k.jumlah > 0);
  if (kuota.length === 0) return null;
  const total = kuota.reduce((s, k) => s + k.jumlah, 0);

  // Lingkaran keliling 100 → dasharray langsung dalam persen.
  const persenTiap = kuota.map((k) => (k.jumlah / total) * 100);
  const irisan = kuota.map((k, i) => ({
    ...k,
    p: persenTiap[i],
    awal: persenTiap.slice(0, i).reduce((s, p) => s + p, 0),
    warna: WARNA[i % WARNA.length],
  }));

  return (
    <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
      <div data-reveal className="relative mx-auto aspect-square w-full max-w-[380px]">
        <svg viewBox="0 0 42 42" className="h-full w-full -rotate-90" role="img" aria-label={`Grafik kuota: total ${total} kursi`}>
          <circle cx="21" cy="21" r="15.9155" fill="none" stroke="rgb(255 255 255 / 0.06)" strokeWidth="4.2" />
          {irisan.map((s) => (
            <circle
              key={s.nama}
              cx="21"
              cy="21"
              r="15.9155"
              fill="none"
              stroke={s.warna}
              strokeWidth="4.2"
              // Celah tipis antar-irisan supaya terlihat rapi.
              strokeDasharray={`${Math.max(s.p - 0.6, 0.2)} ${100 - Math.max(s.p - 0.6, 0.2)}`}
              strokeDashoffset={-s.awal}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.28em] text-aksen">Daya tampung</span>
          <span className="mt-2 text-[clamp(3.5rem,3rem+3vw,5.5rem)] font-extralight leading-none tracking-[-0.04em] text-white tabular-nums">{total}</span>
          <span className="mt-2 text-sm text-white/70">kursi murid baru</span>
        </div>
      </div>

      <ul data-reveal className="flex flex-col">
        {irisan.map((s) => (
          <li key={s.nama} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 border-b border-white/10 py-4 first:border-t">
            <span className="h-3 w-3 rounded-full" style={{ background: s.warna }} aria-hidden="true" />
            <span className="font-medium text-white">{s.nama}</span>
            <span className="text-right tabular-nums">
              <span className="text-xl font-semibold text-white">{s.jumlah}</span>
              <span className="ml-2 inline-block w-[3.5rem] text-sm text-aksen-terang/80">{persen(s.jumlah, total)}</span>
            </span>
            <span className="col-start-2 col-end-4 h-[3px] overflow-hidden rounded-full bg-white/8" aria-hidden="true">
              <span className="block h-full rounded-full" style={{ width: `${(s.jumlah / Math.max(...kuota.map((k) => k.jumlah))) * 100}%`, background: s.warna }} />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
