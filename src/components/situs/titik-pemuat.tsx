/** Tiga titik hijau yang memantul bergelombang (animasi pemuat situs). */
export function TitikPemuat({ label = "Memuat" }: { label?: string }) {
  return (
    <span className="titik-pemuat" role="status" aria-label={label}>
      <span />
      <span />
      <span />
    </span>
  );
}
