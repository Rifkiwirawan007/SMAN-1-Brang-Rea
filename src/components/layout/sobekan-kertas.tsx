/**
 * Tepi kertas sobek di atas footer + rumput panjang yang tumbuh menutupi tepinya.
 * Bidang kertas memakai warna latar halaman (var --sobek). Semua SVG statis (dirender sekali, ringan):
 * Di HP SVG dibuat lebih lebar dari layar (terpotong rapi) supaya helai rumput tidak gepeng.
 * rumput dibuat dari beberapa rumpun yang dipakai ulang lewat <use>, bukan ratusan path unik.
 */

const L = 1440;
const T = 210;

/** PRNG kecil berbiji supaya bentuk sama di server & browser. */
function acak(biji: number) {
  let s = biji;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

const AMP = 40;
/** Tinggi tepi sobekan di titik x (bukit landai seperti contoh). */
function tepi(x: number, dasar: number) {
  return (
    dasar +
    Math.sin(x / 210 + 0.6) * AMP * 0.55 +
    Math.sin(x / 97 + 2.1) * AMP * 0.25 +
    Math.sin(x / 41 + 0.3) * AMP * 0.1
  );
}

function garisSobek(biji: number, dasar: number) {
  const r = acak(biji);
  const titik: string[] = [];
  for (let x = -24; x <= L + 24; x += 6) {
    titik.push(`${x},${(tepi(x, dasar) + (r() - 0.5) * 3).toFixed(1)}`);
  }
  return `M-24,-10 L${titik.join(" L")} L${L + 24},-10 Z`;
}

const DASAR = 108;
const KABUT = garisSobek(7, DASAR + 18);
const SERAT = garisSobek(7, DASAR + 8);
const KERTAS = garisSobek(7, DASAR);

/** Satu rumpun rumput selebar 160 unit, akar di y=0, helai melengkung ke atas. */
function rumpun(biji: number, jumlah: number, tinggiMin: number, tinggiMaks: number) {
  const r = acak(biji);
  const f = (n: number) => n.toFixed(1);
  const helai: string[] = [];
  for (let i = 0; i < jumlah; i++) {
    const x = r() * 160;
    const w = 2.2 + r() * 3.2;
    const h = tinggiMin + r() ** 1.6 * (tinggiMaks - tinggiMin);
    const condong = (r() - 0.5) * h * 0.55;
    helai.push(
      `M${f(x - w / 2)},0 Q${f(x - w / 4 + condong * 0.35)},${f(-h * 0.6)} ${f(x + condong)},${f(-h)} Q${f(x + w / 4 + condong * 0.35)},${f(-h * 0.6)} ${f(x + w / 2)},0Z`,
    );
  }
  return helai.join("");
}

const RUMPUN = [
  { id: "rumpun-a", d: rumpun(11, 46, 22, 78), isi: "url(#helai-gelap)" },
  { id: "rumpun-b", d: rumpun(23, 52, 18, 64), isi: "url(#helai-sedang)" },
  { id: "rumpun-c", d: rumpun(37, 40, 14, 52), isi: "url(#helai-terang)" },
];

/** Posisi rumpun di sepanjang tepi: akar sedikit di bawah tepi kertas, ikut naik-turun bukit. */
function barisRumpun(lapis: number, geser: number, turun: number) {
  const r = acak(100 + lapis);
  const hasil: { id: string; x: number; y: number }[] = [];
  for (let x = -80 + geser; x < L + 20; x += 96) {
    hasil.push({
      id: RUMPUN[(lapis + hasil.length) % RUMPUN.length].id,
      x: x + (r() - 0.5) * 30,
      y: tepi(x + 80, DASAR) + turun + r() * 10,
    });
  }
  return hasil;
}

const LAPIS = [barisRumpun(0, 0, 34), barisRumpun(1, 48, 44), barisRumpun(2, 24, 56)];

export function SobekanKertas() {
  return (
    <svg
      aria-hidden="true"
      className="sobekan-kertas pointer-events-none absolute left-1/2 -top-[2px] block h-[130px] w-[250%] -translate-x-1/2 sm:w-[160%] md:h-[210px] md:w-full"
      viewBox={`0 0 ${L} ${T}`}
      preserveAspectRatio="none"
    >
      <defs>
        {/* Tepi kertas berbulu lalu dilembutkan. */}
        <filter id="tepi-lembut" x="-3%" y="-20%" width="106%" height="160%">
          <feTurbulence type="fractalNoise" baseFrequency="1.4 0.5" numOctaves="2" seed="4" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="12" xChannelSelector="R" yChannelSelector="G" result="d" />
          <feGaussianBlur in="d" stdDeviation="2.2 1.6" />
        </filter>
        <filter id="kabut-serat" x="-3%" y="-20%" width="106%" height="180%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9 0.25" numOctaves="2" seed="9" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="18" xChannelSelector="R" yChannelSelector="G" result="d" />
          <feGaussianBlur in="d" stdDeviation="6 4" />
        </filter>
        {/* Warna helai: gelap di akar, terang di ujung (kena cahaya). */}
        <linearGradient id="helai-gelap" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#4a8030" />
          <stop offset="1" stopColor="#7fae45" />
        </linearGradient>
        <linearGradient id="helai-sedang" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#568d2f" />
          <stop offset="1" stopColor="#9cc458" />
        </linearGradient>
        <linearGradient id="helai-terang" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#62982f" />
          <stop offset="1" stopColor="#b9d872" />
        </linearGradient>
        {RUMPUN.map((k) => (
          <path key={k.id} id={k.id} d={k.d} fill={k.isi} />
        ))}
      </defs>

      <path d={KABUT} fill="#ffffff" opacity="0.55" filter="url(#kabut-serat)" />
      <path d={SERAT} fill="#ffffff" opacity="0.8" filter="url(#tepi-lembut)" />
      <path d={KERTAS} fill="var(--sobek)" filter="url(#tepi-lembut)" />
      {/* tutup tepi atas (filter menggeser piksel tepi sehingga hijau bisa mengintip) */}
      <rect x="-24" y="-10" width={L + 48} height="40" fill="var(--sobek)" />

      {/* rumput panjang: tiga lapis, belakang paling gelap */}
      {LAPIS.map((baris, i) => (
        <g key={i} opacity={i === 0 ? 0.85 : 1}>
          {baris.map((p, j) => (
            <use key={j} href={`#${p.id}`} x={p.x.toFixed(1)} y={p.y.toFixed(1)} />
          ))}
        </g>
      ))}
    </svg>
  );
}
