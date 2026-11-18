# SILADIK | Sistem Layanan Akademik Digital Terpadu
### Universitas Pendidikan Indonesia - Kampus Daerah Tasikmalaya
**Program Studi S1 Bisnis Digital**  
*Mata Kuliah: Analisis dan Desain Sistem Informasi (2026)*  
*Dosen Pengampu: Muhammad Rizki Nugraha, S.Pd., M.T.*

---

## 📌 Ringkasan Sistem Terkini

**SILADIK** (*Sistem Informasi Layanan Akademik Digital Terpadu*) adalah platform berbasis web *Single Window System* yang mentransformasi alur pelayanan administrasi akademik di UPI Kampus Daerah Tasikmalaya. Sistem ini mengintegrasikan efisiensi pengajuan dokumen akademik secara digital dengan **keabsahan tanda tangan basah fisik dan cap dinas resmi universitas**, memastikan seluruh berkas memenuhi standar hukum administrasi pendidikan tinggi.

### 🌟 Fitur Utama & Pembaruan Sistem Terkini:
1. **Otentikasi Terpadu & Strict Role-Based Access Control (RBAC):**
   - Mendukung 4 peran pengguna dengan isolasi hak akses penuh: **Mahasiswa**, **Staf Tata Usaha**, **KASI (Pimpinan)**, dan **Administrator Sistem**.
   - Otentikasi instan sub-milidetik dengan fallback basis data lokal dan sinkronisasi opsional ke REST API backend.
2. **Alur 4 Tahap Berkas Akademik & Pelacakan Interaktif (Timeline Modal):**
   - Mahasiswa dapat memantau perjalanan berkasnya secara transparan melalui modal timeline interaktif 4 tahap:
     * **Tahap 1: Pengajuan Berkas Online** (Sistem antrean FIFO).
     * **Tahap 2: Review Staf TU & Cetak Draf Fisik** (Validasi SIAKAD & draf kosongan).
     * **Tahap 3: Menunggu TTD Basah & Cap Pimpinan** (Proses penandatanganan fisik di ruang KASI).
     * **Tahap 4: Dokumen Selesai & Terbit** (Pemindaian/scan berkas basah, pengunggahan PDF resmi, siap diunduh).
3. **Konsep Draf Kosongan & Tanda Tangan Basah Fisik (Non-Digital Fake Sign):**
   - Sesuai arahan penguji akademik, dokumen draf otomatis dibuat **polos tanpa tanda tangan digital palsu dan tanpa barcode QR buatan**.
   - Dokumen dicetak fisik oleh staf TU, dimintakan tanda tangan basah dan cap stempel basah pimpinan, lalu di-scan dan diunggah kembali ke sistem untuk diverifikasi.
4. **Dashboard Evaluasi Kinerja KASI dengan Dual Bar Chart & Garis Batas SLA (3 Hari):**
   - **Chart 1:** Bar chart visual per jenis dokumen dilengkapi **Garis Merah Putus-Putus Batas Maksimal SLA (3 Hari Kerja)**. Bar hijau di bawah garis menandakan performa optimal.
   - **Chart 2:** Bar chart pemantauan rata-rata durasi operasional per 4 tahapan layanan untuk mendeteksi *bottleneck*.
   - **Ekspor Laporan Kinerja Formal:** Cetak laporan kinerja resmi format A4 2 halaman presisi dengan standar tipografi Times New Roman 12pt (narasi) dan 10pt (tabel).
5. **Manajemen Asas Keberlanjutan Mandiri di Portal Administrator:**
   - **Ekspor & Impor Excel (.xlsx / .csv):** Didukung penuh secara luring (offline) via SheetJS. Admin dapat mengekspor seluruh basis data mahasiswa serta mengimpor ratusan mahasiswa baru secara massal.
   - **Checkbox Select All & Filter Cuti:** Fitur pemilihan massal mahasiswa aktif. Mahasiswa berstatus **CUTI** otomatis tidak terpilih (*unselected*) dan dilewati saat eksekusi tombol **"Naikkan Semester Massal (+1)"**.
   - **Katalog Master Mata Kuliah & Kelola Nilai:** Pengelolaan kurikulum prodi per semester serta penginputan nilai huruf/angka mahasiswa tiap semester.
   - **Standarisasi Email Resmi:** Otomatis menghasilkan format email formal kampus berbasis nama (`nama.lengkap@upi.edu`), bukan angka NIM.

