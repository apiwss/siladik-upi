/**
 * SISTEM INFORMASI LAYANAN AKADEMIK DIGITAL TERPADU (SILADIK-AI)
 * File: assets/js/app.js
 * Main Application Orchestrator, Router & Strict RBAC Isolation
 */

const App = (() => {
  function init() {
    renderCurrentState();

    // Listen to authentication changes
    window.addEventListener('auth:changed', () => {
      renderCurrentState();
    });

    // Setup global modal close listeners
    const overlay = document.getElementById('globalModalOverlay');
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal();
      });
    }

    // Keyboard ESC to close modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });
  }

  /**
   * Main Router:
   * If not logged in -> renders Login Page.
   * If logged in -> strictly renders only the authorized view for the active actor.
   */
  function renderCurrentState() {
    const user = AuthManager.getCurrentUser();
    const container = document.getElementById('viewContainer');
    const headerProfile = document.getElementById('headerProfileArea');
    const ssoStatus = document.getElementById('headerSsoStatus');
    const infoStrip = document.getElementById('globalInfoStrip');

    if (!container) return;

    container.classList.remove('fade-in');
    requestAnimationFrame(() => {
      container.classList.add('fade-in');
    });

    if (!user) {
      document.body.classList.add('portal-landing-mode');
      // 1. Unauthenticated State -> Clean transparent navbar without extra top buttons
      if (headerProfile) {
        headerProfile.innerHTML = '';
      }
      if (infoStrip) infoStrip.style.display = 'none';
      LoginView.render(container);
    } else {
      document.body.classList.remove('portal-landing-mode');
      // 2. Authenticated State -> Render Actor Workspace with Strict Isolation
      if (infoStrip) infoStrip.style.display = 'flex';

      // Update Header with Actor Profile & Logout Button (NO cross-role switcher)
      if (headerProfile) {
        let roleBadgeColor = 'var(--color-mahasiswa)';
        let roleTitle = 'Mahasiswa';
        if (user.role === 'staff') {
          roleBadgeColor = 'var(--color-staff)';
          roleTitle = 'Staf Akademik';
        } else if (user.role === 'kasi') {
          roleBadgeColor = 'var(--color-kasi)';
          roleTitle = 'Kasubag / KASI';
        } else if (user.role === 'admin') {
          roleBadgeColor = 'var(--color-admin, #dc2626)';
          roleTitle = 'Admin Sistem';
        }

        headerProfile.innerHTML = `
          <div style="display: flex; align-items: center; gap: 0.85rem;">
            <div class="user-profile-badge">
              <div class="avatar-circle ${user.role}">
                ${user.avatarLabel || 'U'}
              </div>
              <div class="user-info-text">
                <div class="user-name">${user.nama}</div>
                <div class="user-role-label">
                  <span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:${roleBadgeColor}; margin-right:4px;"></span>
                  <strong>${roleTitle}</strong> ${user.nim ? `(${user.nim})` : (user.nip ? `(${user.nip})` : '')}
                </div>
              </div>
            </div>

            <button class="logout-nav-btn" onclick="App.logout()" title="Keluar dari sesi akun saat ini">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Keluar
            </button>
          </div>
        `;
      }

      // Reset scroll position so dashboard header is always visible
      window.scrollTo(0, 0);

      // Render strictly the role view
      if (user.role === 'mahasiswa') {
        MahasiswaView.render(container);
      } else if (user.role === 'staff') {
        StaffView.render(container);
      } else if (user.role === 'kasi') {
        KasiView.render(container);
      } else if (user.role === 'admin') {
        if (typeof AdminView !== 'undefined' && AdminView.render) {
          AdminView.render(container);
        } else {
          container.innerHTML = '<div class="card p-4"><h3>Memuat Panel Administrator...</h3></div>';
        }
      }
    }
  }

  function logout() {
    AuthManager.logout();
    showToast('Anda telah berhasil keluar dari sistem.', 'info');
  }

  /**
   * Modal Management
   */
  function openCustomModal(title, contentHtml) {
    const overlay = document.getElementById('globalModalOverlay');
    const titleEl = document.getElementById('globalModalTitle');
    const bodyEl = document.getElementById('globalModalBody');

    if (titleEl) titleEl.textContent = title;
    if (bodyEl) bodyEl.innerHTML = contentHtml;
    if (overlay) {
      overlay.classList.add('active');
      document.body.classList.add('modal-open');
    }
  }

  /**
   * Stores the latest document HTML for printing (used by printDocument)
   */
  let _currentDocHtml = '';
  let _currentDocTitle = '';

  function openDocumentPreviewModal(documentHtml, title = 'Pratinjau Dokumen Resmi') {
    const overlay = document.getElementById('globalModalOverlay');
    const titleEl = document.getElementById('globalModalTitle');
    const bodyEl = document.getElementById('globalModalBody');

    // Store for printing
    _currentDocHtml = documentHtml;
    _currentDocTitle = title;

    if (titleEl) {
      const safeFileName = title.replace(/[^a-zA-Z0-9_-]/g, '_');
      titleEl.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; padding-right: 1.5rem; flex-wrap: wrap; gap: 0.5rem;">
          <span style="font-weight: 700;">${title}</span>
          <div style="display: flex; gap: 0.4rem; align-items: center;">
            <button class="btn btn-sm btn-primary no-print" onclick="App.downloadAsPdf(App.getCurrentDocHtml(), '${safeFileName}.pdf')" title="Unduh langsung sebagai berkas PDF resmi">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              <span>Unduh PDF</span>
            </button>
            <button class="btn btn-sm btn-secondary no-print" onclick="App.printDocument()" title="Buka dialog Cetak / Simpan sebagai PDF">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
              <span>Cetak Dokumen</span>
            </button>
          </div>
        </div>
      `;
    }

    if (bodyEl) {
      bodyEl.innerHTML = `
        <div style="background: #cbd5e1; padding: 1.5rem; border-radius: var(--radius-md); overflow-y: auto; max-height: 80vh;">
          ${documentHtml}
        </div>
      `;
    }

    if (overlay) {
      overlay.classList.add('active');
      document.body.classList.add('modal-open');
    }
  }

  /**
   * Opens a clean popup window containing ONLY the document content and prints it.
   * This completely isolates the print from the web app UI.
   */
  function printDocument(customHtml, customTitle) {
    const html = customHtml || _currentDocHtml;
    const title = customTitle || _currentDocTitle || 'Dokumen Resmi UPI';

    if (!html) {
      showToast('Tidak ada dokumen untuk dicetak.', 'warning');
      return;
    }

    // Fetch the document CSS content inline
    const docCssUrl = 'assets/css/document-preview.css';

    // Build the full print HTML page
    const printHtml = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Times+New+Roman&display=swap');

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      background: #f0f0f0;
      font-family: 'Times New Roman', Times, serif;
      padding: 20px;
    }

    @page {
      size: A4 portrait;
      margin: 0 !important;
    }

    .doc-pages-wrapper {
      display: flex;
      flex-direction: column;
      gap: 24px;
      align-items: center;
      width: 100%;
    }

    .official-doc-paper,
    .official-doc-page {
      background: #ffffff;
      color: #000000;
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      /* Standar Akademik Indonesia 4-3-3-4: Kiri 4cm (40mm), Atas 3cm (30mm), Kanan 3cm (30mm), Bawah 3cm (30mm) */
      padding: 30mm 30mm 30mm 40mm;
      box-shadow: none !important;
      border: none !important;
      outline: none !important;
      border-radius: 0 !important;
      font-family: 'Times New Roman', Times, serif;
      line-height: 1.35;
      position: relative;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .doc-page-body {
      flex: 1;
      width: 100%;
    }

    .official-doc-paper.is-draft,
    .official-doc-page.is-draft {
      background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'><text x='50%' y='50%' fill='rgba(220,38,38,0.06)' font-size='30' font-family='Arial, sans-serif' font-weight='bold' text-anchor='middle' transform='rotate(-30 400 300)' letter-spacing='3'>DRAF KOSONGAN - MENUNGGU TTD BASAH &amp; CAP ASLI</text></svg>");
      background-repeat: no-repeat;
      background-position: center center;
      background-size: 85%;
    }

    .official-doc-paper.is-official,
    .official-doc-page.is-official {
      background-image: none !important;
    }

    .official-doc-paper.is-draft::before,
    .official-doc-page.is-draft::before,
    .official-doc-paper.is-official::before,
    .official-doc-page.is-official::before {
      display: none !important;
      content: none !important;
    }

    .kop-surat {
      display: flex;
      align-items: center;
      gap: 16px;
      border-bottom: 3px double #000000;
      padding-bottom: 8px;
      margin-bottom: 16px;
    }

    .kop-logo {
      width: 72px;
      height: 72px;
      object-fit: contain;
      flex-shrink: 0;
    }

    .kop-text {
      flex: 1;
      text-align: center;
    }

    .kop-instansi-1 {
      font-size: 11pt;
      text-transform: uppercase;
    }

    .kop-instansi-2 {
      font-size: 13.5pt;
      font-weight: bold;
      letter-spacing: 0.5px;
    }

    .kop-kampus {
      font-size: 11.5pt;
      font-weight: bold;
    }

    .kop-prodi {
      font-size: 10pt;
      font-weight: bold;
    }

    .kop-alamat {
      font-size: 8pt;
      margin-top: 2px;
      line-height: 1.25;
    }

    .doc-heading {
      text-align: center;
      margin-bottom: 12px;
    }

    .doc-main-title {
      font-size: 12pt;
      font-weight: bold;
      text-transform: uppercase;
      text-decoration: underline;
      margin-bottom: 2px;
    }

    .doc-number {
      font-size: 9.5pt;
    }

    .doc-identity-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9.5pt;
      margin-bottom: 10px;
    }

    .doc-identity-table td {
      padding: 2px 4px;
      vertical-align: top;
    }

    .doc-identity-table td.label-col {
      width: 135px;
    }

    .doc-identity-table td.colon-col {
      width: 12px;
      text-align: center;
    }

    .doc-academic-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 8.5pt;
      font-family: Arial, Helvetica, sans-serif;
      margin: 8px 0;
    }

    .doc-academic-table th, .doc-academic-table td {
      border: 1px solid #000000;
      padding: 4px 6px;
    }

    .doc-academic-table th {
      background-color: #f1f5f9;
      font-weight: bold;
      text-align: center;
    }

    .doc-academic-table td.text-center {
      text-align: center;
    }

    .doc-summary-box {
      margin-top: 8px;
      padding: 6px 10px;
      background-color: #f8fafc;
      border: 1px solid #000000;
      font-family: Arial, sans-serif;
      font-size: 8.5pt;
      display: flex;
      justify-content: space-between;
    }

    .doc-signature-wrapper {
      margin-top: 16px;
      display: flex;
      justify-content: flex-end;
      page-break-inside: avoid;
    }

    .doc-sign-block {
      width: 240px;
      text-align: left;
      font-size: 10pt;
    }

    .sign-date { margin-bottom: 2px; }
    .sign-role { line-height: 1.2; }
    .sign-visual-container { height: 75px; margin: 4px 0; }
    .sign-name { font-weight: bold; text-decoration: underline; }
    .sign-nip { font-size: 9pt; }

    .doc-continuation-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding-bottom: 6px;
      border-bottom: 2px solid #000000;
      margin-bottom: 12px;
      font-family: Arial, sans-serif;
    }

    .continuation-univ {
      font-size: 9pt;
      font-weight: bold;
      letter-spacing: 0.5px;
    }

    .continuation-prodi {
      font-size: 8pt;
      color: #475569;
    }

    .continuation-meta {
      text-align: right;
      font-size: 8pt;
      line-height: 1.3;
    }

    .doc-page-footer {
      display: none !important;
    }

    .footer-left { font-style: italic; }
    .footer-right { font-weight: 600; color: #334155; }

    @media print {
      body {
        background: #ffffff !important;
        padding: 0 !important;
      }
      .print-actions {
        display: none !important;
      }
      .doc-pages-wrapper {
        display: block !important;
        gap: 0 !important;
      }
      .official-doc-paper,
      .official-doc-page {
        box-shadow: none !important;
        border: none !important;
        margin: 0 !important;
        /* Standar 4 3 3 4 */
        padding: 30mm 30mm 30mm 40mm !important;
        width: 210mm !important;
        min-height: 297mm !important;
        max-height: 297mm !important;
        page-break-after: always !important;
        break-after: page !important;
        position: relative !important;
        display: flex !important;
        flex-direction: column !important;
        justify-content: space-between !important;
        box-sizing: border-box !important;
      }
      .official-doc-paper:last-child,
      .official-doc-page:last-child {
        page-break-after: avoid !important;
        break-after: avoid !important;
      }
      .doc-academic-table thead {
        display: table-header-group !important;
      }
      .doc-academic-table tr {
        page-break-inside: avoid !important;
      }
      .doc-signature-wrapper {
        page-break-inside: avoid !important;
      }
    }
  </style>
  <link rel="stylesheet" href="${window.location.origin}${window.location.pathname.replace(/\/[^/]*$/, '')}/assets/css/document-preview.css">
</head>
<body>
  <div class="print-actions" style="text-align:center; margin-bottom: 16px;">
    <button onclick="window.print()" style="display:inline-flex; align-items:center; gap:8px; padding: 8px 20px; background: #991b1b; color: #fff; border: none; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer; margin-right: 8px;">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
      Cetak / Simpan PDF
    </button>
    <button onclick="window.close()" style="display:inline-flex; align-items:center; gap:8px; padding: 8px 20px; background: #475569; color: #fff; border: none; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer;">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      Tutup
    </button>
  </div>
  ${html}
  <script>
    window.onload = function() {
      // Siap cetak langsung
    };
  <\/script>
</body>
</html>`;

    const printWin = window.open('', '_blank', 'width=900,height=700,scrollbars=yes,resizable=yes');
    if (!printWin) {
      showToast('Popup diblokir oleh browser. Izinkan popup untuk fitur cetak.', 'warning');
      return;
    }

    printWin.document.open();
    printWin.document.write(printHtml);
    printWin.document.close();
  }

  /**
   * Unduh dokumen langsung sebagai file PDF resmi standar akademik (*.pdf)
   * Menggunakan Standar Margin Akademik Indonesia: Kiri 4cm, Atas 3cm, Kanan 3cm, Bawah 3cm (4-3-3-4)
   * Menggunakan rendering kanvas independen per-halaman untuk mencegah pergeseran scroll atau spasi kosong.
   */
  async function downloadAsPdf(elementOrHtml, fileName = 'Dokumen_Resmi_UPI.pdf') {
    const cleanFileName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;

    showToast('Sedang menyiapkan berkas PDF standar akademik (4-3-3-4)...', 'info');

    // 1. Ambil konten HTML murni
    let htmlContent = '';
    if (typeof elementOrHtml === 'string') {
      htmlContent = elementOrHtml;
    } else if (elementOrHtml && elementOrHtml.outerHTML) {
      htmlContent = elementOrHtml.outerHTML;
    } else if (elementOrHtml && elementOrHtml.innerHTML) {
      htmlContent = elementOrHtml.innerHTML;
    } else {
      htmlContent = _currentDocHtml || '';
    }

    if (!htmlContent.trim()) {
      showToast('Tidak ada dokumen untuk dibuatkan PDF.', 'warning');
      return false;
    }

    // 2. Render container terisolasi di luar layar (off-screen) agar proses PDF 100% senyap tanpa kedipan/pratinjau di layar pengguna
    const sandbox = document.createElement('div');
    sandbox.id = 'pdf-render-sandbox';
    sandbox.style.cssText = 'position: fixed; left: -9999px; top: 0; width: 210mm; background: #ffffff; z-index: -99999; pointer-events: none; margin: 0; padding: 0;';

    // Injeksi format akademik 4-3-3-4 secara inline
    sandbox.innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Times+New+Roman&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        #pdf-render-sandbox {
          font-family: 'Times New Roman', Times, serif;
          color: #000000;
          background: #ffffff;
        }
        .doc-pages-wrapper {
          display: block;
          width: 100%;
        }
        .official-doc-page, .official-doc-paper {
          width: 210mm !important;
          height: 297mm !important;
          min-height: 297mm !important;
          max-height: 297mm !important;
          /* Standar Margin Akademik Indonesia 4-3-3-4: Kiri 4cm, Atas 3cm, Kanan 3cm, Bawah 3cm */
          padding: 30mm 30mm 30mm 40mm !important;
          box-sizing: border-box !important;
          background: #ffffff !important;
          position: relative !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: space-between !important;
          overflow: hidden !important;
          margin: 0 !important;
          border: none !important;
          box-shadow: none !important;
          outline: none !important;
          border-radius: 0 !important;
        }
        .doc-page-body { flex: 1; width: 100%; }
        .kop-surat { display: flex; align-items: center; gap: 16px; border-bottom: 3px double #000000; padding-bottom: 8px; margin-bottom: 12px; }
        .kop-logo { width: 72px; height: 72px; object-fit: contain; }
        .kop-text { flex: 1; text-align: center; }
        .kop-instansi-1 { font-size: 11pt; text-transform: uppercase; }
        .kop-instansi-2 { font-size: 13.5pt; font-weight: bold; letter-spacing: 0.5px; }
        .kop-kampus { font-size: 11.5pt; font-weight: bold; }
        .kop-prodi { font-size: 10pt; font-weight: bold; }
        .kop-alamat { font-size: 8pt; margin-top: 2px; line-height: 1.25; }
        .doc-heading { text-align: center; margin-bottom: 10px; }
        .doc-main-title { font-size: 12pt; font-weight: bold; text-transform: uppercase; text-decoration: underline; margin-bottom: 2px; }
        .doc-number { font-size: 9.5pt; }
        .doc-identity-table { width: 100%; border-collapse: collapse; font-size: 9.5pt; margin-bottom: 8px; }
        .doc-identity-table td { padding: 2px 4px; vertical-align: top; }
        .doc-identity-table td.label-col { width: 135px; }
        .doc-identity-table td.colon-col { width: 12px; text-align: center; }
        .doc-academic-table { width: 100%; border-collapse: collapse; font-size: 8.5pt; font-family: Arial, Helvetica, sans-serif; margin: 6px 0; }
        .doc-academic-table th, .doc-academic-table td { border: 1px solid #000000; padding: 3px 5px; }
        .doc-academic-table th { background-color: #f1f5f9; font-weight: bold; text-align: center; }
        .doc-academic-table td.text-center { text-align: center; }
        .doc-summary-box { margin-top: 6px; padding: 6px 10px; background-color: #f8fafc; border: 1px solid #000000; font-family: Arial, sans-serif; font-size: 8.5pt; display: flex; justify-content: space-between; }
        .doc-signature-wrapper { margin-top: 10px; display: flex; justify-content: flex-end; }
        .doc-sign-block { width: 240px; text-align: left; font-size: 10pt; position: relative; }
        .sign-date { margin-bottom: 2px; }
        .sign-role { line-height: 1.2; }
        .sign-visual-container { height: 75px; position: relative; margin: 4px 0; }
        .sign-visual-container.is-draft-space { height: 75px; margin: 4px 0; border: none !important; background: transparent !important; }
        .sign-ttd-img { position: absolute; left: 20px; top: 0; width: 140px; height: auto; z-index: 2; }
        .sign-stamp-img { position: absolute; left: -20px; top: -10px; width: 105px; height: 105px; z-index: 1; opacity: 0.88; }
        .sign-name { font-weight: bold; text-decoration: underline; }
        .sign-nip { font-size: 9pt; }
        .doc-continuation-header { display: flex; justify-content: space-between; align-items: flex-end; padding-bottom: 6px; border-bottom: 2px solid #000000; margin-bottom: 10px; font-family: Arial, sans-serif; }
        .continuation-univ { font-size: 9pt; font-weight: bold; }
        .continuation-prodi { font-size: 8pt; color: #475569; }
        .continuation-meta { text-align: right; font-size: 8pt; line-height: 1.3; }
        .doc-page-footer { display: none !important; }
        .footer-left { font-style: italic; }
        .footer-right { font-weight: 600; color: #334155; }
        .official-doc-page.is-draft, .official-doc-paper.is-draft {
          background-image: none !important;
        }
      </style>
      ${htmlContent}
    `;

    document.body.appendChild(sandbox);

    // Tunggu bila gambar logo sedang di-render
    const images = sandbox.querySelectorAll('img');
    await Promise.all(Array.from(images).map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise(resolve => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    }));

    if (typeof html2pdf !== 'undefined') {
      try {
        let pageEls = Array.from(sandbox.querySelectorAll('.official-doc-page'));
        if (pageEls.length === 0) {
          pageEls = Array.from(sandbox.querySelectorAll('.official-doc-paper'));
        }
        if (pageEls.length === 0) {
          pageEls = [sandbox];
        }

        const h2cOptions = {
          scale: 2,
          useCORS: true,
          logging: false,
          scrollY: 0,
          scrollX: 0
        };

        // Render halaman pertama untuk inisialisasi berkas PDF resmi
        const firstWorker = html2pdf().set({
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: h2cOptions,
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        }).from(pageEls[0]);

        await firstWorker.toCanvas();
        await firstWorker.toPdf();
        const pdf = firstWorker.prop.pdf;

        // Pastikan halaman awal presisi 1 halaman penuh
        while (pdf.internal.getNumberOfPages() > 1) {
          pdf.deletePage(pdf.internal.getNumberOfPages());
        }

        // Render halaman 2 dan seterusnya (jika dokumen multi-lembar seperti Transkrip)
        for (let i = 1; i < pageEls.length; i++) {
          const nextWorker = html2pdf().set({
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: h2cOptions
          }).from(pageEls[i]);

          await nextWorker.toCanvas();
          pdf.addPage();
          pdf.setPage(i + 1);
          pdf.addImage(nextWorker.prop.canvas.toDataURL('image/jpeg', 0.98), 'JPEG', 0, 0, 210, 297);
        }

        // Simpan dokumen PDF secara langsung
        pdf.save(cleanFileName);

        showToast(`Dokumen PDF "${cleanFileName}" berhasil diunduh!`, 'success');
        if (sandbox.parentNode) sandbox.parentNode.removeChild(sandbox);
        return true;
      } catch (err) {
        console.warn('html2pdf generation error, fallback to print dialog:', err);
      }
    }

    if (sandbox.parentNode) sandbox.parentNode.removeChild(sandbox);
    // Fallback native print dialog
    printDocument(htmlContent, cleanFileName.replace('.pdf', ''));
    return false;
  }

  function closeModal() {
    const overlay = document.getElementById('globalModalOverlay');
    if (overlay) {
      overlay.classList.remove('active');
      document.body.classList.remove('modal-open');
    }
  }

  /**
   * Floating Toast Notifications
   */
  function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
    if (type === 'success') {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
    } else if (type === 'warning') {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';
    } else if (type === 'error') {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';
    }

    toast.innerHTML = `
      <span style="display:inline-flex; align-items:center; justify-content:center; flex-shrink:0;">${iconSvg}</span>
      <span style="font-weight: 500;">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'all 0.3s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  return {
    init,
    logout,
    openCustomModal,
    openDocumentPreviewModal,
    printDocument,
    downloadAsPdf,
    getCurrentDocHtml: () => _currentDocHtml,
    closeModal,
    showToast
  };
})();

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

// Export globally
window.App = App;
