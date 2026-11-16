// Ilustrasi hiasan bagian "Jadwal & jam pelajaran": jam weker dan tumpukan buku
// bergaya sablon/print (bintik grain + tepi sedikit kasar), warna hijau sekolah.

const HIJAU = "#34724c";
const HIJAU_TUA = "#285c3c";
const HIJAU_MUDA = "#4f8f66";
const TINTA = "#15301f";
const KERTAS = "#f5f8f6";
const EMAS = "#c9a24b";

/** Filter tekstur: tepi agak kasar + bintik gelap & terang, hanya di dalam bentuk. */
function FilterTekstur({ id, seed }: { id: string; seed: number }) {
  return (
    <filter id={id} x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed={seed} result="kasar" />
      <feDisplacementMap in="SourceGraphic" in2="kasar" scale="3" xChannelSelector="R" yChannelSelector="G" result="bentuk" />
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={seed + 7} result="butir" />
      <feColorMatrix
        in="butir"
        type="matrix"
        values="0 0 0 0 0.08  0 0 0 0 0.19  0 0 0 0 0.12  4 0 0 0 -2.3"
        result="butirGelap"
      />
      <feComposite in="butirGelap" in2="bentuk" operator="in" result="bintikGelap" />
      <feColorMatrix
        in="butir"
        type="matrix"
        values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 4 0 0 -2.45"
        result="butirTerang"
      />
      <feComposite in="butirTerang" in2="bentuk" operator="in" result="bintikTerang" />
      <feMerge>
        <feMergeNode in="bentuk" />
        <feMergeNode in="bintikGelap" />
        <feMergeNode in="bintikTerang" />
      </feMerge>
    </filter>
  );
}

export function JamWeker({ className }: { className?: string }) {
  const cx = 120;
  const cy = 142;
  const ujung = (sudut: number, r: number) => {
    const rad = (sudut * Math.PI) / 180;
    return [cx + r * Math.sin(rad), cy - r * Math.cos(rad)] as const;
  };
  const [jx, jy] = ujung(-60, 34); // jarum jam ke angka 10
  const [mx, my] = ujung(60, 50); // jarum menit ke angka 2
  const [dx, dy] = ujung(160, 54); // jarum detik
  return (
    <svg viewBox="0 0 240 250" aria-hidden="true" focusable="false" className={className}>
      <defs>
        <FilterTekstur id="tekstur-jam" seed={4} />
      </defs>
      <g filter="url(#tekstur-jam)">
        {/* Kaki */}
        <path d="M70 212 L50 240 M170 212 L190 240" stroke={TINTA} strokeWidth="11" strokeLinecap="round" />
        {/* Gagang dan palu */}
        <path d="M84 50 Q120 14 156 50" fill="none" stroke={TINTA} strokeWidth="9" strokeLinecap="round" />
        <path d="M120 34 V58" stroke={TINTA} strokeWidth="7" strokeLinecap="round" />
        {/* Lonceng kiri & kanan */}
        <ellipse cx="68" cy="60" rx="36" ry="27" transform="rotate(-38 68 60)" fill={HIJAU_TUA} />
        <ellipse cx="172" cy="60" rx="36" ry="27" transform="rotate(38 172 60)" fill={HIJAU_TUA} />
        <path d="M46 62 Q52 40 74 34" fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth="5" strokeLinecap="round" />
        {/* Badan: bayangan bawah-kanan + badan utama */}
        <circle cx={cx} cy={cy} r="88" fill={HIJAU_TUA} />
        <circle cx={cx - 7} cy={cy - 7} r="81" fill={HIJAU} />
        <path d="M58 116 A68 68 0 0 1 98 74" fill="none" stroke="#fff" strokeOpacity=".4" strokeWidth="7" strokeLinecap="round" />
        {/* Muka jam */}
        <circle cx={cx} cy={cy} r="64" fill={TINTA} />
        <circle cx={cx} cy={cy} r="59" fill={KERTAS} />
        {Array.from({ length: 12 }, (_, i) => {
          const besar = i % 3 === 0;
          const [x1, y1] = ujung(i * 30, besar ? 44 : 48);
          const [x2, y2] = ujung(i * 30, 54);
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={besar ? HIJAU_TUA : TINTA}
              strokeWidth={besar ? 6 : 3}
              strokeLinecap="round"
            />
          );
        })}
        {/* Jarum */}
        <line x1={cx} y1={cy} x2={jx} y2={jy} stroke={TINTA} strokeWidth="8" strokeLinecap="round" />
        <line x1={cx} y1={cy} x2={mx} y2={my} stroke={TINTA} strokeWidth="5.5" strokeLinecap="round" />
        <line x1={cx} y1={cy} x2={dx} y2={dy} stroke={EMAS} strokeWidth="2.5" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r="7" fill={TINTA} />
        <circle cx={cx} cy={cy} r="2.8" fill={EMAS} />
      </g>
    </svg>
  );
}

