/**
 * Status layar pemuat BAREMA untuk komponen lain (hero, reveal, dll.).
 *
 * Skrip awal di <head> memasang kelas `pemuat-aktif` pada <html> bila layar pemuat akan tampil;
 * LayarPemuat melepasnya saat mulai memudar dan memicu event `pemuat-selesai`. Animasi halaman
 * (slide hero, efek mengetik, reveal) menunggu sinyal ini supaya baru mulai saat halaman terlihat,
 * tidak "tabrakan" di belakang layar pemuat.
 */

export const EVENT_PEMUAT_SELESAI = "pemuat-selesai";

/** Apakah layar pemuat masih menutupi halaman. Selalu false di server. */
export function pemuatMasihAktif() {
  return typeof document !== "undefined" && document.documentElement.classList.contains("pemuat-aktif");
}

/** Untuk useSyncExternalStore: berlangganan perubahan status pemuat. */
export function langgananPemuat(cb: () => void) {
  window.addEventListener(EVENT_PEMUAT_SELESAI, cb);
  return () => window.removeEventListener(EVENT_PEMUAT_SELESAI, cb);
}

/** Jalankan `cb` setelah layar pemuat selesai (langsung bila tidak ada pemuat). Mengembalikan fungsi batal. */
export function setelahPemuat(cb: () => void) {
  if (!pemuatMasihAktif()) {
    cb();
    return () => {};
  }
  window.addEventListener(EVENT_PEMUAT_SELESAI, cb, { once: true });
  return () => window.removeEventListener(EVENT_PEMUAT_SELESAI, cb);
}

/** Dipanggil LayarPemuat saat mulai memudar. */
export function tandaiPemuatSelesai() {
  document.documentElement.classList.remove("pemuat-aktif");
  window.dispatchEvent(new Event(EVENT_PEMUAT_SELESAI));
}
