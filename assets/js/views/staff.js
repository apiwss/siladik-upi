/**
 * SISTEM INFORMASI LAYANAN AKADEMIK DIGITAL TERPADU (SILADIK-AI)
 * File: assets/js/views/staff.js
 * Staff View (Eksekutor): FIFO Work Queue, AI Document Draft Review, One-Click Execution
 * Mengakomodasi FR-09, FR-12, FR-18, FR-19, FR-20, BR-05, BR-06, BR-09
 */

const StaffView = (() => {
  let activeFilter = 'all';

  async function render(container) {
    const user = AuthManager.getCurrentUser();
    if (user.role !== 'staff') {
      container.innerHTML = `<div class="card p-4"><p class="text-danger">Akses Ditolak: Halaman ini hanya untuk Staf Layanan Akademik.</p></div>`;
      return;
    }

    const allRequests = QueueSlaManager.getAllRequests();
    const pendingQueue = allRequests.filter(r => r.status === 'antrean' || r.status === 'verifikasi_staf');
    const completedToday = allRequests.filter(r => r.status === 'selesai');

    let filteredList = allRequests;
    if (activeFilter === 'pending') {
      filteredList = allRequests.filter(r => r.status === 'antrean');
    } else if (activeFilter === 'review') {
      filteredList = allRequests.filter(r => r.status === 'verifikasi_staf');
    } else if (activeFilter === 'completed') {
      filteredList = allRequests.filter(r => r.status === 'selesai');
    }

    container.innerHTML = `
      <!-- Staff Executive Header Banner (Unified Theme) -->
      <div class="portal-header-banner">
        <div class="portal-role-chip">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          Staf Tata Usaha Layanan Akademik
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; position: relative; z-index: 1;">
          <div>
            <h2 style="font-size: 1.35rem; color: #ffffff; font-weight: 700; margin-bottom: 0.25rem;">${user.nama}</h2>
            <p style="font-size: 0.85rem; color: #cbd5e1;">
              Unit Layanan Verifikasi Berkas Fisik & Cetak Surat • S1 Bisnis Digital UPI Tasikmalaya
            </p>
          </div>
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div style="background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.18); padding: 0.5rem 0.9rem; border-radius: var(--radius-md); font-size: 0.8rem; color: #f8fafc; display: flex; align-items: center; gap: 0.5rem;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span>Standar SLA: <strong>Maks. 3 Hari Kerja</strong></span>
            </div>
          </div>
        </div>
      </div>

      <!-- Staff KPI Strip -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-card-header">
            <span class="stat-card-title">Antrean Masuk (FIFO)</span>
            <div class="stat-icon blue">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
          </div>
          <div class="stat-value">${pendingQueue.length}</div>
          <div class="stat-meta positive">Urutan pemrosesan otomatis berbasis FIFO</div>
        </div>

        <div class="stat-card">
          <div class="stat-card-header">
            <span class="stat-card-title">Draf Siap Review</span>
            <div class="stat-icon purple">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
            </div>
          </div>
          <div class="stat-value">${allRequests.filter(r => r.status === 'verifikasi_staf').length}</div>
          <div class="stat-meta positive">Penyusunan auto-fill otomatis SIAKAD</div>
        </div>

        <div class="stat-card">
          <div class="stat-card-header">
            <span class="stat-card-title">Disahkan & Diterbitkan</span>
            <div class="stat-icon green">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
          </div>
          <div class="stat-value">${completedToday.length}</div>
          <div class="stat-meta positive">Telah memuat TTD & Cap Digital</div>
        </div>

        <div class="stat-card">
          <div class="stat-card-header">
            <span class="stat-card-title">Rata-rata Waktu Verifikasi</span>
            <div class="stat-icon amber">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
          </div>
          <div class="stat-value">1.8 Menit</div>
          <div class="stat-meta positive">Memangkas proses manual Word (3 hari)</div>
        </div>
      </div>

      <!-- Main Staff Queue Table -->
      <div class="card">
        <div class="card-header">
          <div>
            <h3 class="card-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
              Daftar Antrean Kerja Staf Layanan Akademik (FIFO Queue)
            </h3>
          </div>

          <!-- Queue Filter Tabs -->
          <div style="display: flex; gap: 0.4rem;">
            <button class="btn btn-sm ${activeFilter === 'all' ? 'btn-teal' : 'btn-secondary'}" onclick="StaffView.setFilter('all')">Semua (${allRequests.length})</button>
            <button class="btn btn-sm ${activeFilter === 'pending' ? 'btn-teal' : 'btn-secondary'}" onclick="StaffView.setFilter('pending')">Antrean FIFO (${allRequests.filter(r => r.status === 'antrean').length})</button>
            <button class="btn btn-sm ${activeFilter === 'review' ? 'btn-teal' : 'btn-secondary'}" onclick="StaffView.setFilter('review')">Review Draf Dokumen (${allRequests.filter(r => r.status === 'verifikasi_staf').length})</button>
            <button class="btn btn-sm ${activeFilter === 'completed' ? 'btn-teal' : 'btn-secondary'}" onclick="StaffView.setFilter('completed')">Selesai (${completedToday.length})</button>
          </div>
        </div>

        <div class="card-body" style="padding: 0;">
          <div class="data-table-wrapper" style="border: none;">
            <table class="data-table">
              <thead>
                <tr>
                  <th style="width: 140px; min-width: 130px; white-space: nowrap;">No Antrean</th>
                  <th width="24%">Identitas Mahasiswa</th>
                  <th width="20%">Jenis Dokumen</th>
                  <th width="14%">Semester</th>
                  <th width="15%">SLA (3 Hari Kerja)</th>
                  <th width="15%">Aksi Eksekutor</th>
                </tr>
              </thead>
              <tbody>
                ${filteredList.length === 0 ? `
                  <tr><td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-muted);">Tidak ada antrean dalam kategori ini.</td></tr>
                ` : filteredList.map(r => {
      const sla = QueueSlaManager.getSlaCountdown(r.slaDeadline, r.status);
      return `
                    <tr>
                      <td style="white-space: nowrap;">
                        <span class="badge-queue-no">${r.queueNo}</span>
                        <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 3px;">
                          ${new Date(r.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                        </div>
                      </td>
                      <td>
                        <strong>${r.nama}</strong>
                        <div style="font-size: 0.78rem; color: var(--text-muted);">NIM: ${r.nim} • ${r.prodi}</div>
                      </td>
                      <td>
                        <strong>${r.docTitle}</strong>
                        <div style="font-size: 0.75rem; color: var(--text-muted);">${r.keperluan || '-'}</div>
                      </td>
                      <td>
                        <span class="badge badge-diajukan">
                          ${r.semester ? `Semester ${r.semester}` : 'Reguler'}
                        </span>
                      </td>
                      <td>
                        <span class="sla-timer ${sla.state}">
                          ⏱ ${sla.text}
                        </span>
                      </td>
                      <td>
                        <button class="btn btn-sm btn-teal" onclick="StaffView.openProcessModal('${r.id}')">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                          ${r.status === 'selesai' ? 'Lihat Dokumen' : 'Proses Dokumen'}
                        </button>
                      </td>
                    </tr>
                  `;
    }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  function setFilter(filter) {
    activeFilter = filter;
    render(document.getElementById('viewContainer'));
  }

  /**
   * Open Staf Review & One-Click Execution Modal
   */
  async function openProcessModal(reqId) {
    const req = QueueSlaManager.getRequestById(reqId);
    if (!req) return;

    const student = await SiakadApi.getStudentByNim(req.nim);
    const modalTitle = `Verifikasi & Eksekusi: ${req.queueNo} - ${req.docTitle}`;

    const modalContent = `
      <div style="display: grid; grid-template-columns: 340px 1fr; gap: 1.5rem; align-items: start;">
        <!-- Left Panel: Alur Tanda Tangan Fisik & Kontrol -->
        <div>
          <!-- Info Mahasiswa -->
          <div style="background: var(--bg-subtle); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); margin-bottom: 1.15rem;">
            <div style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: var(--text-muted); margin-bottom: 0.4rem;">
              Data Akademik Mahasiswa
            </div>
            <div style="font-size: 0.85rem; line-height: 1.45;">
              <div><strong>${student.nama}</strong></div>
              <div>NIM: ${student.nim}</div>
              <div>Prodi: ${student.prodi}</div>
              <div>Semester Berjalan: Semester ${student.semesterAktif}</div>
              <div style="margin-top: 0.35rem; color: #059669; font-weight: 600; display: flex; align-items: center; gap: 0.35rem;">
                <span class="live-status-dot"></span> Status Akademik: Aktif Terdaftar
              </div>
            </div>
          </div>

          <!-- TAHAP 1: Cetak Draf Fisik -->
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: var(--radius-md); padding: 0.9rem; margin-bottom: 1rem;">
            <div style="font-size: 0.775rem; font-weight: 800; color: #1e293b; margin-bottom: 0.35rem; display: flex; align-items: center; gap: 0.45rem;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
              <span>TAHAP 1: Cetak Draf Kosongan Fisik</span>
            </div>
            <p style="font-size: 0.725rem; color: #64748b; line-height: 1.4; margin-bottom: 0.6rem;">
              Cetak draf dokumen untuk dimintakan paraf pejabat dan tanda tangan basah pimpinan (KASI) serta cap stempel basah universitas.
            </p>
            <div style="display:flex; flex-wrap:wrap; gap:0.4rem;">
              <button class="btn btn-secondary btn-sm" style="flex:1; min-width:100px; display:inline-flex; align-items:center; justify-content:center; gap:0.35rem;" onclick="StaffView.printModalDoc()" title="Buka dialog cetak dokumen / Simpan sebagai PDF">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                <span>Cetak Dokumen</span>
              </button>
              <button class="btn btn-primary btn-sm" style="flex:1; min-width:110px; display:inline-flex; align-items:center; justify-content:center; gap:0.35rem;" onclick="StaffView.downloadPdf('${req.id}')" title="Unduh berkas dokumen PDF">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                <span>Unduh PDF</span>
              </button>
              <button id="btnTriggerAi" class="btn btn-sm btn-outline" style="display:inline-flex; align-items:center; gap:0.3rem;" onclick="StaffView.generateAiDraftInModal('${req.id}')" title="Perbarui Isi Draf">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                <span>Refresh</span>
              </button>
            </div>
          </div>

          <!-- TAHAP 2: Unggah Hasil Scan Dokumen Sah -->
          <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: var(--radius-md); padding: 0.9rem; margin-bottom: 1rem;">
            <div style="font-size: 0.775rem; font-weight: 800; color: #1e40af; margin-bottom: 0.35rem; display: flex; align-items: center; gap: 0.45rem;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
              <span>TAHAP 2: Unggah Dokumen Sah (TTD Basah)</span>
            </div>
            <p style="font-size: 0.725rem; color: #475569; line-height: 1.4; margin-bottom: 0.6rem;">
              Unggah file hasil scan berkas fisik yang telah ditandatangani basah dan dicap stempel.
            </p>
            <input
              type="file"
              id="signedDocFileInput"
              class="form-control form-control-sm"
              accept="image/*,application/pdf"
              onchange="StaffView.handleScanUpload(event, '${req.id}')" />

            <div id="uploadStatusBadge" style="margin-top: 0.5rem; font-size: 0.725rem; color: ${req.uploadedSignedFile ? '#059669' : '#d97706'}; font-weight: 600; display:flex; align-items:center; gap:0.35rem;">
              ${req.uploadedSignedFile ? `
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>Berkas Fisik Terunggah: <strong>${req.uploadedSignedFile}</strong></span>
              ` : `
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                <span>Belum ada scan dokumen basah yang dipilih (Opsional).</span>
              `}
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="staffNotesInput">Catatan Staf / Nomor Arsip TU</label>
            <textarea id="staffNotesInput" class="form-control" rows="2" placeholder="Catatan verifikasi atau nomor arsip fisik...">${req.processedBy || ''}</textarea>
          </div>

          <!-- Actions -->
          <div style="display: flex; flex-direction: column; gap: 0.6rem; margin-top: 1rem;">
            <button class="btn btn-success btn-block btn-lg" style="display:flex; align-items:center; justify-content:center; gap:0.5rem;" onclick="StaffView.executeApproval('${req.id}')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>Sahkan & Terbitkan ke Mahasiswa</span>
            </button>
            <button class="btn btn-danger btn-block btn-sm" style="display:flex; align-items:center; justify-content:center; gap:0.4rem;" onclick="StaffView.executeRejection('${req.id}')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
              <span>Tolak / Kembalikan Pengajuan</span>
            </button>
          </div>
        </div>

        <!-- Right Panel: Live Document Preview -->
        <div style="background: #e2e8f0; padding: 1.5rem; border-radius: var(--radius-lg); max-height: 75vh; overflow-y: auto;">
          <div id="modalDocPreviewContainer">
            <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
              <div class="ai-spinner" style="display: none;" id="modalAiSpinner"></div>
              <p id="modalDocPlaceholderText">Memuat draf dokumen...</p>
            </div>
          </div>
        </div>
      </div>
    `;

    App.openCustomModal(modalTitle, modalContent);

    // Auto-generate or render document preview
    if (!req.generatedDoc) {
      generateAiDraftInModal(req.id);
    } else {
      const container = document.getElementById('modalDocPreviewContainer');
      if (container) container.innerHTML = req.generatedDoc.fullHtml;
    }
  }

  async function generateAiDraftInModal(reqId) {
    const previewContainer = document.getElementById('modalDocPreviewContainer');
    if (!previewContainer) return;

    previewContainer.innerHTML = `
      <div style="text-align: center; padding: 4rem 1rem;">
        <div class="ai-spinner"></div>
        <h4 style="color: #7c3aed; font-size: 1.1rem; margin-bottom: 0.35rem;">Sistem Sedang Memetakan Data SIAKAD...</h4>
        <p style="font-size: 0.85rem; color: var(--text-muted);">
          Menyusun draf resmi kosongan dari SIAKAD, siap diunduh dan dicetak untuk tanda tangan basah pimpinan.
        </p>
      </div>
    `;

    // Simulate synthesis with short natural latency
    setTimeout(async () => {
      try {
        const updatedReq = await QueueSlaManager.triggerAiGeneration(reqId);
        if (updatedReq && updatedReq.generatedDoc && updatedReq.generatedDoc.fullHtml) {
          previewContainer.innerHTML = updatedReq.generatedDoc.fullHtml;
          App.showToast('Draf dokumen berhasil disusun otomatis!', 'info');
        } else {
          throw new Error('Draf dokumen gagal disusun.');
        }
      } catch (err) {
        console.error('Error saat generate draf AI:', err);
        previewContainer.innerHTML = `
          <div style="text-align: center; padding: 3rem 1rem; color: #b91c1c;">
            <p style="font-weight: 600; margin-bottom: 0.5rem;">Gagal membuat draf dokumen secara otomatis.</p>
            <p style="font-size: 0.85rem; color: #4b5563; margin-bottom: 1rem;">${err.message || 'Data kurikulum atau nilai semester belum tersedia.'}</p>
            <button class="btn btn-secondary btn-sm" onclick="StaffView.generateAiDraftInModal('${reqId}')">Coba Lagi</button>
          </div>
        `;
        App.showToast(`Gagal generate draf: ${err.message}`, 'error');
      }
    }, 750);
  }

  async function executeApproval(reqId) {
    const user = AuthManager.getCurrentUser() || { nama: 'Staf TU Akademik' };
    const staffName = `${user.nama} (Staf TU Akademik)`;

    // Cegah klik ganda selama proses berjalan
    const btn = document.querySelector(`button[onclick="StaffView.executeApproval('${reqId}')"]`);
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span>Memproses...</span>';
    }

    try {
      await QueueSlaManager.approveRequest(reqId, staffName);
      App.closeModal();
      App.showToast('Dokumen berhasil disahkan dan diterbitkan kepada mahasiswa!', 'success');
      // Sinkronkan ulang dari server atau lokal
      await QueueSlaManager.resetQueue();
      render(document.getElementById('viewContainer'));
    } catch (err) {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
          <span>Sahkan & Terbitkan ke Mahasiswa</span>
        `;
      }
      App.showToast(
        `Gagal menyimpan persetujuan: ${err.message || 'Terjadi kesalahan pada server.'}`,
        'error'
      );
    }
  }

  async function executeRejection(reqId) {
    const reason = prompt('Masukkan alasan penolakan/pengembalian dokumen:', 'Persyaratan belum lengkap atau SKS belum memenuhi ketentuan.');
    if (!reason) return;

    const btn = document.querySelector(`button[onclick="StaffView.executeRejection('${reqId}')"]`);
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span>Memproses...</span>';
    }

    try {
      await QueueSlaManager.rejectRequest(reqId, reason);
      App.closeModal();
      App.showToast('Pengajuan telah ditolak dengan catatan.', 'warning');
      await QueueSlaManager.resetQueue();
      render(document.getElementById('viewContainer'));
    } catch (err) {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
          <span>Tolak / Kembalikan Pengajuan</span>
        `;
      }
      App.showToast(
        `Gagal menyimpan penolakan: ${err.message || 'Terjadi kesalahan pada server.'}`,
        'error'
      );
    }
  }

  function printModalDoc() {
    const previewContainer = document.getElementById('modalDocPreviewContainer');
    if (!previewContainer || !previewContainer.innerHTML.trim()) {
      App.showToast('Tidak ada dokumen untuk dicetak. Silakan generate draf terlebih dahulu.', 'warning');
      return;
    }
    App.printDocument(previewContainer.innerHTML, 'Dokumen Draf Fisik UPI Tasikmalaya');
  }

  async function downloadDraftDoc(reqId) {
    const req = QueueSlaManager.getRequestById(reqId);
    const docCode = req ? req.id : 'UPI';

    // 1. Jika staf sudah mengunggah berkas scan bertanda tangan basah
    if (req && req.uploadedSignedData) {
      const a = document.createElement('a');
      a.href = req.uploadedSignedData;
      const ext = req.uploadedSignedType === 'application/pdf' ? 'pdf' : (req.uploadedSignedFile ? req.uploadedSignedFile.split('.').pop() : 'pdf');
      a.download = req.uploadedSignedFile || `DOKUMEN_TTD_BASAH_${docCode}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      App.showToast('Mengunduh berkas fisik bertanda tangan basah...', 'success');
      return;
    }

    // 2. Jika belum ada scan fisik, unduh dokumen resmi dengan ruang TTD kosong siap cetak
    const previewContainer = document.getElementById('modalDocPreviewContainer');
    const fileName = `DOKUMEN_AKADEMIK_${docCode}.pdf`;

    const btn = event?.currentTarget || document.querySelector('button[onclick*="downloadPdf"], button[onclick*="downloadDraftDoc"]');
    const originalText = btn ? btn.innerHTML : '';
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `
        <div style="display:inline-block; width:12px; height:12px; border:2px solid #fff; border-top-color:transparent; border-radius:50%; animation:spin 0.6s linear infinite; margin-right:4px;"></div>
        <span>Membuat PDF...</span>
      `;
    }

    try {
      const doc = await AiDocumentEngine.generateDraftDocument({
        id: req.id,
        docType: req.docType,
        nim: req.nim,
        semester: req.semester,
        keperluan: req.keperluan
      });
      await App.downloadAsPdf(doc.fullHtml, fileName);
    } catch (e) {
      console.error('Error downloading PDF:', e);
      if (previewContainer && previewContainer.innerHTML.trim()) {
        App.printDocument(previewContainer.innerHTML, `Dokumen UPI - ${docCode}`);
      }
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = originalText;
      }
    }
  }

  function handleScanUpload(event, reqId) {
    const file = event.target.files?.[0];
    const statusBadge = document.getElementById('uploadStatusBadge');
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      const dataUrl = e.target.result;
      const req = QueueSlaManager.getRequestById(reqId);
      if (req) {
        req.uploadedSignedFile = file.name;
        req.uploadedSignedData = dataUrl;
        req.uploadedSignedType = file.type;
        QueueSlaManager.updateRequest(reqId, {
          uploadedSignedFile: file.name,
          uploadedSignedData: dataUrl,
          uploadedSignedType: file.type
        });
      }

      if (statusBadge) {
        statusBadge.style.color = '#059669';
        statusBadge.innerHTML = `
          <div style="display:flex; flex-direction:column; gap:0.35rem; width:100%;">
            <div style="display:flex; align-items:center; gap:0.35rem;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>Berkas TTD Basah Terunggah: <strong>${file.name}</strong></span>
            </div>
            ${file.type && file.type.startsWith('image/') ? `
              <div style="margin-top:0.25rem; border:1px solid #cbd5e1; border-radius:4px; overflow:hidden; max-height:100px; display:inline-block;">
                <img src="${dataUrl}" alt="Preview Scan" style="height:90px; width:auto; object-fit:contain; display:block;" />
              </div>
            ` : `
              <span style="font-size:0.7rem; color:#0284c7;">Dokumen PDF scan siap diterbitkan ke mahasiswa.</span>
            `}
          </div>
        `;
      }

      App.showToast(`Berkas fisik scan "${file.name}" berhasil dilampirkan!`, 'success');
    };
    reader.readAsDataURL(file);
  }

  return {
    render,
    setFilter,
    openProcessModal,
    generateAiDraftInModal,
    executeApproval,
    executeRejection,
    printModalDoc,
    downloadPdf: downloadDraftDoc,
    downloadDraftDoc,
    handleScanUpload
  };
})();

// Export globally
window.StaffView = StaffView;