---

## 👥 4 Aktor Sistem & Matriks Hak Akses (Strict RBAC)

| No | Peran (Role) | Kredensial Login | Tanggung Jawab & Hak Akses | Batasan Akses |
|:--:|:---|:---|:---|:---|
| 1 | **Mahasiswa** | Akun SSO SIAKAD<br>*(Contoh: NIM `2312017`)* | • Mengajukan 4 dokumen akademik (SKMA, KRS, KHS, Transkrip Nilai Sementara)<br>• Mengetahui nomor antrean FIFO dan estimasi waktu selesai SLA<br>• Melacak alur progres melalui modal **Timeline 4 Tahap**<br>• Mengunduh dokumen PDF resmi yang telah disahkan dan di-scan | Terisolasi pada data miliknya sendiri. Tidak dapat melihat berkas mahasiswa lain atau mengakses antrean staf. |
| 2 | **Staf TU Akademik** | Akun Staf NIP<br>*(Contoh: `budi_akademik`)* | • Memproses antrean berkas masuk berbasis FIFO<br>• Verifikasi data SIAKAD dan status SPP secara otomatis<br>• Mencetak draf kosongan fisik untuk pengesahan pimpinan<br>• Mengunggah berkas hasil scan tanda tangan basah & cap asli<br>• Mengesahkan dokumen ke mahasiswa atau menolak berkas bermasalah | Tidak dapat mengubah kurikulum master prodi atau mengakses dashboard evaluasi manajerial KASI. |
| 3 | **KASI Layanan Akademik** | Akun Pimpinan NIP<br>*(Contoh: `rizkinugraha`)* | • Memantau KPI eksekutif (Kepatuhan SLA, rata-rata durasi, antrean aktif)<br>• Memantau **Chart SLA dengan Garis Batas 3 Hari** dan **Chart Durasi 4 Tahap**<br>• Memantau distribusi beban kerja per staf pelaksana TU<br>• Menandatangani berkas fisik secara basah di kantor<br>• Mencetak Laporan Kinerja Resmi (Format formal UPI Times New Roman 12pt) | Akses manajerial dan pengawasan. Tidak terlibat dalam teknis input data mahasiswa harian. |
| 4 | **Administrator** | Akun Admin Sistem<br>*(Contoh: `admin`)* | • Kelola akun seluruh pengguna (tambah, edit, hapus, kelola nilai)<br>• Monitoring menyeluruh status pengajuan dokumen kampus<br>• Kelola master kurikulum & katalog mata kuliah prodi per semester<br>• **Ekspor & Impor data mahasiswa via Excel (.xlsx)**<br>• **Pengelolaan kenaikan semester massal (+1) dengan filter mahasiswa Cuti** | Akses penuh (*Full System Access*) terhadap konfigurasi data master dan kesinambungan sistem. |

---

## 🔄 Alur Layanan Dokumen Akademik (4 Tahapan)

```text
+-----------------------------------------------------------------------------------+
|                           TAHAP 1: PENGAJUAN ONLINE                               |
| Mahasiswa mengajukan SKMA/KRS/KHS/Transkrip via portal. Data SIAKAD & SPP otomatis|
| divalidasi. Berkas masuk antrean FIFO TU dengan nomor registrasi (ANT-XXX-XXX).   |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                     TAHAP 2: REVIEW STAF TU & CETAK DRAF                          |
| Staf TU membuka berkas, memeriksa keabsahan SIAKAD. Sistem AI menyusun draf polos |
| tanpa TTD palsu/barcode. Staf TU mencetak lembar draf fisik di kertas dinas.     |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                   TAHAP 3: MENUNGGU TTD BASAH & CAP PIMPINAN                      |
| Lembar draf fisik diajukan ke meja Kepala Seksi (KASI). KASI membubuhkan paraf/   |
| tanda tangan basah asli dengan pulpen dan cap stempel dinas basah universitas.    |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                     TAHAP 4: DOKUMEN SELESAI & TERBIT                             |
| Staf TU memindai (scan) lembar fisik yang sah, mengunggah file ke sistem, lalu    |
| klik "Sahkan & Terbitkan". Tombol unduh PDF resmi aktif di akun mahasiswa.        |
+-----------------------------------------------------------------------------------+
```

