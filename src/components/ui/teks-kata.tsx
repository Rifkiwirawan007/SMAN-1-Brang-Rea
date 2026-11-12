/**
 * Memecah teks menjadi kata-kata (span.kata) agar bisa dimunculkan satu per satu
 * oleh RevealObserver. Pembungkusnya harus punya atribut [data-reveal-kata].
 * `mulai` = urutan kata pertama, supaya beberapa teks bisa berlanjut berurutan.
 */
export function TeksKata({ teks, mulai = 0 }: { teks: string; mulai?: number }) {
  const kata = teks.split(/\s+/).filter(Boolean);
  return (
    <>
      {kata.map((k, i) => (
        <span key={i}>
          <span className="kata" style={{ "--i": mulai + i } as React.CSSProperties}>
            {k}
          </span>
          {i < kata.length - 1 ? " " : null}
        </span>
      ))}
    </>
  );
}

export function jumlahKata(teks: string) {
  return teks.split(/\s+/).filter(Boolean).length;
}