export function TumpukanBuku({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 300 240" aria-hidden="true" focusable="false" className={className}>
      <defs>
        <FilterTekstur id="tekstur-buku" seed={11} />
      </defs>
      <g filter="url(#tekstur-buku)">
        {/* Buku bawah: punggung buku menghadap depan */}
        <rect x="22" y="178" width="256" height="48" rx="7" fill={HIJAU_TUA} />
        <rect x="46" y="178" width="11" height="48" fill={TINTA} fillOpacity=".45" />
        <rect x="243" y="178" width="11" height="48" fill={TINTA} fillOpacity=".45" />
        <rect x="94" y="193" width="112" height="18" rx="3" fill={KERTAS} fillOpacity=".92" />
        <rect x="108" y="200" width="84" height="4" rx="2" fill={HIJAU_TUA} />
        <path d="M30 186 H270" stroke="#fff" strokeOpacity=".25" strokeWidth="3" strokeLinecap="round" />

        {/* Buku tengah: sisi halaman menghadap depan, sedikit miring */}
        <g transform="rotate(-4 152 156)">
          <rect x="34" y="132" width="13" height="48" rx="5" fill={HIJAU_TUA} />
          <rect x="40" y="132" width="228" height="9" rx="3" fill={HIJAU} />
          <rect x="46" y="141" width="216" height="30" fill={KERTAS} />
          <path d="M50 148 H258 M50 155 H258 M50 162 H258" stroke="#c4d4ca" strokeWidth="1.6" />
          <rect x="40" y="171" width="228" height="9" rx="3" fill={HIJAU} />
          {/* Pita pembatas */}
          <path d="M206 176 h12 v34 l-6 -7 l-6 7 z" fill={EMAS} />
        </g>

        {/* Buku atas: punggung buku, warna lebih muda */}
        <g transform="rotate(3 158 112)">
          <rect x="60" y="92" width="196" height="40" rx="7" fill={HIJAU_MUDA} />
          <rect x="80" y="92" width="9" height="40" fill={TINTA} fillOpacity=".35" />
          <rect x="226" y="92" width="9" height="40" fill={TINTA} fillOpacity=".35" />
          <rect x="118" y="104" width="78" height="5" rx="2.5" fill={KERTAS} />
          <rect x="130" y="114" width="54" height="5" rx="2.5" fill={KERTAS} fillOpacity=".8" />
          <path d="M68 99 H248" stroke="#fff" strokeOpacity=".3" strokeWidth="3" strokeLinecap="round" />
        </g>

        {/* Apel di atas tumpukan */}
        <g transform="translate(190 38)">
          <path d="M22 18 C8 6 -6 18 -2 34 C2 50 14 56 22 50 C30 56 42 50 46 34 C50 18 36 6 22 18 Z" fill="#b8442f" />
          <path d="M4 26 Q6 18 14 16" fill="none" stroke="#fff" strokeOpacity=".45" strokeWidth="4" strokeLinecap="round" />
          <path d="M22 18 Q22 8 26 2" fill="none" stroke={TINTA} strokeWidth="4" strokeLinecap="round" />
          <path d="M26 8 Q38 0 44 8 Q34 14 26 8 Z" fill={HIJAU_MUDA} />
        </g>
      </g>
    </svg>
  );
}
