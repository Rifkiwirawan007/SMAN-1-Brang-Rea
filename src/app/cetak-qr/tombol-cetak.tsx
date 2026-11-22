"use client";

export function TombolCetak() {
  return (
    <button type="button" className="cq-cetak" onClick={() => window.print()}>
      Cetak / simpan PDF
    </button>
  );
}
