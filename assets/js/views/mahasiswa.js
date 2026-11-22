/**
 * SISTEM INFORMASI LAYANAN AKADEMIK DIGITAL TERPADU (SILADIK-AI)
 * File: assets/js/views/mahasiswa.js
 * Student View: Submission, SIAKAD Autofill, SPP Blocker, Queue & SLA Tracking
 * Mengakomodasi FR-01, FR-02, FR-03, FR-05, FR-06, FR-07, FR-08, FR-10, FR-11, BR-01, BR-02, BR-03, BR-04, BR-08
 */

const MahasiswaView = (() => {
  let timerInterval = null;
  let mobileViewMode = 'card'; // 'card' (default mobile) atau 'table' (bisa di-slide)

  function toggleMobileViewMode() {
    mobileViewMode = mobileViewMode === 'card' ? 'table' : 'card';
    render(document.getElementById('viewContainer'));
  }

  function render(container) {
    const user = AuthManager.getCurrentUser();

    if (!user || user.role !== 'mahasiswa' || !container) {
      return;
    }

    // Ambil data profil mahasiswa dari database lokal SIAKAD jika tersedia
    let localStudent = null;
    if (typeof SiakadApi !== 'undefined' && SiakadApi.databaseSiakad && SiakadApi.databaseSiakad[user.nim]) {
      localStudent = SiakadApi.databaseSiakad[user.nim];
    }

    const student = {
      nim: user.nim,
      nama: user.nama,
      email: user.email || `${user.nim}@upi.edu`,
      prodi: user.prodi || 'S1 Bisnis Digital',
      currentSemester: Number(user.currentSemester ?? user.semester_berjalan ?? localStudent?.currentSemester ?? 1),
      totalSksLulus: Number(user.totalSksLulus ?? user.total_sks_lulus ?? localStudent?.totalSksLulus ?? 0),
      ipk: user.ipk !== undefined ? Number(user.ipk) : (localStudent?.ipk || 0.00),
      statusAkademik: 'Aktif',
      statusSpp: user.statusSpp || localStudent?.statusSpp || 'Lunas',
      dosen_pa: user.dosen_pa || 'Muhammad Rizki Nugraha, S.Pd., M.T.',
      riwayatSemester: localStudent?.riwayatSemester || {}
    };

    const currentSemester = Number(
      student.currentSemester ?? 1
    );

    const requests = QueueSlaManager.getRequestsByNim(student.nim);

    // PERBAIKAN BUG: Hilangkan fallback "|| requests[0]".
    // Fallback tersebut menyebabkan pengajuan yang sudah SELESAI atau DITOLAK
    // tetap ditampilkan sebagai pengajuan aktif karena find() mengembalikan
    // undefined dan fallback memilih elemen pertama tanpa memperhatikan statusnya.
    // Jika tidak ada pengajuan aktif, activeRequest = null (tampilkan keadaan kosong).
    const activeRequest = requests.find(
      r => r.status !== 'selesai' && r.status !== 'ditolak'
    ) ?? null;

    container.innerHTML = `
      <!-- Student Identity Banner (Auto-filled from SIAKAD SSO) -->
      <div class="student-profile-banner">
        <div class="profile-top">
          <div class="profile-avatar-large">${student.nama
        .split(' ')
        .map(n => n[0])
        .join('')
        .substring(0, 2)}</div>

          <div class="profile-meta">
            <h2>${student.nama}</h2>

            <p>
              <span>NIM: <strong>${student.nim}</strong></span> • 
              <span>${student.prodi}</span>

              <span class="siakad-synced-badge" style="background: rgba(16, 185, 129, 0.15); color: #059669; border-color: #a7f3d0;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
                Data Terverifikasi Aktif
              </span>
            </p>
          </div>
        </div>

        <div class="student-data-grid">
          <div class="data-cell">
            <span class="data-cell-label">Semester Aktif</span>
            <span class="data-cell-value">
              Semester ${currentSemester}
            </span>
          </div>

          <div class="data-cell">
            <span class="data-cell-label">Status Akademik</span>
            <span class="data-cell-value" style="color: #4ade80; display: inline-flex; align-items: center; gap: 0.35rem;">
              <span class="live-status-dot"></span> ${student.statusAkademik || 'Aktif'}
            </span>
          </div>

          <div class="data-cell">
            <span class="data-cell-label">Indeks Prestasi Kumulatif (IPK)</span>
            <span class="data-cell-value">
              ${student.ipk ?? '-'} ${student.totalSksLulus ? `(${student.totalSksLulus} SKS)` : ''}
            </span>
          </div>

          <div class="data-cell">
            <span class="data-cell-label">Status SPP</span>
            <span class="data-cell-value" style="color: #4ade80; display: inline-flex; align-items: center; gap: 0.35rem;">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              ${student.statusSpp || 'LUNAS'}
            </span>
          </div>

          <div class="data-cell">
            <span class="data-cell-label">Dosen Pembimbing Akademik (PA)</span>
            <span class="data-cell-value" style="font-size: 0.85rem; font-weight: 600;">
              ${student.dosen_pa || 'Muhammad Rizki Nugraha, S.Pd., M.T.'}
            </span>
          </div>

          <div class="data-cell">
            <span class="data-cell-label">Tahun Angkatan</span>
            <span class="data-cell-value">
              20${student.nim ? student.nim.substring(0, 2) : '23'}
            </span>
          </div>
        </div>
      </div>

      <!-- Main Layout: Form Pengajuan (Kiri) & Live Tracking Queue (Kanan) -->
      <div class="dashboard-grid">

        <!-- Kolom Kiri: Form Pengajuan Dokumen -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
              Pengajuan Dokumen Baru
            </h3>
          </div>

          <div class="card-body">
            <form
              id="formPengajuanDokumen"
              onsubmit="MahasiswaView.handleSubmit(event)">

              <div class="form-group">
                <label class="form-label" for="docTypeSelect">
                  Jenis Dokumen Akademik
                </label>

                <select
                  id="docTypeSelect"
                  class="form-select"
                  onchange="MahasiswaView.handleDocTypeChange(this.value)">

                  <option value="skma">
                    Surat Keterangan Mahasiswa Aktif (SKMA)
                  </option>

                  <option value="transkrip">
                    Transkrip Nilai Akademik Sementara
                  </option>

                  <option value="khs">
                    Kartu Hasil Studi (KHS)
                  </option>

                  <option value="krs">
                    Kartu Rencana Studi (KRS)
                  </option>
                </select>
              </div>

              <!-- Dynamic Field: Keperluan (SKMA) -->
              <div class="form-group" id="groupKeperluan">
                <label class="form-label" for="keperluanSelect">
                  Kategori Keperluan Surat
                </label>

                <select
                  id="keperluanSelect"
                  class="form-select"
                  onchange="MahasiswaView.handleKeperluanChange(this.value)">

                  <option value="Pengajuan Tunjangan Gaji Orang Tua (PNS / BUMN / Swasta)">
                    Pengajuan Tunjangan Gaji Orang Tua (PNS / BUMN / Swasta)
                  </option>

                  <option value="Pendaftaran Beasiswa">
                    Pendaftaran Beasiswa
                  </option>

                  <option value="Persyaratan Magang / MBKM / Praktik Kerja Lapangan">
                    Persyaratan Magang / MBKM / Praktik Kerja Lapangan
                  </option>

                  <option value="Pengurusan BPJS Kesehatan / Asuransi">
                    Pengurusan BPJS Kesehatan / Asuransi
                  </option>

                  <option value="Kelengkapan Berkas Akademik / Lomba Mahasiswa">
                    Kelengkapan Berkas Akademik / Lomba Mahasiswa
                  </option>

                  <option value="custom">
                    Keperluan Lainnya (Ketik Manual)...
                  </option>
                </select>

                <!-- Input Spesifik Tambahan (Opsional) -->
                <div id="keperluanDetailWrapper" style="margin-top: 0.6rem;">
                  <input
                    type="text"
                    id="keperluanDetailInput"
                    class="form-control"
                    placeholder="Keterangan Tambahan / Instansi Terkait (Opsional)..." />
                </div>
              </div>

              <!-- Dynamic Field: Semester (KHS, KRS & Transkrip) -->
              <div class="form-group" id="groupSemester" style="display: none;">
                <label class="form-label" for="semesterSelect">
                  Semester Terkait
                </label>

                <select id="semesterSelect" class="form-select">
                  ${renderSemesterOptions(currentSemester, 'khs')}
                </select>

                <span class="form-hint">
                  Pilihan semester disesuaikan otomatis dengan semester berjalan mahasiswa.
                </span>
              </div>

              <div class="form-group">
                <label class="form-label">
                  Data Terisi Otomatis (Hanya-Baca)
                </label>

                <input
                  type="text"
                  class="form-control"
                  value="${student.nama} (${student.nim}) - ${student.prodi}"
                  readonly />
              </div>

              <div style="margin-top: 1.5rem;">
                <button
                  type="submit"
                  id="btnSubmitPengajuan"
                  class="btn btn-primary btn-block btn-lg"
                  onclick="MahasiswaView.handleSubmit(event)">

                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="22" y1="2" x2="11" y2="13"/>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>

                  Kirim Pengajuan Dokumen
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Kolom Kanan: Status Pelacakan, Antrean & SLA Countdown -->
        <div id="mahasiswaRightCol">
          ${renderRightColumnHtml(requests, activeRequest)}
        </div>
      </div>
    `;

    // Start SLA countdown ticker
    if (activeRequest) {
      startSlaTicker(activeRequest);
    }

    // Trigger initial check on docType
    handleDocTypeChange(
      document.getElementById('docTypeSelect')?.value || 'skma'
    );

    // Background sync: sinkronkan data terbaru dari cloud PostgreSQL tanpa memblokir UI
    if (typeof QueueSlaManager !== 'undefined' && QueueSlaManager.syncFromDatabase) {
      QueueSlaManager.syncFromDatabase().catch(() => {});
    }
  }

  function renderRightColumnHtml(requests, activeRequest) {
    return `
      <!-- Riwayat Pengajuan Mahasiswa (FR-08) -->
          <div class="card">
            <div class="card-header">
              <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; flex-wrap: wrap; gap: 0.5rem;">
                <h4 class="card-title">
                  Riwayat Pengajuan Dokumen Anda
                </h4>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <span class="badge" style="background:#f1f5f9; color:#475569;">
                    ${requests.length} Pengajuan
                  </span>
                  <!-- Switcher Mode Tampilan di HP -->
                  <div class="mobile-only-toggle-wrapper">
                    <button type="button" class="mobile-toggle-btn" onclick="MahasiswaView.toggleMobileViewMode()" title="Ganti mode tampilan">
                      ${mobileViewMode === 'card' ? '📊 Mode Tabel (Slide)' : '📱 Mode Kartu'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="card-body" style="padding: 0;">
              ${mobileViewMode === 'card' ? `
                <!-- 1. Tampilan Kartu Mobile (Sangat Rapi & Pas di Layar HP) -->
                <div class="mobile-student-cards-wrapper">
                  ${requests.length === 0 ? `
                    <div style="text-align: center; color: var(--text-muted); padding: 2.5rem 1rem; font-size: 0.85rem;">
                      Belum ada riwayat pengajuan dokumen.
                    </div>
                  ` : requests.map(r => `
                    <div class="mobile-student-card">
                      <div class="msc-header">
                        <div style="display: flex; align-items: center; gap: 0.45rem;">
                          <span class="badge-queue-no">${r.queueNo}</span>
                          <span class="msc-date">${new Date(r.createdAt).toLocaleDateString('id-ID')}</span>
                        </div>
                        <div>
                          ${getStatusBadge(r.status)}
                        </div>
                      </div>

                      <div class="msc-body">
                        <div class="msc-doc-title">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                          <span>${r.docTitle}</span>
                          ${r.semester ? `<span class="badge badge-diajukan" style="margin-left: 0.35rem;">Sem. ${r.semester}</span>` : ''}
                        </div>
                        <div class="msc-keperluan">
                          ${r.keperluan || 'Keperluan pengajuan dokumen akademik'}
                        </div>
                      </div>

                      <div class="msc-footer">
                        <button
                          type="button"
                          class="btn btn-sm btn-secondary msc-timeline-btn"
                          onclick="MahasiswaView.showTimelineModal('${r.id || r.queueNo}')"
                          title="Lacak 4 tahapan dokumen">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                          <span>Lacak Status</span>
                        </button>

                        ${r.status === 'selesai' ? `
                          <button
                            class="btn btn-sm btn-success msc-download-btn"
                            onclick="MahasiswaView.downloadOfficialDocDirect('${r.id}')"
                            title="Unduh Dokumen PDF">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                            <span>Unduh PDF</span>
                          </button>
                        ` : `
                          <span class="msc-processing-badge">
                            ⏳ Dalam Proses
                          </span>
                        `}
                      </div>
                    </div>
                  `).join('')}
                </div>

                <!-- 2. Tampilan Tabel Desktop (Otomatis Aktif di Layar Lebar) -->
                <div class="desktop-data-table-wrapper data-table-wrapper" style="border:none;">
                  <table class="data-table">
                  <thead>
                    <tr>
                      <th style="width: 140px; min-width: 130px; white-space: nowrap;">No Antrean</th>
                      <th>Dokumen</th>
                      <th style="white-space: nowrap;">Waktu Diajukan</th>
                      <th style="white-space: nowrap;">Status</th>
                      <th style="white-space: nowrap; text-align: center;">Aksi</th>
                    </tr>
                  </thead>

                  <tbody>
                    ${requests.length === 0 ? `
                      <tr>
                        <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 2rem;">
                          Belum ada riwayat pengajuan dokumen.
                        </td>
                      </tr>
                    ` : requests.map(r => `
                      <tr>

                        <td style="white-space: nowrap;">
                          <span class="badge-queue-no">
                            ${r.queueNo}
                          </span>
                        </td>

                        <td>
                          <strong>${r.docTitle}</strong>

                          <div style="font-size: 0.75rem; color: var(--text-muted);">
                            ${r.keperluan || '-'}
                            ${r.semester ? ` • Semester ${r.semester}` : ''}
                          </div>
                        </td>

                        <td style="white-space: nowrap;">
                          ${new Date(r.createdAt).toLocaleDateString('id-ID')}
                        </td>

                        <td style="white-space: nowrap;">
                          <button
                            type="button"
                            class="status-timeline-btn"
                            onclick="MahasiswaView.showTimelineModal('${r.id || r.queueNo}')"
                            title="Klik untuk melacak 4 tahapan progres pengajuan">
                            ${getStatusBadge(r.status)}
                            <span class="timeline-click-hint">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                              Lacak
                            </span>
                          </button>
                        </td>

                        <td style="white-space: nowrap; text-align: center;">
                          ${r.status === 'selesai' ? `
                            <button
                              class="btn btn-sm btn-success"
                              style="display: inline-flex; align-items: center; gap: 0.35rem;"
                              onclick="MahasiswaView.downloadOfficialDocDirect('${r.id}')"
                              title="Unduh Berkas Dokumen PDF Resmi">
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                              <span>Unduh PDF</span>
                            </button>
                          ` : `
                            <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 500;">
                              Dalam Proses
                            </span>
                          `}
                        </td>

                      </tr>
                    `).join('')}
                  </tbody>
                  </table>
                </div>
              ` : `
                <!-- 3. Mode Tabel Mobile (Disertai Petunjuk Slide & Scrollbar Halus) -->
                <div class="table-scroll-indicator">
                  <span class="tsi-arrow">👉</span>
                  <span>Geser tabel ke samping untuk melihat aksi ➔</span>
                </div>
                <div class="data-table-wrapper" style="border:none;">
                  <table class="data-table">
                    <thead>
                      <tr>
                        <th style="width: 140px; min-width: 130px; white-space: nowrap;">No Antrean</th>
                        <th>Dokumen</th>
                        <th style="white-space: nowrap;">Waktu Diajukan</th>
                        <th style="white-space: nowrap;">Status</th>
                        <th style="white-space: nowrap; text-align: center;">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${requests.length === 0 ? `
                        <tr>
                          <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 2rem;">
                            Belum ada riwayat pengajuan dokumen.
                          </td>
                        </tr>
                      ` : requests.map(r => `
                        <tr>
                          <td style="white-space: nowrap;">
                            <span class="badge-queue-no">
                              ${r.queueNo}
                            </span>
                          </td>
                          <td>
                            <strong>${r.docTitle}</strong>
                            <div style="font-size: 0.75rem; color: var(--text-muted);">
                              ${r.keperluan || '-'}
                              ${r.semester ? ` • Semester ${r.semester}` : ''}
                            </div>
                          </td>
                          <td style="white-space: nowrap;">
                            ${new Date(r.createdAt).toLocaleDateString('id-ID')}
                          </td>
                          <td style="white-space: nowrap;">
                            <button
                              type="button"
                              class="status-timeline-btn"
                              onclick="MahasiswaView.showTimelineModal('${r.id || r.queueNo}')"
                              title="Klik untuk melacak 4 tahapan progres pengajuan">
                              ${getStatusBadge(r.status)}
                              <span class="timeline-click-hint">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                                Lacak
                              </span>
                            </button>
                          </td>
                          <td style="white-space: nowrap; text-align: center;">
                            ${r.status === 'selesai' ? `
                              <button
                                class="btn btn-sm btn-success"
                                style="display: inline-flex; align-items: center; gap: 0.35rem;"
                                onclick="MahasiswaView.downloadOfficialDocDirect('${r.id}')"
                                title="Unduh Berkas Dokumen PDF Resmi">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                <span>Unduh PDF</span>
                              </button>
                            ` : `
                              <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 500;">
                                Dalam Proses
                              </span>
                            `}
                          </td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              `}
            </div>
          </div>
    `;
  }

  function updateRiwayatOnly() {
    const user = AuthManager.getCurrentUser();
    if (!user || user.role !== 'mahasiswa') return;
    const rightCol = document.getElementById('mahasiswaRightCol');
    if (!rightCol) return;

    const studentNim = user.nim || user.nomor_induk;
    const requests = QueueSlaManager.getRequestsByNim(studentNim);
    const activeRequest = requests.find(
      r => r.status !== 'selesai' && r.status !== 'ditolak'
    ) ?? null;

    rightCol.innerHTML = renderRightColumnHtml(requests, activeRequest);

    if (activeRequest) {
      startSlaTicker(activeRequest);
    }
  }

  /**
   * Menentukan semester yang dapat dipilih mahasiswa
   *
   * Aturan:
   * - Semester 1 -> 1
   * - Semester 3 -> 1,2,3
   * - Semester 5 -> 1,2,3,4,5
   * - Semester 7:
   *     KHS       -> 1,2,3,4,5,6
   *     Transkrip -> 1,2,3,4,5,6
   *     KRS       -> 1,2,3,4,5,6,7
   *
   * Untuk semester selain 7, maksimal mengikuti semester aktif mahasiswa.
   */
  function getAvailableSemesters(currentSemester, docType) {
    const activeSemester = Number(currentSemester) || 1;

    let maxSemester = activeSemester;

    if (
      activeSemester === 7 &&
      (docType === 'khs' || docType === 'transkrip')
    ) {
      maxSemester = 6;
    }

    const semesters = [];

    for (let semester = 1; semester <= maxSemester; semester++) {
      semesters.push(semester);
    }

    return semesters;
  }

  /**
   * Membuat option dropdown semester.
   * Semester tertinggi yang diperbolehkan otomatis dipilih.
   */
  function renderSemesterOptions(currentSemester, docType) {
    const semesters = getAvailableSemesters(currentSemester, docType);

    if (semesters.length === 0) {
      return `<option value="">Semester tidak tersedia</option>`;
    }

    return semesters
      .map(semester => `
        <option
          value="${semester}"
          ${semester === semesters[semesters.length - 1] ? 'selected' : ''}>
          Semester ${semester}
        </option>
      `)
      .join('');
  }

  function getStatusBadge(status) {
    switch (status) {
      case 'antrean':
        return `<span class="badge badge-antrean"><span class="badge-dot"></span>Dalam Antrean</span>`;

      case 'verifikasi_staf':
        return `<span class="badge badge-review-staf"><span class="badge-dot"></span>Review Staf</span>`;

      case 'selesai':
        return `<span class="badge badge-selesai"><span class="badge-dot"></span>Selesai</span>`;

      case 'ditolak':
        return `<span class="badge badge-ditolak"><span class="badge-dot"></span>Ditolak</span>`;

      default:
        return `<span class="badge badge-diajukan"><span class="badge-dot"></span>Diajukan</span>`;
    }
  }

  function getStepClass(currentStatus, stepIndex) {
    const statusOrder = {
      'diajukan': 1,
      'antrean': 3,
      'verifikasi_staf': 5,
      'selesai': 6,
      'ditolak': 1
    };

    const currentLevel = statusOrder[currentStatus] || 1;

    if (currentLevel > stepIndex) return 'completed';
    if (currentLevel === stepIndex) return 'active';

    return '';
  }

  function startSlaTicker(request) {
    if (timerInterval) {
      clearInterval(timerInterval);
    }

    const updateCountdown = () => {
      const el = document.getElementById('countdownTimerText');

      if (!el) return;

      const res = QueueSlaManager.getSlaCountdown(
        request.slaDeadline,
        request.status
      );

      el.textContent = res.text;
    };

    updateCountdown();

    timerInterval = setInterval(updateCountdown, 1000);
  }

  function handleDocTypeChange(val) {
    const user = AuthManager.getCurrentUser();

    const sppContainer =
      document.getElementById('sppBlockerContainer');

    const submitBtn =
      document.getElementById('btnSubmitPengajuan');

    const groupKeperluan =
      document.getElementById('groupKeperluan');

    const groupSemester =
      document.getElementById('groupSemester');

    const semesterSelect =
      document.getElementById('semesterSelect');

    // Toggle semester selector.
    // KHS, KRS DAN TRANSKRIP membutuhkan pilihan semester.
    const needsSemester =
      val === 'khs' ||
      val === 'krs' ||
      val === 'transkrip';

    if (groupSemester) {
      groupSemester.style.display =
        needsSemester ? 'flex' : 'none';
    }

    if (groupKeperluan) {
      groupKeperluan.style.display =
        val === 'skma' ? 'flex' : 'none';
    }

    /*
     * Ambil currentSemester langsung dari SIAKAD
     * setiap kali jenis dokumen berubah.
     */
    const studentNim = user?.nim || user?.nomor_induk;
    SiakadApi.getStudentByNim(studentNim)
      .then(student => {
        if (!student) {
          throw new Error('Data mahasiswa tidak ditemukan di SIAKAD.');
        }

        const currentSemester = Number(
          student.currentSemester ??
          student.semesterAktif ??
          1
        );

        /*
         * Update dropdown semester berdasarkan:
         * 1. semester aktif mahasiswa
         * 2. jenis dokumen
         */
        if (semesterSelect && needsSemester) {
          semesterSelect.innerHTML =
            renderSemesterOptions(
              currentSemester,
              val
            );
        }
      })
      .catch(error => {
        console.error(
          'Gagal mengambil data semester mahasiswa:',
          error
        );
      });

    // Tombol ajukan selalu aktif untuk semua jenis dokumen (tanpa syarat SPP)
    if (sppContainer) {
      sppContainer.style.display = 'none';
    }

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.style.opacity = '1';
      submitBtn.title = '';
    }
  }

  function handleKeperluanChange(val) {
    const detailInput = document.getElementById('keperluanDetailInput');
    if (!detailInput) return;

    if (val === 'Pendaftaran Beasiswa') {
      detailInput.placeholder = 'Nama Program Beasiswa (contoh: Beasiswa Unggulan / Bank Indonesia / KIP-K)';
      detailInput.style.display = 'block';
    } else if (val === 'Pengajuan Tunjangan Gaji Orang Tua (PNS / BUMN / Swasta)') {
      detailInput.placeholder = 'Instansi / Perusahaan Orang Tua (Opsional, contoh: Dinas Pendidikan)';
      detailInput.style.display = 'block';
    } else if (val === 'Persyaratan Magang / MBKM / Praktik Kerja Lapangan') {
      detailInput.placeholder = 'Nama Perusahaan / Tempat Magang (Opsional)';
      detailInput.style.display = 'block';
    } else if (val === 'custom') {
      detailInput.placeholder = 'Tuliskan rincian keperluan spesifik surat...';
      detailInput.style.display = 'block';
    } else {
      detailInput.placeholder = 'Keterangan Tambahan / Instansi Terkait (Opsional)...';
      detailInput.style.display = 'block';
    }
  }

  async function handleSubmit(e) {
    if (e) {
      if (typeof e.preventDefault === 'function') e.preventDefault();
      if (typeof e.stopPropagation === 'function') e.stopPropagation();
    }

    const user = AuthManager.getCurrentUser();
    const nim = user?.nim || user?.nomor_induk;

    if (!nim) {
      App.showToast('Gagal memverifikasi identitas mahasiswa. Silakan masuk ulang.', 'error');
      return;
    }

    const docTypeEl = document.getElementById('docTypeSelect');
    const docType = docTypeEl ? docTypeEl.value : 'skma';

    let selectedKeperluan =
      document.getElementById('keperluanSelect')?.value || '';

    const detailText =
      document.getElementById('keperluanDetailInput')?.value.trim() || '';

    let keperluan = selectedKeperluan;
    if (selectedKeperluan === 'custom') {
      keperluan = detailText || 'Keperluan Akademik Mahasiswa';
    } else if (detailText) {
      keperluan = `${selectedKeperluan} - ${detailText}`;
    }

    /*
     * Semester hanya digunakan untuk KHS, KRS dan Transkrip.
     * Untuk SKMA nilainya tetap null.
     */
    const semesterSelect =
      document.getElementById('semesterSelect');

    const semester =
      (
        docType === 'khs' ||
        docType === 'krs' ||
        docType === 'transkrip'
      )
        ? (semesterSelect?.value ? Number(semesterSelect.value) : 1)
        : null;

    const submitBtn = document.getElementById('btnSubmitPengajuan');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="animation: spin 1s linear infinite;"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
        <span>Mengirim Pengajuan...</span>
      `;
    }

    try {
      const created =
        await QueueSlaManager.createRequest({
          nim: nim,
          docType,
          keperluan,
          semester
        });

      App.showToast(
        `Pengajuan ${created.docTitle} berhasil dikirim! Nomor antrean: ${created.queueNo}`,
        'success'
      );

      // Reset input keterangan tambahan jika ada
      const detailInput = document.getElementById('keperluanDetailInput');
      if (detailInput) detailInput.value = '';

      render(
        document.getElementById('viewContainer')
      );
    } catch (err) {
      App.showToast(
        err.message,
        'error'
      );
    } finally {
      const btn = document.getElementById('btnSubmitPengajuan');
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
          Kirim Pengajuan Dokumen
        `;
      }
    }
  }

  async function switchStudentProfile(nim) {
    await AuthManager.loginMahasiswaSso(nim);

    render(
      document.getElementById('viewContainer')
    );

    App.showToast(
      `Berhasil beralih akun mahasiswa SSO: NIM ${nim}`,
      'info'
    );
  }

  async function toggleCurrentSpp(nim) {
    await SiakadApi.toggleSppPayment(nim);

    render(
      document.getElementById('viewContainer')
    );

    App.showToast(
      `Status pembayaran SPP di SIAKAD berhasil diperbarui!`,
      'success'
    );
  }

  async function downloadOfficialDocDirect(reqId) {
    const req = QueueSlaManager.getRequestById(reqId);
    if (!req) {
      App.showToast('Data pengajuan tidak ditemukan.', 'error');
      return;
    }

    // 1. Jika berkas fisik bertanda tangan basah diunggah oleh staf
    if (req.uploadedSignedData) {
      const a = document.createElement('a');
      a.href = req.uploadedSignedData;
      const ext = req.uploadedSignedType === 'application/pdf' ? 'pdf' : (req.uploadedSignedFile ? req.uploadedSignedFile.split('.').pop() : 'pdf');
      a.download = req.uploadedSignedFile || `${req.docTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}_${req.nim}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      App.showToast('Mengunduh berkas PDF resmi bertanda tangan...', 'success');
      return;
    }

    // 2. Langsung unduh berkas PDF resmi standar dengan ruang TTD kosong (tanpa modal preview)
    try {
      App.showToast('Menyiapkan dan mengunduh berkas PDF resmi...', 'info');
      const doc = await AiDocumentEngine.generateDraftDocument({
        id: req.id,
        docType: req.docType,
        nim: req.nim,
        semester: req.semester,
        keperluan: req.keperluan
      });

      const fileName = `${req.docTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}_${req.nim}.pdf`;
      await App.downloadAsPdf(doc.fullHtml, fileName);
    } catch (err) {
      console.error('Gagal mengunduh berkas PDF:', err);
      App.showToast('Terjadi kendala saat mengunduh PDF: ' + (err.message || 'Error'), 'error');
    }
  }

  function showTimelineModal(requestId) {
    let req = null;

    // 1. Cek lewat QueueSlaManager
    if (typeof QueueSlaManager !== 'undefined') {
      if (typeof QueueSlaManager.getRequestById === 'function') {
        req = QueueSlaManager.getRequestById(requestId);
      }
      if (!req && typeof QueueSlaManager.getAllRequests === 'function') {
        const all = QueueSlaManager.getAllRequests();
        req = all.find(r =>
          String(r.id) === String(requestId) ||
          String(r.queueNo) === String(requestId) ||
          String(r.queueNumber) === String(requestId) ||
          String(r.nomor_antrean) === String(requestId)
        );
      }
    }

    // 2. Cek langsung dari localStorage (siladik_requests_queue_v1)
    if (!req) {
      try {
        const raw = localStorage.getItem('siladik_requests_queue_v1');
        if (raw) {
          const list = JSON.parse(raw);
          if (Array.isArray(list)) {
            req = list.find(r =>
              String(r.id) === String(requestId) ||
              String(r.queueNo) === String(requestId) ||
              String(r.queueNumber) === String(requestId) ||
              String(r.nomor_antrean) === String(requestId)
            );
          }
        }
      } catch (e) {
        console.warn('Gagal membaca antrean dari localStorage:', e);
      }
    }

    // 3. Fallback: ambil riwayat pengajuan mahasiswa yang sedang login
    if (!req) {
      try {
        const user = (typeof AuthManager !== 'undefined') ? AuthManager.getCurrentUser() : null;
        if (user && typeof QueueSlaManager !== 'undefined') {
          const studentReqs = QueueSlaManager.getRequestsByNim(user.nim || user.nomor_induk);
          if (studentReqs && studentReqs.length > 0) {
            req = studentReqs.find(r =>
              String(r.id) === String(requestId) ||
              String(r.queueNo) === String(requestId)
            ) || studentReqs[0];
          }
        }
      } catch (e) {}
    }

    if (!req) {
      if (typeof App !== 'undefined' && typeof App.showToast === 'function') {
        App.showToast('Data pengajuan tidak ditemukan.', 'warning');
      } else {
        alert('Data pengajuan tidak ditemukan.');
      }
      return;
    }

    const tglPengajuan = req.createdAt
      ? new Date(req.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
      : 'Tanggal pengajuan tercatat';

    // Status mapping untuk 4 tahapan alur berkas:
    // 1. Pengajuan Berkas Online
    // 2. Review Staf TU (Validasi SIAKAD & Cetak Draf Fisik)
    // 3. Menunggu TTD Basah & Cap Pimpinan (Ruang KASI)
    // 4. Selesai & Dokumen Terbit (Scan Berkas Basah Diunggah)
    let s1 = 'completed', s1Badge = 'done', s1BadgeText = 'Selesai';
    let s2 = 'waiting', s2Badge = 'waiting', s2BadgeText = 'Menunggu';
    let s3 = 'waiting', s3Badge = 'waiting', s3BadgeText = 'Menunggu';
    let s4 = 'waiting', s4Badge = 'waiting', s4BadgeText = 'Menunggu';
    let s4Desc = 'Dokumen ber-TTD basah dan berstempel dinas asli akan dipindai (scan), diunggah ke sistem SILADIK, dan siap diunduh oleh mahasiswa.';

    const statusNorm = String(req.status || '').toLowerCase();

    if (statusNorm === 'selesai') {
      s1 = 'completed'; s1Badge = 'done'; s1BadgeText = 'Selesai';
      s2 = 'completed'; s2Badge = 'done'; s2BadgeText = 'Selesai';
      s3 = 'completed'; s3Badge = 'done'; s3BadgeText = 'Selesai';
      s4 = 'completed'; s4Badge = 'done'; s4BadgeText = 'Dokumen Terbit';
      s4Desc = 'Dokumen ber-TTD basah dan berstempel dinas asli telah selesai dipindai dan diverifikasi. Dokumen resmi siap diunduh dalam format PDF berstandar UPI.';
    } else if (statusNorm === 'menunggu_ttd') {
      s1 = 'completed'; s1Badge = 'done'; s1BadgeText = 'Selesai';
      s2 = 'completed'; s2Badge = 'done'; s2BadgeText = 'Selesai';
      s3 = 'active'; s3Badge = 'running'; s3BadgeText = 'Sedang Berjalan';
      s4 = 'waiting'; s4Badge = 'waiting'; s4BadgeText = 'Menunggu';
    } else if (statusNorm === 'verifikasi_staf') {
      s1 = 'completed'; s1Badge = 'done'; s1BadgeText = 'Selesai';
      s2 = 'active'; s2Badge = 'running'; s2BadgeText = 'Sedang Berjalan';
      s3 = 'waiting'; s3Badge = 'waiting'; s3BadgeText = 'Menunggu';
      s4 = 'waiting'; s4Badge = 'waiting'; s4BadgeText = 'Menunggu';
    } else if (statusNorm === 'ditolak') {
      s1 = 'completed'; s1Badge = 'done'; s1BadgeText = 'Selesai';
      s2 = 'rejected'; s2Badge = 'waiting'; s2BadgeText = 'Ditolak';
      s4Desc = 'Pengajuan berkas ditolak karena ketidaksesuaian data. Silakan ajukan ulang atau hubungi Staf Tata Usaha Akademik.';
    } else {
      // antrean / diajukan
      s1 = 'completed'; s1Badge = 'done'; s1BadgeText = 'Selesai';
      s2 = 'active'; s2Badge = 'running'; s2BadgeText = 'Dalam Antrean';
      s3 = 'waiting'; s3Badge = 'waiting'; s3BadgeText = 'Menunggu';
      s4 = 'waiting'; s4Badge = 'waiting'; s4BadgeText = 'Menunggu';
    }

    const checkSvg = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>`;

    const modalHtml = `
      <div class="timeline-modal-wrapper">
        <div class="timeline-doc-header">
          <div class="timeline-doc-info">
            <h4>${req.docTitle}</h4>
            <div class="timeline-doc-meta">
              <span>No. Antrean: <strong>${req.queueNo || req.queueNumber || req.nomor_antrean || req.id}</strong></span>
              <span>•</span>
              <span>Diajukan: ${tglPengajuan}</span>
              <span>•</span>
              <span>Target SLA: <strong style="color:#059669;">Maks. 3 Hari Kerja</strong></span>
            </div>
          </div>
          <div>
            ${getStatusBadge(req.status)}
          </div>
        </div>

        <div class="timeline-stepper">
          <!-- Tahap 1 -->
          <div class="timeline-step ${s1}">
            <div class="timeline-circle">${s1 === 'completed' ? checkSvg : '1'}</div>
            <div class="timeline-content">
              <div class="timeline-title-row">
                <span class="timeline-step-title">Tahap 1: Pengajuan Berkas Online</span>
                <span class="timeline-step-badge ${s1Badge}">${s1BadgeText}</span>
              </div>
              <div class="timeline-step-desc">Permohonan diajukan secara daring melalui portal SILADIK dan berhasil terintegrasi ke dalam sistem antrean FIFO Tata Usaha.</div>
              <div class="timeline-step-actor">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                ${tglPengajuan} • Sistem SILADIK UPI Kampus Tasikmalaya
              </div>
            </div>
          </div>

          <!-- Tahap 2 -->
          <div class="timeline-step ${s2}">
            <div class="timeline-circle">${s2 === 'completed' ? checkSvg : '2'}</div>
            <div class="timeline-content">
              <div class="timeline-title-row">
                <span class="timeline-step-title">Tahap 2: Review Staf TU & Cetak Draf Fisik</span>
                <span class="timeline-step-badge ${s2Badge}">${s2BadgeText}</span>
              </div>
              <div class="timeline-step-desc">Staf Tata Usaha Akademik memverifikasi keabsahan data SIAKAD, riwayat SPP, dan mencetak lembar draf fisik dokumen tanpa tanda tangan untuk verifikasi manual.</div>
              <div class="timeline-step-actor">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Unit Tata Usaha Akademik Kampus Tasikmalaya
              </div>
            </div>
          </div>

          <!-- Tahap 3 -->
          <div class="timeline-step ${s3}">
            <div class="timeline-circle">${s3 === 'completed' ? checkSvg : '3'}</div>
            <div class="timeline-content">
              <div class="timeline-title-row">
                <span class="timeline-step-title">Tahap 3: Menunggu TTD Basah & Cap Pimpinan</span>
                <span class="timeline-step-badge ${s3Badge}">${s3BadgeText}</span>
              </div>
              <div class="timeline-step-desc">Draf fisik dokumen telah diverifikasi dan diajukan ke meja Kepala Seksi Layanan Akademik (KASI) untuk pembubuhan tanda tangan basah dan cap stempel dinas asli.</div>
              <div class="timeline-step-actor">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Ruang KASI Layanan Akademik & Kemahasiswaan
              </div>
            </div>
          </div>

          <!-- Tahap 4 -->
          <div class="timeline-step ${s4}">
            <div class="timeline-circle">${s4 === 'completed' ? checkSvg : '4'}</div>
            <div class="timeline-content">
              <div class="timeline-title-row">
                <span class="timeline-step-title">Tahap 4: Dokumen Selesai & Terbit</span>
                <span class="timeline-step-badge ${s4Badge}">${s4BadgeText}</span>
              </div>
              <div class="timeline-step-desc">${s4Desc}</div>
              ${statusNorm === 'selesai' ? `
                <div style="margin-top: 0.75rem;">
                  <button class="btn btn-sm btn-success" onclick="MahasiswaView.downloadOfficialDocDirect('${req.id}')" style="display:inline-flex; align-items:center; gap:0.4rem;">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    <span>Unduh Berkas Dokumen PDF Resmi</span>
                  </button>
                </div>
              ` : ''}
              <div class="timeline-step-actor" style="margin-top:0.4rem;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Portal Mahasiswa SILADIK Terpadu
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    if (typeof App !== 'undefined' && typeof App.openCustomModal === 'function') {
      App.openCustomModal('Pelacakan 4 Tahapan Berkas Akademik', modalHtml);
    }
  }

  // Alias untuk kompatibilitas
  const previewOfficialDoc = downloadOfficialDocDirect;

  return {
    render,
    updateRiwayatOnly,
    toggleMobileViewMode,
    handleDocTypeChange,
    handleKeperluanChange,
    handleSubmit,
    switchStudentProfile,
    toggleCurrentSpp,
    downloadOfficialDocDirect,
    previewOfficialDoc,
    showTimelineModal
  };
})();

// Export globally
window.MahasiswaView = MahasiswaView;