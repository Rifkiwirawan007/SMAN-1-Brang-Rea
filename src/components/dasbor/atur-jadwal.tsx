"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { CircleCheck, LoaderCircle, Plus, Trash2 } from "lucide-react";
import { HARI, LABEL_HARI, daftarKelasJadwal, type GuruMapel, type Hari, type Jadwal } from "@/lib/jadwal/tipe";
import { simpanJadwalPelajaran } from "@/app/dashboard/absen-kelas/aksi";
import { useToast } from "@/components/dasbor/penyedia";
import { Kartu } from "@/components/dasbor/ui";

type Akun = { id: string; nama: string; username: string };
type Tab = Hari | "guru" | "jam";

export function AturJadwal({ awal, akun }: { awal: Jadwal; akun: Akun[] }) {
  const router = useRouter();
  const toast = useToast();
  const [j, setJ] = useState<Jadwal>(awal);
  const [tab, setTab] = useState<Tab>("senin");
  const [sibuk, setSibuk] = useState(false);
  const [berubah, setBerubah] = useState(false);
  const kelas = useMemo(() => daftarKelasJadwal(j), [j]);
  const petaGuru = useMemo(() => new Map(j.guru.map((g) => [g.kode, g])), [j.guru]);

  const ubah = (fn: (d: Jadwal) => Jadwal) => {
    setJ((d) => fn(structuredClone(d)));
    setBerubah(true);
  };

  const simpan = async () => {
    setSibuk(true);
    const h = await simpanJadwalPelajaran(j);
    setSibuk(false);
    toast(h.pesan, h.ok ? "sukses" : "galat");
    if (h.ok) {
      setBerubah(false);
      router.refresh();
    }
  };

  const tabs: { k: Tab; label: string }[] = [...HARI.map((h) => ({ k: h as Tab, label: LABEL_HARI[h] })), { k: "guru", label: "Kode guru & wali" }, { k: "jam", label: "Jam pelajaran" }];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="d-label">Tahun ajaran</span>
          <input className="d-input w-32" value={j.tahunAjaran} onChange={(e) => ubah((d) => ({ ...d, tahunAjaran: e.target.value }))} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="d-label">Semester</span>
          <select className="d-input w-auto" value={j.semester} onChange={(e) => ubah((d) => ({ ...d, semester: e.target.value }))}>
            <option>Ganjil</option>
            <option>Genap</option>
          </select>
        </label>
        {j.diubah && <p className="pb-2 text-xs text-muted">Terakhir diubah {j.diubah.oleh}</p>}
      </div>

      <div className="flex flex-wrap gap-1.5" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.k}
            type="button"
            role="tab"
            aria-selected={tab === t.k}
            onClick={() => setTab(t.k)}
            className={`rounded-full border px-3.5 py-1.5 text-sm ${tab === t.k ? "border-brand bg-brand text-white" : "border-line bg-white text-ink hover:bg-paper-2"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {HARI.includes(tab as Hari) && (
        <Kartu
          judul={`Jadwal ${LABEL_HARI[tab as Hari]}`}
          deskripsi="Ketik kode guru (KG). Kosongkan / 0 bila tidak ada pelajaran. Arahkan kursor ke sel untuk melihat nama guru & mapel."
          isiClassName=""
        >
          <div className="overflow-x-auto">
            <table className="d-tabel text-sm">
              <thead>
                <tr>
                  <th>Jam</th>
                  {kelas.map((k) => (
                    <th key={k} className="text-center">
                      {k}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.keys(tab === "jumat" ? j.jam.jumat : j.jam.umum)
                  .map(Number)
                  .sort((a, b) => a - b)
                  .map((jamKe) => (
                    <tr key={jamKe}>
                      <td className="whitespace-nowrap text-xs">
                        <b className="text-ink">{jamKe}</b>{" "}
                        <span className="text-muted">{(tab === "jumat" ? j.jam.jumat : j.jam.umum)[jamKe]?.[0]}</span>
                      </td>
                      {kelas.map((k) => {
                        const v = j.jadwal[tab as Hari]?.[k]?.[jamKe - 1] ?? 0;
                        const g = petaGuru.get(v);
                        return (
                          <td key={k} className="p-1 text-center">
                            <input
                              className={`w-12 rounded-md border px-1 py-1 text-center tabular-nums ${v && !g ? "border-[#b42318] bg-[#fdeceb]" : "border-line"}`}
                              inputMode="numeric"
                              value={v || ""}
                              title={g ? `${g.nama} · ${g.mapel}` : v ? "Kode tidak dikenal" : "Kosong"}
                              aria-label={`${LABEL_HARI[tab as Hari]} jam ${jamKe} kelas ${k}`}
                              onChange={(e) => {
                                const n = Number(e.target.value.replace(/\D/g, "")) || 0;
                                ubah((d) => {
                                  const h = (d.jadwal[tab as Hari] ??= {});
                                  const b = (h[k] ??= []);
                                  while (b.length < jamKe) b.push(0);
                                  b[jamKe - 1] = n;
                                  return d;
                                });
                              }}
                            />
                            <span className="mt-0.5 block max-w-[3.5rem] truncate text-[0.625rem] text-muted">{g?.mapel ?? ""}</span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Kartu>
      )}

      {tab === "guru" && (
        <>
          <Kartu
            judul="Kode guru (KG)"
            deskripsi="Satu kode = satu guru + satu mapel. Hubungkan ke akun dashboard supaya guru melihat jadwalnya sendiri."
            aksi={
              <button
                type="button"
                className="d-btn d-btn-garis d-btn-kecil"
                onClick={() => ubah((d) => ({ ...d, guru: [...d.guru, { kode: Math.max(0, ...d.guru.map((g) => g.kode)) + 1, nama: "", mapel: "" }] }))}
              >
                <Plus size={14} aria-hidden="true" /> Tambah kode
              </button>
            }
            isiClassName=""
          >
            <div className="overflow-x-auto">
              <table className="d-tabel text-sm">
                <thead>
                  <tr>
                    <th>KG</th>
                    <th>Nama guru</th>
                    <th>Mata pelajaran</th>
                    <th>Akun dashboard</th>
                    <th className="w-px" />
                  </tr>
                </thead>
                <tbody>
                  {j.guru.map((g, i) => {
                    const set = (patch: Partial<GuruMapel>) => ubah((d) => ({ ...d, guru: d.guru.map((x, n) => (n === i ? { ...x, ...patch } : x)) }));
                    return (
                      <tr key={i}>
                        <td>
                          <input className="d-input w-16 text-center" inputMode="numeric" value={g.kode || ""} onChange={(e) => set({ kode: Number(e.target.value.replace(/\D/g, "")) || 0 })} />
                        </td>
                        <td>
                          <input className="d-input min-w-[14rem]" value={g.nama} onChange={(e) => set({ nama: e.target.value })} />
                        </td>
                        <td>
                          <input className="d-input min-w-[11rem]" value={g.mapel} onChange={(e) => set({ mapel: e.target.value })} />
                        </td>
                        <td>
                          <select className="d-input min-w-[12rem]" value={g.akunId ?? ""} onChange={(e) => set({ akunId: e.target.value || undefined })}>
                            <option value="">— belum dihubungkan —</option>
                            {akun.map((a) => (
                              <option key={a.id} value={a.id}>
                                {a.nama} ({a.username})
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="d-btn d-btn-hantu-bahaya d-btn-ikon"
                            aria-label={`Hapus kode ${g.kode}`}
                            onClick={() => ubah((d) => ({ ...d, guru: d.guru.filter((_, n) => n !== i) }))}
                          >
                            <Trash2 size={15} aria-hidden="true" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Kartu>

          <Kartu judul="Wali kelas" deskripsi="Wali kelas langsung melihat rekap kelasnya di menu Absen kelas → Rekap.">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {kelas.map((k) => (
                <label key={k} className="flex items-center gap-3">
                  <span className="w-14 shrink-0 font-semibold text-ink">{k}</span>
                  <select
                    className="d-input"
                    value={j.wali[k] ?? ""}
                    onChange={(e) => ubah((d) => ({ ...d, wali: { ...d.wali, [k]: e.target.value } }))}
                  >
                    <option value="">—</option>
                    {akun.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.nama}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
          </Kartu>
        </>
      )}

      {tab === "jam" && (
        <div className="grid gap-5 lg:grid-cols-2">
          {(["umum", "jumat"] as const).map((jenis) => (
            <Kartu
              key={jenis}
              judul={jenis === "umum" ? "Senin–Kamis & Sabtu" : "Jumat"}
              aksi={
                <button
                  type="button"
                  className="d-btn d-btn-garis d-btn-kecil"
                  onClick={() =>
                    ubah((d) => {
                      const n = Object.keys(d.jam[jenis]).length + 1;
                      const akhir = d.jam[jenis][String(n - 1)]?.[1] ?? "07:30";
                      d.jam[jenis][String(n)] = [akhir, akhir];
                      return d;
                    })
                  }
                >
                  <Plus size={14} aria-hidden="true" /> Jam
                </button>
              }
            >
              <ul className="flex flex-col gap-2">
                {Object.entries(j.jam[jenis])
                  .sort((a, b) => Number(a[0]) - Number(b[0]))
                  .map(([ke, [m, s]]) => (
                    <li key={ke} className="flex items-center gap-2 text-sm">
                      <span className="w-14 text-muted">Jam {ke}</span>
                      {[m, s].map((v, idx) => (
                        <input
                          key={idx}
                          type="time"
                          className="d-input w-auto"
                          value={v}
                          aria-label={`Jam ${ke} ${idx ? "selesai" : "mulai"}`}
                          onChange={(e) =>
                            ubah((d) => {
                              d.jam[jenis][ke][idx] = e.target.value;
                              return d;
                            })
                          }
                        />
                      ))}
                    </li>
                  ))}
              </ul>
            </Kartu>
          ))}
        </div>
      )}

      <div className="sticky bottom-4 z-30 flex items-center justify-end gap-3 self-end rounded-full border border-line bg-white/95 py-2 pl-5 pr-2 shadow-lg">
        {berubah && <span className="self-center text-sm text-muted">Ada perubahan yang belum disimpan</span>}
        <button type="button" className="d-btn d-btn-utama" onClick={simpan} disabled={sibuk || !berubah}>
          {sibuk ? <LoaderCircle size={16} className="animate-spin" aria-hidden="true" /> : <CircleCheck size={16} aria-hidden="true" />} Simpan jadwal
        </button>
      </div>
    </div>
  );
}