---

## 📁 Struktur Direktori & Komponen File

```text
layanan-akademik-upi/
├── index.html                      # Single Page Application (SPA) utama dengan isolasi modal & view
├── server.js                       # Server backend Node.js Express (REST API + Static Server Port 8080)
├── package.json                    # Konfigurasi dependensi project
├── README.md                       # Dokumentasi arsitektur, RBAC, dan operasional terkini
└── assets/
    ├── css/
    │   ├── main.css                # Desain sistem, palet warna resmi UPI, tipografi, dan navigasi
    │   ├── components.css          # Komponen UI: tombol, badge status, modal, toast notifikasi
    │   ├── dashboard.css           # Styling dashboard 4 aktor, timeline modal, bar chart SLA, tabel Excel
    │   └── document-preview.css    # Layout kertas A4 resmi UPI, kop dinas, tipografi formal, @media print
    ├── js/
    │   ├── xlsx.full.min.js        # Library SheetJS (Ekspor & Impor Excel lokal/offline)
    │   ├── html2pdf.bundle.min.js  # Generator PDF langsung dari dokumen browser
    │   ├── config.js               # Konfigurasi endpoint API & environment
    │   ├── siakad-api.js           # Engine integrasi SIAKAD: mahasiswa, kurikulum, nilai, dan SPP
    │   ├── ai-document-engine.js   # Generator draf dokumen resmi UPI bebas barcode/TTD digital palsu
    │   ├── queue-sla.js            # Engine antrean FIFO, kalkulator batas SLA 3 hari, dan sync storage
    │   ├── auth.js                 # Modul otentikasi cepat, manajemen sesi, dan RBAC guard
    │   ├── app.js                  # Main controller, router peran, modal manager, dan toast engine
    │   └── views/
    │       ├── login.js            # View antarmuka login multi-peran dengan fast credential switch
    │       ├── mahasiswa.js        # View mahasiswa: form pengajuan, lacak progres 4 tahap, unduh PDF
    │       ├── staff.js            # View staf TU: antrean FIFO, cetak draf, unggah scan basah, terbitkan
    │       ├── kasi.js             # View KASI: bar chart garis batas SLA 3 hari, 4 tahapan, cetak laporan
    │       └── admin.js            # View admin: ekspor/impor Excel, seleksi cuti, kelola nilai, kurikulum
    └── images/
        ├── logo-upi-bulat.png      # Logo resmi Universitas Pendidikan Indonesia
        ├── stempel-upi.svg         # Vektor cap stempel resmi Subbag Akademik UPI Tasikmalaya
        └── ttd-pimpinan.svg        # Vektor tanda tangan resmi pimpinan akademik
```

---

## 🚀 Panduan Menjalankan Aplikasi

Aplikasi dirancang fleksibel: dapat dijalankan menggunakan **Node.js Server** terintegrasi atau dibuka langsung di peramban secara *zero-dependency*.

### Opsi 1: Menjalankan via Node.js Server (Sangat Direkomendasikan)
1. Buka Terminal pada direktori project:
   ```bash
   node server.js
   ```
2. Aplikasi otomatis aktif di:
   ```text
   http://localhost:8080/
   ```

### Opsi 2: Membuka Langsung di Browser
Cukup klik dua kali (*double click*) file `index.html` menggunakan Google Chrome, Microsoft Edge, atau Mozilla Firefox. Seluruh fungsionalitas (termasuk SheetJS Excel) tetap berjalan 100% tanpa kendala koneksi internet.

