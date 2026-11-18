/**
 * SISTEM LAYANAN AKADEMIK TERPADU (SILADIK)
 * Program Studi S1 Bisnis Digital - UPI Kampus Daerah Tasikmalaya
 * File: assets/js/views/login.js
 * Modern Split-Hero Authentication & Student Registration View
 */

const LoginView = (() => {
  let activeTab = 'login'; // 'login' | 'register'
  let selectedRole = 'mahasiswa'; // 'mahasiswa' | 'staf' | 'kasi' | 'admin'

  function render(container) {
    container.innerHTML = `
      <div class="siladik-auth-container">

        <!-- ═══ LEFT HERO SHOWCASE PANEL (GAMBAR 3 CONTENT ON RED CANVAS) ═══ -->
        <div class="siladik-hero-panel">
          <div class="siladik-hero-inner">
            <!-- Badge -->
            <div class="siladik-hero-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span>PORTAL RESMI S1 BISNIS DIGITAL • UPI TASIKMALAYA</span>
            </div>

            <!-- Title & Description -->
            <div>
              <h1 class="siladik-hero-title">
                Layanan Akademik<br>
                <span class="siladik-hero-title-accent">Cepat & Terpadu.</span>
              </h1>
              <p class="siladik-hero-desc">
                Pengajuan dokumen resmi dan pemantauan antrean secara transparan.
              </p>
            </div>

            <!-- 3 Modern Feature Cards -->
            <div class="siladik-feature-cards">
              <div class="siladik-fcard">
                <div class="siladik-fcard-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                </div>
                <div>
                  <div class="siladik-fcard-title">Pengajuan 4 Dokumen</div>
                  <div class="siladik-fcard-desc">Layanan SKMA, KRS, KHS, dan Transkrip Nilai mandiri.</div>
                </div>
              </div>

              <div class="siladik-fcard">
                <div class="siladik-fcard-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                </div>
                <div>
                  <div class="siladik-fcard-title">Tanda Tangan & Cap Sah</div>
                  <div class="siladik-fcard-desc">Pencetakan berkas fisik dan pengesahan resmi pimpinan.</div>
                </div>
              </div>

              <div class="siladik-fcard">
                <div class="siladik-fcard-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <div>
                  <div class="siladik-fcard-title">SLA Maks. 3 Hari Kerja</div>
                  <div class="siladik-fcard-desc">Antrean FIFO transparan dengan estimasi waktu terukur.</div>
                </div>
              </div>
            </div>

            <!-- Bottom Stats -->
            <div class="siladik-stats-row">
              <div class="siladik-stat-item">
                <span class="siladik-stat-num">3 Hari</span>
                <span class="siladik-stat-sub">Target SLA Layanan</span>
              </div>
              <div class="siladik-stat-sep"></div>
              <div class="siladik-stat-item">
                <span class="siladik-stat-num">4 Kategori</span>
                <span class="siladik-stat-sub">Dokumen Prioritas</span>
              </div>
              <div class="siladik-stat-sep"></div>
              <div class="siladik-stat-item">
                <span class="siladik-stat-num">100% Mandiri</span>
                <span class="siladik-stat-sub">Database Internal</span>
              </div>
            </div>

          </div>
        </div>

        <!-- ═══ RIGHT AUTHENTICATION PANEL ═══ -->
        <div class="siladik-form-panel">
          <div class="siladik-modern-card">

            <!-- Card Brand Header -->
            <div class="siladik-card-brand">
              <div class="siladik-card-logo-ring">
                <img src="assets/images/logo-upi-bulat.png" alt="Logo UPI" class="siladik-card-logo-img" />
              </div>
              <div>
                <div class="siladik-card-title">SILADIK</div>
                <div class="siladik-card-subtitle">Sistem Layanan Akademik Terpadu • S1 Bisnis Digital</div>
              </div>
            </div>

            <!-- Modern Segmented Tabs -->
            <div class="siladik-tab-switcher">
              <button
                type="button"
                id="btnTabLogin"
                class="siladik-tab-toggle ${activeTab === 'login' ? 'active' : ''}"
                onclick="LoginView.switchTab('login')">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                Log Masuk
              </button>
              <button
                type="button"
                id="btnTabRegister"
                class="siladik-tab-toggle ${activeTab === 'register' ? 'active' : ''}"
                onclick="LoginView.switchTab('register')">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                Daftar Akun Baru
              </button>
            </div>

            <!-- TAB 1: LOG MASUK -->
            <div id="contentTabLogin" style="display: ${activeTab === 'login' ? 'block' : 'none'};">
              <form onsubmit="LoginView.handleLoginSubmit(event)">

                <!-- Interactive Role Selector Grid -->
                <label class="siladik-role-label">Masuk Sebagai:</label>
                <div class="siladik-role-grid">
                  <div
                    data-role="mahasiswa"
                    class="siladik-role-chip ${selectedRole === 'mahasiswa' ? 'selected' : ''}"
                    onclick="LoginView.selectRole('mahasiswa')">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                    <span>Mahasiswa</span>
                  </div>
                  <div
                    data-role="staf"
                    class="siladik-role-chip ${selectedRole === 'staf' ? 'selected' : ''}"
                    onclick="LoginView.selectRole('staf')">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                    <span>Staf TU</span>
                  </div>
                  <div
                    data-role="kasi"
                    class="siladik-role-chip ${selectedRole === 'kasi' ? 'selected' : ''}"
                    onclick="LoginView.selectRole('kasi')">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>
                    <span>KASI</span>
                  </div>
                  <div
                    data-role="admin"
                    class="siladik-role-chip ${selectedRole === 'admin' ? 'selected' : ''}"
                    onclick="LoginView.selectRole('admin')">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                    <span>Admin</span>
                  </div>
                </div>

                <!-- Input Nomor Induk -->
                <div class="siladik-input-group">
                  <label class="siladik-role-label" id="labelIdentifier">Nomor Induk Mahasiswa (NIM)</label>
                  <div class="siladik-input-box">
                    <svg class="siladik-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    <input
                      type="text"
                      id="loginIdentifierInput"
                      class="siladik-form-input"
                      placeholder="Masukkan NIM Anda"
                      value="2312017"
                      required />
                  </div>
                </div>

                <!-- Input Kata Sandi -->
                <div class="siladik-input-group">
                  <div style="display:flex; justify-content:space-between; align-items:center;">
                    <label class="siladik-role-label">Kata Sandi</label>
                    <a href="javascript:void(0)" onclick="App.showToast('Gunakan kata sandi bawaan: password123', 'info')" style="font-size:0.75rem; color:#991b1b; text-decoration:none;">Lupa sandi?</a>
                  </div>
                  <div class="siladik-input-box">
                    <svg class="siladik-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    <input
                      type="password"
                      id="loginPasswordInput"
                      class="siladik-form-input"
                      style="padding-right: 2.75rem;"
                      value="password123"
                      placeholder="••••••••••••"
                      required />
                    <button
                      type="button"
                      class="siladik-password-toggle"
                      onclick="LoginView.togglePasswordVisibility('loginPasswordInput', this)"
                      title="Lihat kata sandi"
                      aria-label="Lihat kata sandi">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    </button>
                  </div>
                </div>

                <!-- Submit Button -->
                <button type="submit" id="loginSubmitBtn" class="siladik-btn-submit">
                  <span>Masuk ke Portal SILADIK</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </button>
              </form>

              <!-- Quick 1-Click Demo -->
              <div class="siladik-demo-strip">
                <div class="siladik-demo-title">Akses Demo 1-Klik</div>
                <div class="siladik-demo-buttons">
                  <button type="button" class="siladik-demo-btn" onclick="LoginView.quickLogin('2312017', 'mahasiswa')">
                    <span style="display:inline-block; width:7px; height:7px; border-radius:50%; background:#2563eb;"></span>
                    <span>Mahasiswa (Nabil)</span>
                  </button>
                  <button type="button" class="siladik-demo-btn" onclick="LoginView.quickLogin('198703142014041001', 'staf')">
                    <span style="display:inline-block; width:7px; height:7px; border-radius:50%; background:#0d9488;"></span>
                    <span>Staf TU (Budi)</span>
                  </button>
                  <button type="button" class="siladik-demo-btn" onclick="LoginView.quickLogin('199105202020121008', 'kasi')">
                    <span style="display:inline-block; width:7px; height:7px; border-radius:50%; background:#7c3aed;"></span>
                    <span>KASI (M. Rizki)</span>
                  </button>
                  <button type="button" class="siladik-demo-btn" onclick="LoginView.quickLogin('ADMIN001', 'admin')">
                    <span style="display:inline-block; width:7px; height:7px; border-radius:50%; background:#dc2626;"></span>
                    <span>Administrator</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- TAB 2: DAFTAR AKUN BARU (KHUSUS MAHASISWA) -->
            <div id="contentTabRegister" style="display: ${activeTab === 'register' ? 'block' : 'none'};">
              <div style="background:#fef2f2; border:1px solid #fecaca; border-radius:12px; padding:0.75rem 0.9rem; margin-bottom:1.25rem; font-size:0.775rem; color:#991b1b; display:flex; align-items:center; gap:0.5rem;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <span>Pendaftaran akun mandiri ini <strong>khusus untuk Mahasiswa</strong> aktif UPI Kampus Tasikmalaya.</span>
              </div>

              <form onsubmit="LoginView.handleRegisterSubmit(event)">
                <div class="siladik-input-group">
                  <label class="siladik-role-label">NIM (Nomor Induk Mahasiswa)</label>
                  <input type="text" id="regNim" class="siladik-form-input" style="padding-left:1rem;" placeholder="Contoh: 2301599" required />
                </div>

                <div class="siladik-input-group">
                  <label class="siladik-role-label">Nama Lengkap</label>
                  <input type="text" id="regNama" class="siladik-form-input" style="padding-left:1rem;" placeholder="Nama lengkap sesuai data akademik" required />
                </div>

                <div class="siladik-input-group">
                  <label class="siladik-role-label">Program Studi</label>
                  <select id="regProdi" class="siladik-form-input" style="padding-left:1rem;">
                    <option value="S1 Bisnis Digital" selected>S1 Bisnis Digital</option>
                    <option value="S1 Kewirausahaan">S1 Kewirausahaan</option>
                    <option value="S1 Desain Produk Industri (DPI)">S1 Desain Produk Industri (DPI)</option>
                    <option value="S1 Pendidikan Guru Sekolah Dasar (PGSD)">S1 Pendidikan Guru Sekolah Dasar (PGSD)</option>
                    <option value="S1 PGPAUD">S1 Pendidikan Guru PAUD (PGPAUD)</option>
                  </select>
                </div>

                <div class="siladik-input-group">
                  <label class="siladik-role-label">Semester Berjalan</label>
                  <select id="regSemester" class="siladik-form-input" style="padding-left:1rem;">
                    <option value="1">Semester 1 (Tingkat 1 Ganjil)</option>
                    <option value="2">Semester 2 (Tingkat 1 Genap)</option>
                    <option value="3">Semester 3 (Tingkat 2 Ganjil)</option>
                    <option value="4">Semester 4 (Tingkat 2 Genap)</option>
                    <option value="5">Semester 5 (Tingkat 3 Ganjil)</option>
                    <option value="6">Semester 6 (Tingkat 3 Genap)</option>
                    <option value="7" selected>Semester 7 (Tingkat 4 Ganjil)</option>
                    <option value="8">Semester 8 (Tingkat 4 Genap)</option>
                  </select>
                </div>

                <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.6rem;">
                  <div class="siladik-input-group">
                    <label class="siladik-role-label">Kata Sandi</label>
                    <div class="siladik-input-box">
                      <input type="password" id="regPassword" class="siladik-form-input" style="padding-left:1rem; padding-right:2.4rem;" placeholder="Min. 6 karakter" required />
                      <button
                        type="button"
                        class="siladik-password-toggle"
                        style="right: 0.5rem;"
                        onclick="LoginView.togglePasswordVisibility('regPassword', this)"
                        title="Lihat kata sandi"
                        aria-label="Lihat kata sandi">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      </button>
                    </div>
                  </div>
                  <div class="siladik-input-group">
                    <label class="siladik-role-label">Konfirmasi Sandi</label>
                    <div class="siladik-input-box">
                      <input type="password" id="regConfirmPassword" class="siladik-form-input" style="padding-left:1rem; padding-right:2.4rem;" placeholder="Ulangi sandi" required />
                      <button
                        type="button"
                        class="siladik-password-toggle"
                        style="right: 0.5rem;"
                        onclick="LoginView.togglePasswordVisibility('regConfirmPassword', this)"
                        title="Lihat kata sandi"
                        aria-label="Lihat kata sandi">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      </button>
                    </div>
                  </div>
                </div>

                <button type="submit" id="regSubmitBtn" class="siladik-btn-submit">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  <span>Daftarkan Akun Mahasiswa</span>
                </button>
              </form>
            </div>

          </div>
        </div>

      </div>
    `;
  }

  function switchTab(tab) {
    activeTab = tab;
    const loginTab = document.getElementById('contentTabLogin');
    const regTab = document.getElementById('contentTabRegister');
    const btnLogin = document.getElementById('btnTabLogin');
    const btnReg = document.getElementById('btnTabRegister');

    if (loginTab && regTab) {
      if (tab === 'login') {
        loginTab.style.display = 'block';
        regTab.style.display = 'none';
        btnLogin.classList.add('active');
        btnReg.classList.remove('active');
      } else {
        loginTab.style.display = 'none';
        regTab.style.display = 'block';
        btnLogin.classList.remove('active');
        btnReg.classList.add('active');
      }
    }
  }

  function selectRole(role) {
    selectedRole = role;
    document.querySelectorAll('.siladik-role-chip').forEach(c => {
      if (c.getAttribute('data-role') === role) {
        c.classList.add('selected');
      } else {
        c.classList.remove('selected');
      }
    });

    const input = document.getElementById('loginIdentifierInput');
    const label = document.getElementById('labelIdentifier');
    if (!input || !label) return;

    if (role === 'mahasiswa') {
      label.textContent = 'Nomor Induk Mahasiswa (NIM)';
      input.placeholder = 'Contoh: 2312017';
      input.value = '2312017';
    } else if (role === 'staf') {
      label.textContent = 'NIP / ID Staf Akademik (TU)';
      input.placeholder = 'Contoh: 198703142014041001';
      input.value = '198703142014041001';
    } else if (role === 'kasi') {
      label.textContent = 'NIP / ID Pimpinan / KASI';
      input.placeholder = 'Contoh: 199105202020121008';
      input.value = '199105202020121008';
    } else if (role === 'admin') {
      label.textContent = 'ID Pengguna Administrator';
      input.placeholder = 'Contoh: ADMIN001';
      input.value = 'ADMIN001';
    }

    const pwdInput = document.getElementById('loginPasswordInput');
    if (pwdInput) {
      pwdInput.value = 'password123';
    }
  }

  async function handleLoginSubmit(e) {
    e.preventDefault();
    const btn = document.getElementById('loginSubmitBtn');
    const identifier = document.getElementById('loginIdentifierInput').value.trim();
    const password = document.getElementById('loginPasswordInput').value;

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="animation:spin 1s linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
        <span>Memverifikasi Database...</span>
      `;
    }

    try {
      const user = await AuthManager.login(identifier, password, selectedRole);
      let roleLabel = user.role;
      if (user.role === 'kasi') roleLabel = 'Kasubag / KASI';
      if (user.role === 'staff') roleLabel = 'Staf Akademik';
      if (user.role === 'admin') roleLabel = 'Administrator';
      if (user.role === 'mahasiswa') roleLabel = 'Mahasiswa';
      App.showToast(`Berhasil masuk sebagai ${roleLabel} (${user.nama})`, 'success');
    } catch (err) {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `
          <span>Masuk ke Portal SILADIK</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        `;
      }
      App.showToast(err.message || 'Identitas tidak ditemukan dalam basis data', 'error');
    }
  }

  async function handleRegisterSubmit(e) {
    e.preventDefault();
    const nim = document.getElementById('regNim').value.trim();
    const nama = document.getElementById('regNama').value.trim();
    const prodi = document.getElementById('regProdi').value;
    const currentSemester = document.getElementById('regSemester').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    const btn = document.getElementById('regSubmitBtn');

    if (password !== confirmPassword) {
      App.showToast('Kata sandi dan konfirmasi kata sandi tidak cocok!', 'error');
      return;
    }

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = 'Mendaftarkan Akun...';
    }

    try {
      const newStudent = await AuthManager.registerStudent({
        nim, nama, prodi, currentSemester, password
      });

      App.showToast(`Akun Mahasiswa ${newStudent.nama} (${newStudent.nim}) berhasil didaftarkan!`, 'success');

      switchTab('login');
      const input = document.getElementById('loginIdentifierInput');
      const pass = document.getElementById('loginPasswordInput');
      if (input) input.value = newStudent.nim;
      if (pass) pass.value = password;
      selectedRole = 'mahasiswa';
      document.querySelectorAll('.siladik-role-chip').forEach(c => c.classList.remove('selected'));
      const mhsChip = document.querySelector('.siladik-role-chip:first-child');
      if (mhsChip) mhsChip.classList.add('selected');
    } catch (err) {
      App.showToast(err.message, 'error');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          <span>Daftarkan Akun Mahasiswa</span>
        `;
      }
    }
  }

  async function quickLogin(identifier, role) {
    try {
      const user = await AuthManager.login(identifier, 'password123', role);
      let roleLabel = user.role;
      if (user.role === 'kasi') roleLabel = 'Kasubag / KASI';
      if (user.role === 'staff') roleLabel = 'Staf Akademik';
      if (user.role === 'admin') roleLabel = 'Administrator';
      if (user.role === 'mahasiswa') roleLabel = 'Mahasiswa';
      App.showToast(`Berhasil masuk sebagai ${roleLabel} (${user.nama})`, 'success');
    } catch (err) {
      App.showToast(err.message, 'error');
    }
  }

  function togglePasswordVisibility(inputId, btnEl) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';

    const eyeIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
    const eyeOffIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;

    if (btnEl) {
      btnEl.innerHTML = isPassword ? eyeOffIcon : eyeIcon;
      btnEl.title = isPassword ? 'Sembunyikan kata sandi' : 'Lihat kata sandi';
      btnEl.setAttribute('aria-label', isPassword ? 'Sembunyikan kata sandi' : 'Lihat kata sandi');
    }
  }

  return {
    render,
    switchTab,
    selectRole,
    handleLoginSubmit,
    handleRegisterSubmit,
    quickLogin,
    togglePasswordVisibility
  };
})();

// Export globally
window.LoginView = LoginView;
