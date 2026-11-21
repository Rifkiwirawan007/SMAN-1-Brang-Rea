// Konfigurasi PM2: menjaga website tetap jalan (dan menyala lagi otomatis setelah server restart).
// Folder "current" adalah tautan ke rilis aktif, diganti oleh deploy.sh setiap update.
const APP_DIR = process.env.APP_DIR || "/srv/sman1";
const PORT = process.env.APP_PORT || "3000";

module.exports = {
  apps: [
    {
      name: process.env.PM2_NAMA || "sman1",
      cwd: `${APP_DIR}/current`,
      script: "node_modules/next/dist/bin/next",
      args: `start -p ${PORT} -H 127.0.0.1`,
      // Satu proses saja: penyimpanan file JSON memakai kunci di memori proses.
      instances: 1,
      exec_mode: "fork",
      env: { NODE_ENV: "production", NEXT_TELEMETRY_DISABLED: "1" },
      max_memory_restart: "900M",
      // Beri waktu menyelesaikan permintaan yang sedang berjalan sebelum dimatikan.
      kill_timeout: 15000,
      time: true,
    },
  ],
};
