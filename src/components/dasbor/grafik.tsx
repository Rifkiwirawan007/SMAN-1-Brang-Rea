/** Grafik sederhana berbasis SVG/HTML (tanpa pustaka, aman di Server Component). */

const formatAngka = (n: number) => new Intl.NumberFormat("id-ID").format(n);
const labelTanggal = (iso: string, panjang = false) =>
  new Intl.DateTimeFormat("id-ID", panjang ? { weekday: "long", day: "numeric", month: "long" } : { day: "numeric", month: "short" }).format(
    new Date(`${iso}T12:00:00+08:00`),
  );

/** Grafik batang harian: tayangan (batang) + pengunjung unik (garis titik). */
export function GrafikHarian({ seri, tinggi = 180 }: { seri: { tanggal: string; tampil: number; unik: number }[]; tinggi?: number }) {
  const maks = Math.max(4, ...seri.map((s) => s.tampil));
  const langkah = Math.pow(10, Math.floor(Math.log10(maks)));
  const atas = Math.ceil(maks / langkah) * langkah;
  const garis = [0, 0.5, 1].map((f) => Math.round(atas * f));
  const tiapLabel = Math.ceil(seri.length / 8);

  return (
    <div>
      <div className="flex gap-2">
        <div className="relative w-8 shrink-0 text-right text-[0.625rem] tabular-nums text-muted" style={{ height: tinggi }}>
          {garis.map((g) => (
            <span key={g} className="absolute right-0 -translate-y-1/2" style={{ top: `${100 - (g / atas) * 100}%` }}>
              {formatAngka(g)}
            </span>
          ))}
        </div>
        <div className="relative min-w-0 flex-1" style={{ height: tinggi }}>
          {garis.map((g) => (
            <div key={g} className="absolute inset-x-0 border-t border-dashed border-line" style={{ top: `${100 - (g / atas) * 100}%` }} />
          ))}
          <div className="absolute inset-0 flex items-end gap-[3px]">
            {seri.map((s) => (
              <div key={s.tanggal} className="group relative flex h-full flex-1 items-end">
                <div
                  className="w-full rounded-t-[3px] bg-brand/80 transition-colors group-hover:bg-brand"
                  style={{ height: `${(s.tampil / atas) * 100}%`, minHeight: s.tampil ? 2 : 0 }}
                />
                <div
                  className="absolute left-1/2 h-1.5 w-1.5 -translate-x-1/2 translate-y-1/2 rounded-full bg-sun"
                  style={{ bottom: `${(s.unik / atas) * 100}%` }}
                  aria-hidden="true"
                />
                <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-ink px-2.5 py-1.5 text-[0.6875rem] leading-snug text-white shadow-lg group-hover:block">
                  <span className="block font-semibold">{labelTanggal(s.tanggal, true)}</span>
                  {formatAngka(s.tampil)} tayangan · {formatAngka(s.unik)} pengunjung
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="ml-10 mt-1.5 flex gap-[3px] text-[0.625rem] text-muted">
        {seri.map((s, i) => (
          <span key={s.tanggal} className="flex-1 truncate text-center">
            {i % tiapLabel === 0 ? labelTanggal(s.tanggal) : ""}
          </span>
        ))}
      </div>
      <div className="ml-10 mt-3 flex flex-wrap gap-4 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-brand/80" /> Tayangan halaman
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-sun" /> Pengunjung unik
        </span>
      </div>
      <table className="sr-only">
        <caption>Kunjungan harian</caption>
        <thead>
          <tr>
            <th>Tanggal</th>
            <th>Tayangan</th>
            <th>Pengunjung</th>
          </tr>
        </thead>
        <tbody>
          {seri.map((s) => (
            <tr key={s.tanggal}>
              <td>{labelTanggal(s.tanggal, true)}</td>
              <td>{s.tampil}</td>
              <td>{s.unik}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Daftar batang horizontal (halaman populer, sumber kunjungan). */
export function BatangHorizontal({ data, kosong = "Belum ada data." }: { data: { label: string; nilai: number; href?: string }[]; kosong?: string }) {
  if (!data.length) return <p className="py-6 text-center text-sm text-muted">{kosong}</p>;
  const maks = Math.max(...data.map((d) => d.nilai));
  return (
    <ul className="flex flex-col gap-2">
      {data.map((d) => (
        <li key={d.label} className="relative overflow-hidden rounded-lg">
          <div className="absolute inset-y-0 left-0 rounded-lg bg-brand-soft" style={{ width: `${(d.nilai / maks) * 100}%` }} aria-hidden="true" />
          <div className="relative flex items-center justify-between gap-3 px-3 py-1.5 text-sm">
            {d.href ? (
              <a href={d.href} target="_blank" rel="noopener noreferrer" className="min-w-0 truncate text-ink hover:text-brand hover:underline">
                {d.label}
              </a>
            ) : (
              <span className="min-w-0 truncate text-ink">{d.label}</span>
            )}
            <span className="shrink-0 font-semibold tabular-nums text-ink">{formatAngka(d.nilai)}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}

export { formatAngka };