---

## 🔑 Kredensial Pengujian (Demo Akun)

| Peran (Role) | Username / NIP / NIM | Kata Sandi | Kegunaan Pengujian |
|---|---|---|---|
| **Mahasiswa 1** | `2312017` | *Bebas / Auto* | Nabil Amanulloh (Semester 8, SPP Lunas, Nilai Semester 1–7 Lengkap). |
| **Mahasiswa 2** | `2300159` | *Bebas / Auto* | Nazwa Salsabila (Mahasiswa Cuti / Simulasi Pengujian Status Khusus). |
| **Mahasiswa 3** | `2300687` | *Bebas / Auto* | Zahra Agniasari (Semester 7, Uji Pengajuan KRS/KHS). |
| **Staf TU** | `budi_akademik` | *Bebas / Auto* | Budi Prasetyo, S.Kom. (Verifikator TU, cetak draf & unggah scan). |
| **KASI** | `rizkinugraha` | *Bebas / Auto* | Muhammad Rizki Nugraha, S.Pd., M.T. (Monitor SLA & Cetak Laporan). |
| **Administrator** | `admin` | *Bebas / Auto* | Administrator Sistem (Impor/Ekspor Excel, kelola nilai, kelola cuti). |

---

## 🧪 Skenario Validasi & Pengujian Fitur

### 1. Pengujian Pelacakan 4 Tahapan Berkas (Mahasiswa)
1. Login sebagai Mahasiswa (`2312017`).
2. Kirim salah satu pengajuan dokumen pada formulir.
3. Pada tabel **Riwayat Pengajuan Dokumen Anda**, klik tombol **"Lacak"** pada kolom Status.
4. Modal 4 Tahapan Berkas akan terbuka menampilkan posisi terkini berkas secara visual dan transparan.

### 2. Pengujian Cetak Draf Kosongan & Pengesahan Fisik (Staf TU)
1. Beralih ke peran **Staf TU** (`budi_akademik`).
2. Klik tombol **"Tinjau & Eksekusi"** pada antrean permohonan.
3. Periksa draf dokumen: dokumen tersusun rapi tanpa barcode digital dan tanpa tanda tangan palsu.
4. Klik **"Cetak Dokumen"** untuk mencetak draf ke kertas fisik.
5. Unggah berkas hasil scan basah pada kolom **TAHAP 2: Unggah Dokumen Sah**, lalu klik tombol hijau **"Sahkan & Terbitkan ke Mahasiswa"**.

### 3. Pengujian Monitoring SLA & 4 Tahapan (KASI)
1. Beralih ke peran **KASI** (`rizkinugraha`).
2. Amati **Chart 1 (Realisasi vs Garis Batas Target SLA 3 Hari)**: perhatikan posisi bar dokumen di bawah garis merah putus-putus.
3. Amati **Chart 2 (Rata-rata Durasi per 4 Tahapan)** untuk evaluasi alur kerja staf.
4. Klik tombol **"Ekspor Laporan Kinerja Resmi"** untuk menghasilkan dokumen laporan kinerja formal 2 halaman berstandar Times New Roman 12pt.

### 4. Pengujian Impor/Ekspor Excel & Mahasiswa Cuti (Administrator)
1. Beralih ke peran **Administrator** (`admin`), buka tab **Pembaruan Mahasiswa Per Semester**.
2. Klik tombol hijau **"Ekspor Excel (.xlsx)"** untuk mengunduh daftar mahasiswa aktif ke spreadsheet resmi.
3. Klik tombol biru **"Impor Excel (.xlsx)"** untuk menguji drag-and-drop file spreadsheet mahasiswa baru.
4. Ubah status mahasiswa tertentu menjadi **CUTI** dengan mengklik badgenya: baris mahasiswa cuti akan berwarna krem dan checkbox-nya otomatis tidak terpilih.
5. Klik **"Naikkan Semester Massal (+1)"**: sistem akan menaikkan semester seluruh mahasiswa aktif yang dicentang dan secara aman melewati mahasiswa berstatus Cuti.
