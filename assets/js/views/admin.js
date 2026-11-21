/**
 * SISTEM INFORMASI LAYANAN AKADEMIK DIGITAL TERPADU (SILADIK-AI)
 * File: assets/js/views/admin.js
 * Admin Workspace: Master Data Management (Insert, Update, Delete) & Database Monitoring
 * Terhubung langsung ke Database PostgreSQL
 */

const AdminView = (() => {
  let activeTab = 'users'; // 'users' | 'spp' | 'pengajuan' | 'matakuliah'
  let roleFilter = 'ALL';
  let searchQuery = '';
  let cachedUsers = [];
  let cachedStats = null;
  let cachedPengajuan = [];
  let cachedMataKuliah = [];

  // =============================================================
  // PRESET & FALLBACK DATA UNTUK MODE OFFLINE / SIMULASI LOKAL
  // =============================================================
  const DEFAULT_PRESET_USERS = [
    {
      id: 1,
      nomor_induk: '2300159',
      nama: 'Nazwa Salsabila',
      email: 'nazwa.salsabila@upi.edu',
      role: 'MAHASISWA',
      prodi: 'S1 Bisnis Digital',
      is_active: true,
      created_at: '2026-08-01T08:00:00Z',
      semester_berjalan: 7,
      angkatan: 2023,
      total_sks_lulus: 120,
      ipk: 3.84,
      dosen_pa: 'Muhammad Rizki Nugraha, S.Pd., M.T.',
      spp_status: 'LUNAS'
    },
    {
      id: 2,
      nomor_induk: '2312017',
      nama: 'Nabil Amanulloh',
      email: 'nabil.amanulloh@upi.edu',
      role: 'MAHASISWA',
      prodi: 'S1 Bisnis Digital',
      is_active: true,
      created_at: '2026-08-01T08:00:00Z',
      semester_berjalan: 7,
      angkatan: 2023,
      total_sks_lulus: 120,
      ipk: 3.89,
      dosen_pa: 'Muhammad Rizki Nugraha, S.Pd., M.T.',
      spp_status: 'LUNAS'
    },
    {
      id: 3,
      nomor_induk: '198703142014041001',
      nama: 'Budi Prasetyo, S.Kom.',
      email: 'budi_akademik@upi.edu',
      role: 'STAF',
      prodi: 'S1 Bisnis Digital',
      is_active: true,
      created_at: '2026-08-01T08:00:00Z',
      semester_berjalan: null,
      angkatan: null,
      total_sks_lulus: null,
      ipk: null,
      dosen_pa: null,
      spp_status: 'LUNAS'
    },
    {
      id: 4,
      nomor_induk: '199105202020121008',
      nama: 'Muhammad Rizki Nugraha, S.Pd., M.T.',
      email: 'rizkinugraha@upi.edu',
      role: 'KASI',
      prodi: 'S1 Bisnis Digital',
      is_active: true,
      created_at: '2026-08-01T08:00:00Z',
      semester_berjalan: null,
      angkatan: null,
      total_sks_lulus: null,
      ipk: null,
      dosen_pa: null,
      spp_status: 'LUNAS'
    },
    {
      id: 5,
      nomor_induk: 'ADMIN001',
      nama: 'Administrator Sistem SILADIK',
      email: 'admin@upi.edu',
      role: 'ADMIN',
      prodi: 'S1 Bisnis Digital',
      is_active: true,
      created_at: '2026-08-01T08:00:00Z',
      semester_berjalan: null,
      angkatan: null,
      total_sks_lulus: null,
      ipk: null,
      dosen_pa: null,
      spp_status: 'LUNAS'
    },
    {
      id: 6,
      nomor_induk: '2312080',
      nama: 'Nazwa Difa Nailla',
      email: 'nazwa.difa@upi.edu',
      role: 'MAHASISWA',
      prodi: 'S1 Bisnis Digital',
      is_active: true,
      created_at: '2026-08-01T08:00:00Z',
      semester_berjalan: 7,
      angkatan: 2023,
      total_sks_lulus: 120,
      ipk: 3.75,
      dosen_pa: 'Muhammad Rizki Nugraha, S.Pd., M.T.',
      spp_status: 'LUNAS'
    },
    {
      id: 7,
      nomor_induk: '2300687',
      nama: 'Zahra Agniasari',
      email: 'zahra.agniasari@upi.edu',
      role: 'MAHASISWA',
      prodi: 'S1 Bisnis Digital',
      is_active: true,
      created_at: '2026-08-01T08:00:00Z',
      semester_berjalan: 7,
      angkatan: 2023,
      total_sks_lulus: 120,
      ipk: 3.75,
      dosen_pa: 'Muhammad Rizki Nugraha, S.Pd., M.T.',
      spp_status: 'LUNAS'
    }
  ];

  const DEFAULT_PRESET_PENGAJUAN = [
    {
      id: 'REQ-202610-001',
      nim: '2312017',
      nama: 'Nabil Amanulloh',
      docType: 'transkrip',
      docTitle: 'Transkrip Nilai Akademik',
      semester: 7,
      keperluan: 'Pendaftaran Program Beasiswa Unggulan Kemdikbud 2026',
      status: 'selesai',
      nomorDokumenResmi: '411/UN40.D/AK/2026',
      createdAt: '2026-10-25T08:30:00Z',
      tanggalSelesai: '2026-10-26T14:15:00Z',
      catatanStaf: 'Dokumen transkrip nilai telah diverifikasi SIAKAD dan disahkan dengan TTD & Cap resmi.'
    },
    {
      id: 'REQ-202610-002',
      nim: '2312017',
      nama: 'Nabil Amanulloh',
      docType: 'krs',
      docTitle: 'Kartu Rencana Studi (KRS)',
      semester: 7,
      keperluan: 'Registrasi Kontrak Kuliah Semester Ganjil 2026/2027',
      status: 'selesai',
      nomorDokumenResmi: '412/UN40.D/AK/2026',
      createdAt: '2026-10-26T09:10:00Z',
      tanggalSelesai: '2026-10-27T10:00:00Z',
      catatanStaf: 'KRS disetujui Dosen PA dan divalidasi Subbag Akademik.'
    },
    {
      id: 'REQ-202610-003',
      nim: '2312017',
      nama: 'Nabil Amanulloh',
      docType: 'skma',
      docTitle: 'Surat Keterangan Mahasiswa Aktif (SKMA)',
      semester: 7,
      keperluan: 'Syarat Pengajuan Magang Industri BUMN (MBKM)',
      status: 'verifikasi_staf',
      nomorDokumenResmi: null,
      createdAt: '2026-10-29T11:00:00Z',
      catatanStaf: 'Menunggu review draf dan pengesahan pimpinan.'
    }
  ];

  const DEFAULT_PRESET_MK = [
    { id: 1, kode_mk: 'UFO101', nama_mk: 'Pendidikan Agama', sks: 2, prodi: 'S1 Bisnis Digital', semester_paket: 1 },
    { id: 2, kode_mk: 'BD101', nama_mk: 'Pengantar Bisnis Digital', sks: 3, prodi: 'S1 Bisnis Digital', semester_paket: 1 },
    { id: 3, kode_mk: 'UFO102', nama_mk: 'Pancasila & Kewarganegaraan', sks: 2, prodi: 'S1 Bisnis Digital', semester_paket: 2 },
    { id: 4, kode_mk: 'BD103', nama_mk: 'Prinsip Manajemen', sks: 3, prodi: 'S1 Bisnis Digital', semester_paket: 2 },
    { id: 5, kode_mk: 'BD301', nama_mk: 'Analisis & Perancangan Sistem', sks: 3, prodi: 'S1 Bisnis Digital', semester_paket: 3 },
    { id: 6, kode_mk: 'BD302', nama_mk: 'E-Commerce', sks: 3, prodi: 'S1 Bisnis Digital', semester_paket: 3 },
    { id: 7, kode_mk: 'BD401', nama_mk: 'Pemrograman Web Bisnis', sks: 3, prodi: 'S1 Bisnis Digital', semester_paket: 4 },
    { id: 8, kode_mk: 'BD402', nama_mk: 'Manajemen Keuangan Digital', sks: 3, prodi: 'S1 Bisnis Digital', semester_paket: 4 },
    { id: 9, kode_mk: 'BD501', nama_mk: 'Digital Marketing', sks: 3, prodi: 'S1 Bisnis Digital', semester_paket: 5 },
    { id: 10, kode_mk: 'BD502', nama_mk: 'Financial Technology (FinTech)', sks: 3, prodi: 'S1 Bisnis Digital', semester_paket: 5 },
    { id: 11, kode_mk: 'BD601', nama_mk: 'Metodologi Penelitian Bisnis', sks: 3, prodi: 'S1 Bisnis Digital', semester_paket: 6 },
    { id: 12, kode_mk: 'BD602', nama_mk: 'Manajemen Risiko Bisnis', sks: 3, prodi: 'S1 Bisnis Digital', semester_paket: 6 },
    { id: 13, kode_mk: 'BD701', nama_mk: 'Manajemen Strategis Bisnis Digital', sks: 3, prodi: 'S1 Bisnis Digital', semester_paket: 7 },
    { id: 14, kode_mk: 'BD702', nama_mk: 'Business Intelligence & Big Data', sks: 3, prodi: 'S1 Bisnis Digital', semester_paket: 7 }
  ];

  function getDeletedUserBlacklist() {
    try {
      const stored = localStorage.getItem('siladik_deleted_users_blacklist_v1');
      if (stored) {
        const list = JSON.parse(stored);
        if (Array.isArray(list)) return list;
      }
    } catch (e) {}
    return [];
  }

  function addDeletedUserBlacklist(nim) {
    if (!nim) return;
    try {
      const list = getDeletedUserBlacklist();
      const clean = String(nim).trim();
      if (clean && !list.includes(clean)) {
        list.push(clean);
        localStorage.setItem('siladik_deleted_users_blacklist_v1', JSON.stringify(list));
      }
    } catch (e) {}
  }

  function formatStudentEmail(nama, fallbackNim, existingEmail) {
    if (existingEmail && !/^\d+@upi\.edu$/i.test(existingEmail.trim())) {
      return existingEmail.trim().toLowerCase();
    }
    if (nama) {
      const clean = nama
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 3)
        .join('.');
      if (clean) return `${clean}@upi.edu`;
    }
    return fallbackNim ? `${fallbackNim}@upi.edu` : '-';
  }

  function getLocalFallbackUsers() {
    const blacklist = getDeletedUserBlacklist();
    const cutiList = getCutiList();
    let local = [];
    let needsResave = false;
    try {
      const stored = localStorage.getItem('siladik_admin_users_v1');
      if (stored) {
        local = JSON.parse(stored);
        if (Array.isArray(local)) {
          local.forEach(u => {
            if (u.nomor_induk === 'ADMIN001' && u.nama && u.nama.includes('SIPAKAD')) {
              u.nama = u.nama.replace(/SIPAKAD/g, 'SILADIK');
              needsResave = true;
            }
            if (!u.email || /^\d+@upi\.edu$/i.test(u.email.trim())) {
              u.email = formatStudentEmail(u.nama, u.nomor_induk, u.email);
              needsResave = true;
            }
            // Auto-heal is_active dan status_akademik jika belum tersimpan / undefined
            if (u.is_active === undefined || u.is_active === null) {
              const statusStr = String(u.status_akademik || '').toUpperCase().trim();
              if (statusStr === 'NON-AKTIF' || statusStr === 'NONAKTIF') {
                u.is_active = false;
                u.status_akademik = 'NON-AKTIF';
              } else if (statusStr === 'CUTI' || cutiList.includes(String(u.nomor_induk).trim())) {
                u.is_active = true;
                u.status_akademik = 'CUTI';
              } else {
                u.is_active = true;
                u.status_akademik = 'AKTIF';
              }
              needsResave = true;
            }
          });
        }
      }
    } catch (e) {}

    if (needsResave && Array.isArray(local) && local.length > 0) {
      saveLocalUsers(local);
    }

    if (!Array.isArray(local) || local.length === 0) {
      local = JSON.parse(JSON.stringify(DEFAULT_PRESET_USERS));
    }

    // Filter out blacklisted / deleted users
    local = local.filter(u => !blacklist.includes(String(u.nomor_induk || '').trim()));

    // Gabungkan jika ada mahasiswa baru yang mendaftar mandiri via form registrasi
    if (typeof AuthManager !== 'undefined' && typeof AuthManager.getRegisteredStudents === 'function') {
      const regStudents = AuthManager.getRegisteredStudents() || [];
      regStudents.forEach(st => {
        const nimStr = String(st.nim || st.nomor_induk || '').trim();
        if (nimStr && !blacklist.includes(nimStr) && !local.some(u => String(u.nomor_induk || '').trim() === nimStr)) {
          local.push({
            id: local.length + 1,
            nomor_induk: nimStr,
            nama: st.nama,
            email: formatStudentEmail(st.nama, nimStr, st.email),
            role: 'MAHASISWA',
            prodi: st.prodi || 'S1 Bisnis Digital',
            is_active: true,
            created_at: st.registeredAt || new Date().toISOString(),
            semester_berjalan: st.currentSemester || 1,
            angkatan: st.angkatan || 2024,
            total_sks_lulus: st.totalSksLulus || 0,
            ipk: st.ipk || 0.0,
            dosen_pa: st.dosenPa || 'Muhammad Rizki Nugraha, S.Pd., M.T.',
            spp_status: (st.statusSpp || 'Lunas').toUpperCase(),
            is_registered: true
          });
        }
      });
    }

    return local;
  }

  function saveLocalUsers(list) {
    try {
      localStorage.setItem('siladik_admin_users_v1', JSON.stringify(list));
    } catch (e) {
      console.warn('Gagal simpan local users:', e);
    }
  }

  function getLocalFallbackPengajuan() {
    try {
      const stored = localStorage.getItem('siladik_requests_queue_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    try {
      localStorage.setItem('siladik_requests_queue_v1', JSON.stringify(DEFAULT_PRESET_PENGAJUAN));
    } catch (e) {}
    return DEFAULT_PRESET_PENGAJUAN;
  }

  function getLocalFallbackMataKuliah() {
    try {
      const stored = localStorage.getItem('siladik_admin_mk_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_PRESET_MK;
  }

  function saveLocalMataKuliah(list) {
    try {
      localStorage.setItem('siladik_admin_mk_v1', JSON.stringify(list));
    } catch (e) {}
  }

  function getApiUrl(endpoint) {
    if (window.AppConfig && typeof window.AppConfig.apiUrl === 'function') {
      return window.AppConfig.apiUrl(endpoint);
    }
    const base = window.API_BASE_URL || (window.location.origin.includes(':8080') ? '' : 'http://localhost:8080');
    return `${base}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
  }

  async function checkConnection() {
    const pill = document.getElementById('dbLivePill');
    const warning = document.getElementById('adminConnWarning');
    try {
      const res = await fetch(getApiUrl('/api/health'));
      if (res.ok) {
        const json = await res.json();
        if (json.status === 'OK') {
          if (pill) {
            pill.className = 'db-live-pill';
            pill.style.background = 'rgba(16, 185, 129, 0.15)';
            pill.style.borderColor = 'rgba(16, 185, 129, 0.35)';
            pill.style.color = '#34d399';
            pill.innerHTML = '<span class="dot-pulse"></span> PostgreSQL Terhubung';
          }
          if (warning) warning.style.display = 'none';
          return true;
        }
      }
    } catch (e) {
      console.warn('Backend health check error:', e.message);
    }

    if (pill) {
      pill.className = 'db-live-pill';
      pill.style.background = 'rgba(16, 185, 129, 0.15)';
      pill.style.borderColor = 'rgba(16, 185, 129, 0.35)';
      pill.style.color = '#34d399';
      pill.innerHTML = '<span class="dot-pulse" style="background:#10b981;"></span> Sistem Aktif & Siap';
    }
    if (warning) {
      warning.style.display = 'none';
    }
    return false;
  }

  async function render(container) {
    const user = AuthManager.getCurrentUser();
    if (!user || user.role !== 'admin') {
      container.innerHTML = `<div class="card p-4"><p class="text-danger">Akses Ditolak: Halaman ini hanya untuk Administrator Sistem.</p></div>`;
      return;
    }

    container.innerHTML = `
      <div class="admin-dashboard-wrapper">
        <!-- 1. Header & Welcome Strip -->
        <div class="admin-header-card">
          <div class="admin-header-left">
            <div class="admin-badge-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
              </svg>
            </div>
            <div>
              <div style="display:flex; align-items:center; gap: 0.5rem;">
                <h1 class="admin-title">Panel Administrator Master Data</h1>
                <span class="db-live-pill" id="dbLivePill">
                  <span class="dot-pulse"></span>
                  Memeriksa Status...
                </span>
              </div>
              <p class="admin-subtitle">
                Kelola basis data pengguna (Mahasiswa, Staf, KASI, Admin), sinkronisasi status SPP, dan kontrol pengajuan dokumen.
              </p>
            </div>
          </div>
          <div class="admin-header-actions">
            <button class="btn btn-primary" onclick="AdminView.openAddUserModal()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Tambah Pengguna Baru
            </button>
            <button class="btn btn-outline" onclick="AdminView.refreshData()" title="Sinkronkan ulang data">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
              </svg>
              Sinkronkan Ulang
            </button>
          </div>
        </div>

        <!-- 2. KPI Metrics Grid -->
        <div class="stats-grid" id="adminStatsGrid">
          <div class="stat-card">
            <div class="stat-card-header">
              <span class="stat-card-title">Total Mahasiswa</span>
              <div class="stat-icon blue">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
              </div>
            </div>
            <div class="stat-value" id="statMhsVal">-</div>
            <div class="stat-meta">Mahasiswa aktif di database</div>
          </div>

          <div class="stat-card">
            <div class="stat-card-header">
              <span class="stat-card-title">Staf & KASI</span>
              <div class="stat-icon purple">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/></svg>
              </div>
            </div>
            <div class="stat-value" id="statStaffVal">-</div>
            <div class="stat-meta">Eksekutor dan verifikator TU</div>
          </div>

          <div class="stat-card">
            <div class="stat-card-header">
              <span class="stat-card-title">Pengajuan Dokumen</span>
              <div class="stat-icon green">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              </div>
            </div>
            <div class="stat-value" id="statPengajuanVal">-</div>
            <div class="stat-meta positive" id="statPengajuanSelesai">Memuat status...</div>
          </div>

          <div class="stat-card">
            <div class="stat-card-header">
              <span class="stat-card-title">Akun Administrator</span>
              <div class="stat-icon red">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              </div>
            </div>
            <div class="stat-value" id="statAdminVal">-</div>
            <div class="stat-meta">Akses penuh sistem</div>
          </div>
        </div>

        <!-- 3. Navigation Tabs -->
        <div class="admin-tabs-bar">
          <button class="admin-tab-btn ${activeTab === 'users' ? 'active' : ''}" onclick="AdminView.switchTab('users')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            Manajemen Pengguna (Users)
          </button>
          <button class="admin-tab-btn ${activeTab === 'pengajuan' ? 'active' : ''}" onclick="AdminView.switchTab('pengajuan')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
            Monitoring Pengajuan Dokumen
          </button>
          <button class="admin-tab-btn ${activeTab === 'matakuliah' ? 'active' : ''}" onclick="AdminView.switchTab('matakuliah')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            Mata Kuliah
          </button>
          <button class="admin-tab-btn ${activeTab === 'kelola_mhs' ? 'active' : ''}" onclick="AdminView.switchTab('kelola_mhs')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
            Pembaruan Mahasiswa Per Semester
          </button>
        </div>

        <!-- 4. Dynamic Content Area -->
        <div id="adminTabContent" class="admin-tab-content">
          <!-- Injected via renderActiveTab -->
        </div>
      </div>
    `;

    await checkConnection();
    await loadUsers();
    await loadStats();
    renderActiveTab();
  }

  function switchTab(tab) {
    activeTab = tab;
    document.querySelectorAll('.admin-tab-btn').forEach(btn => btn.classList.remove('active'));
    renderActiveTab();
  }

  async function loadStats() {
    let statsLoaded = false;
    try {
      const res = await fetch(getApiUrl('/api/admin/stats'));
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          cachedStats = json.data;
          statsLoaded = true;
        }
      }
    } catch (e) {
      console.warn('Gagal load stats dari backend:', e.message);
    }

    if (!statsLoaded) {
      const blacklist = getDeletedUserBlacklist();
      const rawUsers = (cachedUsers && cachedUsers.length > 0) ? cachedUsers : getLocalFallbackUsers();
      const users = rawUsers.filter(u => !blacklist.includes(String(u.nomor_induk || '').trim()));
      const mhs = users.filter(u => u.role === 'MAHASISWA').length;
      const staf = users.filter(u => u.role === 'STAF').length;
      const kasi = users.filter(u => u.role === 'KASI').length;
      const admin = users.filter(u => u.role === 'ADMIN').length;

      let allPengajuan = [];
      if (typeof QueueSlaManager !== 'undefined' && typeof QueueSlaManager.getAllRequests === 'function') {
        allPengajuan = QueueSlaManager.getAllRequests() || [];
      }
      if (!allPengajuan || allPengajuan.length === 0) {
        allPengajuan = getLocalFallbackPengajuan();
      }

      const totalP = allPengajuan.length;
      const selesaiP = allPengajuan.filter(p => p.status === 'selesai').length;
      const prosesP = allPengajuan.filter(p => p.status !== 'selesai' && p.status !== 'ditolak').length;

      cachedStats = {
        users: { total: users.length, mahasiswa: mhs, staf, kasi, admin },
        pengajuan: { total: totalP, selesai: selesaiP, dalamProses: prosesP }
      };
    }

    if (cachedStats) {
      const u = cachedStats.users;
      const p = cachedStats.pengajuan;
      const mhsEl = document.getElementById('statMhsVal');
      const staffEl = document.getElementById('statStaffVal');
      const adminEl = document.getElementById('statAdminVal');
      const pengajuanEl = document.getElementById('statPengajuanVal');
      const selesaiEl = document.getElementById('statPengajuanSelesai');
      if (mhsEl) mhsEl.textContent = u.mahasiswa;
      if (staffEl) staffEl.textContent = (u.staf + u.kasi);
      if (adminEl) adminEl.textContent = u.admin;
      if (pengajuanEl) pengajuanEl.textContent = p.total;
      if (selesaiEl) selesaiEl.textContent = `${p.selesai} Selesai • ${p.dalamProses} Diproses`;
    }
  }

  async function loadUsers() {
    const blacklist = getDeletedUserBlacklist();
    try {
      const res = await fetch(getApiUrl('/api/admin/users'));
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          cachedUsers = json.data
            .filter(u => !blacklist.includes(String(u.nomor_induk || '').trim()))
            .map(u => ({
              ...u,
              email: formatStudentEmail(u.nama, u.nomor_induk, u.email)
            }));
          return;
        }
      }
    } catch (e) {
      console.warn('Gagal load users dari backend, beralih ke data lokal:', e.message);
    }
    cachedUsers = getLocalFallbackUsers();
  }

  async function refreshData() {
    App.showToast('Menyinkronkan data...', 'info');
    const isConnected = await checkConnection();
    await loadUsers();
    await loadStats();
    if (activeTab === 'pengajuan') await loadPengajuan();
    if (activeTab === 'matakuliah') await loadMataKuliah();
    renderActiveTab();
    App.showToast(isConnected ? 'Data berhasil diperbarui dari PostgreSQL!' : 'Data berhasil dimuat dari penyimpanan lokal!', 'success');
  }

  function renderActiveTab() {
    const tabContainer = document.getElementById('adminTabContent');
    if (!tabContainer) return;

    if (activeTab === 'users' || activeTab === 'spp') {
      renderUsersTab(tabContainer);
    } else if (activeTab === 'pengajuan') {
      renderPengajuanTab(tabContainer);
    } else if (activeTab === 'matakuliah') {
      renderMataKuliahTab(tabContainer);
    } else if (activeTab === 'kelola_mhs') {
      renderKelolaMhsTab(tabContainer);
    }
  }

  // -------------------------------------------------------------
  // TAB 1: MANAJEMEN USERS
  // -------------------------------------------------------------
  function renderUsersTab(container) {
    let filtered = cachedUsers.filter(u => {
      const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
      const q = searchQuery.toLowerCase();
      const matchSearch = !q ||
        u.nama.toLowerCase().includes(q) ||
        u.nomor_induk.toLowerCase().includes(q) ||
        (u.email && u.email.toLowerCase().includes(q));
      return matchRole && matchSearch;
    });

    container.innerHTML = `
      <div class="admin-panel-card">
        <div class="admin-card-header">
          <div class="admin-card-header-info">
            <h3>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              Manajemen Pengguna & Otoritas Akun
            </h3>
            <p>Kelola data akun sivitas akademika (Mahasiswa, Staf TU, KASI, dan Administrator) serta hak aksesnya.</p>
          </div>
          <div class="admin-card-header-actions">
            <button class="btn btn-sm btn-primary" onclick="AdminView.openAddUserModal()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Tambah Pengguna Baru
            </button>
          </div>
        </div>

        <div class="admin-subtoolbar">
          <div class="search-input-box">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" placeholder="Cari nama, NIM, atau NIP..." value="${searchQuery}" oninput="AdminView.handleSearch(this.value)" />
          </div>

          <div class="filter-group">
            <label>Filter Peran:</label>
            <select onchange="AdminView.handleRoleFilter(this.value)">
              <option value="ALL" ${roleFilter === 'ALL' ? 'selected' : ''}>Semua Peran (${cachedUsers.length})</option>
              <option value="MAHASISWA" ${roleFilter === 'MAHASISWA' ? 'selected' : ''}>Mahasiswa</option>
              <option value="STAF" ${roleFilter === 'STAF' ? 'selected' : ''}>Staf TU</option>
              <option value="KASI" ${roleFilter === 'KASI' ? 'selected' : ''}>KASI</option>
              <option value="ADMIN" ${roleFilter === 'ADMIN' ? 'selected' : ''}>Admin</option>
            </select>
          </div>
        </div>

        <div class="table-scroll-indicator">
          <span class="tsi-arrow">👉</span>
          <span>Geser tabel ke samping untuk melihat detail pengguna ➔</span>
        </div>
        <div class="table-responsive">
          <table class="admin-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Pengguna</th>
                <th>Nomor Induk</th>
                <th>Peran (Role)</th>
                <th>Program Studi</th>
                <th>Informasi Akademik</th>
                <th>Status</th>
                <th style="text-align:right;">Aksi</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.length === 0 ? `
                <tr>
                  <td colspan="8" style="text-align:center; padding: 2rem; color: var(--text-muted);">
                    Tidak ada data pengguna yang sesuai dengan filter.
                  </td>
                </tr>
              ` : filtered.map((u, idx) => {
                let badgeClass = 'badge-role-mahasiswa';
                let roleName = 'Mahasiswa';
                if (u.role === 'STAF') { badgeClass = 'badge-role-staff'; roleName = 'Staf TU'; }
                else if (u.role === 'KASI') { badgeClass = 'badge-role-kasi'; roleName = 'KASI'; }
                else if (u.role === 'ADMIN') { badgeClass = 'badge-role-admin'; roleName = 'Admin'; }

                let initial = u.nama.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

                return `
                  <tr>
                    <td>${idx + 1}</td>
                    <td>
                      <div class="user-row-info">
                        <div class="user-mini-avatar ${badgeClass}">
                          ${initial}
                        </div>
                        <div>
                          <div class="user-row-name">${u.nama}</div>
                          <div class="user-row-email">${formatStudentEmail(u.nama, u.nomor_induk, u.email)}</div>
                        </div>
                      </div>
                    </td>
                    <td><span class="code-pill">${u.nomor_induk}</span></td>
                    <td><span class="role-badge ${badgeClass}">${roleName}</span></td>
                    <td>${u.prodi || 'S1 Bisnis Digital'}</td>
                    <td>
                      ${u.role === 'MAHASISWA' ? `
                        <div class="academic-mini-detail">
                          <span>Sem. <strong>${u.semester_berjalan || 1}</strong></span> • 
                          <span>IPK: <strong>${(u.ipk !== null && u.ipk !== undefined && u.ipk !== '' && Number(u.ipk) > 0) ? u.ipk : '<em style="color:var(--text-subtle);">Belum ada data</em>'}</strong></span> • 
                          <span class="spp-pill ${u.spp_status === 'LUNAS' ? 'lunas' : 'belum'}">
                            ${u.spp_status === 'LUNAS' ? 'SPP Lunas' : 'SPP Belum'}
                          </span>
                        </div>
                      ` : `<span style="color:var(--text-subtle); font-size:0.8rem;">Pegawai UPI</span>`}
                    </td>
                    <td>
                      ${(() => {
                        const nimStr = String(u.nomor_induk || '').trim();
                        const isCuti = (u.role === 'MAHASISWA' && (getStudentCutiStatus(nimStr) || u.status_akademik === 'CUTI'));
                        const isNonaktif = (u.is_active === false || u.status_akademik === 'NON-AKTIF' || u.status_akademik === 'NONAKTIF');
                        if (isCuti) {
                          return `
                            <span class="status-pill cuti" style="color:#d97706; font-weight:700; display:inline-flex; align-items:center;">
                              <span class="status-indicator warning" style="background:#f59e0b; box-shadow:0 0 0 2px rgba(245, 158, 11, 0.25);"></span>
                              Cuti
                            </span>
                          `;
                        } else if (isNonaktif) {
                          return `
                            <span class="status-pill inactive" style="display:inline-flex; align-items:center;">
                              <span class="status-indicator inactive"></span>
                              Nonaktif
                            </span>
                          `;
                        } else {
                          return `
                            <span class="status-pill active" style="display:inline-flex; align-items:center;">
                              <span class="status-indicator active"></span>
                              Aktif
                            </span>
                          `;
                        }
                      })()}
                    </td>
                    <td style="text-align:right;">
                      <div class="action-btn-group">
                        ${u.role === 'MAHASISWA' ? `
                          <button class="btn-action nilai" onclick="AdminView.openManageNilaiModal('${u.nomor_induk}', '${u.nama.replace(/'/g, "\\'")}')" title="Kelola Nilai Mahasiswa (Insert & Update)">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                            Nilai
                          </button>
                        ` : ''}
                        <button class="btn-action edit" onclick="AdminView.openEditUserModal('${u.id}')" title="Edit Pengguna (Update Data)">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          Edit
                        </button>
                        <button class="btn-action delete" onclick="AdminView.confirmDeleteUser('${u.id}', '${u.nomor_induk}', '${u.nama.replace(/'/g, "\\'")}')" title="Hapus Pengguna dari Database">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function handleSearch(val) {
    searchQuery = val;
    renderActiveTab();
  }

  function handleRoleFilter(val) {
    roleFilter = val;
    renderActiveTab();
  }

  // -------------------------------------------------------------
  // TAB 2: MANAJEMEN SPP MAHASISWA
  // -------------------------------------------------------------
  function renderSppTab(container) {
    const blacklist = getDeletedUserBlacklist();
    const mahasiswaList = cachedUsers.filter(u => u.role === 'MAHASISWA' && !blacklist.includes(String(u.nomor_induk || '').trim()));

    container.innerHTML = `
      <div class="admin-panel-card">
        <div class="admin-card-header">
          <div class="admin-card-header-info">
            <h3>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
              Kontrol Status Pembayaran SPP Mahasiswa
            </h3>
            <p>Validasi dan kelola status pelunasan SPP mahasiswa untuk integrasi otomatis izin pengajuan Transkrip Nilai.</p>
          </div>
          <div class="admin-card-header-actions">
            <span class="header-counter-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
              ${mahasiswaList.length} Mahasiswa Terdata
            </span>
          </div>
        </div>

        <div class="table-scroll-indicator">
          <span class="tsi-arrow">👉</span>
          <span>Geser tabel ke samping untuk melihat detail pengguna ➔</span>
        </div>
        <div class="table-responsive">
          <table class="admin-table">
            <thead>
              <tr>
                <th>No</th>
                <th>NIM</th>
                <th>Nama Mahasiswa</th>
                <th>Semester Berjalan</th>
                <th>IPK / SKS</th>
                <th>Status Pembayaran SPP</th>
                <th style="text-align:right;">Aksi Cepat</th>
              </tr>
            </thead>
            <tbody>
              ${mahasiswaList.length === 0 ? `
                <tr><td colspan="7" style="text-align:center; padding:2.5rem 1.5rem; color:var(--text-muted);">Belum ada data mahasiswa di sistem.</td></tr>
              ` : mahasiswaList.map((m, idx) => {
                const isLunas = m.spp_status === 'LUNAS';
                return `
                  <tr>
                    <td>${idx + 1}</td>
                    <td><span class="code-pill">${m.nomor_induk}</span></td>
                    <td><strong>${m.nama}</strong></td>
                    <td>Semester ${m.semester_berjalan || 1}</td>
                    <td>${(m.ipk && Number(m.ipk) > 0) ? m.ipk : '<span style="color:#94a3b8; font-style:italic;">Belum ada data</span>'} (${m.total_sks_lulus ? m.total_sks_lulus + ' SKS' : '<span style="color:#94a3b8; font-style:italic;">Belum ada data</span>'})</td>
                    <td>
                      <span class="spp-status-badge ${isLunas ? 'lunas' : 'belum'}">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                          ${isLunas ? '<polyline points="20 6 9 17 4 12"></polyline>' : '<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>'}
                        </svg>
                        ${isLunas ? 'LUNAS (Dapat Mengajukan Dokumen)' : 'BELUM LUNAS (Terblokir)'}
                      </span>
                    </td>
                    <td style="text-align:right;">
                      <button class="btn btn-sm ${isLunas ? 'btn-danger-outline' : 'btn-success'}" style="display:inline-flex; align-items:center; gap:0.35rem;" onclick="AdminView.quickToggleSpp('${m.nomor_induk}', '${isLunas ? 'BELUM_LUNAS' : 'LUNAS'}')">
                        ${isLunas ? 'Set Belum Lunas' : '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> Set Lunas Sekarang'}
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  async function quickToggleSpp(nim, targetStatus) {
    try {
      const res = await fetch(getApiUrl(`/api/students/${encodeURIComponent(nim)}/spp`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: targetStatus })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          App.showToast(`Status SPP ${nim} diubah menjadi ${targetStatus}`, 'success');
        }
      }
    } catch (e) {
      console.warn('API SPP offline, sinkronkan lokal:', e.message);
    }

    // Selalu sinkronkan ke local user cache & SiakadApi
    const m = cachedUsers.find(u => u.nomor_induk === nim);
    if (m) {
      m.spp_status = targetStatus;
      saveLocalUsers(cachedUsers);
    }
    if (typeof SiakadApi !== 'undefined' && SiakadApi.databaseSiakad && SiakadApi.databaseSiakad[nim]) {
      SiakadApi.databaseSiakad[nim].statusSpp = targetStatus === 'LUNAS' ? 'Lunas' : 'Belum Lunas';
    }

    App.showToast(`Status SPP ${nim} berhasil diubah menjadi ${targetStatus}!`, 'success');
    renderActiveTab();
  }

  // -------------------------------------------------------------
  // TAB 3: MONITORING PENGAJUAN DOKUMEN
  // -------------------------------------------------------------
  async function loadPengajuan() {
    try {
      const res = await fetch(getApiUrl('/api/pengajuan'));
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          cachedPengajuan = json.data;
          return;
        }
      }
    } catch (e) {
      console.warn('Gagal load pengajuan dari backend:', e.message);
    }
    cachedPengajuan = getLocalFallbackPengajuan();
  }

  async function renderPengajuanTab(container) {
    container.innerHTML = `<div class="card p-4 text-center">Memuat riwayat pengajuan...</div>`;
    await loadPengajuan();

    container.innerHTML = `
      <div class="admin-panel-card">
        <div class="admin-card-header">
          <div class="admin-card-header-info">
            <h3>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
              Monitoring Antrean & SLA Pengajuan Dokumen
            </h3>
            <p>Pantau seluruh permohonan berkas mahasiswa, kepatuhan batas waktu SLA kerja, dan riwayat dokumen yang telah disahkan.</p>
          </div>
          <div class="admin-card-header-actions">
            <span class="header-counter-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              ${cachedPengajuan.length} Berkas Terdaftar
            </span>
          </div>
        </div>

        <div class="table-scroll-indicator">
          <span class="tsi-arrow">👉</span>
          <span>Geser tabel ke samping untuk melihat detail pengguna ➔</span>
        </div>
        <div class="table-responsive">
          <table class="admin-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Nomor Pengajuan</th>
                <th>Mahasiswa (NIM)</th>
                <th>Jenis Dokumen</th>
                <th>Keperluan</th>
                <th>Status SLA</th>
                <th>Dokumen Resmi</th>
                <th style="text-align:right;">Aksi</th>
              </tr>
            </thead>
            <tbody>
              ${cachedPengajuan.length === 0 ? `
                <tr><td colspan="8" style="text-align:center; padding:2.5rem 1.5rem; color:var(--text-muted);">Belum ada pengajuan dokumen di database.</td></tr>
              ` : cachedPengajuan.map((p, idx) => {
                let statusColor = 'var(--status-pending)';
                let statusLabel = 'Dalam Antrean';
                if (p.status === 'verifikasi_staf') {
                  statusColor = 'var(--status-process)';
                  statusLabel = 'Ditinjau Staf';
                } else if (p.status === 'selesai') {
                  statusColor = 'var(--status-approved)';
                  statusLabel = 'Selesai & Disahkan';
                } else if (p.status === 'ditolak') {
                  statusColor = 'var(--status-rejected)';
                  statusLabel = 'Ditolak';
                }

                return `
                  <tr>
                    <td>${idx + 1}</td>
                    <td><span class="code-pill">${p.id}</span></td>
                    <td>
                      <div class="user-row-name">${p.nama}</div>
                      <span class="code-pill" style="font-size:0.725rem;">${p.nim}</span>
                    </td>
                    <td>
                      <div style="font-weight:600; color:var(--text-main);">${p.docTitle}</div>
                      <span style="font-size:0.75rem; color:var(--text-muted);">Semester ${p.semester}</span>
                    </td>
                    <td><span style="font-size:0.825rem; color:var(--text-main);">${p.keperluan || '-'}</span></td>
                    <td>
                      <span class="status-badge-custom" style="background:${statusColor}22; color:${statusColor}; border:1px solid ${statusColor}66;">
                        ${statusLabel}
                      </span>
                    </td>
                    <td>
                      ${p.nomorDokumenResmi ? `
                        <span style="color:#059669; font-weight:600; font-size:0.8rem; display:inline-flex; align-items:center; gap:0.25rem;">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          ${p.nomorDokumenResmi}
                        </span>
                      ` : `<span style="color:var(--text-subtle); font-size:0.85rem;">-</span>`}
                    </td>
                    <td style="text-align:right;">
                      <button class="btn-action delete" onclick="AdminView.deletePengajuan('${p.id}')" title="Hapus Pengajuan">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  async function deletePengajuan(nomorPengajuan) {
    if (!confirm(`Yakin ingin menghapus permohonan ${nomorPengajuan}?`)) return;

    try {
      const res = await fetch(getApiUrl(`/api/pengajuan/${encodeURIComponent(nomorPengajuan)}`), { method: 'DELETE' });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          App.showToast('Pengajuan dokumen berhasil dihapus!', 'success');
        }
      }
    } catch (e) {
      console.warn('API delete pengajuan offline:', e.message);
    }

    cachedPengajuan = cachedPengajuan.filter(p => p.id !== nomorPengajuan);
    try {
      localStorage.setItem('siladik_requests_queue_v1', JSON.stringify(cachedPengajuan));
    } catch (e) {}

    App.showToast('Pengajuan dokumen berhasil dihapus (Lokal)!', 'success');
    await loadPengajuan();
    await loadStats();
    renderActiveTab();
  }

  // -------------------------------------------------------------
  // TAB 4: MATA KULIAH
  // -------------------------------------------------------------
  async function loadMataKuliah() {
    try {
      const res = await fetch(getApiUrl('/api/admin/mata-kuliah'));
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          cachedMataKuliah = json.data;
          return;
        }
      }
    } catch (e) {
      console.warn('Gagal load MK dari backend:', e.message);
    }
    cachedMataKuliah = getLocalFallbackMataKuliah();
  }

  async function renderMataKuliahTab(container) {
    container.innerHTML = `<div class="card p-4 text-center">Memuat mata kuliah...</div>`;
    await loadMataKuliah();

    container.innerHTML = `
      <div class="admin-panel-card">
        <div class="admin-card-header">
          <div class="admin-card-header-info">
            <h3>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
              Katalog Kurikulum & Mata Kuliah SIAKAD
            </h3>
            <p>Daftar mata kuliah dan bobot SKS resmi untuk penyusunan otomatis draf KRS, KHS, dan Transkrip Nilai.</p>
          </div>
          <div class="admin-card-header-actions admin-action-btn-group">
            <button class="btn btn-sm btn-outline" onclick="AdminView.openAddMataKuliahModal()" title="Tambah Mata Kuliah Manual">
              + Tambah Matkul
            </button>
            <button class="btn-excel-export" onclick="AdminView.exportNilaiToExcel()" title="Ekspor seluruh rekapitulasi nilai mahasiswa ke format Excel (.xlsx)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Ekspor Nilai (.xlsx)
            </button>
            <button class="btn-excel-import" onclick="AdminView.openImportNilaiModal()" title="Impor nilai akademik mahasiswa secara massal dari Excel (.xlsx / .csv)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              Impor Nilai Massal (.xlsx)
            </button>
          </div>
        </div>

        <div class="admin-info-banner">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
          <span>Fitur <strong>Impor Nilai Massal</strong>: Admin dapat mengunggah file Excel nilai mahasiswa per semester sekaligus tanpa input manual satu per satu. Seluruh draf KHS dan Transkrip Nilai mahasiswa otomatis diperbarui secara instan.</span>
        </div>

        <div class="table-scroll-indicator">
          <span class="tsi-arrow">👉</span>
          <span>Geser tabel ke samping untuk melihat detail pengguna ➔</span>
        </div>
        <div class="table-responsive">
          <table class="admin-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Kode MK</th>
                <th>Nama Mata Kuliah</th>
                <th>SKS</th>
                <th>Paket Semester</th>
                <th>Program Studi</th>
              </tr>
            </thead>
            <tbody>
              ${cachedMataKuliah.length === 0 ? `
                <tr><td colspan="6" style="text-align:center; padding:2.5rem 1.5rem; color:var(--text-muted);">Belum ada mata kuliah yang terdaftar di database.</td></tr>
              ` : cachedMataKuliah.map((mk, idx) => `
                <tr>
                  <td>${idx + 1}</td>
                  <td><span class="code-pill">${mk.kode_mk}</span></td>
                  <td><strong>${mk.nama_mk}</strong></td>
                  <td>${mk.sks} SKS</td>
                  <td>Semester ${mk.semester_paket}</td>
                  <td>${mk.prodi}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // -------------------------------------------------------------
  // MODAL: INSERT USER BARU (TAMBAH DATA)
  // -------------------------------------------------------------
  function openAddUserModal() {
    const content = `
      <form onsubmit="AdminView.submitAddUser(event)" class="admin-modal-form">
        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label" for="newRole">Peran (Role) Pengguna <span class="text-danger">*</span></label>
            <select id="newRole" class="form-control" onchange="AdminView.toggleRoleFields(this.value)" required>
              <option value="MAHASISWA">Mahasiswa</option>
              <option value="STAF">Staf TU Layanan Akademik</option>
              <option value="KASI">Kepala Seksi (KASI)</option>
              <option value="ADMIN">Administrator Sistem</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="newNomorInduk">Nomor Induk (NIM / NIP) <span class="text-danger">*</span></label>
            <input type="text" id="newNomorInduk" class="form-control" placeholder="Contoh: 2312999 atau 1987..." required />
          </div>
        </div>

        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label" for="newNama">Nama Lengkap (beserta gelar jika ada) <span class="text-danger">*</span></label>
            <input type="text" id="newNama" class="form-control" placeholder="Nama Lengkap..." required />
          </div>

          <div class="form-group">
            <label class="form-label" for="newEmail">Email Kampus (@upi.edu)</label>
            <input type="email" id="newEmail" class="form-control" placeholder="nama@upi.edu" />
          </div>
        </div>

        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label" for="newPassword">Kata Sandi Default</label>
            <input type="text" id="newPassword" class="form-control" value="password123" required />
            <small class="form-hint">Standar: password123 (akan di-hash dengan bcrypt secara aman)</small>
          </div>

          <div class="form-group">
            <label class="form-label" for="newProdi">Program Studi</label>
            <input type="text" id="newProdi" class="form-control" value="S1 Bisnis Digital" required />
          </div>
        </div>

        <!-- Bagian Khusus Mahasiswa -->
        <div id="mhsSpecificFields" class="mhs-specific-box">
          <div class="mhs-box-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/></svg>
            Data Akademik & Profil Mahasiswa
          </div>

          <div class="form-row-3">
            <div class="form-group">
              <label class="form-label" for="newSemester">Semester Berjalan</label>
              <input type="number" id="newSemester" class="form-control" min="1" max="14" value="1" />
            </div>

            <div class="form-group">
              <label class="form-label" for="newAngkatan">Tahun Angkatan</label>
              <input type="number" id="newAngkatan" class="form-control" value="2024" />
            </div>

            <div class="form-group">
              <label class="form-label" for="newIpk">IPK Awal</label>
              <input type="number" id="newIpk" class="form-control" step="0.01" min="0" max="4.00" value="3.50" />
            </div>
          </div>

          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label" for="newSks">Total SKS Lulus</label>
              <input type="number" id="newSks" class="form-control" min="0" max="160" value="20" />
            </div>

            <div class="form-group">
              <label class="form-label" for="newSpp">Status Pembayaran SPP</label>
              <select id="newSpp" class="form-control">
                <option value="LUNAS">LUNAS (Dapat Mengajukan Dokumen)</option>
                <option value="BELUM_LUNAS">BELUM LUNAS (Terblokir)</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="newDosenPa">Dosen Pembimbing Akademik (PA)</label>
            <input type="text" id="newDosenPa" class="form-control" value="Muhammad Rizki Nugraha, S.Pd., M.T." />
          </div>
        </div>

        <div class="modal-form-actions">
          <button type="button" class="btn btn-outline" onclick="App.closeModal()">Batal</button>
          <button type="submit" class="btn btn-primary" id="btnSubmitAddUser">
            Simpan Pengguna
          </button>
        </div>
      </form>
    `;

    App.openCustomModal('Tambah Pengguna Baru', content);
  }

  function toggleRoleFields(role) {
    const box = document.getElementById('mhsSpecificFields');
    if (box) {
      box.style.display = role === 'MAHASISWA' ? 'block' : 'none';
    }
  }

  async function submitAddUser(e) {
    e.preventDefault();
    const btn = document.getElementById('btnSubmitAddUser');
    if (btn) btn.disabled = true;

    const role = document.getElementById('newRole').value;
    const body = {
      role,
      nomor_induk: document.getElementById('newNomorInduk').value.trim(),
      nama: document.getElementById('newNama').value.trim(),
      email: document.getElementById('newEmail').value.trim(),
      password: document.getElementById('newPassword').value.trim(),
      prodi: document.getElementById('newProdi').value.trim(),
    };

    if (role === 'MAHASISWA') {
      body.semester_berjalan = parseInt(document.getElementById('newSemester').value, 10) || 1;
      body.angkatan = parseInt(document.getElementById('newAngkatan').value, 10) || 2024;
      body.ipk = parseFloat(document.getElementById('newIpk').value) || 0.00;
      body.total_sks_lulus = parseInt(document.getElementById('newSks').value, 10) || 0;
      body.spp_status = (document.getElementById('newSpp') && document.getElementById('newSpp').value) || 'LUNAS';
      body.dosen_pa = document.getElementById('newDosenPa').value.trim();
    }

    try {
      const apiUrl = getApiUrl('/api/admin/users');
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const json = await res.json();

      if (res.ok && json.success) {
        App.closeModal();
        App.showToast(`Berhasil menambahkan ${body.nama} ke basis data!`, 'success');
        await loadStats();
        await loadUsers();
        renderActiveTab();
        return;
      }
    } catch (err) {
      console.warn('API insert user offline, gunakan penyimpanan lokal:', err.message);
    }

    // Fallback simpan lokal saat PostgreSQL offline
    const newId = cachedUsers.length > 0 ? Math.max(...cachedUsers.map(u => (typeof u.id === 'number' ? u.id : 0))) + 1 : 1;
    const newUser = {
      id: newId,
      nomor_induk: body.nomor_induk,
      nama: body.nama,
      email: body.email || `${body.nomor_induk}@upi.edu`,
      role: role.toUpperCase(),
      prodi: body.prodi || 'S1 Bisnis Digital',
      is_active: true,
      created_at: new Date().toISOString(),
      semester_berjalan: body.semester_berjalan || 1,
      angkatan: body.angkatan || 2024,
      total_sks_lulus: body.total_sks_lulus || 0,
      ipk: body.ipk || 0.0,
      dosen_pa: body.dosen_pa || 'Muhammad Rizki Nugraha, S.Pd., M.T.',
      spp_status: body.spp_status || 'LUNAS'
    };
    cachedUsers.unshift(newUser);
    saveLocalUsers(cachedUsers);
    App.closeModal();
    App.showToast(`Berhasil menambahkan ${body.nama} (Tersimpan Lokal)!`, 'success');
    await loadStats();
    renderActiveTab();
  }

  // -------------------------------------------------------------
  // MODAL: EDIT USER (UPDATE DATA)
  // -------------------------------------------------------------
  function openEditUserModal(userId) {
    const user = cachedUsers.find(u => String(u.id) === String(userId) || String(u.nomor_induk) === String(userId));
    if (!user) {
      App.showToast('Data user tidak ditemukan.', 'error');
      return;
    }

    const isMhs = user.role === 'MAHASISWA';

    const content = `
      <form onsubmit="AdminView.submitEditUser(event, '${user.id}')" class="admin-modal-form">
        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label">Nomor Induk (NIM/NIP)</label>
            <input type="text" class="form-control" value="${user.nomor_induk}" disabled />
            <small class="form-hint">Nomor induk bersifat unik dan menjadi kunci identitas akun.</small>
          </div>

          <div class="form-group">
            <label class="form-label" for="editRole">Peran (Role)</label>
            <select id="editRole" class="form-control" onchange="AdminView.toggleEditRoleFields(this.value)">
              <option value="MAHASISWA" ${user.role === 'MAHASISWA' ? 'selected' : ''}>Mahasiswa</option>
              <option value="STAF" ${user.role === 'STAF' ? 'selected' : ''}>Staf TU Layanan Akademik</option>
              <option value="KASI" ${user.role === 'KASI' ? 'selected' : ''}>Kepala Seksi (KASI)</option>
              <option value="ADMIN" ${user.role === 'ADMIN' ? 'selected' : ''}>Administrator Sistem</option>
            </select>
          </div>
        </div>

        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label" for="editNama">Nama Lengkap <span class="text-danger">*</span></label>
            <input type="text" id="editNama" class="form-control" value="${user.nama}" required />
          </div>

          <div class="form-group">
            <label class="form-label" for="editEmail">Email Kampus</label>
            <input type="email" id="editEmail" class="form-control" value="${user.email || ''}" />
          </div>
        </div>

        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label" for="editPassword">Ubah Kata Sandi (Opsional)</label>
            <input type="text" id="editPassword" class="form-control" placeholder="Kosongkan jika tidak diubah" />
            <small class="form-hint">Isi hanya jika ingin mereset kata sandi pengguna.</small>
          </div>

          <div class="form-group">
            <label class="form-label" for="editProdi">Program Studi</label>
            <input type="text" id="editProdi" class="form-control" value="${user.prodi || 'S1 Bisnis Digital'}" required />
          </div>
        </div>

        <div class="form-group">
          <label class="checkbox-label">
            <input type="checkbox" id="editIsActive" ${user.is_active ? 'checked' : ''} />
            <span>Akun Aktif (Bisa masuk ke sistem)</span>
          </label>
        </div>

        <!-- Khusus Mahasiswa -->
        <div id="editMhsBox" class="mhs-specific-box" style="display:${isMhs ? 'block' : 'none'};">
          <div class="mhs-box-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/></svg>
            Data Akademik & Status SPP Mahasiswa
          </div>

          <div class="form-row-3">
            <div class="form-group">
              <label class="form-label" for="editSemester">Semester Berjalan</label>
              <input type="number" id="editSemester" class="form-control" min="1" max="14" value="${user.semester_berjalan || 1}" />
            </div>

            <div class="form-group">
              <label class="form-label" for="editAngkatan">Angkatan</label>
              <input type="number" id="editAngkatan" class="form-control" value="${user.angkatan || 2023}" />
            </div>

            <div class="form-group">
              <label class="form-label" for="editIpk">IPK</label>
              <input type="number" id="editIpk" class="form-control" step="0.01" min="0" max="4.00" value="${user.ipk || 0.00}" />
            </div>
          </div>

          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label" for="editSks">Total SKS Lulus</label>
              <input type="number" id="editSks" class="form-control" value="${user.total_sks_lulus || 0}" />
            </div>

            <div class="form-group">
              <label class="form-label" for="editSpp">Status Pembayaran SPP</label>
              <select id="editSpp" class="form-control">
                <option value="LUNAS" ${user.spp_status === 'LUNAS' ? 'selected' : ''}>LUNAS (Bisa Mengajukan)</option>
                <option value="BELUM_LUNAS" ${user.spp_status !== 'LUNAS' ? 'selected' : ''}>BELUM LUNAS (Terblokir)</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="editDosenPa">Dosen PA</label>
            <input type="text" id="editDosenPa" class="form-control" value="${user.dosen_pa || 'Muhammad Rizki Nugraha, S.Pd., M.T.'}" />
          </div>
        </div>

        <div class="modal-form-actions">
          <button type="button" class="btn btn-outline" onclick="App.closeModal()">Batal</button>
          <button type="submit" class="btn btn-primary" id="btnSubmitEditUser">
            Simpan Perubahan
          </button>
        </div>
      </form>
    `;

    App.openCustomModal(`Edit Data Pengguna: ${user.nama}`, content);
  }

  function toggleEditRoleFields(role) {
    const box = document.getElementById('editMhsBox');
    if (box) {
      box.style.display = role === 'MAHASISWA' ? 'block' : 'none';
    }
  }

  async function submitEditUser(e, userId) {
    e.preventDefault();
    const btn = document.getElementById('btnSubmitEditUser');
    if (btn) btn.disabled = true;

    const role = document.getElementById('editRole').value;
    const body = {
      role,
      nama: document.getElementById('editNama').value.trim(),
      email: document.getElementById('editEmail').value.trim(),
      prodi: document.getElementById('editProdi').value.trim(),
      is_active: document.getElementById('editIsActive').checked,
    };

    const pass = document.getElementById('editPassword').value.trim();
    if (pass) body.password = pass;

    if (role === 'MAHASISWA') {
      body.semester_berjalan = parseInt(document.getElementById('editSemester').value, 10) || 1;
      body.angkatan = parseInt(document.getElementById('editAngkatan').value, 10) || 2024;
      body.ipk = parseFloat(document.getElementById('editIpk').value) || 0.00;
      body.total_sks_lulus = parseInt(document.getElementById('editSks').value, 10) || 0;
      body.status_spp = document.getElementById('editSpp').value;
      body.dosen_pa = document.getElementById('editDosenPa').value.trim();
    }

    try {
      const res = await fetch(getApiUrl(`/api/admin/users/${userId}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const json = await res.json();

      if (res.ok && json.success) {
        App.closeModal();
        App.showToast(`Data ${body.nama} berhasil diperbarui!`, 'success');
        await loadStats();
        await loadUsers();
        renderActiveTab();
        return;
      }
    } catch (err) {
      console.warn('API update user offline, simpan lokal:', err.message);
    }

    // Fallback update lokal
    const idx = cachedUsers.findIndex(u => String(u.id) === String(userId) || String(u.nomor_induk) === String(userId));
    if (idx !== -1) {
      cachedUsers[idx] = {
        ...cachedUsers[idx],
        ...body,
        role: role.toUpperCase()
      };
      saveLocalUsers(cachedUsers);
      App.closeModal();
      App.showToast(`Data ${body.nama} berhasil diperbarui (Tersimpan Lokal)!`, 'success');
      await loadStats();
      renderActiveTab();
    }
  }

  // -------------------------------------------------------------
  // DELETE USER
  // -------------------------------------------------------------
  async function confirmDeleteUser(userId, nomorInduk, nama) {
    const targetUser = cachedUsers.find(u => 
      String(u.id) === String(userId) || 
      String(u.nomor_induk || '').trim() === String(nomorInduk || '').trim() || 
      String(u.nomor_induk || '').trim() === String(userId || '').trim()
    );

    const actualNim = targetUser ? String(targetUser.nomor_induk).trim() : String(nomorInduk || userId).trim();
    const displayName = nama || (targetUser ? targetUser.nama : actualNim);

    if (!confirm(`Apakah Anda yakin ingin menghapus akun "${displayName}" (NIM/NIP: ${actualNim})? Data akun ini akan dihapus secara permanen dari sistem.`)) {
      return;
    }

    // 1. Catat ke Blacklist agar tidak dibangkitkan lagi oleh fallback / sinkronisasi lokal
    if (actualNim) {
      addDeletedUserBlacklist(actualNim);
    }

    // 2. Request DELETE ke API Backend PostgreSQL jika aktif
    try {
      if (targetUser && targetUser.id) {
        await fetch(getApiUrl(`/api/admin/users/${encodeURIComponent(targetUser.id)}`), { method: 'DELETE' });
      }
      if (actualNim) {
        await fetch(getApiUrl(`/api/admin/users/${encodeURIComponent(actualNim)}`), { method: 'DELETE' });
      }
    } catch (e) {
      console.warn('Backend API offline, lanjutkan penghapusan lokal:', e.message);
    }

    // 3. Hapus dari cachedUsers di memori
    cachedUsers = cachedUsers.filter(u => 
      String(u.id) !== String(userId) && 
      String(u.nomor_induk || '').trim() !== actualNim &&
      (targetUser ? String(u.id) !== String(targetUser.id) : true)
    );
    saveLocalUsers(cachedUsers);

    // 4. Hapus dari daftar registrasi mandiri AuthManager (siladik_registered_students_v1 & sipakad_registered_students_v1)
    if (typeof AuthManager !== 'undefined' && typeof AuthManager.deleteRegisteredStudent === 'function') {
      AuthManager.deleteRegisteredStudent(actualNim);
    } else {
      ['siladik_registered_students_v1', 'sipakad_registered_students_v1'].forEach(key => {
        try {
          const storedReg = localStorage.getItem(key);
          if (storedReg) {
            const list = JSON.parse(storedReg);
            const filtered = list.filter(s => String(s.nim || '').trim() !== actualNim && String(s.nomor_induk || '').trim() !== actualNim);
            localStorage.setItem(key, JSON.stringify(filtered));
          }
        } catch (e) {}
      });
    }

    // 5. Hapus dari SiakadApi.databaseSiakad
    if (typeof SiakadApi !== 'undefined' && SiakadApi.databaseSiakad && actualNim) {
      delete SiakadApi.databaseSiakad[actualNim];
    }

    // 6. Jika akun yang dihapus sedang login di session aktif, bersihkan session
    if (typeof AuthManager !== 'undefined' && typeof AuthManager.getCurrentUser === 'function') {
      const cur = AuthManager.getCurrentUser();
      if (cur && (String(cur.nim || '').trim() === actualNim || String(cur.nip || '').trim() === actualNim || String(cur.nomor_induk || '').trim() === actualNim)) {
        if (typeof AuthManager.setCurrentUser === 'function') {
          AuthManager.setCurrentUser(null);
        } else {
          sessionStorage.removeItem('siladik_session_user_v1');
          sessionStorage.removeItem('sipakad_session_user_v1');
        }
      }
    }

    App.showToast(`Akun "${displayName}" berhasil dihapus permanen!`, 'success');
    await loadStats();
    renderActiveTab();
  }

  // -------------------------------------------------------------
  // MODAL: TAMBAH MATA KULIAH
  // -------------------------------------------------------------
  function openAddMataKuliahModal() {
    const content = `
      <form onsubmit="AdminView.submitAddMataKuliah(event)" class="admin-modal-form">
        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label" for="mkKode">Kode Mata Kuliah <span class="text-danger">*</span></label>
            <input type="text" id="mkKode" class="form-control" placeholder="Contoh: BD705" required />
          </div>

          <div class="form-group">
            <label class="form-label" for="mkSks">Bobot SKS <span class="text-danger">*</span></label>
            <input type="number" id="mkSks" class="form-control" min="1" max="6" value="3" required />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="mkNama">Nama Mata Kuliah <span class="text-danger">*</span></label>
          <input type="text" id="mkNama" class="form-control" placeholder="Contoh: Big Data Analytics & Cloud Computing" required />
        </div>

        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label" for="mkSemester">Paket Semester</label>
            <input type="number" id="mkSemester" class="form-control" min="1" max="8" value="7" required />
          </div>

          <div class="form-group">
            <label class="form-label" for="mkProdi">Program Studi</label>
            <input type="text" id="mkProdi" class="form-control" value="S1 Bisnis Digital" required />
          </div>
        </div>

        <div class="modal-form-actions">
          <button type="button" class="btn btn-outline" onclick="App.closeModal()">Batal</button>
          <button type="submit" class="btn btn-primary" id="btnSubmitMk">Simpan Mata Kuliah</button>
        </div>
      </form>
    `;

    App.openCustomModal('Tambah Mata Kuliah Baru', content);
  }

  async function submitAddMataKuliah(e) {
    e.preventDefault();
    const body = {
      kode_mk: document.getElementById('mkKode').value.trim(),
      nama_mk: document.getElementById('mkNama').value.trim(),
      sks: parseInt(document.getElementById('mkSks').value, 10),
      semester_paket: parseInt(document.getElementById('mkSemester').value, 10),
      prodi: document.getElementById('mkProdi').value.trim(),
    };

    try {
      const res = await fetch(getApiUrl('/api/admin/mata-kuliah'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          App.closeModal();
          App.showToast(`Mata kuliah ${body.nama_mk} berhasil ditambahkan!`, 'success');
          await loadMataKuliah();
          renderActiveTab();
          return;
        }
      }
    } catch (e) {
      console.warn('API tambah mata kuliah offline, simpan lokal:', e.message);
    }

    // Fallback simpan lokal
    const newMk = {
      id: cachedMataKuliah.length + 1,
      ...body
    };
    cachedMataKuliah.push(newMk);
    saveLocalMataKuliah(cachedMataKuliah);
    App.closeModal();
    App.showToast(`Mata kuliah ${body.nama_mk} berhasil ditambahkan (Lokal)!`, 'success');
    renderActiveTab();
  }

  // -------------------------------------------------------------
  // MODAL: KELOLA NILAI MAHASISWA (INSERT & UPDATE)
  // -------------------------------------------------------------
  const BOBOT_MAP = {
    'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7, 'C+': 2.3, 'C': 2.0, 'D': 1.0, 'E': 0.0
  };

  function getLocalNilaiStorage() {
    try {
      const raw = localStorage.getItem('siladik_nilai_mahasiswa_v1');
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return {};
  }

  function getLocalNilaiList(nim) {
    const store = getLocalNilaiStorage();
    const cleanNim = String(nim || '').trim();
    return (store && Array.isArray(store[cleanNim])) ? store[cleanNim] : [];
  }

  function saveLocalNilaiList(nim, list) {
    try {
      const cleanNim = String(nim || '').trim();
      const store = getLocalNilaiStorage();
      store[cleanNim] = list;
      localStorage.setItem('siladik_nilai_mahasiswa_v1', JSON.stringify(store));
    } catch (e) {
      console.warn('Gagal simpan local nilai list:', e);
    }
  }

  async function openManageNilaiModal(nim, nama) {
    App.openCustomModal(
      `Kelola Nilai Akademik: ${nama} (${nim})`,
      `<div class="card p-4 text-center">Memuat riwayat nilai dan daftar mata kuliah...</div>`
    );

    try {
      if (!cachedMataKuliah || cachedMataKuliah.length === 0) {
        await loadMataKuliah();
      }

      let existingNilai = [];
      try {
        const res = await fetch(getApiUrl(`/api/admin/nilai/${encodeURIComponent(nim)}`), {
          headers: { 'x-user-role': 'ADMIN' }
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) existingNilai = json.data;
        }
      } catch (err) {}

      // 1. Cek dari LocalStorage jika API belum ada / offline
      if (existingNilai.length === 0) {
        existingNilai = getLocalNilaiList(nim);
      }

      // 2. Fallback lokal dari SiakadApi jika masih kosong
      if (existingNilai.length === 0 && typeof SiakadApi !== 'undefined' && SiakadApi.databaseSiakad) {
        const st = SiakadApi.databaseSiakad[nim];
        if (st && st.riwayatSemester) {
          for (const sem in st.riwayatSemester) {
            (st.riwayatSemester[sem].mataKuliah || []).forEach(mk => {
              existingNilai.push({
                semester_ambil: parseInt(sem, 10),
                kode_mk: mk.kode,
                nama_mk: mk.nama,
                sks: mk.sks,
                nilai_huruf: mk.nilai,
                bobot_nilai: BOBOT_MAP[mk.nilai] !== undefined ? BOBOT_MAP[mk.nilai] : null,
                is_krs_active: !mk.nilai
              });
            });
          }
        }
      }

      renderManageNilaiModalContent(nim, nama, existingNilai);
    } catch (err) {
      App.showToast('Gagal memuat data nilai: ' + err.message, 'error');
    }
  }

  function renderManageNilaiModalContent(nim, nama, nilaiList) {
    const mkOptions = cachedMataKuliah.map(mk => `
      <option value="${mk.kode_mk}">${mk.kode_mk} - ${mk.nama_mk} (${mk.sks} SKS, Sem. ${mk.semester_paket})</option>
    `).join('');

    const content = `
      <div class="manage-nilai-wrapper" style="display:flex; flex-direction:column; gap:1.25rem;">
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:var(--radius-md); padding:1.25rem;">
          <div style="font-weight:700; color:#1e293b; margin-bottom:0.75rem; display:flex; align-items:center; gap:0.5rem;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            <span id="formNilaiTitle">Form Tambah / Perbarui Nilai Mata Kuliah</span>
          </div>

          <form onsubmit="AdminView.submitSaveNilai(event, '${nim}')" class="admin-modal-form">
            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label" for="formNilaiMk">Mata Kuliah <span class="text-danger">*</span></label>
                <select id="formNilaiMk" class="form-control" required>
                  <option value="">-- Pilih Mata Kuliah --</option>
                  ${mkOptions}
                </select>
              </div>

              <div class="form-group">
                <label class="form-label" for="formNilaiSemester">Semester Ambil <span class="text-danger">*</span></label>
                <input type="number" id="formNilaiSemester" class="form-control" min="1" max="14" value="1" required />
              </div>
            </div>

            <div class="form-row-3">
              <div class="form-group">
                <label class="form-label" for="formNilaiHuruf">Nilai Huruf</label>
                <select id="formNilaiHuruf" class="form-control" onchange="AdminView.onNilaiHurufChange(this.value)">
                  <option value="">-- Status KRS (Belum Ada Nilai) --</option>
                  <option value="A">A (4.00 - Istimewa)</option>
                  <option value="A-">A- (3.70 - Sangat Baik)</option>
                  <option value="B+">B+ (3.30 - Baik Sekali)</option>
                  <option value="B">B (3.00 - Baik)</option>
                  <option value="B-">B- (2.70 - Cukup Baik)</option>
                  <option value="C+">C+ (2.30 - Lebih Dari Cukup)</option>
                  <option value="C">C (2.00 - Cukup)</option>
                  <option value="D">D (1.00 - Kurang)</option>
                  <option value="E">E (0.00 - Gagal)</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label" for="formNilaiBobot">Bobot Mutu (0.00 - 4.00)</label>
                <input type="number" step="0.01" min="0" max="4.00" id="formNilaiBobot" class="form-control" placeholder="Otomatis" />
              </div>

              <div class="form-group">
                <label class="form-label" for="formNilaiTahun">Tahun Akademik</label>
                <input type="text" id="formNilaiTahun" class="form-control" value="2026/2027 Ganjil" placeholder="Contoh: 2026/2027 Ganjil" />
              </div>
            </div>

            <div style="display:flex; justify-content:flex-end; gap:0.5rem; margin-top:0.75rem;">
              <button type="button" class="btn btn-sm btn-outline" onclick="AdminView.resetNilaiForm()">Reset Form</button>
              <button type="submit" class="btn btn-sm btn-primary" id="btnSubmitNilai">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Simpan Nilai
              </button>
            </div>
          </form>
        </div>

        <div>
          <div style="font-weight:700; color:#334155; margin-bottom:0.5rem; display:flex; justify-content:space-between; align-items:center;">
            <span>Daftar Nilai Akademik Mahasiswa (${nilaiList.length} Mata Kuliah)</span>
          </div>

          <div class="table-responsive" style="max-height: 280px; overflow-y:auto; border:1px solid #e2e8f0; border-radius:var(--radius-md);">
            <table class="admin-table" style="font-size:0.85rem;">
              <thead>
                <tr>
                  <th>Sem</th>
                  <th>Kode MK</th>
                  <th>Mata Kuliah</th>
                  <th>SKS</th>
                  <th>Nilai Huruf</th>
                  <th>Bobot</th>
                  <th>Status</th>
                  <th style="text-align:right;">Aksi</th>
                </tr>
              </thead>
              <tbody>
                ${nilaiList.length === 0 ? `
                  <tr><td colspan="8" style="text-align:center; padding:1.5rem; color:#64748b;">Belum ada nilai yang tersimpan untuk mahasiswa ini.</td></tr>
                ` : nilaiList.map(n => `
                  <tr>
                    <td>Sem. ${n.semester_ambil}</td>
                    <td><span class="code-pill">${n.kode_mk}</span></td>
                    <td><strong>${n.nama_mk}</strong></td>
                    <td>${n.sks}</td>
                    <td><span style="font-weight:800; color:${n.nilai_huruf === 'A' || n.nilai_huruf === 'A-' ? '#059669' : (n.nilai_huruf === 'E' ? '#dc2626' : '#2563eb')};">${n.nilai_huruf || '-'}</span></td>
                    <td>${n.bobot_nilai !== null ? Number(n.bobot_nilai).toFixed(2) : '-'}</td>
                    <td>${n.is_krs_active ? '<span class="status-pill active" style="font-size:0.75rem;">KRS Aktif</span>' : '<span style="color:#059669; font-size:0.75rem; display:inline-flex; align-items:center; gap:0.2rem;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> Selesai</span>'}</td>
                    <td style="text-align:right;">
                      <button class="btn btn-sm btn-outline" style="padding:0.2rem 0.5rem; font-size:0.75rem;" onclick="AdminView.fillEditNilaiForm('${n.kode_mk}', ${n.semester_ambil}, '${n.nilai_huruf || ''}', ${n.bobot_nilai !== null ? n.bobot_nilai : "''"}, '${n.tahun_akademik || ''}')">
                        Edit
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div class="modal-form-actions" style="margin-top:0.5rem;">
          <button type="button" class="btn btn-primary" onclick="App.closeModal(); AdminView.refreshData();">Tutup</button>
        </div>
      </div>
    `;

    App.openCustomModal(`Kelola Nilai Akademik: ${nama} (${nim})`, content);
  }

  function onNilaiHurufChange(val) {
    const bobotInput = document.getElementById('formNilaiBobot');
    if (bobotInput && BOBOT_MAP[val] !== undefined) {
      bobotInput.value = BOBOT_MAP[val].toFixed(2);
    }
  }

  function fillEditNilaiForm(kode_mk, semester, nilai_huruf, bobot, tahun) {
    const mkSel = document.getElementById('formNilaiMk');
    const semInput = document.getElementById('formNilaiSemester');
    const nhSel = document.getElementById('formNilaiHuruf');
    const bobotInput = document.getElementById('formNilaiBobot');
    const tahunInput = document.getElementById('formNilaiTahun');
    const title = document.getElementById('formNilaiTitle');

    if (mkSel) mkSel.value = kode_mk;
    if (semInput) semInput.value = semester;
    if (nhSel) nhSel.value = nilai_huruf || '';
    if (bobotInput) bobotInput.value = (bobot !== undefined && bobot !== '') ? parseFloat(bobot).toFixed(2) : '';
    if (tahunInput && tahun) tahunInput.value = tahun;
    if (title) title.innerHTML = `<span style="display:inline-flex; align-items:center; gap:0.35rem;"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg> Edit Nilai: <strong>${kode_mk} (Semester ${semester})</strong></span>`;
  }

  function resetNilaiForm() {
    const mkSel = document.getElementById('formNilaiMk');
    const semInput = document.getElementById('formNilaiSemester');
    const nhSel = document.getElementById('formNilaiHuruf');
    const bobotInput = document.getElementById('formNilaiBobot');
    const title = document.getElementById('formNilaiTitle');

    if (mkSel) mkSel.value = '';
    if (semInput) semInput.value = 1;
    if (nhSel) nhSel.value = '';
    if (bobotInput) bobotInput.value = '';
    if (title) title.innerHTML = `Form Tambah / Perbarui Nilai Mata Kuliah`;
  }

  async function submitSaveNilai(e, nim) {
    e.preventDefault();
    const btn = document.getElementById('btnSubmitNilai');
    if (btn) btn.disabled = true;

    const kode_mk = document.getElementById('formNilaiMk').value;
    const semester_ambil = parseInt(document.getElementById('formNilaiSemester').value, 10) || 1;
    const nilai_huruf = document.getElementById('formNilaiHuruf').value;
    const bobot_nilai = document.getElementById('formNilaiBobot').value;
    const tahun_akademik = document.getElementById('formNilaiTahun').value.trim() || '2026/2027 Ganjil';

    if (!kode_mk) {
      App.showToast('Silakan pilih mata kuliah terlebih dahulu!', 'warning');
      if (btn) btn.disabled = false;
      return;
    }

    const mkRef = cachedMataKuliah.find(m => m.kode_mk === kode_mk);
    const namaMk = mkRef ? mkRef.nama_mk : kode_mk;
    const sksMk = mkRef ? parseInt(mkRef.sks, 10) : 3;
    const bobotNum = (bobot_nilai !== '' && !isNaN(bobot_nilai)) 
      ? parseFloat(bobot_nilai) 
      : (BOBOT_MAP[nilai_huruf] !== undefined ? BOBOT_MAP[nilai_huruf] : null);

    const payload = {
      nim,
      nilai: [{
        kode_mk,
        semester_ambil,
        nilai_huruf: nilai_huruf || null,
        bobot_nilai: bobotNum,
        tahun_akademik,
        is_krs_active: !nilai_huruf
      }]
    };

    // 1. Coba kirim ke API Backend jika PostgreSQL online
    try {
      const res = await fetch(getApiUrl('/api/admin/nilai'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'ADMIN'
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          const refreshRes = await fetch(getApiUrl(`/api/admin/nilai/${encodeURIComponent(nim)}`), {
            headers: { 'x-user-role': 'ADMIN' }
          });
          const refreshJson = await refreshRes.json();
          if (refreshJson.success && Array.isArray(refreshJson.data)) {
            saveLocalNilaiList(nim, refreshJson.data);
            const studentObj = cachedUsers.find(u => String(u.nomor_induk) === String(nim));
            renderManageNilaiModalContent(nim, studentObj ? studentObj.nama : nim, refreshJson.data);
            App.showToast(`Nilai ${kode_mk} (${namaMk}) berhasil disimpan!`, 'success');
            await loadUsers();
            if (btn) btn.disabled = false;
            return;
          }
        }
      }
    } catch (err) {
      console.warn('API save nilai offline, lanjutkan penyimpanan lokal:', err.message);
    }

    // 2. Fallback Penyimpanan Lokal Terpadu (LocalStorage + SiakadApi)
    let currentNilai = getLocalNilaiList(nim);
    if (!currentNilai || currentNilai.length === 0) {
      if (typeof SiakadApi !== 'undefined' && SiakadApi.databaseSiakad && SiakadApi.databaseSiakad[nim]) {
        const st = SiakadApi.databaseSiakad[nim];
        if (st.riwayatSemester) {
          for (const s in st.riwayatSemester) {
            (st.riwayatSemester[s].mataKuliah || []).forEach(m => {
              currentNilai.push({
                semester_ambil: parseInt(s, 10),
                kode_mk: m.kode,
                nama_mk: m.nama,
                sks: m.sks,
                nilai_huruf: m.nilai,
                bobot_nilai: BOBOT_MAP[m.nilai] !== undefined ? BOBOT_MAP[m.nilai] : null,
                is_krs_active: !m.nilai,
                tahun_akademik
              });
            });
          }
        }
      }
    }

    // Tambah atau Update entri nilai
    const existingIdx = currentNilai.findIndex(n => n.kode_mk === kode_mk && n.semester_ambil === semester_ambil);
    const newRecord = {
      semester_ambil,
      kode_mk,
      nama_mk: namaMk,
      sks: sksMk,
      nilai_huruf: nilai_huruf || null,
      bobot_nilai: bobotNum,
      tahun_akademik,
      is_krs_active: !nilai_huruf
    };

    if (existingIdx !== -1) {
      currentNilai[existingIdx] = newRecord;
    } else {
      currentNilai.push(newRecord);
    }

    // Urutkan nilai berdasarkan semester dan kode
    currentNilai.sort((a, b) => (a.semester_ambil - b.semester_ambil) || a.kode_mk.localeCompare(b.kode_mk));

    // Simpan permanen ke LocalStorage
    saveLocalNilaiList(nim, currentNilai);

    // Sinkronkan ke SiakadApi RAM
    if (typeof SiakadApi !== 'undefined' && SiakadApi.databaseSiakad) {
      if (!SiakadApi.databaseSiakad[nim]) {
        SiakadApi.databaseSiakad[nim] = {
          nama: nim,
          nim,
          prodi: 'S1 Bisnis Digital',
          currentSemester: semester_ambil,
          statusSpp: 'Lunas',
          riwayatSemester: {}
        };
      }
      const dbMhs = SiakadApi.databaseSiakad[nim];
      if (!dbMhs.riwayatSemester) dbMhs.riwayatSemester = {};
      if (!dbMhs.riwayatSemester[semester_ambil]) {
        dbMhs.riwayatSemester[semester_ambil] = {
          semesterTeks: `Semester ${semester_ambil}`,
          mataKuliah: []
        };
      }
      const semMk = dbMhs.riwayatSemester[semester_ambil].mataKuliah || [];
      const mIdx = semMk.findIndex(m => m.kode === kode_mk);
      if (mIdx !== -1) {
        semMk[mIdx].nilai = nilai_huruf || '';
      } else {
        semMk.push({ kode: kode_mk, nama: namaMk, sks: sksMk, nilai: nilai_huruf || '' });
      }
      dbMhs.riwayatSemester[semester_ambil].mataKuliah = semMk;
    }

    // Hitung ulang IPK dan SKS Lulus
    let totalSks = 0;
    let totalMutu = 0;
    let totalSksLulus = 0;
    currentNilai.forEach(n => {
      const sks = parseInt(n.sks, 10) || 0;
      const bobot = (n.bobot_nilai !== null && n.bobot_nilai !== undefined) ? parseFloat(n.bobot_nilai) : null;
      if (bobot !== null) {
        totalSks += sks;
        totalMutu += (bobot * sks);
        if (n.nilai_huruf !== 'E') {
          totalSksLulus += sks;
        }
      }
    });
    const calculatedIpk = totalSks > 0 ? parseFloat((totalMutu / totalSks).toFixed(2)) : 0.00;

    // Update IPK & SKS di cachedUsers
    const uIdx = cachedUsers.findIndex(u => String(u.nomor_induk) === String(nim));
    if (uIdx !== -1) {
      cachedUsers[uIdx].ipk = calculatedIpk.toFixed(2);
      cachedUsers[uIdx].total_sks_lulus = totalSksLulus;
      saveLocalUsers(cachedUsers);
    }

    // Update IPK & SKS di AuthManager jika ada di akun registrasi
    if (typeof AuthManager !== 'undefined' && typeof AuthManager.getRegisteredStudents === 'function') {
      const regStudents = AuthManager.getRegisteredStudents();
      const regIdx = regStudents.findIndex(s => String(s.nim || s.nomor_induk) === String(nim));
      if (regIdx !== -1) {
        regStudents[regIdx].ipk = calculatedIpk;
        regStudents[regIdx].totalSksLulus = totalSksLulus;
        AuthManager.saveRegisteredStudents(regStudents);
      }
    }

    // Update SiakadApi IPK
    if (typeof SiakadApi !== 'undefined' && SiakadApi.databaseSiakad && SiakadApi.databaseSiakad[nim]) {
      SiakadApi.databaseSiakad[nim].ipk = calculatedIpk;
      SiakadApi.databaseSiakad[nim].totalSksLulus = totalSksLulus;
    }

    App.showToast(`Nilai ${kode_mk} (${namaMk}) berhasil disimpan! IPK: ${calculatedIpk.toFixed(2)} (${totalSksLulus} SKS)`, 'success');
    
    const studentObj = cachedUsers.find(u => String(u.nomor_induk) === String(nim));
    renderManageNilaiModalContent(nim, studentObj ? studentObj.nama : nim, currentNilai);
    resetNilaiForm();
    if (btn) btn.disabled = false;
  }

  // -------------------------------------------------------------
  // FITUR EKSPOR & IMPOR NILAI MAHASISWA MASSAL (.XLSX)
  // -------------------------------------------------------------
  let _parsedNilaiImportData = [];

  function downloadNilaiTemplate() {
    if (typeof XLSX === 'undefined') {
      App.showToast('Pustaka SheetJS (XLSX) tidak ditemukan.', 'error');
      return;
    }

    const templateRows = [
      {
        'NIM': '2300991',
        'Nama Mahasiswa': 'Fajar Ramadhan Pratama',
        'Semester Ambil': 1,
        'Kode MK': 'BD101',
        'Nama Mata Kuliah': 'Pengantar Bisnis Digital',
        'SKS': 3,
        'Nilai Huruf': 'A'
      },
      {
        'NIM': '2300991',
        'Nama Mahasiswa': 'Fajar Ramadhan Pratama',
        'Semester Ambil': 1,
        'Kode MK': 'BD102',
        'Nama Mata Kuliah': 'Algoritma & Pemrograman',
        'SKS': 3,
        'Nilai Huruf': 'A-'
      },
      {
        'NIM': '2300992',
        'Nama Mahasiswa': 'Annisa Putri Wardani',
        'Semester Ambil': 1,
        'Kode MK': 'BD101',
        'Nama Mata Kuliah': 'Pengantar Bisnis Digital',
        'SKS': 3,
        'Nilai Huruf': 'B+'
      },
      {
        'NIM': '2300992',
        'Nama Mahasiswa': 'Annisa Putri Wardani',
        'Semester Ambil': 1,
        'Kode MK': 'BD102',
        'Nama Mata Kuliah': 'Algoritma & Pemrograman',
        'SKS': 3,
        'Nilai Huruf': 'A'
      },
      {
        'NIM': '2300993',
        'Nama Mahasiswa': 'Dimas Bagus Saputra',
        'Semester Ambil': 1,
        'Kode MK': 'BD101',
        'Nama Mata Kuliah': 'Pengantar Bisnis Digital',
        'SKS': 3,
        'Nilai Huruf': 'B'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateRows);
    worksheet['!cols'] = [
      { wch: 14 },
      { wch: 28 },
      { wch: 15 },
      { wch: 14 },
      { wch: 32 },
      { wch: 8 },
      { wch: 12 }
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Nilai');
    XLSX.writeFile(workbook, 'TEMPLATE_IMPORT_NILAI_UPI.xlsx');
    App.showToast('Template Excel nilai berhasil diunduh.', 'success');
  }

  function exportNilaiToExcel() {
    if (typeof XLSX === 'undefined') {
      App.showToast('Pustaka SheetJS (XLSX) tidak ditemukan.', 'error');
      return;
    }

    const exportRows = [];
    const store = getLocalNilaiStorage();
    const students = cachedUsers.filter(u => u.role === 'MAHASISWA');

    students.forEach(student => {
      const nim = String(student.nomor_induk || '').trim();
      let nilaiList = store[nim];

      // Jika di store kosong, coba ambil dari SiakadApi
      if ((!nilaiList || nilaiList.length === 0) && typeof SiakadApi !== 'undefined' && SiakadApi.databaseSiakad && SiakadApi.databaseSiakad[nim]) {
        const db = SiakadApi.databaseSiakad[nim];
        if (db.riwayatSemester) {
          nilaiList = [];
          for (const s in db.riwayatSemester) {
            (db.riwayatSemester[s].mataKuliah || []).forEach(mk => {
              nilaiList.push({
                semester_ambil: parseInt(s, 10),
                kode_mk: mk.kode,
                nama_mk: mk.nama,
                sks: mk.sks,
                nilai_huruf: mk.nilai,
                bobot_nilai: BOBOT_MAP[mk.nilai] !== undefined ? BOBOT_MAP[mk.nilai] : null
              });
            });
          }
        }
      }

      if (nilaiList && nilaiList.length > 0) {
        nilaiList.forEach(item => {
          exportRows.push({
            'NIM': nim,
            'Nama Mahasiswa': student.nama,
            'Program Studi': student.prodi || 'S1 Bisnis Digital',
            'Semester Ambil': item.semester_ambil || 1,
            'Kode MK': item.kode_mk,
            'Nama Mata Kuliah': item.nama_mk || '',
            'SKS': item.sks || 3,
            'Nilai Huruf': item.nilai_huruf || 'KRS Aktif',
            'Bobot': item.bobot_nilai !== null && item.bobot_nilai !== undefined ? item.bobot_nilai : '-',
            'Status Kelulusan': (item.nilai_huruf && item.nilai_huruf !== 'E') ? 'LULUS' : (item.nilai_huruf === 'E' ? 'MENGULANG' : 'KRS BERJALAN')
          });
        });
      }
    });

    if (exportRows.length === 0) {
      App.showToast('Belum ada data nilai mahasiswa yang tersimpan untuk diekspor.', 'warning');
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    worksheet['!cols'] = [
      { wch: 14 },
      { wch: 28 },
      { wch: 22 },
      { wch: 15 },
      { wch: 14 },
      { wch: 32 },
      { wch: 8 },
      { wch: 12 },
      { wch: 10 },
      { wch: 16 }
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekap Nilai');
    XLSX.writeFile(workbook, `REKAP_NILAI_MAHASISWA_UPI_${new Date().toISOString().slice(0, 10)}.xlsx`);
    App.showToast(`Berhasil mengekspor ${exportRows.length} entri nilai mahasiswa ke Excel!`, 'success');
  }

  function openImportNilaiModal() {
    _parsedNilaiImportData = [];
    const modalHtml = `
      <div style="padding: 0.5rem 0;">
        <div style="margin-bottom: 1.25rem; font-size: 0.875rem; color: #475569; line-height: 1.5;">
          Unggah berkas Excel (<strong>.xlsx</strong>, <strong>.xls</strong>) atau <strong>.csv</strong> berisi nilai mahasiswa per semester. Sistem akan secara otomatis menghitung IPK, total SKS lulus, dan memperbarui draf KHS serta Transkrip Nilai mahasiswa.
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
          <span style="font-size: 0.8rem; font-weight: 600; color: #1e293b;">Format Spreadsheet Nilai:</span>
          <button class="btn btn-sm btn-outline" style="display:inline-flex; align-items:center; gap:0.35rem;" onclick="AdminView.downloadNilaiTemplate()">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Unduh Format Template Nilai (.xlsx)
          </button>
        </div>

        <div class="excel-dropzone" id="nilaiExcelDropzone" onclick="document.getElementById('nilaiExcelFileInput').click()">
          <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="1.8" style="margin-bottom: 0.5rem;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          <div style="font-weight: 700; color: #0f172a; margin-bottom: 0.25rem;">Klik untuk pilih file nilai atau seret file ke sini</div>
          <div style="font-size: 0.775rem; color: #64748b;">Mendukung berkas .xlsx, .xls, .csv dari Excel atau Google Sheets</div>
          <input type="file" id="nilaiExcelFileInput" accept=".xlsx, .xls, .csv" style="display:none;" onchange="AdminView.handleNilaiFileSelect(this)" />
        </div>

        <div id="nilaiPreviewContainer" style="display: none; margin-top: 1.25rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem; flex-wrap: wrap; gap: 0.5rem;">
            <div style="font-weight: 700; font-size: 0.9rem; color: #0f172a;" id="nilaiPreviewCount">
              Pratinjau Data (0 Nilai)
            </div>
            <button class="btn btn-success btn-sm" id="btnConfirmNilaiImport" onclick="AdminView.commitNilaiImport()" style="display:inline-flex; align-items:center; gap:0.35rem;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Simpan & Impor Nilai ke Sistem
            </button>
          </div>
          <div style="max-height: 220px; overflow-y: auto; border: 1px solid #e2e8f0; border-radius: var(--radius-md);">
            <table class="admin-table" style="font-size: 0.8rem; margin: 0;">
              <thead>
                <tr>
                  <th>NIM</th>
                  <th>Nama Mahasiswa</th>
                  <th>Sem</th>
                  <th>Kode MK</th>
                  <th>Nama MK</th>
                  <th>SKS</th>
                  <th>Nilai</th>
                </tr>
              </thead>
              <tbody id="nilaiPreviewTbody"></tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    App.openCustomModal('Impor Nilai Mahasiswa Massal (.xlsx / .csv)', modalHtml);
  }

  function handleNilaiFileSelect(input) {
    const file = input.files && input.files[0];
    if (!file) return;

    if (typeof XLSX === 'undefined') {
      App.showToast('Pustaka SheetJS belum siap.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rows = XLSX.utils.sheet_to_json(worksheet);

        if (!rows || rows.length === 0) {
          App.showToast('File Excel kosong atau format tidak sesuai.', 'warning');
          return;
        }

        _parsedNilaiImportData = rows.map(r => {
          const nim = String(r['NIM'] || r['nim'] || r['Nomor Induk'] || '').trim();
          const nama = String(r['Nama Mahasiswa'] || r['nama'] || r['Nama'] || '').trim();
          const sem = parseInt(r['Semester Ambil'] || r['Semester'] || r['semester'] || 1, 10) || 1;
          const kodeMk = String(r['Kode MK'] || r['Kode'] || r['kode_mk'] || '').trim().toUpperCase();
          const namaMk = String(r['Nama Mata Kuliah'] || r['Nama MK'] || r['nama_mk'] || '').trim();
          const sks = parseInt(r['SKS'] || r['sks'] || 3, 10) || 3;
          const nilaiHuruf = String(r['Nilai Huruf'] || r['Nilai'] || r['nilai'] || '').trim().toUpperCase();

          return {
            nim,
            nama,
            semester_ambil: sem,
            kode_mk: kodeMk,
            nama_mk: namaMk,
            sks,
            nilai_huruf: nilaiHuruf
          };
        }).filter(item => item.nim && item.kode_mk);

        if (_parsedNilaiImportData.length === 0) {
          App.showToast('Tidak ada data nilai valid (kolom NIM dan Kode MK wajib diisi).', 'warning');
          return;
        }

        const container = document.getElementById('nilaiPreviewContainer');
        const countEl = document.getElementById('nilaiPreviewCount');
        const tbody = document.getElementById('nilaiPreviewTbody');

        if (countEl) countEl.textContent = `Pratinjau Data (${_parsedNilaiImportData.length} Nilai Siap Diimpor)`;
        if (tbody) {
          tbody.innerHTML = _parsedNilaiImportData.slice(0, 15).map(m => `
            <tr>
              <td><strong>${m.nim}</strong></td>
              <td>${m.nama || '-'}</td>
              <td>Sem. ${m.semester_ambil}</td>
              <td><code>${m.kode_mk}</code></td>
              <td>${m.nama_mk || '-'}</td>
              <td>${m.sks}</td>
              <td><span class="badge" style="background:#e0e7ff; color:#3730a3; font-weight:700;">${m.nilai_huruf || '-'}</span></td>
            </tr>
          `).join('') + (_parsedNilaiImportData.length > 15 ? `<tr><td colspan="7" style="text-align:center; color:#64748b;">...dan ${_parsedNilaiImportData.length - 15} entri nilai lainnya</td></tr>` : '');
        }
        if (container) container.style.display = 'block';
        App.showToast(`Berhasil membaca ${_parsedNilaiImportData.length} entri nilai dari berkas Excel!`, 'success');

      } catch (err) {
        console.error('Gagal membaca file Excel nilai:', err);
        App.showToast('Gagal memproses file Excel: ' + err.message, 'error');
      }
    };
    reader.readAsArrayBuffer(file);
  }

  function commitNilaiImport() {
    if (!_parsedNilaiImportData || _parsedNilaiImportData.length === 0) {
      App.showToast('Tidak ada data nilai untuk diimpor.', 'warning');
      return;
    }

    const store = getLocalNilaiStorage();
    const affectedNims = new Set();

    _parsedNilaiImportData.forEach(row => {
      const nim = row.nim;
      affectedNims.add(nim);

      if (!store[nim]) {
        store[nim] = [];
      }

      // Cari nama mata kuliah dari cachedMataKuliah jika di excel kosong
      let namaMk = row.nama_mk;
      let sks = row.sks;
      const foundMk = cachedMataKuliah.find(m => m.kode_mk === row.kode_mk);
      if (foundMk) {
        if (!namaMk) namaMk = foundMk.nama_mk;
        if (!sks) sks = foundMk.sks;
      }

      const bobotNum = (row.nilai_huruf && BOBOT_MAP[row.nilai_huruf] !== undefined)
        ? BOBOT_MAP[row.nilai_huruf]
        : null;

      const record = {
        semester_ambil: row.semester_ambil,
        kode_mk: row.kode_mk,
        nama_mk: namaMk || row.kode_mk,
        sks: sks || 3,
        nilai_huruf: row.nilai_huruf || null,
        bobot_nilai: bobotNum,
        tahun_akademik: '2024/2025',
        is_krs_active: !row.nilai_huruf
      };

      const existingIdx = store[nim].findIndex(n => n.kode_mk === row.kode_mk && n.semester_ambil === row.semester_ambil);
      if (existingIdx !== -1) {
        store[nim][existingIdx] = record;
      } else {
        store[nim].push(record);
      }

      // Sinkronkan ke SiakadApi RAM
      if (typeof SiakadApi !== 'undefined' && SiakadApi.databaseSiakad) {
        if (!SiakadApi.databaseSiakad[nim]) {
          const studentObj = cachedUsers.find(u => String(u.nomor_induk) === String(nim));
          SiakadApi.databaseSiakad[nim] = {
            nim: nim,
            nama: studentObj ? studentObj.nama : (row.nama || nim),
            prodi: studentObj ? studentObj.prodi : 'S1 Bisnis Digital',
            currentSemester: row.semester_ambil,
            statusSpp: 'Lunas',
            email: studentObj ? studentObj.email : `${nim}@upi.edu`,
            ipk: 0.00,
            totalSksLulus: 0,
            riwayatSemester: {}
          };
        }

        const dbMhs = SiakadApi.databaseSiakad[nim];
        if (!dbMhs.riwayatSemester) dbMhs.riwayatSemester = {};
        if (!dbMhs.riwayatSemester[row.semester_ambil]) {
          dbMhs.riwayatSemester[row.semester_ambil] = {
            semesterTeks: `Semester ${row.semester_ambil}`,
            mataKuliah: []
          };
        }
        const semMk = dbMhs.riwayatSemester[row.semester_ambil].mataKuliah || [];
        const mIdx = semMk.findIndex(m => m.kode === row.kode_mk);
        if (mIdx !== -1) {
          semMk[mIdx].nilai = row.nilai_huruf || '';
        } else {
          semMk.push({
            kode: row.kode_mk,
            nama: namaMk || row.kode_mk,
            sks: sks || 3,
            nilai: row.nilai_huruf || ''
          });
        }
        dbMhs.riwayatSemester[row.semester_ambil].mataKuliah = semMk;
      }
    });

    // Simpan seluruh nilai terupdate ke localStorage
    try {
      localStorage.setItem('siladik_nilai_mahasiswa_v1', JSON.stringify(store));
    } catch (e) {
      console.warn('Gagal menyimpan local nilai storage:', e);
    }

    // Hitung ulang IPK dan SKS Lulus untuk semua mahasiswa yang nilainya terpengaruh
    affectedNims.forEach(nim => {
      const studentNilai = store[nim] || [];
      studentNilai.sort((a, b) => (a.semester_ambil - b.semester_ambil) || a.kode_mk.localeCompare(b.kode_mk));

      let totalSks = 0;
      let totalMutu = 0;
      let totalSksLulus = 0;

      studentNilai.forEach(n => {
        const sks = parseInt(n.sks, 10) || 0;
        const bobot = (n.bobot_nilai !== null && n.bobot_nilai !== undefined) ? parseFloat(n.bobot_nilai) : null;
        if (bobot !== null) {
          totalSks += sks;
          totalMutu += (bobot * sks);
          if (n.nilai_huruf !== 'E') {
            totalSksLulus += sks;
          }
        }
      });

      const calculatedIpk = totalSks > 0 ? parseFloat((totalMutu / totalSks).toFixed(2)) : 0.00;

      // Update cachedUsers
      const uIdx = cachedUsers.findIndex(u => String(u.nomor_induk) === String(nim));
      if (uIdx !== -1) {
        cachedUsers[uIdx].ipk = calculatedIpk.toFixed(2);
        cachedUsers[uIdx].total_sks_lulus = totalSksLulus;
      }

      // Update AuthManager
      if (typeof AuthManager !== 'undefined' && typeof AuthManager.getRegisteredStudents === 'function') {
        const regStudents = AuthManager.getRegisteredStudents();
        const regIdx = regStudents.findIndex(s => String(s.nim || s.nomor_induk) === String(nim));
        if (regIdx !== -1) {
          regStudents[regIdx].ipk = calculatedIpk;
          regStudents[regIdx].totalSksLulus = totalSksLulus;
          AuthManager.saveRegisteredStudents(regStudents);
        }
      }

      // Update SiakadApi
      if (typeof SiakadApi !== 'undefined' && SiakadApi.databaseSiakad && SiakadApi.databaseSiakad[nim]) {
        SiakadApi.databaseSiakad[nim].ipk = calculatedIpk;
        SiakadApi.databaseSiakad[nim].totalSksLulus = totalSksLulus;
      }
    });

    saveLocalUsers(cachedUsers);

    const overlay = document.getElementById('globalModalOverlay');
    if (overlay) {
      overlay.classList.remove('active');
      document.body.classList.remove('modal-open');
    }

    renderActiveTab();
    App.showToast(`Berhasil mengimpor ${_parsedNilaiImportData.length} nilai untuk ${affectedNims.size} mahasiswa! IPK & KHS terupdate otomatis.`, 'success');
    _parsedNilaiImportData = [];
  }

  // -------------------------------------------------------------
  // TAB 5: PEMBARUAN MAHASISWA PER SEMESTER (ASAS KEBERLANJUTAN)
  // -------------------------------------------------------------
  const CUTI_STORAGE_KEY = 'siladik_mhs_cuti_v1';

  function getCutiList() {
    try {
      const stored = localStorage.getItem(CUTI_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to parse cuti list', e);
    }
    return [];
  }

  function getStudentCutiStatus(nim) {
    const list = getCutiList();
    return list.includes(String(nim).trim());
  }

  function toggleStudentCuti(nim) {
    const nimStr = String(nim).trim();
    let list = getCutiList();
    const isCurrentlyCuti = list.includes(nimStr);
    if (isCurrentlyCuti) {
      list = list.filter(n => n !== nimStr);
    } else {
      list.push(nimStr);
    }
    try {
      localStorage.setItem(CUTI_STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('Failed to save cuti list', e);
    }

    // Sinkronisasi real-time ke database PostgreSQL dengan JWT
    const curAdm = (typeof AuthManager !== 'undefined') ? AuthManager.getCurrentUser() : null;
    fetch('/api/admin/mahasiswa/toggle-cuti', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + (curAdm?.authToken || ''),
        'x-user-role': 'ADMIN'
      },
      body: JSON.stringify({
        nim: nimStr,
        status_akademik: isCurrentlyCuti ? 'AKTIF' : 'CUTI'
      })
    }).then(r => r.json()).then(res => {
      if (res.success) {
        console.log('[PostgreSQL Sync] Status cuti tersimpan ke PostgreSQL:', res.message);
      }
    }).catch(err => {
      console.warn('[PostgreSQL Sync] Offline / gagal sync toggle cuti:', err);
    });

    renderActiveTab();
    App.showToast(`Status mahasiswa ${nimStr} berhasil diubah menjadi ${!isCurrentlyCuti ? 'CUTI (Tidak naik semester massal)' : 'AKTIF'}.`, 'info');
  }

  function toggleSelectAllStudents(checked) {
    const checkboxes = document.querySelectorAll('.student-row-check');
    checkboxes.forEach(cb => {
      const nim = cb.getAttribute('data-nim');
      const isCuti = getStudentCutiStatus(nim);
      // Ketika select all: centang hanya mahasiswa aktif; mahasiswa cuti tetap uncheck!
      if (checked) {
        cb.checked = !isCuti;
      } else {
        cb.checked = false;
      }
    });
  }

  function onStudentCheckboxChange() {
    const selectAllCb = document.getElementById('selectAllStudentsCheckbox');
    if (!selectAllCb) return;
    const checkboxes = Array.from(document.querySelectorAll('.student-row-check'));
    const activeBoxes = checkboxes.filter(cb => {
      const nim = cb.getAttribute('data-nim');
      return !getStudentCutiStatus(nim);
    });
    if (activeBoxes.length > 0) {
      selectAllCb.checked = activeBoxes.every(cb => cb.checked);
    }
  }

  function promoteSemesterSelected() {
    const checkedBoxes = Array.from(document.querySelectorAll('.student-row-check:checked'));
    if (checkedBoxes.length === 0) {
      App.showToast('Pilih minimal satu mahasiswa aktif untuk dinaikkan semesternya.', 'warning');
      return;
    }

    const selectedNims = checkedBoxes.map(cb => cb.getAttribute('data-nim'));

    if (!confirm(`Apakah Anda yakin ingin menaikkan semester (+1) untuk ${selectedNims.length} mahasiswa terpilih? (Mahasiswa cuti atau tidak dicentang akan dilewati)`)) {
      return;
    }

    let count = 0;
    cachedUsers.forEach(u => {
      if (u.role === 'MAHASISWA' && selectedNims.includes(String(u.nomor_induk))) {
        u.semester_berjalan = (u.semester_berjalan || 1) + 1;
        if (typeof SiakadApi !== 'undefined' && SiakadApi.databaseSiakad && SiakadApi.databaseSiakad[u.nomor_induk]) {
          SiakadApi.databaseSiakad[u.nomor_induk].currentSemester = u.semester_berjalan;
        }
        count++;
      }
    });

    // Perbarui registered students jika ada
    if (typeof AuthManager !== 'undefined' && AuthManager.getRegisteredStudents) {
      const registered = AuthManager.getRegisteredStudents();
      let regChanged = false;
      registered.forEach(r => {
        const nimStr = String(r.nim || r.nomor_induk || '').trim();
        if (selectedNims.includes(nimStr)) {
          r.currentSemester = (r.currentSemester || 1) + 1;
          regChanged = true;
        }
      });
      if (regChanged) {
        localStorage.setItem('siladik_registered_students_v1', JSON.stringify(registered));
      }
    }

    saveLocalUsers(cachedUsers);

    // Sinkronisasi kenaikan semester massal ke database PostgreSQL dengan JWT
    const curAdmSem = (typeof AuthManager !== 'undefined') ? AuthManager.getCurrentUser() : null;
    fetch('/api/admin/mahasiswa/bulk-semester', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + (curAdmSem?.authToken || ''),
        'x-user-role': 'ADMIN'
      },
      body: JSON.stringify({ nims: selectedNims })
    }).then(r => r.json()).then(res => {
      if (res.success) {
        console.log('[PostgreSQL Sync] Bulk semester tersimpan ke PostgreSQL:', res.message);
      }
    }).catch(err => {
      console.warn('[PostgreSQL Sync] Offline / gagal sync bulk semester:', err);
    });

    renderActiveTab();
    App.showToast(`Berhasil menaikkan semester untuk ${count} mahasiswa terpilih! Mahasiswa cuti tidak dinaikkan.`, 'success');
  }

  function exportStudentsToExcel() {
    if (typeof XLSX === 'undefined') {
      App.showToast('Pustaka SheetJS (XLSX) tidak ditemukan.', 'error');
      return;
    }

    const blacklist = getDeletedUserBlacklist();
    const registered = (typeof AuthManager !== 'undefined') ? AuthManager.getRegisteredStudents() : [];
    const baseMhs = cachedUsers.filter(u => u.role === 'MAHASISWA' && !blacklist.includes(String(u.nomor_induk || '').trim()));

    const allStudents = [...baseMhs];
    registered.forEach(r => {
      const nimStr = String(r.nim || r.nomor_induk || '').trim();
      if (nimStr && !blacklist.includes(nimStr) && !allStudents.some(s => String(s.nomor_induk || '').trim() === nimStr)) {
        allStudents.push({
          id: 'reg_' + nimStr,
          nomor_induk: nimStr,
          nama: r.nama,
          email: r.email,
          prodi: r.prodi,
          role: 'MAHASISWA',
          semester_berjalan: r.currentSemester || 1,
          spp_status: r.statusSpp || 'LUNAS',
          ipk: (r.ipk !== undefined && r.ipk !== null) ? r.ipk : 0.00,
          total_sks_lulus: r.totalSksLulus || 0,
          is_registered: true
        });
      }
    });

    const exportRows = allStudents.map((m, idx) => {
      const isCuti = getStudentCutiStatus(m.nomor_induk);
      const emailResmi = (m.email && !/^\d+@/.test(m.email)) ? m.email : formatEmailFromName(m.nama, m.nomor_induk);
      return {
        'No': idx + 1,
        'NIM': String(m.nomor_induk),
        'Nama Mahasiswa': m.nama,
        'Email Kampus': emailResmi,
        'Program Studi': m.prodi || 'S1 Bisnis Digital',
        'Semester Berjalan': Number(m.semester_berjalan || 1),
        'Status Akademik': isCuti ? 'CUTI' : 'AKTIF',
        'Status SPP': m.spp_status || 'LUNAS'
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    worksheet['!cols'] = [
      { wch: 6 },
      { wch: 14 },
      { wch: 26 },
      { wch: 30 },
      { wch: 22 },
      { wch: 18 },
      { wch: 16 },
      { wch: 14 }
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Mahasiswa');

    const fileName = `DATA_MAHASISWA_UPI_TASIKMALAYA_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    App.showToast('Data mahasiswa berhasil diekspor ke file Excel (.xlsx)!', 'success');
  }

  function downloadExcelTemplate() {
    if (typeof XLSX === 'undefined') {
      App.showToast('Pustaka SheetJS (XLSX) tidak ditemukan.', 'error');
      return;
    }

    const templateRows = [
      {
        'NIM': '2300991',
        'Nama Mahasiswa': 'Fajar Ramadhan Pratama',
        'Email Kampus': 'fajar.ramadhan@upi.edu',
        'Program Studi': 'S1 Bisnis Digital',
        'Semester': 1,
        'Status Akademik': 'AKTIF',
        'Status SPP': 'LUNAS'
      },
      {
        'NIM': '2300992',
        'Nama Mahasiswa': 'Annisa Putri Wardani',
        'Email Kampus': 'annisa.putri@upi.edu',
        'Program Studi': 'S1 Bisnis Digital',
        'Semester': 1,
        'Status Akademik': 'AKTIF',
        'Status SPP': 'LUNAS'
      },
      {
        'NIM': '2300993',
        'Nama Mahasiswa': 'Dimas Bagus Saputra',
        'Email Kampus': 'dimas.bagus@upi.edu',
        'Program Studi': 'S1 Bisnis Digital',
        'Semester': 1,
        'Status Akademik': 'CUTI',
        'Status SPP': 'LUNAS'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateRows);
    worksheet['!cols'] = [
      { wch: 14 },
      { wch: 28 },
      { wch: 30 },
      { wch: 22 },
      { wch: 12 },
      { wch: 16 },
      { wch: 14 }
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Import');
    XLSX.writeFile(workbook, 'TEMPLATE_IMPORT_MAHASISWA_UPI.xlsx');
  }

  let _parsedImportData = [];

  function openImportExcelModal() {
    _parsedImportData = [];
    const modalHtml = `
      <div style="padding: 0.5rem 0;">
        <div style="margin-bottom: 1.25rem; font-size: 0.875rem; color: #475569; line-height: 1.5;">
          Unggah file Excel (<strong>.xlsx</strong>, <strong>.xls</strong>) atau <strong>.csv</strong> berisi daftar mahasiswa baru untuk dimasukkan ke database sistem secara massal.
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
          <span style="font-size: 0.8rem; font-weight: 600; color: #1e293b;">Format Spreadsheet:</span>
          <button class="btn btn-sm btn-outline" style="display:inline-flex; align-items:center; gap:0.35rem;" onclick="AdminView.downloadExcelTemplate()">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Unduh Format Template Excel
          </button>
        </div>

        <div class="excel-dropzone" id="excelDropzone" onclick="document.getElementById('excelFileInput').click()">
          <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="1.8" style="margin-bottom: 0.5rem;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          <div style="font-weight: 700; color: #0f172a; margin-bottom: 0.25rem;">Klik untuk pilih file atau seret file ke sini</div>
          <div style="font-size: 0.775rem; color: #64748b;">Mendukung berkas .xlsx, .xls, .csv dari Excel atau Google Sheets</div>
          <input type="file" id="excelFileInput" accept=".xlsx, .xls, .csv" style="display:none;" onchange="AdminView.handleExcelFileSelect(this)" />
        </div>

        <div id="excelPreviewContainer" style="display: none; margin-top: 1.25rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem; flex-wrap: wrap; gap: 0.5rem;">
            <div style="font-weight: 700; font-size: 0.9rem; color: #0f172a;" id="excelPreviewCount">
              Pratinjau Data (0 Mahasiswa)
            </div>
            <button class="btn btn-success btn-sm" id="btnConfirmImport" onclick="AdminView.commitExcelImport()" style="display:inline-flex; align-items:center; gap:0.35rem;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Simpan & Impor ke Sistem
            </button>
          </div>
          <div style="max-height: 220px; overflow-y: auto; border: 1px solid #e2e8f0; border-radius: var(--radius-md);">
            <table class="admin-table" style="font-size: 0.8rem; margin: 0;">
              <thead>
                <tr>
                  <th>NIM</th>
                  <th>Nama Mahasiswa</th>
                  <th>Prodi</th>
                  <th>Semester</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody id="excelPreviewTbody"></tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    App.openCustomModal('Impor Data Mahasiswa (.xlsx / .csv)', modalHtml);
  }

  function handleExcelFileSelect(input) {
    const file = input.files && input.files[0];
    if (!file) return;

    if (typeof XLSX === 'undefined') {
      App.showToast('Pustaka SheetJS belum siap.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rows = XLSX.utils.sheet_to_json(worksheet);

        if (!rows || rows.length === 0) {
          App.showToast('File Excel kosong atau format tidak sesuai.', 'warning');
          return;
        }

        _parsedImportData = rows.map(r => {
          const nim = String(r['NIM'] || r['nim'] || r['Nomor Induk'] || '').trim();
          const nama = String(r['Nama Mahasiswa'] || r['nama'] || r['Nama'] || '').trim();
          const prodi = String(r['Program Studi'] || r['prodi'] || r['Prodi'] || 'S1 Bisnis Digital').trim();
          const semester = Number(r['Semester'] || r['semester'] || r['Semester Berjalan'] || 1);
          const statusAkademik = String(r['Status Akademik'] || r['status_akademik'] || r['Status'] || 'AKTIF').toUpperCase().trim();
          const sppStatus = String(r['Status SPP'] || r['spp'] || 'LUNAS').toUpperCase().trim();
          const email = String(r['Email Kampus'] || r['email'] || formatEmailFromName(nama, nim)).trim();
          const rawIpk = (r['IPK'] !== undefined ? r['IPK'] : r['ipk']);
          const ipk = (rawIpk !== undefined && rawIpk !== null && rawIpk !== '' && !isNaN(Number(rawIpk))) ? parseFloat(Number(rawIpk).toFixed(2)) : null;
          const rawSks = (r['Total SKS'] !== undefined ? r['Total SKS'] : r['sks']);
          const totalSks = (rawSks !== undefined && rawSks !== null && rawSks !== '' && !isNaN(Number(rawSks))) ? parseInt(rawSks, 10) : null;

          return {
            nomor_induk: nim,
            nama,
            prodi,
            semester_berjalan: semester,
            status_akademik: statusAkademik,
            spp_status: sppStatus,
            email: email,
            ipk: ipk,
            total_sks_lulus: totalSks
          };
        }).filter(item => item.nomor_induk && item.nama);

        if (_parsedImportData.length === 0) {
          App.showToast('Tidak ada data mahasiswa valid (kolom NIM dan Nama wajib diisi).', 'warning');
          return;
        }

        const container = document.getElementById('excelPreviewContainer');
        const countEl = document.getElementById('excelPreviewCount');
        const tbody = document.getElementById('excelPreviewTbody');

        if (countEl) countEl.textContent = `Pratinjau Data (${_parsedImportData.length} Mahasiswa Siap Diimpor)`;
        if (tbody) {
          tbody.innerHTML = _parsedImportData.slice(0, 15).map(m => `
            <tr>
              <td><strong>${m.nomor_induk}</strong></td>
              <td>${m.nama}</td>
              <td>${m.prodi}</td>
              <td>Sem. ${m.semester_berjalan}</td>
              <td><span class="academic-status-badge ${m.status_akademik === 'CUTI' ? 'cuti' : 'aktif'}">${m.status_akademik}</span></td>
            </tr>
          `).join('') + (_parsedImportData.length > 15 ? `<tr><td colspan="5" style="text-align:center; color:#64748b;">...dan ${_parsedImportData.length - 15} mahasiswa lainnya</td></tr>` : '');
        }
        if (container) container.style.display = 'block';
        App.showToast(`Berhasil membaca ${_parsedImportData.length} data mahasiswa dari berkas Excel!`, 'success');

      } catch (err) {
        console.error('Gagal membaca file Excel:', err);
        App.showToast('Gagal memproses file Excel: ' + err.message, 'error');
      }
    };
    reader.readAsArrayBuffer(file);
  }

  function commitExcelImport() {
    if (!_parsedImportData || _parsedImportData.length === 0) {
      App.showToast('Tidak ada data mahasiswa untuk diimpor.', 'warning');
      return;
    }

    let cutiList = getCutiList();
    let addedCount = 0;

    _parsedImportData.forEach(item => {
      const isUserActive = (item.status_akademik !== 'NON-AKTIF' && item.status_akademik !== 'NONAKTIF');
      const existingIdx = cachedUsers.findIndex(u => String(u.nomor_induk).trim() === item.nomor_induk);
      if (existingIdx >= 0) {
        cachedUsers[existingIdx].nama = item.nama;
        cachedUsers[existingIdx].prodi = item.prodi;
        cachedUsers[existingIdx].semester_berjalan = item.semester_berjalan;
        cachedUsers[existingIdx].email = item.email;
        cachedUsers[existingIdx].spp_status = item.spp_status;
        cachedUsers[existingIdx].status_akademik = item.status_akademik;
        cachedUsers[existingIdx].is_active = isUserActive;
      } else {
        cachedUsers.push({
          id: 'imp_' + item.nomor_induk,
          nomor_induk: item.nomor_induk,
          nama: item.nama,
          email: item.email,
          prodi: item.prodi,
          role: 'MAHASISWA',
          semester_berjalan: item.semester_berjalan,
          spp_status: item.spp_status,
          status_akademik: item.status_akademik,
          is_active: isUserActive,
          ipk: item.ipk ?? null,
          total_sks_lulus: item.total_sks_lulus ?? null
        });
        addedCount++;
      }

      if (item.status_akademik === 'CUTI' && !cutiList.includes(item.nomor_induk)) {
        cutiList.push(item.nomor_induk);
      } else if (item.status_akademik !== 'CUTI') {
        cutiList = cutiList.filter(n => n !== item.nomor_induk);
      }

      if (typeof SiakadApi !== 'undefined' && SiakadApi.databaseSiakad) {
        SiakadApi.databaseSiakad[item.nomor_induk] = {
          nim: item.nomor_induk,
          nama: item.nama,
          prodi: item.prodi,
          currentSemester: item.semester_berjalan,
          statusSpp: item.spp_status,
          statusAkademik: item.status_akademik,
          email: item.email,
          ipk: item.ipk ?? null,
          totalSksLulus: item.total_sks_lulus ?? null,
          riwayatSemester: []
        };
      }
    });

    try {
      localStorage.setItem(CUTI_STORAGE_KEY, JSON.stringify(cutiList));
    } catch (e) {
      console.warn('Failed to save cuti list', e);
    }

    saveLocalUsers(cachedUsers);

    // Sinkronisasi data mahasiswa hasil impor Excel langsung ke database PostgreSQL dengan JWT
    const curUser = (typeof AuthManager !== 'undefined') ? AuthManager.getCurrentUser() : null;
    const authToken = curUser?.authToken || '';
    fetch('/api/admin/mahasiswa/batch-import', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + authToken,
        'x-user-role': 'ADMIN'
      },
      body: JSON.stringify({ students: _parsedImportData })
    }).then(r => r.json()).then(res => {
      if (res.success) {
        console.log('[PostgreSQL Sync] Batch import berhasil ke PostgreSQL:', res.message);
      }
    }).catch(err => {
      console.warn('[PostgreSQL Sync] Offline / gagal sync batch import:', err);
    });
    
    const overlay = document.getElementById('globalModalOverlay');
    if (overlay) {
      overlay.classList.remove('active');
      document.body.classList.remove('modal-open');
    }

    renderActiveTab();
    App.showToast(`Berhasil mengimpor ${_parsedImportData.length} data mahasiswa (${addedCount} mahasiswa baru ditambahkan)!`, 'success');
    _parsedImportData = [];
  }

  function renderKelolaMhsTab(container) {
    const blacklist = getDeletedUserBlacklist();
    const registered = (typeof AuthManager !== 'undefined') ? AuthManager.getRegisteredStudents() : [];
    const baseMhs = cachedUsers.filter(u => u.role === 'MAHASISWA' && !blacklist.includes(String(u.nomor_induk || '').trim()));

    const allStudents = [...baseMhs];
    registered.forEach(r => {
      const nimStr = String(r.nim || r.nomor_induk || '').trim();
      if (nimStr && !blacklist.includes(nimStr) && !allStudents.some(s => String(s.nomor_induk || '').trim() === nimStr)) {
        allStudents.push({
          id: 'reg_' + nimStr,
          nomor_induk: nimStr,
          nama: r.nama,
          email: (r.email && !/^\d+@/.test(r.email)) ? r.email : formatEmailFromName(r.nama, nimStr),
          prodi: r.prodi,
          role: 'MAHASISWA',
          semester_berjalan: r.currentSemester || 1,
          spp_status: r.statusSpp || 'LUNAS',
          ipk: (r.ipk !== undefined && r.ipk !== null) ? r.ipk : 0.00,
          total_sks_lulus: r.totalSksLulus || 0,
          is_registered: true
        });
      }
    });

    container.innerHTML = `
      <div class="admin-panel-card">
        <div class="admin-card-header">
          <div class="admin-card-header-info">
            <h3>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
              Pembaruan Mahasiswa Per Semester (Asas Keberlanjutan)
            </h3>
            <p>Pengelolaan kenaikan semester massal dan registrasi mahasiswa baru agar kesinambungan layanan tetap terjamin.</p>
          </div>
          <div class="admin-card-header-actions admin-action-btn-group">
            <button class="btn btn-outline btn-sm" onclick="AdminView.openAddUserModal()" title="Tambah Mahasiswa Manual">
              + Manual
            </button>
            <button class="btn-excel-export" onclick="AdminView.exportStudentsToExcel()" title="Ekspor seluruh data mahasiswa ke format Excel (.xlsx)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Ekspor Excel (.xlsx)
            </button>
            <button class="btn-excel-import" onclick="AdminView.openImportExcelModal()" title="Impor data mahasiswa baru dari file Excel (.xlsx / .csv)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              Impor Excel (.xlsx)
            </button>
            <button class="btn btn-primary btn-sm" style="display:inline-flex; align-items:center; gap:0.35rem;" onclick="AdminView.promoteSemesterSelected()" title="Naikkan semester mahasiswa terpilih (+1)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
              Naikkan Semester Massal (+1)
            </button>
          </div>
        </div>

        <div class="admin-info-banner">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
          <span>Fitur ini mendukung <strong>Asas Keberlanjutan Mandiri</strong>: Admin dapat mengekspor/mengimpor daftar mahasiswa dari Excel serta menaikkan semester massal mahasiswa aktif secara mandiri (mahasiswa berstatus <em>Cuti</em> otomatis dilewati).</span>
        </div>

        <div class="table-scroll-indicator">
          <span class="tsi-arrow">👉</span>
          <span>Geser tabel ke samping untuk melihat detail pengguna ➔</span>
        </div>
        <div class="table-responsive">
          <table class="admin-table">
            <thead>
              <tr>
                <th style="width: 44px; text-align: center;">
                  <input type="checkbox" id="selectAllStudentsCheckbox" class="student-checkbox" onchange="AdminView.toggleSelectAllStudents(this.checked)" title="Pilih Semua Mahasiswa Aktif" checked>
                </th>
                <th>NIM</th>
                <th>Nama Mahasiswa</th>
                <th>Program Studi</th>
                <th>Semester Berjalan</th>
                <th>Status Akademik</th>
                <th>Status Pembayaran</th>
                <th style="text-align:right;">Aksi</th>
              </tr>
            </thead>
            <tbody>
              ${allStudents.length === 0 ? `
                <tr><td colspan="8" style="text-align:center; padding:2rem; color:var(--text-muted);">Belum ada data mahasiswa.</td></tr>
              ` : allStudents.map((m, idx) => {
                const isCuti = getStudentCutiStatus(m.nomor_induk) || m.status_akademik === 'CUTI';
                const isNonaktif = (m.is_active === false || m.status_akademik === 'NON-AKTIF' || m.status_akademik === 'NONAKTIF');
                const officialEmail = (m.email && !/^\d+@/.test(m.email)) ? m.email : formatEmailFromName(m.nama, m.nomor_induk);
                return `
                <tr style="${isCuti ? 'background: #fffdf5;' : (isNonaktif ? 'background: #f8fafc;' : '')}">
                  <td style="text-align: center;">
                    <input
                      type="checkbox"
                      class="student-checkbox student-row-check"
                      data-nim="${m.nomor_induk}"
                      ${(isCuti || isNonaktif) ? '' : 'checked'}
                      onchange="AdminView.onStudentCheckboxChange()"
                      title="${isCuti ? 'Mahasiswa CUTI (tidak dipilih secara default)' : (isNonaktif ? 'Mahasiswa NON-AKTIF (dilewati)' : 'Pilih untuk kenaikan semester')}">
                  </td>
                  <td><span class="code-pill">${m.nomor_induk}</span></td>
                  <td>
                    <strong>${m.nama}</strong>
                    ${m.is_registered ? '<span class="role-chip mahasiswa" style="font-size:0.65rem; margin-left:0.3rem;">Registrasi Mandiri</span>' : ''}
                    <div style="font-size: 0.73rem; color: var(--text-muted);">${officialEmail}</div>
                  </td>
                  <td>${m.prodi || 'S1 Bisnis Digital'}</td>
                  <td><strong>Semester ${m.semester_berjalan || 1}</strong></td>
                  <td>
                    ${(() => {
                      if (isCuti) {
                        return `
                          <span
                            class="academic-status-badge cuti"
                            onclick="AdminView.toggleStudentCuti('${m.nomor_induk}')"
                            title="Klik untuk mengubah status: CUTI -> Ubah ke AKTIF">
                            <span style="background: #d97706; width:6px; height:6px; border-radius:50%; display:inline-block;"></span>
                            CUTI
                          </span>
                        `;
                      } else if (isNonaktif) {
                        return `
                          <span
                            class="academic-status-badge nonaktif"
                            title="Mahasiswa Non-Aktif">
                            <span style="background: #94a3b8; width:6px; height:6px; border-radius:50%; display:inline-block;"></span>
                            NON-AKTIF
                          </span>
                        `;
                      } else {
                        return `
                          <span
                            class="academic-status-badge aktif"
                            onclick="AdminView.toggleStudentCuti('${m.nomor_induk}')"
                            title="Klik untuk mengubah status: AKTIF -> Ubah ke CUTI">
                            <span style="background: #10b981; width:6px; height:6px; border-radius:50%; display:inline-block;"></span>
                            AKTIF
                          </span>
                        `;
                      }
                    })()}
                  </td>
                  <td>
                    <span class="status-chip ${m.spp_status === 'LUNAS' ? 'active' : 'inactive'}">
                      <span class="status-indicator ${m.spp_status === 'LUNAS' ? 'active' : 'inactive'}"></span>
                      ${m.spp_status || 'LUNAS'}
                    </span>
                  </td>
                  <td style="text-align:right;">
                    <div class="action-btn-group" style="justify-content: flex-end;">
                      <button class="btn btn-sm btn-outline" style="display:inline-flex; align-items:center; gap:0.3rem;" onclick="AdminView.incrementStudentSemester('${m.nomor_induk}')" title="Naikkan ke Semester berikutnya">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"></polyline></svg>
                        +1 Sem.
                      </button>
                      <button class="btn-action delete" onclick="AdminView.confirmDeleteUser('${m.id}', '${m.nomor_induk}', '${m.nama.replace(/'/g, "\\'")}')" title="Hapus Akun Mahasiswa">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              `;}).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function incrementStudentSemester(nim) {
    const student = cachedUsers.find(u => u.nomor_induk === nim);
    if (student) {
      student.semester_berjalan = (student.semester_berjalan || 1) + 1;
      saveLocalUsers(cachedUsers);
    }
    if (typeof SiakadApi !== 'undefined' && SiakadApi.databaseSiakad && SiakadApi.databaseSiakad[nim]) {
      SiakadApi.databaseSiakad[nim].currentSemester = (SiakadApi.databaseSiakad[nim].currentSemester || 1) + 1;
    }

    // Sinkronisasi ke database PostgreSQL
    fetch('/api/admin/mahasiswa/bulk-semester', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nims: [nim] })
    }).catch(e => console.warn('[PostgreSQL Sync] Gagal sync semester:', e));

    renderActiveTab();
    App.showToast(`Semester mahasiswa ${nim} berhasil dinaikkan!`, 'success');
  }

  function promoteSemesterAll() {
    promoteSemesterSelected();
  }

  return {
    render,
    switchTab,
    refreshData,
    handleSearch,
    handleRoleFilter,
    quickToggleSpp,
    deletePengajuan,
    openAddUserModal,
    toggleRoleFields,
    submitAddUser,
    openEditUserModal,
    toggleEditRoleFields,
    submitEditUser,
    confirmDeleteUser,
    openAddMataKuliahModal,
    submitAddMataKuliah,
    openManageNilaiModal,
    renderManageNilaiModalContent,
    onNilaiHurufChange,
    fillEditNilaiForm,
    resetNilaiForm,
    submitSaveNilai,
    incrementStudentSemester,
    promoteSemesterAll,
    promoteSemesterSelected,
    toggleSelectAllStudents,
    onStudentCheckboxChange,
    toggleStudentCuti,
    exportStudentsToExcel,
    downloadExcelTemplate,
    openImportExcelModal,
    handleExcelFileSelect,
    commitExcelImport,
    downloadNilaiTemplate,
    exportNilaiToExcel,
    openImportNilaiModal,
    handleNilaiFileSelect,
    commitNilaiImport
  };
})();

// Export globally
window.AdminView = AdminView;
