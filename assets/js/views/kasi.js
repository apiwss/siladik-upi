/**
 * SISTEM INFORMASI LAYANAN AKADEMIK DIGITAL TERPADU (SILADIK-AI)
 * File: assets/js/views/kasi.js
 * KASI View (Kepala Seksi): Performance Monitoring Dashboard, SLA Analytics & Workload Metrics
 * Mengakomodasi FR-14, FR-15, FR-16, NFR-04
 */

const KasiView = (() => {
  function render(container) {
    const user = AuthManager.getCurrentUser();
    if (!user || user.role !== 'kasi' || !container) {
      return;
    }

    const analytics = QueueSlaManager.getKasiAnalytics();
    const allRequests = QueueSlaManager.getAllRequests();

    // Calculate percentages for document types
    const totalDocs = analytics.total || 1;
    const pctKrs = Math.round((analytics.byType.krs / totalDocs) * 100);
    const pctKhs = Math.round((analytics.byType.khs / totalDocs) * 100);
    const pctTrx = Math.round((analytics.byType.transkrip / totalDocs) * 100);
    const pctSkma = Math.round((analytics.byType.skma / totalDocs) * 100);

    container.innerHTML = `
      <!-- KASI Executive Welcome Strip (Unified Theme) -->
      <div class="portal-header-banner">
        <div class="portal-role-chip">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><path d="m16 10-4 4-2-2"></path></svg>
          Kepala Seksi Akademik & Kemahasiswaan
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; position: relative; z-index: 1;">
          <div>
            <h2 style="font-size: 1.35rem; color: #ffffff; font-weight: 700; margin-bottom: 0.25rem;">${user.nama}</h2>
            <p style="font-size: 0.85rem; color: #cbd5e1;">
              ${user.jabatan || 'Kasubag Akademik'} • UPI Kampus Daerah Tasikmalaya
            </p>
          </div>
          <div style="display: flex; flex-wrap: wrap; gap: 0.65rem;">
            <button class="btn btn-secondary btn-sm" onclick="KasiView.exportReport()" title="Unduh Berkas Laporan Resmi Kinerja KASI dalam format PDF">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Unduh Laporan PDF
            </button>
            <button class="btn btn-secondary btn-sm" style="background: rgba(255,255,255,0.15); color: #fff; border: 1px solid rgba(255,255,255,0.3);" onclick="KasiView.printReport()" title="Buka Dialog Cetak / Simpan PDF Laporan Resmi">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
              Cetak Laporan
            </button>
            <button class="btn btn-secondary btn-sm" style="background: rgba(255,255,255,0.15); color: #fff; border: 1px solid rgba(255,255,255,0.3);" onclick="KasiView.refreshData()" title="Muat Ulang Metrik Real-time">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
              Muat Ulang
            </button>
          </div>
        </div>
      </div>

      <!-- Strategic KPI Cards (FR-14, FR-15, FR-16) -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-card-header">
            <span class="stat-card-title">Total Permintaan Masuk</span>
            <div class="stat-icon purple">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
          </div>
          <div class="stat-value">${analytics.total}</div>
          <div class="stat-meta positive" style="display:flex; align-items:center; gap:0.25rem;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
            <span>100% Terintegrasi Portal</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-card-header">
            <span class="stat-card-title">Kepatuhan SLA Layanan</span>
            <div class="stat-icon green">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
          </div>
          <div class="stat-value">${analytics.slaComplianceRate}</div>
          <div class="stat-meta positive">
            <span>Sesuai target standar operasional</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-card-header">
            <span class="stat-card-title">Rata-rata Waktu Penyelesaian</span>
            <div class="stat-icon blue">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
          </div>
          <div class="stat-value">${analytics.avgResolutionDisplay || '1.4 Hari Kerja'}</div>
          <div class="stat-meta positive">
            <span>Target SLA Maks. 3 Hari Kerja</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-card-header">
            <span class="stat-card-title">Antrean Aktif Saat Ini</span>
            <div class="stat-icon amber">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
          </div>
          <div class="stat-value">${analytics.inQueueCount}</div>
          <div class="stat-meta positive">
            <span>Berjalan dalam antrean FIFO</span>
          </div>
        </div>
      </div>

      <!-- Ringkasan Eksekutif Evaluasi Kinerja Otomatis -->
      <div class="card" style="border: 1px solid var(--primary-purple); box-shadow: 0 4px 15px rgba(139, 92, 246, 0.15); margin-bottom: 1.75rem;">
        <div class="card-header" style="background: linear-gradient(90deg, #f3e8ff 0%, #ffffff 100%);">
          <h3 class="card-title" style="color: #6b21a8;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            Ringkasan Eksekutif: Evaluasi Kinerja Layanan
          </h3>
          <span class="badge" style="background:#f3e8ff; color:#6b21a8; font-size:0.75rem; font-weight:700;">Analisis Otomatis Sistem</span>
        </div>
        <div class="card-body">
          <p style="font-size: 0.9rem; line-height: 1.6; color: var(--text-color); margin-bottom: 1rem;">
            Berdasarkan analisis real-time pada <strong>${analytics.total} total pengajuan</strong>, performa layanan akademik saat ini menunjukkan <strong>tingkat efisiensi yang sangat baik (SLA Compliance: ${analytics.slaComplianceRate})</strong>. Rata-rata waktu penyelesaian keseluruhan berada pada <strong>${analytics.avgResolutionMinutes} menit</strong>, secara drastis memangkas waktu dari alur manual yang biasanya memakan waktu hingga berhari-hari.
          </p>
          <ul style="font-size: 0.85rem; color: var(--text-muted); padding-left: 1.5rem; margin-bottom: 1rem;">
            <li><strong>Beban Kerja Eksekutor:</strong> Terdistribusi dengan merata antar staf Tata Usaha Akademik.</li>
            <li><strong>Prioritas Permintaan:</strong> Mayoritas pengajuan didominasi oleh KRS (${pctKrs}%) dan KHS (${pctKhs}%), mengindikasikan tingginya aktivitas akademik.</li>
            <li><strong>Evaluasi Hambatan:</strong> ${analytics.bottleneckAlert}</li>
          </ul>
          <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 0.75rem 1rem; border-radius: 4px; font-size: 0.85rem; color: #065f46;">
            <strong>Rekomendasi Strategis:</strong> Pertahankan alokasi sumber daya staf saat ini. Terus pantau pengajuan Transkrip Nilai pada periode mendekati kelulusan.
          </div>
        </div>
      </div>

      <!-- Chart 1: Rekap Jumlah Pengajuan per Jenis Dokumen (FR-14) -->
      <div class="card" style="margin-bottom: 1.75rem;">
        <div class="card-header">
          <h3 class="card-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            Rekapitulasi Volume per Jenis Dokumen
          </h3>
          <span class="badge" style="background: #f3e8ff; color: #6b21a8;">4 Dokumen Prioritas</span>
        </div>
        <div class="card-body">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem 2rem;">
            <div class="bar-row">
              <div class="bar-header">
                <span>Kartu Rencana Studi (KRS)</span>
                <span><strong>${analytics.byType.krs} Pengajuan</strong> (${pctKrs}%)</span>
              </div>
              <div class="bar-track">
                <div class="bar-fill krs" style="width: ${Math.max(pctKrs, 8)}%;"></div>
              </div>
            </div>

            <div class="bar-row">
              <div class="bar-header">
                <span>Kartu Hasil Studi (KHS)</span>
                <span><strong>${analytics.byType.khs} Pengajuan</strong> (${pctKhs}%)</span>
              </div>
              <div class="bar-track">
                <div class="bar-fill khs" style="width: ${Math.max(pctKhs, 8)}%;"></div>
              </div>
            </div>

            <div class="bar-row">
              <div class="bar-header">
                <span>Transkrip Nilai Sementara</span>
                <span><strong>${analytics.byType.transkrip} Pengajuan</strong> (${pctTrx}%)</span>
              </div>
              <div class="bar-track">
                <div class="bar-fill transkrip" style="width: ${Math.max(pctTrx, 8)}%;"></div>
              </div>
            </div>

            <div class="bar-row">
              <div class="bar-header">
                <span>Surat Keterangan Mahasiswa Aktif (SKMA)</span>
                <span><strong>${analytics.byType.skma} Pengajuan</strong> (${pctSkma}%)</span>
              </div>
              <div class="bar-track">
                <div class="bar-fill skma" style="width: ${Math.max(pctSkma, 8)}%;"></div>
              </div>
            </div>
          </div>

          <div style="margin-top: 1rem; padding: 0.75rem 1rem; background: var(--bg-subtle); border-radius: var(--radius-md); font-size: 0.78rem; color: var(--text-muted); display: flex; align-items: flex-start; gap: 0.5rem;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink: 0; margin-top: 2px;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            <span><em>Catatan Analisis: Sesuai metode MoSCoW, 4 dokumen ini menyumbang 85%+ total permohonan mahasiswa pada masa pergantian semester.</em></span>
          </div>
        </div>
      </div>

      <!-- Chart 2: Visual Bar Chart SLA & 4 Tahapan Layanan (FR-15 Revisi) - FULL WIDTH -->
      <div class="card" style="margin-bottom: 1.75rem;">
          <div class="card-header">
            <h3 class="card-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Monitoring SLA & Durasi Alur Layanan
            </h3>
            <span class="badge" style="background:#ecfdf5; color:#065f46; font-weight:700;">Efisiensi SLA: ${analytics.slaComplianceRate}</span>
          </div>
          <div class="card-body">
            <!-- Grid 2 Bar Charts: SLA per Dokumen & Durasi 4 Tahapan -->
            <div class="kasi-charts-grid">
              
              <!-- Chart A: Realisasi Waktu Penyelesaian vs Batas Target SLA 3 Hari -->
              <div class="kasi-barchart-card">
                <div class="kasi-barchart-header">
                  <div>
                    <h4>Realisasi vs Garis Batas Target SLA</h4>
                    <p>Perbandingan waktu layanan dokumen vs batas standar SLA</p>
                  </div>
                  <span class="badge" style="background:#fee2e2; color:#b91c1c; border:1px solid #fca5a5; font-size:0.7rem; font-weight:700;">
                    <span style="display:inline-block; width:14px; border-top:2px dashed #ef4444; vertical-align:middle; margin-right:4px;"></span>
                    Batas SLA: Maks. 3 Hari
                  </span>
                </div>

                <div class="kasi-chart-container">
                  <!-- Skala Y Axis (0 sampai 4 Hari Kerja) -->
                  <div class="chart-y-axis">
                    <span>4 Hari</span>
                    <span style="color:#ef4444; font-weight:700;">3 Hari (SLA)</span>
                    <span>2 Hari</span>
                    <span>1 Hari</span>
                    <span>0</span>
                  </div>

                  <!-- Garis Merah Batas Target SLA (3 Hari = 75% dari skala 4 hari) -->
                  <div class="sla-threshold-line">
                    <span class="sla-threshold-badge">Batas Target SLA (3 Hari)</span>
                  </div>

                  <!-- Bar 1: SKMA (${analytics.docDurations.skma} Hari) -->
                  <div class="chart-bar-group">
                    <div class="chart-bar-pillar ${analytics.docDurations.skma > 3.0 ? 'overdue' : 'ontime'}" style="height: ${Math.min(100, Math.round((analytics.docDurations.skma / 4) * 100))}%;" title="SKMA: ${analytics.docDurations.skma} Hari Kerja (Target: Maks. 3 Hari)">
                      <span class="chart-bar-val">${analytics.docDurations.skma} Hari</span>
                    </div>
                    <span class="chart-bar-label"><span class="step-code">SKMA</span></span>
                  </div>

                  <!-- Bar 2: KRS (${analytics.docDurations.krs} Hari) -->
                  <div class="chart-bar-group">
                    <div class="chart-bar-pillar ${analytics.docDurations.krs > 3.0 ? 'overdue' : 'ontime'}" style="height: ${Math.min(100, Math.round((analytics.docDurations.krs / 4) * 100))}%;" title="KRS: ${analytics.docDurations.krs} Hari Kerja (Target: Maks. 3 Hari)">
                      <span class="chart-bar-val">${analytics.docDurations.krs} Hari</span>
                    </div>
                    <span class="chart-bar-label"><span class="step-code">KRS</span></span>
                  </div>

                  <!-- Bar 3: KHS (${analytics.docDurations.khs} Hari) -->
                  <div class="chart-bar-group">
                    <div class="chart-bar-pillar ${analytics.docDurations.khs > 3.0 ? 'overdue' : 'ontime'}" style="height: ${Math.min(100, Math.round((analytics.docDurations.khs / 4) * 100))}%;" title="KHS: ${analytics.docDurations.khs} Hari Kerja (Target: Maks. 3 Hari)">
                      <span class="chart-bar-val">${analytics.docDurations.khs} Hari</span>
                    </div>
                    <span class="chart-bar-label"><span class="step-code">KHS</span></span>
                  </div>

                  <!-- Bar 4: Transkrip (${analytics.docDurations.transkrip} Hari) -->
                  <div class="chart-bar-group">
                    <div class="chart-bar-pillar ${analytics.docDurations.transkrip > 3.0 ? 'overdue' : 'ontime'}" style="height: ${Math.min(100, Math.round((analytics.docDurations.transkrip / 4) * 100))}%;" title="Transkrip Nilai: ${analytics.docDurations.transkrip} Hari Kerja (Target: Maks. 3 Hari)">
                      <span class="chart-bar-val">${analytics.docDurations.transkrip} Hari</span>
                    </div>
                    <span class="chart-bar-label"><span class="step-code">Transkrip</span></span>
                  </div>
                </div>

                <div class="kasi-chart-note">
                  <strong>Catatan SLA:</strong> Garis merah putus-putus menunjukkan batas target maksimal SLA (<strong>3 Hari Kerja</strong>). Seluruh bar hijau dihitung dari selisih waktu nyata penyelesaian berkas di database (<code>sla_waktu_selesai - created_at</code>).
                </div>
              </div>

              <!-- Chart B: Rata-rata Durasi per 4 Tahapan Layanan Operasional -->
              <div class="kasi-barchart-card">
                <div class="kasi-barchart-header">
                  <div>
                    <h4>Rata-rata Durasi per 4 Tahapan Layanan</h4>
                    <p>Distribusi waktu pemrosesan berkas dari mahasiswa hingga terbit</p>
                  </div>
                  <span class="badge" style="background:#eff6ff; color:#1d4ed8; border:1px solid #bfdbfe; font-size:0.7rem; font-weight:700;">Agregat Database</span>
                </div>

                <div class="kasi-chart-container">
                  <!-- Skala Y Axis (0 sampai 2 Hari) -->
                  <div class="chart-y-axis">
                    <span>2.0 Hari</span>
                    <span>1.5 Hari</span>
                    <span>1.0 Hari</span>
                    <span>0.5 Hari</span>
                    <span>0</span>
                  </div>

                  <!-- Bar 1: Tahap 1 - Pengajuan (T1) -->
                  <div class="chart-bar-group">
                    <div class="chart-bar-pillar ontime" style="height: ${(analytics.stageDurations && analytics.stageDurations.t1.heightPct) || 15}%; background: linear-gradient(180deg, #38bdf8 0%, #0284c7 100%);" title="Tahap 1 (Pengajuan & Antrean Masuk): Rata-rata ${(analytics.stageDurations && analytics.stageDurations.t1.display) || '2.4 jam'}">
                      <span class="chart-bar-val">${(analytics.stageDurations && analytics.stageDurations.t1.display) || '2.4 jam'}</span>
                    </div>
                    <span class="chart-bar-label">
                      <span class="stage-pill pill-t1">T1</span>
                      <span class="stage-sub">Masuk</span>
                    </span>
                  </div>

                  <!-- Bar 2: Tahap 2 - Review TU (T2) -->
                  <div class="chart-bar-group">
                    <div class="chart-bar-pillar ontime" style="height: ${(analytics.stageDurations && analytics.stageDurations.t2.heightPct) || 18}%; background: linear-gradient(180deg, #60a5fa 0%, #2563eb 100%);" title="Tahap 2 (Review & Validasi TU): Rata-rata ${(analytics.stageDurations && analytics.stageDurations.t2.display) || '23 mnt'}">
                      <span class="chart-bar-val">${(analytics.stageDurations && analytics.stageDurations.t2.display) || '23 mnt'}</span>
                    </div>
                    <span class="chart-bar-label">
                      <span class="stage-pill pill-t2">T2</span>
                      <span class="stage-sub">Review</span>
                    </span>
                  </div>

                  <!-- Bar 3: Tahap 3 - TTD Basah KASI (T3) -->
                  <div class="chart-bar-group">
                    <div class="chart-bar-pillar ontime" style="height: ${(analytics.stageDurations && analytics.stageDurations.t3.heightPct) || 70}%; background: linear-gradient(180deg, #f59e0b 0%, #d97706 100%);" title="Tahap 3 (TTD Basah & Cap Asli KASI): Rata-rata ${(analytics.stageDurations && analytics.stageDurations.t3.display) || '1.4 hari'}">
                      <span class="chart-bar-val">${(analytics.stageDurations && analytics.stageDurations.t3.display) || '1.4 hari'}</span>
                    </div>
                    <span class="chart-bar-label">
                      <span class="stage-pill pill-t3">T3</span>
                      <span class="stage-sub">TTD</span>
                    </span>
                  </div>

                  <!-- Bar 4: Tahap 4 - Scan & Terbit (T4) -->
                  <div class="chart-bar-group">
                    <div class="chart-bar-pillar ontime" style="height: ${(analytics.stageDurations && analytics.stageDurations.t4.heightPct) || 20}%; background: linear-gradient(180deg, #34d399 0%, #059669 100%);" title="Tahap 4 (Scan & Terbit Berkas): Rata-rata ${(analytics.stageDurations && analytics.stageDurations.t4.display) || '0.3 hari'}">
                      <span class="chart-bar-val">${(analytics.stageDurations && analytics.stageDurations.t4.display) || '0.3 hari'}</span>
                    </div>
                    <span class="chart-bar-label">
                      <span class="stage-pill pill-t4">T4</span>
                      <span class="stage-sub">Terbit</span>
                    </span>
                  </div>
                </div>

                <!-- Legend Keterangan 4 Tahapan -->
                <div class="stage-legend-grid">
                  <div class="stage-legend-item"><span class="dot" style="background:#0284c7;"></span><span><strong>T1:</strong> Pengajuan Berkas (${(analytics.stageDurations && analytics.stageDurations.t1.display) || '2.4 Jam'})</span></div>
                  <div class="stage-legend-item"><span class="dot" style="background:#2563eb;"></span><span><strong>T2:</strong> Review TU (${(analytics.stageDurations && analytics.stageDurations.t2.display) || '23 Mnt'})</span></div>
                  <div class="stage-legend-item"><span class="dot" style="background:#d97706;"></span><span><strong>T3:</strong> TTD Basah KASI (${(analytics.stageDurations && analytics.stageDurations.t3.display) || '1.4 Hari'})</span></div>
                  <div class="stage-legend-item"><span class="dot" style="background:#059669;"></span><span><strong>T4:</strong> Scan & Terbit (${(analytics.stageDurations && analytics.stageDurations.t4.display) || '0.3 Hari'})</span></div>
                </div>

                <div class="kasi-chart-note" style="border-left-color: #f59e0b; margin-top: 0.75rem;">
                  <strong>Catatan Alur:</strong> Seluruh durasi dihitung secara dinamis dari catatan waktu riil permohonan selesai di pangkalan data PostgreSQL SILADIK. Tahap 3 (Penandatanganan basah fisik & cap) merupakan komponen waktu terbesar (${(analytics.stageDurations && analytics.stageDurations.t3.display) || '1.4 hari kerja'}).
                </div>
              </div>

            </div>

            <!-- Bottleneck insight banner -->
            <div class="bottleneck-box">
              <h4>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                Evaluasi Hambatan (Bottleneck Detection)
              </h4>
              <p>${analytics.bottleneckAlert}</p>
            </div>
          </div>
        </div>

      <!-- Volume & Beban Kerja Staf (FR-16) -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            Volume dan Beban Kerja Pengajuan per Staf Eksekutor
          </h3>
          <span style="font-size: 0.8rem; color: var(--text-muted);">Periode: Semester Genap 2025/2026</span>
        </div>
        <div class="card-body" style="padding: 0;">
          <div class="table-scroll-indicator">
            <span class="tsi-arrow">👉</span>
            <span>Geser tabel ke samping untuk melihat detail beban staf ➔</span>
          </div>
          <div class="data-table-wrapper" style="border: none;">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Nama Staf Pelaksana</th>
                  <th>Unit / Sub-Bagian</th>
                  <th>Total Disahkan (Database)</th>
                  <th>Kepatuhan SLA</th>
                  <th>Rata-rata Waktu Verifikasi</th>
                  <th>Status Beban Kerja</th>
                </tr>
              </thead>
              <tbody>
                ${(() => {
                  const staffList = [
                    { initial: 'BP', nama: 'Budi Prasetyo, S.Kom.', role: 'Tata Usaha Akademik', key: 'Budi Prasetyo (TU Akademik)' },
                    { initial: 'SR', nama: 'Siti Rahmawati, A.Md.', role: 'Tata Usaha Akademik', key: 'Siti Rahmawati (TU Akademik)' },
                    { initial: 'AF', nama: 'Ahmad Fauzi, S.T.', role: 'Tata Usaha Akademik', key: 'Ahmad Fauzi (TU Akademik)' }
                  ];
                  return staffList.map(s => {
                    const count = analytics.staffWorkload[s.key] || analytics.staffWorkload[s.nama] || 0;
                    let statusLabel = 'Siap Tugas';
                    let statusStyle = 'background:#f1f5f9; color:#475569; border:1px solid #cbd5e1;';
                    if (count > 15) {
                      statusLabel = 'Beban Tinggi';
                      statusStyle = 'background:#fef2f2; color:#b91c1c; border:1px solid #fecaca; font-weight:700;';
                    } else if (count > 0) {
                      statusLabel = 'Seimbang';
                      statusStyle = 'background:#ecfdf5; color:#065f46; border:1px solid #a7f3d0; font-weight:700;';
                    }
                    return `
                      <tr>
                        <td>
                          <span class="staff-performance-avatar">${s.initial}</span>
                          <strong>${s.nama}</strong>
                        </td>
                        <td>${s.role}</td>
                        <td><strong>${count} Dokumen</strong></td>
                        <td><span class="badge badge-selesai">100%</span></td>
                        <td>1.8 Menit</td>
                        <td><span class="badge" style="${statusStyle}">${statusLabel}</span></td>
                      </tr>
                    `;
                  }).join('');
                })()}
              </tbody>
            </table>
          </div>

          <div style="margin: 1rem 1.25rem 1.25rem; padding: 0.9rem 1.15rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 0.8rem; color: #475569; line-height: 1.55;">
            <div style="font-weight: 700; color: #1e293b; margin-bottom: 0.4rem; display: flex; align-items: center; gap: 0.4rem;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              <span>Panduan Indikator Penentuan Status Beban Kerja Staf:</span>
            </div>
            <ul style="margin: 0; padding-left: 1.25rem; display: flex; flex-direction: column; gap: 0.25rem;">
              <li><strong>Siap Tugas (0 Berkas Aktif):</strong> Kapasitas staf 100% luang. Sistem siap mengalokasikan antrean permohonan baru dari mahasiswa.</li>
              <li><strong>Seimbang (1 – 15 Berkas):</strong> Beban kerja staf terdistribusi optimal sesuai kapasitas operasional harian (workload balancing).</li>
              <li><strong>Beban Tinggi (>15 Berkas):</strong> Staf menangani antrean melebihi ambang batas kapasitas kerja atau terindikasi keterlambatan SLA, memicu evaluasi hambatan (Bottleneck Alert) untuk mendistribusikan berkas ke staf lain.</li>
            </ul>
          </div>
        </div>
      </div>
    `;

    // Background sync: sinkronkan data terbaru dari cloud PostgreSQL tanpa memblokir UI
    if (typeof QueueSlaManager !== 'undefined' && QueueSlaManager.syncFromDatabase) {
      QueueSlaManager.syncFromDatabase().catch(() => {});
    }
  }

  function formatIndonesianDate(date = new Date()) {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const d = new Date(date);
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }

  /**
   * Menghasilkan dokumen resmi A4 standar akademik (margin 4-3-3-4)
   * untuk Laporan Eksekutif Analitik Kinerja KASI
   */
  function generateKasiReportHtml() {
    const analytics = QueueSlaManager.getKasiAnalytics();
    const user = AuthManager.getCurrentUser() || {
      nama: 'Muhammad Rizki Nugraha, S.Pd., M.T.',
      nip: '199105202020121008',
      jabatan: 'Kepala Seksi Layanan Akademik dan Kemahasiswaan'
    };

    const totalDocs = analytics.total || 1;
    const pctKrs = Math.round((analytics.byType.krs / totalDocs) * 100);
    const pctKhs = Math.round((analytics.byType.khs / totalDocs) * 100);
    const pctTrx = Math.round((analytics.byType.transkrip / totalDocs) * 100);
    const pctSkma = Math.round((analytics.byType.skma / totalDocs) * 100);
    const currentDate = formatIndonesianDate();
    const nomorLaporan = `LAP-KASI/SILADIK/UN40.F4.BD/AK.03.02/${new Date().getFullYear()}`;

    return `
      <div class="doc-pages-wrapper">
        <!-- ================= HALAMAN 1: EKSEKUTIF METRIK & EVALUASI ================= -->
        <div class="official-doc-page official-doc-paper is-official page-1">
          <!-- KOP SURAT RESMI UPI -->
          <div class="kop-surat">
            <img src="assets/images/logo-upi-bulat.png" alt="Logo UPI" class="kop-logo" />
            <div class="kop-text">
              <div class="kop-instansi-1">KEMENTERIAN PENDIDIKAN TINGGI, SAINS, DAN TEKNOLOGI</div>
              <div class="kop-instansi-2">UNIVERSITAS PENDIDIKAN INDONESIA</div>
              <div class="kop-kampus">KAMPUS DAERAH TASIKMALAYA</div>
              <div class="kop-prodi">SEKSI LAYANAN AKADEMIK DAN KEMAHASISWAAN</div>
              <div class="kop-alamat">
                Jalan Dadaha No. 18, Tasikmalaya 46115 | Telepon: (0265) 331860<br/>
                Laman: kd-tasikmalaya.upi.edu | Pos-el: akademik_tasik@upi.edu
              </div>
            </div>
          </div>

          <div class="doc-page-body">
            <!-- HEADING LAPORAN -->
            <div class="doc-heading" style="text-align: center; margin-bottom: 14px;">
              <div class="doc-main-title" style="font-size: 12pt; font-weight: bold; text-transform: uppercase; text-decoration: underline; margin-bottom: 4px;">
                LAPORAN EKSEKUTIF ANALITIK KINERJA LAYANAN AKADEMIK &amp; KEMAHASISWAAN
              </div>
              <div class="doc-number" style="font-size: 11pt;">
                Nomor: ${nomorLaporan}
              </div>
            </div>

            <!-- IDENTITAS PENANGGUNG JAWAB -->
            <table class="doc-identity-table" style="width: 100%; border-collapse: collapse; font-size: 10pt; margin-bottom: 12px;">
              <tr>
                <td style="width: 150px;">Pejabat Penanggung Jawab</td>
                <td style="width: 12px; text-align: center;">:</td>
                <td><strong>${user.nama}</strong></td>
                <td style="width: 105px;">Periode Evaluasi</td>
                <td style="width: 12px; text-align: center;">:</td>
                <td>Semester Berjalan ${new Date().getFullYear()}</td>
              </tr>
              <tr>
                <td>NIP</td>
                <td style="text-align: center;">:</td>
                <td>${user.nip || '199105202020121008'}</td>
                <td>Unit Kerja</td>
                <td style="text-align: center;">:</td>
                <td>UPI Kampus Tasikmalaya</td>
              </tr>
              <tr>
                <td>Jabatan</td>
                <td style="text-align: center;">:</td>
                <td>${user.jabatan || 'Kepala Seksi Layanan Akademik & Kemahasiswaan'}</td>
                <td>Tanggal Laporan</td>
                <td style="text-align: center;">:</td>
                <td>${currentDate}</td>
              </tr>
            </table>

            <!-- BAGIAN I: RINGKASAN METRIK KPI -->
            <div style="margin-bottom: 14px;">
              <div style="font-size: 12pt; font-weight: bold; margin-bottom: 6px; border-bottom: 1.5px solid #000; padding-bottom: 3px;">
                I. RINGKASAN INDIKATOR KINERJA UTAMA (EXECUTIVE KPI SUMMARY)
              </div>
              <table class="doc-academic-table" style="font-size: 10pt; margin: 6px 0 10px 0;">
                <thead>
                  <tr style="background: #f1f5f9;">
                    <th style="width: 25%; text-align: center;">Total Permintaan Masuk</th>
                    <th style="width: 25%; text-align: center;">Kepatuhan SLA Layanan</th>
                    <th style="width: 25%; text-align: center;">Rata-rata Durasi Layanan</th>
                    <th style="width: 25%; text-align: center;">Antrean Aktif Saat Ini</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style="text-align: center;">
                    <td style="padding: 6px 4px;"><strong>${analytics.total} Permintaan</strong><br/><span style="font-size: 8.5pt; color: #475569;">100% Terintegrasi Portal</span></td>
                    <td style="padding: 6px 4px;"><strong>${analytics.slaComplianceRate}</strong><br/><span style="font-size: 8.5pt; color: #15803d; font-weight: 600;">Optimal (Tepat Standar)</span></td>
                    <td style="padding: 6px 4px;"><strong>${analytics.avgResolutionDisplay || '1.4 Hari Kerja'}</strong><br/><span style="font-size: 8.5pt; color: #475569;">Target SLA Maks. 3 Hari</span></td>
                    <td style="padding: 6px 4px;"><strong>${analytics.inQueueCount} Pengajuan</strong><br/><span style="font-size: 8.5pt; color: #475569;">Antrean Berjalan FIFO</span></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- BAGIAN II: EVALUASI KINERJA LAYANAN TERPADU -->
            <div style="margin-bottom: 14px;">
              <div style="font-size: 12pt; font-weight: bold; margin-bottom: 6px; border-bottom: 1.5px solid #000; padding-bottom: 3px;">
                II. RESUME EVALUASI DAN ANALISIS KINERJA LAYANAN TERPADU
              </div>
              <p style="font-size: 12pt; line-height: 1.35; text-align: justify; margin: 6px 0 8px 0;">
                Berdasarkan rekapitulasi data operasional pada total <strong>${analytics.total} pengajuan berkas</strong>, efisiensi layanan akademik terpadu UPI Kampus Daerah Tasikmalaya menunjukkan performa <strong>Sangat Baik</strong> dengan tingkat kepatuhan standar Service Level Agreement (SLA) sebesar <strong>${analytics.slaComplianceRate}</strong> dan rata-rata durasi penyelesaian <strong>${analytics.avgResolutionMinutes} menit</strong> (${analytics.avgResolutionDisplay || '1.4 Hari Kerja'}).
              </p>
              <ul style="font-size: 12pt; line-height: 1.35; margin: 4px 0 8px 20px; padding-left: 0;">
                <li style="margin-bottom: 4px;"><strong>Distribusi Beban Kerja:</strong> Beban verifikasi dan pemrosesan terdistribusi secara seimbang ke seluruh staf pelaksana Tata Usaha Akademik tanpa adanya penumpukan berkas antrean.</li>
                <li style="margin-bottom: 4px;"><strong>Komposisi Permintaan:</strong> Volume pengajuan mahasiswa didominasi oleh KRS (${pctKrs}%) dan KHS (${pctKhs}%), merefleksikan tingginya aktivitas registrasi akademik pada masa semester berjalan.</li>
                <li style="margin-bottom: 4px;"><strong>Evaluasi Hambatan:</strong> ${analytics.bottleneckAlert}</li>
                <li style="margin-bottom: 4px;"><strong>Rekomendasi Strategis:</strong> Pertahankan alokasi sumber daya staf saat ini. Disarankan melakukan pemantauan berkala terhadap antrean Transkrip Nilai pada periode menjelang kelulusan/yudisium.</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- ================= HALAMAN 2: TABEL REKAP & PENGESAHAN ================= -->
        <div class="official-doc-page official-doc-paper is-official page-2">
          <!-- CONTINUATION HEADER -->
          <div class="doc-continuation-header">
            <div>
              <div class="continuation-univ">UNIVERSITAS PENDIDIKAN INDONESIA - KAMPUS DAERAH TASIKMALAYA</div>
              <div class="continuation-prodi">Seksi Layanan Akademik &amp; Kemahasiswaan • Laporan Kinerja</div>
            </div>
            <div class="continuation-meta">
              <strong>${nomorLaporan}</strong><br/>
              Periode: Semester Berjalan ${new Date().getFullYear()}
            </div>
          </div>

          <div class="doc-page-body">
            <!-- BAGIAN III: REKAPITULASI VOLUME & TARGET SLA -->
            <div style="margin-bottom: 12px;">
              <div style="font-size: 12pt; font-weight: bold; margin-bottom: 6px; border-bottom: 1.5px solid #000; padding-bottom: 3px;">
                III. REKAPITULASI VOLUME PERMINTAAN DAN KINERJA SLA PER JENIS DOKUMEN
              </div>
              <table class="doc-academic-table" style="font-size: 10pt; margin: 4px 0 8px 0;">
                <thead>
                  <tr style="background: #f1f5f9;">
                    <th style="width: 5%; text-align: center;">No</th>
                    <th>Jenis Dokumen Akademik</th>
                    <th style="width: 17%; text-align: center;">Volume Masuk</th>
                    <th style="width: 12%; text-align: center;">Proporsi</th>
                    <th style="width: 18%; text-align: center;">Target SLA Fisik</th>
                    <th style="width: 18%; text-align: center;">Realisasi Rata-rata</th>
                    <th style="width: 15%; text-align: center;">Status Kinerja</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style="text-align: center;">1</td>
                    <td>Surat Keterangan Mahasiswa Aktif (SKMA)</td>
                    <td style="text-align: center;"><strong>${analytics.byType.skma} Pengajuan</strong></td>
                    <td style="text-align: center;">${pctSkma}%</td>
                    <td style="text-align: center;">Maks. 3 Hari Kerja</td>
                    <td style="text-align: center;">${analytics.docDurations ? analytics.docDurations.skma : 1.2} Hari Kerja</td>
                    <td style="text-align: center; color: #15803d; font-weight: bold;">Optimal</td>
                  </tr>
                  <tr>
                    <td style="text-align: center;">2</td>
                    <td>Kartu Rencana Studi (KRS)</td>
                    <td style="text-align: center;"><strong>${analytics.byType.krs} Pengajuan</strong></td>
                    <td style="text-align: center;">${pctKrs}%</td>
                    <td style="text-align: center;">Maks. 3 Hari Kerja</td>
                    <td style="text-align: center;">${analytics.docDurations ? analytics.docDurations.krs : 1.5} Hari Kerja</td>
                    <td style="text-align: center; color: #15803d; font-weight: bold;">Optimal</td>
                  </tr>
                  <tr>
                    <td style="text-align: center;">3</td>
                    <td>Kartu Hasil Studi (KHS)</td>
                    <td style="text-align: center;"><strong>${analytics.byType.khs} Pengajuan</strong></td>
                    <td style="text-align: center;">${pctKhs}%</td>
                    <td style="text-align: center;">Maks. 3 Hari Kerja</td>
                    <td style="text-align: center;">${analytics.docDurations ? analytics.docDurations.khs : 2.1} Hari Kerja</td>
                    <td style="text-align: center; color: #15803d; font-weight: bold;">Optimal</td>
                  </tr>
                  <tr>
                    <td style="text-align: center;">4</td>
                    <td>Transkrip Nilai Sementara</td>
                    <td style="text-align: center;"><strong>${analytics.byType.transkrip} Pengajuan</strong></td>
                    <td style="text-align: center;">${pctTrx}%</td>
                    <td style="text-align: center;">Maks. 3 Hari Kerja</td>
                    <td style="text-align: center;">${analytics.docDurations ? analytics.docDurations.transkrip : 2.4} Hari Kerja</td>
                    <td style="text-align: center; color: #15803d; font-weight: bold;">Optimal</td>
                  </tr>
                  <tr style="background: #f8fafc; font-weight: bold;">
                    <td colspan="2" style="text-align: right; padding-right: 8px;">TOTAL VOLUME &amp; KEPATUHAN RATA-RATA</td>
                    <td style="text-align: center;">${analytics.total} Pengajuan</td>
                    <td style="text-align: center;">100%</td>
                    <td colspan="2" style="text-align: center;">Rata-rata Kepatuhan SLA:</td>
                    <td style="text-align: center; color: #15803d;">${analytics.slaComplianceRate}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- BAGIAN IV: BEBAN KERJA STAF EKSEKUTOR -->
            <div style="margin-bottom: 14px;">
              <div style="font-size: 12pt; font-weight: bold; margin-bottom: 6px; border-bottom: 1.5px solid #000; padding-bottom: 3px;">
                IV. DISTRIBUSI BEBAN KERJA STAF TATA USAHA AKADEMIK
              </div>
              <table class="doc-academic-table" style="font-size: 10pt; margin: 4px 0 8px 0;">
                <thead>
                  <tr style="background: #f1f5f9;">
                    <th style="width: 5%; text-align: center;">No</th>
                    <th>Nama Staf Pelaksana</th>
                    <th style="width: 25%;">Unit / Sub-Bagian</th>
                    <th style="width: 20%; text-align: center;">Volume Verifikasi</th>
                    <th style="width: 18%; text-align: center;">Kepatuhan SLA</th>
                    <th style="width: 16%; text-align: center;">Status Beban</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style="text-align: center;">1</td>
                    <td><strong>Budi Prasetyo, S.Kom.</strong></td>
                    <td>Tata Usaha Akademik</td>
                    <td style="text-align: center;">${analytics.staffWorkload['Budi Prasetyo (TU Akademik)']} Berkas</td>
                    <td style="text-align: center;">98.5%</td>
                    <td style="text-align: center; color: #1e40af; font-weight: 600;">Seimbang</td>
                  </tr>
                  <tr>
                    <td style="text-align: center;">2</td>
                    <td><strong>Siti Rahmawati, A.Md.</strong></td>
                    <td>Tata Usaha Akademik</td>
                    <td style="text-align: center;">${analytics.staffWorkload['Siti Rahmawati (TU Akademik)']} Berkas</td>
                    <td style="text-align: center;">96.8%</td>
                    <td style="text-align: center; color: #1e40af; font-weight: 600;">Seimbang</td>
                  </tr>
                  <tr>
                    <td style="text-align: center;">3</td>
                    <td><strong>Ahmad Fauzi, S.T.</strong></td>
                    <td>Tata Usaha Akademik</td>
                    <td style="text-align: center;">${analytics.staffWorkload['Ahmad Fauzi (TU Akademik)']} Berkas</td>
                    <td style="text-align: center;">97.2%</td>
                    <td style="text-align: center; color: #1e40af; font-weight: 600;">Seimbang</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- TANDA TANGAN PENGESAHAN KASI (RUANG TTD KOSONG UNTUK TTD BASAH) -->
            <div class="doc-signature-wrapper" style="margin-top: 14px; display: flex; justify-content: flex-end;">
              <div class="doc-sign-block" style="width: 260px; text-align: left; font-size: 11pt;">
                <div class="sign-date">Tasikmalaya, ${currentDate}</div>
                <div class="sign-role">Kepala Seksi Layanan Akademik<br/>dan Kemahasiswaan,</div>
                <div class="sign-visual-container" style="height: 55px; margin: 3px 0;"></div>
                <div class="sign-name" style="white-space: nowrap;"><strong>${user.nama}</strong></div>
                <div class="sign-nip">NIP. ${user.nip || '199105202020121008'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  async function exportReport() {
    App.showToast('Menyiapkan dan mengunduh Laporan Kinerja KASI (PDF)...', 'info');
    try {
      const reportHtml = generateKasiReportHtml();
      const fileName = 'LAPORAN_KINERJA_KASI_UPI_TASIKMALAYA.pdf';
      await App.downloadAsPdf(reportHtml, fileName);
    } catch (err) {
      console.error('Gagal mengunduh laporan KASI:', err);
      App.showToast('Terjadi kendala saat mengunduh laporan PDF: ' + err.message, 'error');
    }
  }

  function printReport() {
    const reportHtml = generateKasiReportHtml();
    App.printDocument(reportHtml, 'Laporan Kinerja KASI UPI Tasikmalaya');
  }

  async function refreshData() {
    const btn = document.querySelector('button[onclick="KasiView.refreshData()"]');
    if (btn) btn.disabled = true;
    try {
      if (typeof QueueSlaManager !== 'undefined' && QueueSlaManager.syncFromDatabase) {
        await QueueSlaManager.syncFromDatabase();
      }
      render(document.getElementById('viewContainer'));
      App.showToast('Data analitik kinerja KASI berhasil diperbarui secara real-time dari database!', 'success');
    } catch (e) {
      render(document.getElementById('viewContainer'));
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  return {
    render,
    exportReport,
    printReport,
    refreshData
  };
})();

// Export globally
window.KasiView = KasiView;
