/**
 * SISTEM INFORMASI LAYANAN AKADEMIK DIGITAL TERPADU (SILADIK-AI)
 * File: assets/js/config.js
 * Global API Base URL Configuration & Auto-Detection
 * Memastikan koneksi backend tetap terhubung baik dibuka via http://localhost:8080,
 * Live Server (port 5500 / 3000 / 5173), maupun file:// protocol
 */

const AppConfig = (() => {
  let baseUrl = '';

  if (typeof window !== 'undefined') {
    // Jika dibuka via Live Server (port 5500, 3000, 5173) atau file:// protocol, arahkan ke backend port 8080
    const isLiveServer = window.location.port === '5500' || 
                         window.location.port === '3000' || 
                         window.location.port === '5173' || 
                         window.location.protocol === 'file:';
    if (isLiveServer) {
      baseUrl = 'http://localhost:8080';
    } else {
      // Jika di-serve langsung dari Express (baik di Render, localhost:8080, port custom, dll) -> pakai relative URL
      baseUrl = '';
    }
  }

  return {
    API_BASE_URL: baseUrl,
    apiUrl: (endpoint) => `${baseUrl}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`,
    async checkHealth() {
      try {
        const res = await fetch(`${baseUrl}/api/health`);
        if (res.ok) {
          const json = await res.json();
          return { ok: true, data: json };
        }
      } catch (e) {
        return { ok: false, error: e.message };
      }
      return { ok: false, error: 'Server tidak merespons' };
    }
  };
})();

window.AppConfig = AppConfig;
window.API_BASE_URL = AppConfig.API_BASE_URL;
