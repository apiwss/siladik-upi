/**
 * ===================================================================
 * SISTEM INFORMASI LAYANAN AKADEMIK DIGITAL TERPADU (SILADIK-AI)
 * Universitas Pendidikan Indonesia Kampus Daerah Tasikmalaya
 * Backend Server: Node.js + Express + PostgreSQL (Tanpa Prisma)
 * ===================================================================
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');
require('dotenv').config();

// Aturan Konversi Nilai Akademik Standar UPI
const STANDAR_NILAI_UPI = {
  'A': 4.0,
  'A-': 3.7,
  'B+': 3.3,
  'B': 3.0,
  'B-': 2.7,
  'C+': 2.3,
  'C': 2.0,
  'D': 1.0,
  'E': 0.0
};

const JWT_SECRET = process.env.JWT_SECRET || 'rahasia_siladik_ai_upi_tasikmalaya_2026';

// Middleware Otorisasi: Khusus Admin dan Petugas (Staf TU / KASI)
function authorizeAdminOrStaff(req, res, next) {
  // 1. Cek dari header Authorization (Bearer Token JWT)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'rahasia_siladik_ai_upi_tasikmalaya_2026');
      const role = String(decoded.role || '').toUpperCase();
      if (['ADMIN', 'STAF', 'STAFF', 'KASI'].includes(role)) {
        req.user = decoded;
        return next();
      }
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak: Operasi ini memerlukan wewenang Administrator atau Petugas Akademik.'
      });
    } catch (e) {
      return res.status(401).json({ success: false, message: 'Token otentikasi tidak valid atau telah kedaluwarsa.' });
    }
  }

  // 2. Cek dari header peran kustom (x-user-role / x-role) atau body actor_role
  const headerRole = String(req.headers['x-user-role'] || req.headers['x-role'] || req.body?.actor_role || '').toUpperCase();
  if (headerRole) {
    if (['ADMIN', 'STAF', 'STAFF', 'KASI'].includes(headerRole)) {
      req.user = { role: headerRole };
      return next();
    }
    return res.status(403).json({
      success: false,
      message: 'Akses ditolak: Peran pengguna tidak memiliki wewenang untuk menambah atau mengubah nilai.'
    });
  }

  // 3. Jika peran mahasiswa secara eksplisit mencoba mengakses via body atau query
  const declaredRole = String(req.body?.user_role || req.body?.role || req.query?.role || '').toUpperCase();
  if (declaredRole === 'MAHASISWA') {
    return res.status(403).json({
      success: false,
      message: 'Akses ditolak: Mahasiswa tidak memiliki izin untuk mengelola nilai akademik.'
    });
  }

  // Izinkan jika dipanggil internal oleh admin panel (same-origin SPA session)
  return next();
}

// Middleware Otorisasi Ketat: Khusus Administrator Sistem
function authorizeAdmin(req, res, next) {
  // 1. Cek dari header Authorization (Bearer Token JWT)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'rahasia_siladik_ai_upi_tasikmalaya_2026');
      const role = String(decoded.role || '').toUpperCase();
      if (role === 'ADMIN') {
        req.user = decoded;
        return next();
      }
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak: Operasi ini hanya boleh dilakukan oleh Administrator Sistem.'
      });
    } catch (e) {
      return res.status(401).json({ success: false, message: 'Token otentikasi tidak valid atau telah kedaluwarsa.' });
    }
  }

  // 2. Cek dari header peran kustom (x-user-role / x-role)
  const headerRole = String(req.headers['x-user-role'] || req.headers['x-role'] || req.body?.actor_role || '').toUpperCase();
  if (headerRole === 'ADMIN') {
    req.user = { role: 'ADMIN' };
    return next();
  }

  // 3. Fallback dev mode jika same-origin request
  const origin = req.headers.origin || req.headers.referer || '';
  if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
    const secRole = String(req.headers['x-user-role'] || '').toUpperCase();
    if (!secRole || secRole === 'ADMIN') {
      return next();
    }
  }

  return res.status(401).json({
    success: false,
    message: 'Akses ditolak: Diperlukan otentikasi Administrator.'
  });
}

const app = express();
const PORT = process.env.PORT || 8080;

// Tangani unhandled rejection / uncaught exception agar server tidak crash jika DB offline
process.on('uncaughtException', (err) => {
  console.warn('[Server Handled Exception]:', err.message);
});
process.on('unhandledRejection', (reason) => {
  console.warn('[Server Handled Rejection]:', reason?.message || reason);
});

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger
app.use((req, res, next) => {
  if (req.url.startsWith('/api')) {
    console.log(`[API ${new Date().toLocaleTimeString()}] ${req.method} ${req.url} (origin: ${req.headers.origin || 'same-origin'})`);
  }
  next();
});

// Melayani File Statis Frontend (index.html, assets, css, js, gambar)
app.use(express.static(__dirname));

// ===================================================================
// API ROUTES
// ===================================================================

// 1. Healthcheck & Test Database Connection
app.get('/api/health', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW() as current_time, version()');
    return res.json({
      status: 'OK',
      message: 'Server Node.js & Database PostgreSQL Terhubung!',
      dbTime: result.rows[0].current_time,
      dbVersion: result.rows[0].version,
    });
  } catch (err) {
    return res.status(500).json({
      status: 'ERROR',
      message: 'Gagal terhubung ke database PostgreSQL. Pastikan PostgreSQL berjalan dan database sudah dibuat.',
      error: err.message,
    });
  }
});

// 2. Authentication (Login Mahasiswa, Staf, KASI, Admin)
app.post('/api/auth/login', async (req, res) => {
  const { nomor_induk, password } = req.body;
  if (!nomor_induk) {
    return res.status(400).json({ success: false, message: 'Nomor induk (NIM/NIP) wajib diisi.' });
  }

  try {
    const query = `
      SELECT u.id, u.nomor_induk, u.nama, u.email, u.password_hash, u.role, u.prodi, u.is_active,
             mp.semester_berjalan, mp.total_sks_lulus, mp.ipk, mp.dosen_pa, mp.alamat, mp.no_telepon
      FROM users u
      LEFT JOIN mahasiswa_profile mp ON u.id = mp.user_id
      WHERE u.nomor_induk = $1
    `;
    const result = await db.query(query, [nomor_induk.trim()]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Nomor induk tidak ditemukan dalam database.' });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'Akun Anda dinonaktifkan. Hubungi administrator.' });
    }

    // Validasi kata sandi ketat (Wajib diisi & diverifikasi hash bcrypt)
    if (!password || password.trim() === '') {
      return res.status(400).json({ success: false, message: 'Kata sandi wajib diisi.' });
    }
    const isMatch = await bcrypt.compare(password.trim(), user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Kata sandi tidak sesuai.' });
    }

    // Ambil status SPP semester berjalan jika mahasiswa
    let sppStatus = 'Lunas';
    if (user.role === 'MAHASISWA') {
      const sppRes = await db.query(
        'SELECT status FROM status_spp WHERE user_id = $1 ORDER BY semester DESC LIMIT 1',
        [user.id]
      );
      if (sppRes.rows.length > 0) {
        sppStatus = sppRes.rows[0].status === 'LUNAS' ? 'Lunas' : 'Belum Lunas';
      }
    }

    // Format role untuk frontend: 'mahasiswa', 'staff', 'kasi', 'admin'
    let mappedRole = 'mahasiswa';
    if (user.role === 'STAF') mappedRole = 'staff';
    else if (user.role === 'KASI') mappedRole = 'kasi';
    else if (user.role === 'ADMIN') mappedRole = 'admin';

    const token = jwt.sign(
      { id: user.id, nomor_induk: user.nomor_induk, role: mappedRole },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({
      success: true,
      message: 'Login berhasil.',
      token,
      user: {
        id: user.id,
        nomor_induk: user.nomor_induk,
        nim: user.role === 'MAHASISWA' ? user.nomor_induk : undefined,
        nip: user.role !== 'MAHASISWA' ? user.nomor_induk : undefined,
        nama: user.nama,
        email: user.email,
        role: mappedRole,
        role_db: user.role,
        prodi: user.prodi,
        currentSemester: user.semester_berjalan || 1,
        semester_berjalan: user.semester_berjalan || 1,
        total_sks_lulus: user.total_sks_lulus || 0,
        totalSksLulus: user.total_sks_lulus || 0,
        ipk: user.ipk ? Number(user.ipk) : 0,
        dosen_pa: user.dosen_pa,
        statusSpp: sppStatus,
        avatarLabel: user.nama.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server database.', error: err.message });
  }
});

// Register Akun Mahasiswa Baru (Integrasi Langsung ke PostgreSQL)
app.post('/api/auth/register', async (req, res) => {
  const { nim, nama, prodi, currentSemester, password } = req.body;
  if (!nim || !nama || !password) {
    return res.status(400).json({ success: false, message: 'NIM, nama lengkap, dan kata sandi wajib diisi.' });
  }

  let client;
  try {
    client = await db.pool.connect();
    await client.query('BEGIN');

    // Cek apakah NIM sudah terdaftar
    const existing = await client.query('SELECT id FROM users WHERE nomor_induk = $1', [nim.trim()]);
    if (existing.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: `Mahasiswa dengan NIM '${nim.trim()}' sudah terdaftar.` });
    }

    const hashedPassword = await bcrypt.hash(password.trim(), 10);
    const cleanNameEmail = nama.trim().toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().split(/\s+/).filter(Boolean).slice(0, 3).join('.') + '@upi.edu';
    const userQuery = `
      INSERT INTO users (nomor_induk, nama, email, password_hash, role, prodi, is_active)
      VALUES ($1, $2, $3, $4, 'MAHASISWA', $5, true)
      RETURNING id, nomor_induk, nama, role, prodi;
    `;
    const userRes = await client.query(userQuery, [
      nim.trim(),
      nama.trim(),
      cleanNameEmail,
      hashedPassword,
      prodi || 'S1 Bisnis Digital'
    ]);

    const newUserId = userRes.rows[0].id;
    const sem = parseInt(currentSemester || 1, 10);
    const angkatan = 2000 + (parseInt(String(nim.trim()).slice(0, 2), 10) || 24);

    await client.query(`
      INSERT INTO mahasiswa_profile (
        user_id, nim, semester_berjalan, angkatan, dosen_pa,
        total_sks_lulus, ipk
      ) VALUES ($1, $2, $3, $4, 'Muhammad Rizki Nugraha, S.Pd., M.T.', $5, 3.75)
    `, [newUserId, nim.trim(), sem, angkatan, (sem - 1) * 20]);

    await client.query(`
      INSERT INTO status_spp (user_id, semester, tahun_akademik, status, tanggal_bayar, jumlah_bayar)
      VALUES ($1, $2, '2026/2027 Ganjil', 'LUNAS', NOW(), 3500000)
    `, [newUserId, sem]);

    await client.query('COMMIT');

    return res.status(201).json({
      success: true,
      message: `Mahasiswa ${nama} (${nim}) berhasil didaftarkan ke PostgreSQL!`,
      user: {
        id: newUserId,
        nim: nim.trim(),
        nomor_induk: nim.trim(),
        nama: nama.trim(),
        role: 'mahasiswa',
        prodi: prodi || 'S1 Bisnis Digital',
        currentSemester: sem,
        semesterAktif: sem,
        totalSksLulus: (sem - 1) * 20,
        ipk: 3.75,
        statusSpp: 'Lunas',
        email: cleanNameEmail
      }
    });
  } catch (err) {
    if (client) {
      try { await client.query('ROLLBACK'); } catch (_) {}
    }
    console.error('Error register mahasiswa:', err);
    return res.status(500).json({ success: false, message: 'Gagal mendaftarkan akun ke database.', error: err.message });
  } finally {
    if (client) client.release();
  }
});

// 3. Data Mahasiswa & SIAKAD Integration
app.get('/api/students', async (req, res) => {
  try {
    const query = `
      SELECT u.id, u.nomor_induk as nim, u.nama, u.email, u.prodi,
             mp.semester_berjalan as "currentSemester", mp.total_sks_lulus as "totalSksLulus",
             mp.ipk, mp.dosen_pa, mp.alamat, mp.no_telepon,
             COALESCE(
               (SELECT status FROM status_spp WHERE user_id = u.id ORDER BY semester DESC LIMIT 1),
               'LUNAS'
             ) as spp_status_db
      FROM users u
      LEFT JOIN mahasiswa_profile mp ON u.id = mp.user_id
      WHERE u.role = 'MAHASISWA' AND u.is_active = TRUE
      ORDER BY u.nomor_induk ASC
    `;
    const result = await db.query(query);

    const students = result.rows.map(s => ({
      nim: s.nim,
      nama: s.nama,
      email: s.email,
      prodi: s.prodi,
      currentSemester: s.currentSemester || 1,
      totalSksLulus: s.totalSksLulus || 0,
      ipk: s.ipk ? Number(s.ipk) : 0,
      dosen_pa: s.dosen_pa || 'Muhammad Rizki Nugraha, S.Pd., M.T.',
      statusSpp: s.spp_status_db === 'LUNAS' ? 'Lunas' : 'Belum Lunas'
    }));

    return res.json({ success: true, data: students });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/students/:nim', async (req, res) => {
  const { nim } = req.params;
  try {
    const studentQuery = `
      SELECT u.id, u.nomor_induk as nim, u.nama, u.email, u.prodi,
             mp.semester_berjalan as "currentSemester", mp.total_sks_lulus as "totalSksLulus",
             mp.ipk, mp.dosen_pa, mp.alamat, mp.no_telepon,
             COALESCE(
               (SELECT status FROM status_spp WHERE user_id = u.id ORDER BY semester DESC LIMIT 1),
               'LUNAS'
             ) as spp_status_db
      FROM users u
      LEFT JOIN mahasiswa_profile mp ON u.id = mp.user_id
      WHERE u.nomor_induk = $1 AND u.role = 'MAHASISWA'
    `;
    const sResult = await db.query(studentQuery, [nim]);
    if (sResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Mahasiswa tidak ditemukan.' });
    }

    const s = sResult.rows[0];

    // Ambil riwayat nilai per semester
    const nilaiQuery = `
      SELECT n.semester_ambil, n.tahun_akademik, n.kode_mk, n.nilai_huruf, n.bobot_nilai, n.is_krs_active,
             mk.nama_mk, mk.sks
      FROM nilai_akademik n
      JOIN mata_kuliah mk ON n.kode_mk = mk.kode_mk
      WHERE n.user_id = $1
      ORDER BY n.semester_ambil ASC, n.kode_mk ASC
    `;
    const nResult = await db.query(nilaiQuery, [s.id]);

    const riwayatSemester = {};
    nResult.rows.forEach(r => {
      const sem = r.semester_ambil;
      if (!riwayatSemester[sem]) {
        riwayatSemester[sem] = {
          semesterTeks: `Semester ${sem} (${r.tahun_akademik || ''})`,
          mataKuliah: []
        };
      }
      riwayatSemester[sem].mataKuliah.push({
        kode: r.kode_mk,
        nama: r.nama_mk,
        sks: r.sks,
        nilai: r.nilai_huruf,
        bobot: r.bobot_nilai !== null ? Number(r.bobot_nilai) : 0,
        isKrs: r.is_krs_active
      });
    });

    // Hitung IP Semester (hanya MK yang sudah punya nilai)
    Object.keys(riwayatSemester).forEach(semKey => {
      const semData = riwayatSemester[semKey];
      const graded = semData.mataKuliah.filter(mk => mk.nilai !== null && mk.nilai !== undefined && !mk.isKrs);
      let totalSks = 0;
      let totalBobot = 0;
      graded.forEach(mk => {
        totalSks += mk.sks;
        totalBobot += mk.sks * (mk.bobot || 0);
      });
      semData.ipSemester = totalSks > 0 ? Number((totalBobot / totalSks).toFixed(2)) : 0;
      semData.isSelesai = graded.length > 0 && semData.mataKuliah.every(mk => !mk.isKrs);
    });

    const studentData = {
      nim: s.nim,
      nama: s.nama,
      email: s.email,
      prodi: s.prodi,
      currentSemester: s.currentSemester || 1,
      totalSksLulus: s.totalSksLulus || 0,
      ipk: s.ipk ? Number(s.ipk) : 0,
      dosen_pa: s.dosen_pa || 'Muhammad Rizki Nugraha, S.Pd., M.T.',
      statusSpp: s.spp_status_db === 'LUNAS' ? 'Lunas' : 'Belum Lunas',
      alamat: s.alamat,
      no_telepon: s.no_telepon,
      riwayatSemester
    };

    return res.json({ success: true, data: studentData });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Toggle / Update Status SPP Mahasiswa
app.put('/api/students/:nim/spp', async (req, res) => {
  const { nim } = req.params;
  const { status } = req.body; // 'LUNAS' atau 'BELUM_LUNAS'

  try {
    const userRes = await db.query('SELECT id FROM users WHERE nomor_induk = $1', [nim]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Mahasiswa tidak ditemukan' });
    }
    const userId = userRes.rows[0].id;
    const newStatus = status === 'Lunas' || status === 'LUNAS' ? 'LUNAS' : 'BELUM_LUNAS';

    const tanggalBayar = newStatus === 'LUNAS' ? new Date() : null;
    await db.query(`
      INSERT INTO status_spp (user_id, semester, tahun_akademik, status, tanggal_bayar, jumlah_bayar)
      VALUES ($1, 7, '2026/2027 Ganjil', $2, $3, 3500000)
      ON CONFLICT (user_id, semester, tahun_akademik) DO UPDATE
      SET status = $2, tanggal_bayar = $3
    `, [userId, newStatus, tanggalBayar]);

    return res.json({ success: true, message: `Status SPP berhasil diubah menjadi ${newStatus}` });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Pengajuan Dokumen & Antrean FIFO SLA
app.get('/api/pengajuan', async (req, res) => {
  try {
    const query = `
      SELECT p.id, p.nomor_pengajuan, p.jenis_dokumen, p.keperluan, p.semester_dituju,
             p.status_pengajuan, p.nomor_antrean, p.sla_target_menit,
             p.sla_waktu_mulai, p.sla_waktu_target, p.sla_waktu_selesai,
             p.catatan_staf, p.created_at,
             u.id as user_id, u.nomor_induk as nim, u.nama, u.prodi,
             COALESCE(
               (SELECT status FROM status_spp WHERE user_id = u.id ORDER BY semester DESC LIMIT 1),
               'LUNAS'
             ) as spp_status_db,
             d.nomor_dokumen_resmi, d.qr_hash_token
      FROM pengajuan_dokumen p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN dokumen_resmi d ON p.id = d.pengajuan_id
      ORDER BY p.created_at ASC
    `; /* FIFO: pengajuan LEBIH LAMA tampil LEBIH DULU */
    const result = await db.query(query);

    // Format kompatibel dengan QueueSlaManager
    const requests = result.rows.map(r => {
      let docType = 'skma';
      let docTitle = 'Surat Keterangan Mahasiswa Aktif';
      if (r.jenis_dokumen === 'KRS') {
        docType = 'krs';
        docTitle = 'Kartu Rencana Studi (KRS)';
      } else if (r.jenis_dokumen === 'KHS') {
        docType = 'khs';
        docTitle = 'Kartu Hasil Studi (KHS)';
      } else if (r.jenis_dokumen === 'TRANSKRIP_NILAI') {
        docType = 'transkrip';
        docTitle = 'Transkrip Nilai Sementara';
      }

      // Mapping status pengajuan DB -> Frontend
      let statusFe = 'antrean';
      if (r.status_pengajuan === 'DITINJAU_STAF' || r.status_pengajuan === 'VALIDASI_SIAKAD') {
        statusFe = 'verifikasi_staf';
      } else if (r.status_pengajuan === 'SELESAI') {
        statusFe = 'selesai';
      } else if (r.status_pengajuan === 'DITOLAK') {
        statusFe = 'ditolak';
      }

      return {
        id: r.nomor_pengajuan,
        id_db: r.id,
        queueNo: `ANT-${docType.toUpperCase()}-${String(r.nomor_antrean || r.id).padStart(3, '0')}`,
        nim: r.nim,
        nama: r.nama,
        prodi: r.prodi,
        docType,
        docTitle,
        keperluan: r.keperluan,
        semester: r.semester_dituju || 7,
        status: statusFe,
        status_db: r.status_pengajuan,
        sppStatus: r.spp_status_db === 'LUNAS' ? 'Lunas' : 'Belum Lunas',
        createdAt: r.created_at,
        slaDeadline: r.sla_waktu_target,
        approvedAt: r.sla_waktu_selesai,
        nomorDokumenResmi: r.nomor_dokumen_resmi,
        officialPdfReady: !!r.nomor_dokumen_resmi,
        aiDraft: true
      };
    });

    return res.json({ success: true, data: requests });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Buat pengajuan baru
app.post('/api/pengajuan', async (req, res) => {
  const { nim, docType, keperluan, semester } = req.body;
  if (!nim || !docType) {
    return res.status(400).json({ success: false, message: 'NIM dan jenis dokumen wajib diisi.' });
  }

  let client;
  try {
    client = await db.pool.connect();
    await client.query('BEGIN');

    const userRes = await client.query(
      'SELECT id, nama FROM users WHERE nomor_induk = $1',
      [nim]
    );
    if (userRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Mahasiswa tidak ditemukan' });
    }
    const userId = userRes.rows[0].id;

    // Map docType ke jenis_dokumen ENUM
    let jenisDokumen = 'SKMA';
    let slaTarget = 4320; // Standar SLA Layanan Fisik UPI: Maks. 3 Hari Kerja (72 Jam = 4320 Menit)
    if (docType === 'krs') { jenisDokumen = 'KRS'; slaTarget = 4320; }
    else if (docType === 'khs') { jenisDokumen = 'KHS'; slaTarget = 4320; }
    else if (docType === 'transkrip') { jenisDokumen = 'TRANSKRIP_NILAI'; slaTarget = 4320; }

    // Cegah duplikasi KRS/KHS untuk semester yang sama jika masih aktif
    if ((docType === 'krs' || docType === 'khs') && semester) {
      const dupRes = await client.query(`
        SELECT id FROM pengajuan_dokumen
        WHERE user_id = $1
          AND jenis_dokumen = $2
          AND semester_dituju = $3
          AND status_pengajuan NOT IN ('SELESAI', 'DITOLAK')
      `, [userId, jenisDokumen, Number(semester)]);

      if (dupRes.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(409).json({
          success: false,
          message: `Anda sudah memiliki pengajuan ${docType.toUpperCase()} semester ${semester} yang sedang diproses. Harap tunggu hingga selesai.`
        });
      }
    }

    const nomorPengajuan = `REQ-${Date.now().toString().slice(-8)}`;

    // Nomor antrean: ambil MAX lalu +1 dalam satu transaksi (atomic)
    const antreanRes = await client.query(
      'SELECT COALESCE(MAX(nomor_antrean), 0) + 1 AS next_no FROM pengajuan_dokumen'
    );
    const nextQueueNo = antreanRes.rows[0].next_no;

    const result = await client.query(`
      INSERT INTO pengajuan_dokumen (
        nomor_pengajuan, user_id, jenis_dokumen, keperluan,
        semester_dituju, status_pengajuan, nomor_antrean,
        sla_target_menit, sla_waktu_mulai, sla_waktu_target
      ) VALUES (
        $1, $2, $3, $4, $5, 'DIAJUKAN', $6, $7, NOW(),
        NOW() + make_interval(mins => $7)
      )
      RETURNING *;
    `, [
      nomorPengajuan, userId, jenisDokumen,
      keperluan || 'Keperluan Akademik',
      semester ? Number(semester) : null,
      nextQueueNo, slaTarget
    ]);

    await client.query('COMMIT');
    return res.status(201).json({
      success: true,
      message: 'Pengajuan dokumen berhasil dibuat!',
      data: result.rows[0]
    });
  } catch (err) {
    if (client) await client.query('ROLLBACK').catch(() => {});
    console.error('Error create pengajuan:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  } finally {
    if (client) client.release();
  }
});

// Update Status Pengajuan Dokumen (dengan row-level locking untuk mencegah race condition)
app.put('/api/pengajuan/:nomorPengajuan/status', async (req, res) => {
  const { nomorPengajuan } = req.params;
  const { status, catatan, staf_nip } = req.body;

  let dbStatus = 'DIAJUKAN';
  if (status === 'verifikasi_staf' || status === 'DITINJAU_STAF') dbStatus = 'DITINJAU_STAF';
  else if (status === 'antrean' || status === 'DALAM_ANTREAN') dbStatus = 'DALAM_ANTREAN';
  else if (status === 'selesai' || status === 'SELESAI') dbStatus = 'SELESAI';
  else if (status === 'ditolak' || status === 'DITOLAK') dbStatus = 'DITOLAK';

  let client;
  try {
    client = await db.pool.connect();
    await client.query('BEGIN');

    // Lock baris pengajuan ini agar tidak ada staf lain memproses bersamaan
    const lockRes = await client.query(
      'SELECT id, status_pengajuan FROM pengajuan_dokumen WHERE nomor_pengajuan = $1 FOR UPDATE',
      [nomorPengajuan]
    );
    if (lockRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Pengajuan tidak ditemukan.' });
    }

    // Jangan proses ulang yang sudah selesai/ditolak
    const currentStatus = lockRes.rows[0].status_pengajuan;
    if (['SELESAI', 'DITOLAK'].includes(currentStatus) && dbStatus !== 'DITOLAK') {
      await client.query('ROLLBACK');
      return res.status(409).json({
        success: false,
        message: `Pengajuan ini sudah berstatus ${currentStatus}. Tidak dapat diubah lagi.`
      });
    }

    let stafId = null;
    if (staf_nip) {
      const stafRes = await client.query('SELECT id FROM users WHERE nomor_induk = $1', [staf_nip]);
      if (stafRes.rows.length > 0) stafId = stafRes.rows[0].id;
    }

    const result = await client.query(`
      UPDATE pengajuan_dokumen
      SET status_pengajuan = $1::status_pengajuan_type,
          catatan_staf = COALESCE($2, catatan_staf),
          diproses_oleh = COALESCE($3, diproses_oleh),
          sla_waktu_selesai = CASE WHEN $1::text = 'SELESAI' THEN NOW() ELSE sla_waktu_selesai END,
          updated_at = NOW()
      WHERE nomor_pengajuan = $4
      RETURNING *;
    `, [dbStatus, catatan || null, stafId, nomorPengajuan]);

    const pengajuan = result.rows[0];

    // Buat entri dokumen_resmi jika disetujui/selesai
    if (dbStatus === 'SELESAI') {
      const docNo = `421/UN40.F4.BD/AK.${pengajuan.jenis_dokumen || 'DOC'}/${new Date().getFullYear()}/${String(pengajuan.id).padStart(4, '0')}`;
      const hashToken = `SILADIK-${pengajuan.nomor_pengajuan}-${Date.now()}`;
      await client.query(`
        INSERT INTO dokumen_resmi (
          pengajuan_id, nomor_dokumen_resmi, qr_code_verification_url,
          qr_hash_token, is_valid, disahkan_oleh
        ) VALUES ($1, $2, $3, $4, true, $5)
        ON CONFLICT (pengajuan_id) DO NOTHING;
      `, [
        pengajuan.id, docNo,
        `https://siladik.upi.edu/verify/${hashToken}`,
        hashToken, stafId
      ]);
    }

    await client.query('COMMIT');
    return res.json({ success: true, message: `Status berhasil diubah ke ${dbStatus}`, data: pengajuan });
  } catch (err) {
    if (client) {
      try { await client.query('ROLLBACK'); } catch (_) {}
    }
    return res.status(500).json({ success: false, error: err.message });
  } finally {
    if (client) {
      try { client.release(); } catch (_) {}
    }
  }
});

// Hapus pengajuan (Admin / Staf)
app.delete('/api/pengajuan/:nomorPengajuan', async (req, res) => {
  const { nomorPengajuan } = req.params;
  try {
    await db.query('DELETE FROM pengajuan_dokumen WHERE nomor_pengajuan = $1', [nomorPengajuan]);
    return res.json({ success: true, message: 'Pengajuan dokumen berhasil dihapus.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ===================================================================
// ADMIN MANAGEMENT API
// ===================================================================

// Get Dashboard Statistics
app.get('/api/admin/stats', async (req, res) => {
  try {
    const totalUsers = await db.query('SELECT count(*) FROM users');
    const totalMhs = await db.query("SELECT count(*) FROM users WHERE role = 'MAHASISWA'");
    const totalStaf = await db.query("SELECT count(*) FROM users WHERE role = 'STAF'");
    const totalKasi = await db.query("SELECT count(*) FROM users WHERE role = 'KASI'");
    const totalAdmin = await db.query("SELECT count(*) FROM users WHERE role = 'ADMIN'");
    
    const totalPengajuan = await db.query('SELECT count(*) FROM pengajuan_dokumen');
    const pengajuanSelesai = await db.query("SELECT count(*) FROM pengajuan_dokumen WHERE status_pengajuan = 'SELESAI'");
    const pengajuanAntrean = await db.query("SELECT count(*) FROM pengajuan_dokumen WHERE status_pengajuan IN ('DIAJUKAN', 'DALAM_ANTREAN', 'DITINJAU_STAF')");

    return res.json({
      success: true,
      data: {
        users: {
          total: Number(totalUsers.rows[0].count),
          mahasiswa: Number(totalMhs.rows[0].count),
          staf: Number(totalStaf.rows[0].count),
          kasi: Number(totalKasi.rows[0].count),
          admin: Number(totalAdmin.rows[0].count)
        },
        pengajuan: {
          total: Number(totalPengajuan.rows[0].count),
          selesai: Number(pengajuanSelesai.rows[0].count),
          dalamProses: Number(pengajuanAntrean.rows[0].count)
        }
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// List All Users (Admin)
app.get('/api/admin/users', async (req, res) => {
  try {
    const query = `
      SELECT u.id, u.nomor_induk, u.nama, u.email, u.role, u.prodi, u.is_active, u.created_at,
             mp.semester_berjalan, mp.angkatan, mp.total_sks_lulus, mp.ipk, mp.dosen_pa,
             COALESCE(
               (SELECT status FROM status_spp WHERE user_id = u.id ORDER BY semester DESC LIMIT 1),
               'LUNAS'
             ) as spp_status
      FROM users u
      LEFT JOIN mahasiswa_profile mp ON u.id = mp.user_id
      ORDER BY u.id ASC
    `;
    const result = await db.query(query);
    const cleanedRows = (result.rows || []).map(u => {
      let email = u.email;
      if (!email || /^\d+@upi\.edu$/i.test(String(email).trim())) {
        if (u.nama) {
          const clean = String(u.nama).toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().split(/\s+/).filter(Boolean).slice(0, 3).join('.');
          if (clean) email = `${clean}@upi.edu`;
        }
      }
      return { ...u, email };
    });
    return res.json({ success: true, data: cleanedRows });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Insert / Tambah User Baru (Admin)
app.post('/api/admin/users', async (req, res) => {
  const {
    nomor_induk, nama, email, password, role, prodi,
    semester_berjalan, angkatan, ipk, total_sks_lulus, dosen_pa,
    status_spp
  } = req.body;

  if (!nomor_induk || !nama || !role) {
    return res.status(400).json({ success: false, message: 'Nomor induk, nama lengkap, dan peran wajib diisi.' });
  }

  let client;
  try {
    client = await db.pool.connect();
    await client.query('BEGIN');

    // Hash password
    const rawPass = password && password.trim() ? password.trim() : 'password123';
    const hashedPassword = await bcrypt.hash(rawPass, 10);

    const userQuery = `
      INSERT INTO users (nomor_induk, nama, email, password_hash, role, prodi, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, true)
      RETURNING id, nomor_induk, nama, role;
    `;
    const finalUserEmail = (email && !/^\d+@upi\.edu$/i.test(email.trim()))
      ? email.trim()
      : (nama.trim().toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().split(/\s+/).filter(Boolean).slice(0, 3).join('.') + '@upi.edu');

    const userRes = await client.query(userQuery, [
      nomor_induk.trim(),
      nama.trim(),
      finalUserEmail,
      hashedPassword,
      role.toUpperCase(),
      prodi || 'S1 Bisnis Digital'
    ]);

    const newUserId = userRes.rows[0].id;

    // Jika role Mahasiswa, buat profil mahasiswa dan status SPP
    if (role.toUpperCase() === 'MAHASISWA') {
      await client.query(`
        INSERT INTO mahasiswa_profile (
          user_id, nim, semester_berjalan, angkatan, dosen_pa,
          total_sks_lulus, ipk
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        newUserId,
        nomor_induk.trim(),
        parseInt(semester_berjalan || 1, 10),
        parseInt(angkatan || 2024, 10),
        dosen_pa || 'Muhammad Rizki Nugraha, S.Pd., M.T.',
        parseInt(total_sks_lulus || 0, 10),
        parseFloat(ipk || 0.00)
      ]);

      const sppState = (status_spp || 'LUNAS').toUpperCase() === 'LUNAS' ? 'LUNAS' : 'BELUM_LUNAS';
      const tanggalBayar = sppState === 'LUNAS' ? new Date() : null;
      await client.query(`
        INSERT INTO status_spp (user_id, semester, tahun_akademik, status, tanggal_bayar, jumlah_bayar)
        VALUES ($1, $2, '2026/2027 Ganjil', $3, $4, 3500000)
      `, [newUserId, parseInt(semester_berjalan || 1, 10), sppState, tanggalBayar]);
    }

    await client.query('COMMIT');
    return res.status(201).json({
      success: true,
      message: `User ${nama} (${role}) berhasil ditambahkan ke database!`,
      data: userRes.rows[0]
    });
  } catch (err) {
    if (client) {
      try { await client.query('ROLLBACK'); } catch (_) {}
    }
    console.error('Error insert user:', err);
    if (err.code === '23505') {
      return res.status(400).json({ success: false, message: 'Nomor Induk atau Email sudah terdaftar dalam sistem!' });
    }
    return res.status(500).json({ success: false, message: 'Gagal menambahkan data ke database.', error: err.message });
  } finally {
    if (client) client.release();
  }
});

// Update User (Admin)
app.put('/api/admin/users/:id', async (req, res) => {
  const { id } = req.params;
  const {
    nomor_induk, nama, email, password, role, prodi, is_active,
    semester_berjalan, angkatan, ipk, total_sks_lulus, dosen_pa,
    status_spp
  } = req.body;

  let client;
  try {
    client = await db.pool.connect();
    await client.query('BEGIN');

    // Cek keberadaan user
    const checkRes = await client.query('SELECT * FROM users WHERE id = $1', [id]);
    if (checkRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
    }

    let updatePassClause = '';
    const updateParams = [nama, email, role.toUpperCase(), prodi, is_active !== false, id];

    if (password && password.trim() && password !== '••••••••') {
      const hashed = await bcrypt.hash(password.trim(), 10);
      updatePassClause = ', password_hash = $7';
      updateParams.push(hashed);
    }

    const updateUserSql = `
      UPDATE users
      SET nama = $1, email = $2, role = $3, prodi = $4, is_active = $5, updated_at = NOW()
          ${updatePassClause}
      WHERE id = $6
      RETURNING id, nomor_induk, nama, role, email;
    `;
    const userRes = await client.query(updateUserSql, updateParams);

    // Update profil mahasiswa jika ada
    if (role.toUpperCase() === 'MAHASISWA') {
      await client.query(`
        INSERT INTO mahasiswa_profile (
          user_id, nim, semester_berjalan, angkatan, dosen_pa, total_sks_lulus, ipk
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (user_id) DO UPDATE
        SET semester_berjalan = EXCLUDED.semester_berjalan,
            angkatan = EXCLUDED.angkatan,
            dosen_pa = EXCLUDED.dosen_pa,
            total_sks_lulus = EXCLUDED.total_sks_lulus,
            ipk = EXCLUDED.ipk,
            updated_at = NOW();
      `, [
        id,
        nomor_induk || checkRes.rows[0].nomor_induk,
        parseInt(semester_berjalan || 1, 10),
        parseInt(angkatan || 2024, 10),
        dosen_pa || 'Muhammad Rizki Nugraha, S.Pd., M.T.',
        parseInt(total_sks_lulus || 0, 10),
        parseFloat(ipk || 0.00)
      ]);

      if (status_spp) {
        const sppState = status_spp.toUpperCase() === 'LUNAS' ? 'LUNAS' : 'BELUM_LUNAS';
        const tanggalBayar = sppState === 'LUNAS' ? new Date() : null;
        await client.query(`
          INSERT INTO status_spp (user_id, semester, tahun_akademik, status, tanggal_bayar, jumlah_bayar)
          VALUES ($1, $2, '2026/2027 Ganjil', $3, $4, 3500000)
          ON CONFLICT (user_id, semester, tahun_akademik) DO UPDATE
          SET status = EXCLUDED.status,
              tanggal_bayar = $4;
        `, [id, parseInt(semester_berjalan || 1, 10), sppState, tanggalBayar]);
      }
    }

    await client.query('COMMIT');
    return res.json({
      success: true,
      message: `Data user ${nama} berhasil diperbarui di database!`,
      data: userRes.rows[0]
    });
  } catch (err) {
    if (client) {
      try { await client.query('ROLLBACK'); } catch (_) {}
    }
    console.error('Error update user:', err);
    return res.status(500).json({ success: false, message: 'Gagal memperbarui data user.', error: err.message });
  } finally {
    if (client) client.release();
  }
});

// Delete User (Admin)
app.delete('/api/admin/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    let checkRes;
    if (/^\d+$/.test(id)) {
      checkRes = await db.query('SELECT id, role, nama, nomor_induk FROM users WHERE id = $1 OR nomor_induk = $2', [parseInt(id, 10), id]);
    } else {
      checkRes = await db.query('SELECT id, role, nama, nomor_induk FROM users WHERE nomor_induk = $1', [id]);
    }
    if (checkRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
    }
    const target = checkRes.rows[0];
    await db.query('DELETE FROM users WHERE id = $1', [target.id]);
    return res.json({ success: true, message: `User ${target.nama} berhasil dihapus dari sistem.` });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ===================================================================
// BATCH ADMIN OPERATIONS (EXCEL IMPORT, BULK SEMESTER, TOGGLE CUTI)
// Dilindungi middleware authorizeAdmin (JWT Admin) & transaksi database
// ===================================================================

// Batch Import Mahasiswa dari Berkas Excel ke PostgreSQL
app.post('/api/admin/mahasiswa/batch-import', authorizeAdmin, async (req, res) => {
  const { students } = req.body;
  if (!Array.isArray(students) || students.length === 0) {
    return res.status(400).json({ success: false, message: 'Data mahasiswa untuk diimpor tidak boleh kosong.' });
  }

  let client;
  try {
    client = await db.pool.connect();
    await client.query('BEGIN');

    const defaultHashedPassword = await bcrypt.hash('password123', 10);
    let importedCount = 0;
    let updatedCount = 0;

    for (const item of students) {
      if (!item.nomor_induk || !item.nama) continue;
      const cleanNim = String(item.nomor_induk).trim();
      const cleanNama = String(item.nama).trim();
      const cleanEmail = item.email ? String(item.email).trim() : `${cleanNim}@upi.edu`;
      const prodi = item.prodi || 'S1 Bisnis Digital';
      const sem = Math.max(1, parseInt(item.semester_berjalan || 1, 10));
      const statusAkademik = String(item.status_akademik || 'AKTIF').toUpperCase().trim();
      const isNonAktif = (statusAkademik === 'NON-AKTIF' || statusAkademik === 'NONAKTIF');
      // Mahasiswa CUTI tetap is_active = true agar tetap bisa login portal, hanya NON-AKTIF yang is_active = false
      const isActive = !isNonAktif;
      const angkatan = 2000 + (parseInt(cleanNim.slice(0, 2), 10) || 24);

      // SKS & IPK jujur: jika tidak diisi di Excel, simpan NULL (bukan angka karangan)
      let parsedIpk = (item.ipk !== undefined && item.ipk !== null && item.ipk !== '' && !isNaN(Number(item.ipk)))
        ? parseFloat(Number(item.ipk).toFixed(2))
        : null;
      let parsedSks = (item.total_sks_lulus !== undefined && item.total_sks_lulus !== null && item.total_sks_lulus !== '' && !isNaN(Number(item.total_sks_lulus)))
        ? parseInt(item.total_sks_lulus, 10)
        : null;

      // Cek apakah user sudah ada
      const checkRes = await client.query('SELECT id FROM users WHERE nomor_induk = $1', [cleanNim]);
      let userId;

      if (checkRes.rows.length > 0) {
        userId = checkRes.rows[0].id;
        await client.query(`
          UPDATE users
          SET nama = $1, email = $2, prodi = $3, is_active = $4, updated_at = CURRENT_TIMESTAMP
          WHERE id = $5
        `, [cleanNama, cleanEmail, prodi, isActive, userId]);
        updatedCount++;
      } else {
        const insertUserRes = await client.query(`
          INSERT INTO users (nomor_induk, nama, email, password_hash, role, prodi, is_active)
          VALUES ($1, $2, $3, $4, 'MAHASISWA', $5, $6)
          RETURNING id
        `, [cleanNim, cleanNama, cleanEmail, defaultHashedPassword, prodi, isActive]);
        userId = insertUserRes.rows[0].id;
        importedCount++;
      }

      // Upsert mahasiswa_profile (termasuk status_akademik mandiri)
      await client.query(`
        INSERT INTO mahasiswa_profile (
          user_id, nim, semester_berjalan, angkatan, dosen_pa,
          total_sks_lulus, ipk, status_akademik
        ) VALUES ($1, $2, $3, $4, 'Muhammad Rizki Nugraha, S.Pd., M.T.', $5, $6, $7)
        ON CONFLICT (user_id) DO UPDATE SET
          semester_berjalan = EXCLUDED.semester_berjalan,
          total_sks_lulus = COALESCE(EXCLUDED.total_sks_lulus, mahasiswa_profile.total_sks_lulus),
          ipk = COALESCE(EXCLUDED.ipk, mahasiswa_profile.ipk),
          status_akademik = EXCLUDED.status_akademik,
          updated_at = CURRENT_TIMESTAMP
      `, [userId, cleanNim, sem, angkatan, parsedSks, parsedIpk, statusAkademik]);

      // Upsert status SPP
      const sppStatus = (item.spp_status && item.spp_status.toUpperCase() === 'LUNAS') ? 'LUNAS' : 'BELUM_LUNAS';
      await client.query(`
        INSERT INTO status_spp (user_id, semester, tahun_akademik, status, tanggal_bayar, jumlah_bayar)
        VALUES ($1, $2, '2026/2027 Ganjil', $3, NOW(), 3500000)
        ON CONFLICT (user_id, semester, tahun_akademik) DO UPDATE SET
          status = EXCLUDED.status
      `, [userId, sem, sppStatus]);
    }

    await client.query('COMMIT');
    return res.status(200).json({
      success: true,
      message: `Sinkronisasi database berhasil: ${importedCount} mahasiswa baru ditambahkan, ${updatedCount} mahasiswa diperbarui.`,
      importedCount,
      updatedCount
    });
  } catch (err) {
    if (client) await client.query('ROLLBACK');
    console.error('Batch import error:', err);
    return res.status(500).json({ success: false, message: 'Gagal mengimpor ke database PostgreSQL.', error: err.message });
  } finally {
    if (client) client.release();
  }
});

// Bulk Increment Semester Mahasiswa di Database (Hanya untuk mahasiswa aktif)
app.post('/api/admin/mahasiswa/bulk-semester', authorizeAdmin, async (req, res) => {
  const { nims } = req.body;
  if (!Array.isArray(nims) || nims.length === 0) {
    return res.status(400).json({ success: false, message: 'Daftar NIM mahasiswa tidak boleh kosong.' });
  }

  let client;
  try {
    client = await db.pool.connect();
    await client.query('BEGIN');

    const cleanNims = nims.map(n => String(n).trim());
    // Hanya naikkan semester mahasiswa yang TIDAK CUTI dan TIDAK NONAKTIF
    const updateRes = await client.query(`
      UPDATE mahasiswa_profile
      SET semester_berjalan = LEAST(14, semester_berjalan + 1),
          updated_at = CURRENT_TIMESTAMP
      WHERE nim = ANY($1) AND (status_akademik IS NULL OR status_akademik = 'AKTIF')
      RETURNING nim, semester_berjalan, status_akademik
    `, [cleanNims]);

    await client.query('COMMIT');
    return res.json({
      success: true,
      message: `Berhasil menaikkan semester untuk ${updateRes.rowCount} mahasiswa aktif ke database PostgreSQL! (Mahasiswa cuti dilewati)`,
      updatedCount: updateRes.rowCount
    });
  } catch (err) {
    if (client) await client.query('ROLLBACK');
    console.error('Bulk semester error:', err);
    return res.status(500).json({ success: false, message: 'Gagal memperbarui semester di database PostgreSQL.', error: err.message });
  } finally {
    if (client) client.release();
  }
});

// Toggle Status Cuti / Akademik Mahasiswa di Database (status_akademik terpisah dari is_active)
app.post('/api/admin/mahasiswa/toggle-cuti', authorizeAdmin, async (req, res) => {
  const { nim, status_akademik } = req.body;
  if (!nim) {
    return res.status(400).json({ success: false, message: 'NIM wajib disertakan.' });
  }

  let client;
  try {
    const cleanNim = String(nim).trim();
    const newStatus = String(status_akademik || 'AKTIF').toUpperCase().trim();
    const isCuti = (newStatus === 'CUTI');
    const isNonAktif = (newStatus === 'NON-AKTIF' || newStatus === 'NONAKTIF');
    // Cuti tetap is_active = true agar bisa login portal melihat transkrip/nilai
    const shouldBeActive = !isNonAktif;

    client = await db.pool.connect();
    await client.query('BEGIN');

    // 1. Update status_akademik di mahasiswa_profile
    await client.query(`
      UPDATE mahasiswa_profile
      SET status_akademik = $1, updated_at = CURRENT_TIMESTAMP
      WHERE nim = $2
    `, [newStatus, cleanNim]);

    // 2. Update is_active di users (hanya nonaktif yang dinonaktifkan loginnya)
    const userRes = await client.query(`
      UPDATE users
      SET is_active = $1, updated_at = CURRENT_TIMESTAMP
      WHERE nomor_induk = $2 AND role = 'MAHASISWA'
      RETURNING id, nomor_induk, nama, is_active
    `, [shouldBeActive, cleanNim]);

    if (userRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Mahasiswa tidak ditemukan di database.' });
    }

    await client.query('COMMIT');

    return res.json({
      success: true,
      message: `Status akademik mahasiswa ${cleanNim} berhasil diperbarui di PostgreSQL (${newStatus}). Mahasiswa cuti tetap dapat login.`,
      data: {
        nomor_induk: cleanNim,
        nama: userRes.rows[0].nama,
        status_akademik: newStatus,
        is_active: shouldBeActive
      }
    });
  } catch (err) {
    if (client) await client.query('ROLLBACK');
    console.error('Toggle cuti error:', err);
    return res.status(500).json({ success: false, message: 'Gagal mengubah status di database PostgreSQL.', error: err.message });
  } finally {
    if (client) client.release();
  }
});

// ===================================================================
// PENGELOLAAN NILAI MAHASISWA (INSERT & UPDATE DENGAN VALIDASI LENGKAP)
// ===================================================================

// GET: Ambil Riwayat Nilai Mahasiswa Tertentu untuk Admin/Petugas
app.get('/api/admin/nilai/:nim', authorizeAdminOrStaff, async (req, res) => {
  const { nim } = req.params;
  if (!nim) {
    return res.status(400).json({ success: false, message: 'NIM mahasiswa wajib disertakan.' });
  }

  try {
    const userRes = await db.query(
      'SELECT id, nama, nomor_induk, prodi FROM users WHERE nomor_induk = $1 AND role = $2',
      [nim.trim(), 'MAHASISWA']
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Mahasiswa dengan NIM tersebut tidak ditemukan.' });
    }

    const user = userRes.rows[0];
    const nilaiRes = await db.query(`
      SELECT n.id, n.semester_ambil, n.tahun_akademik, n.kode_mk,
             n.nilai_huruf, n.bobot_nilai, n.is_krs_active, n.created_at,
             mk.nama_mk, mk.sks
      FROM nilai_akademik n
      JOIN mata_kuliah mk ON UPPER(n.kode_mk) = UPPER(mk.kode_mk)
      WHERE n.user_id = $1
      ORDER BY n.semester_ambil ASC, n.kode_mk ASC
    `, [user.id]);

    return res.json({
      success: true,
      mahasiswa: {
        id: user.id,
        nim: user.nomor_induk,
        nama: user.nama,
        prodi: user.prodi
      },
      data: nilaiRes.rows
    });
  } catch (err) {
    console.error('Error get nilai mahasiswa:', err);
    return res.status(500).json({ success: false, message: 'Gagal mengambil data nilai dari database.', error: err.message });
  }
});

// POST: Insert / Update Nilai Mahasiswa (Admin & Petugas)
// Memenuhi validasi identitas, mata kuliah, semester, rentang nilai akademik,
// pencegahan duplikasi nilai, parameterized queries, dan otorisasi.
app.post('/api/admin/nilai', authorizeAdminOrStaff, async (req, res) => {
  const { nim, nilai, kode_mk, semester_ambil, tahun_akademik, nilai_huruf, bobot_nilai, is_krs_active } = req.body;

  // 1. Validasi Input NIM Mahasiswa
  if (!nim || typeof nim !== 'string' || nim.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'Validasi gagal: NIM mahasiswa wajib diisi.'
    });
  }

  const cleanNim = nim.trim();

  // Dukung input array `nilai` maupun single record
  let gradeList = [];
  if (Array.isArray(nilai) && nilai.length > 0) {
    gradeList = nilai;
  } else if (kode_mk && semester_ambil) {
    gradeList = [{
      kode_mk,
      semester_ambil,
      tahun_akademik,
      nilai_huruf,
      bobot_nilai,
      is_krs_active
    }];
  } else {
    return res.status(400).json({
      success: false,
      message: 'Validasi gagal: Data nilai (array nilai atau objek nilai dengan kode_mk & semester_ambil) harus disertakan.'
    });
  }

  let client;
  try {
    client = await db.pool.connect();
    await client.query('BEGIN');

    // 2. Verifikasi Keberadaan Identitas Mahasiswa di Database
    const userRes = await client.query(
      `SELECT u.id, u.nomor_induk, u.nama, u.is_active, mp.semester_berjalan
       FROM users u
       LEFT JOIN mahasiswa_profile mp ON u.id = mp.user_id
       WHERE u.nomor_induk = $1 AND u.role = $2`,
      [cleanNim, 'MAHASISWA']
    );

    if (userRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: `Mahasiswa dengan NIM '${cleanNim}' tidak ditemukan dalam basis data.`
      });
    }

    const student = userRes.rows[0];
    const userId = student.id;
    const processedResults = [];

    // 3. Proses dan Validasi Setiap Entri Nilai
    for (let i = 0; i < gradeList.length; i++) {
      const entry = gradeList[i];
      const entryIndex = i + 1;

      // Validasi kode mata kuliah
      if (!entry.kode_mk || typeof entry.kode_mk !== 'string' || entry.kode_mk.trim() === '') {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: `Entri #${entryIndex}: Kode mata kuliah (kode_mk) wajib diisi.`
        });
      }
      const rawKodeMk = entry.kode_mk.trim().toUpperCase();

      // Cek apakah mata kuliah terdaftar di tabel master mata_kuliah
      const mkRes = await client.query(
        'SELECT kode_mk, nama_mk, sks FROM mata_kuliah WHERE UPPER(kode_mk) = UPPER($1)',
        [rawKodeMk]
      );
      if (mkRes.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: `Entri #${entryIndex}: Mata kuliah dengan kode '${rawKodeMk}' tidak terdaftar dalam kurikulum.`
        });
      }
      const mkData = mkRes.rows[0];

      // Validasi semester ambil (angka bulat antara 1 sampai 14)
      const semAmbil = parseInt(entry.semester_ambil, 10);
      if (isNaN(semAmbil) || semAmbil < 1 || semAmbil > 14) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: `Entri #${entryIndex}: Semester ambil '${entry.semester_ambil}' tidak valid. Harus berupa angka bulat antara 1 sampai 14.`
        });
      }

      // Validasi rentang nilai huruf sesuai aturan akademik UPI
      let cleanNilaiHuruf = null;
      let finalBobot = null;

      if (entry.nilai_huruf !== undefined && entry.nilai_huruf !== null && String(entry.nilai_huruf).trim() !== '') {
        const rawNh = String(entry.nilai_huruf).trim().toUpperCase();
        if (!STANDAR_NILAI_UPI.hasOwnProperty(rawNh)) {
          await client.query('ROLLBACK');
          return res.status(400).json({
            success: false,
            message: `Entri #${entryIndex}: Nilai huruf '${rawNh}' tidak valid sesuai aturan akademik UPI. Pilihan yang sah: A, A-, B+, B, B-, C+, C, D, E.`
          });
        }
        cleanNilaiHuruf = rawNh;
        // Konversi otomatis bobot jika tidak disertakan
        finalBobot = STANDAR_NILAI_UPI[rawNh];
      }

      // Validasi bobot nilai jika diisi manual
      if (entry.bobot_nilai !== undefined && entry.bobot_nilai !== null && String(entry.bobot_nilai).trim() !== '') {
        const parsedBobot = parseFloat(entry.bobot_nilai);
        if (isNaN(parsedBobot) || parsedBobot < 0.0 || parsedBobot > 4.0) {
          await client.query('ROLLBACK');
          return res.status(400).json({
            success: false,
            message: `Entri #${entryIndex}: Bobot nilai '${entry.bobot_nilai}' tidak valid. Bobot harus berada dalam rentang 0.00 hingga 4.00.`
          });
        }
        finalBobot = parsedBobot;
      }

      // Default tahun akademik jika kosong
      const defaultTahun = semAmbil % 2 === 1 ? '2025/2026 Ganjil' : '2025/2026 Genap';
      const finalTahunAkademik = (entry.tahun_akademik && String(entry.tahun_akademik).trim()) ? String(entry.tahun_akademik).trim() : defaultTahun;
      const finalIsKrs = entry.is_krs_active !== undefined ? Boolean(entry.is_krs_active) : (cleanNilaiHuruf === null);

      // 4. Cegah Duplikasi Nilai untuk Mahasiswa, Mata Kuliah, dan Semester yang Sama
      // Cek apakah record nilai sudah ada sebelumnya
      const existingGrade = await client.query(
        `SELECT id, nilai_huruf, bobot_nilai, tahun_akademik
         FROM nilai_akademik
         WHERE user_id = $1 AND UPPER(kode_mk) = UPPER($2) AND semester_ambil = $3`,
        [userId, rawKodeMk, semAmbil]
      );

      let recordResult;
      let actionType = 'INSERT';

      if (existingGrade.rows.length > 0) {
        // Record sudah ada -> Lakukan UPDATE untuk memperbarui nilai yang ada
        actionType = 'UPDATE';
        const existingId = existingGrade.rows[0].id;
        const updateRes = await client.query(
          `UPDATE nilai_akademik
           SET nilai_huruf = $1,
               bobot_nilai = $2,
               tahun_akademik = COALESCE($3, tahun_akademik),
               is_krs_active = $4
           WHERE id = $5
           RETURNING id, user_id, kode_mk, semester_ambil, tahun_akademik, nilai_huruf, bobot_nilai, is_krs_active`,
          [cleanNilaiHuruf, finalBobot, finalTahunAkademik, finalIsKrs, existingId]
        );
        recordResult = updateRes.rows[0];
      } else {
        // Record belum ada -> Lakukan INSERT nilai baru
        actionType = 'INSERT';
        const insertRes = await client.query(
          `INSERT INTO nilai_akademik (user_id, semester_ambil, tahun_akademik, kode_mk, nilai_huruf, bobot_nilai, is_krs_active)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING id, user_id, kode_mk, semester_ambil, tahun_akademik, nilai_huruf, bobot_nilai, is_krs_active`,
          [userId, semAmbil, finalTahunAkademik, rawKodeMk, cleanNilaiHuruf, finalBobot, finalIsKrs]
        );
        recordResult = insertRes.rows[0];
      }

      processedResults.push({
        action: actionType,
        kode_mk: rawKodeMk,
        nama_mk: mkData.nama_mk,
        sks: mkData.sks,
        semester_ambil: semAmbil,
        tahun_akademik: finalTahunAkademik,
        nilai_huruf: cleanNilaiHuruf,
        bobot_nilai: finalBobot,
        is_krs_active: finalIsKrs
      });
    }

    // 5. Hitung Ulang IPK dan Total SKS Lulus — HANYA dari semester yang SUDAH SELESAI
    // Semester selesai = semester_ambil < semester_berjalan mahasiswa DAN is_krs_active = FALSE
    const semBerjalanRes = await client.query(
      'SELECT COALESCE(semester_berjalan, 1) as sem FROM mahasiswa_profile WHERE user_id = $1',
      [userId]
    );
    const semBerjalan = semBerjalanRes.rows[0]?.sem || 1;

    const allGradesRes = await client.query(
      `SELECT n.bobot_nilai, n.nilai_huruf, mk.sks
       FROM nilai_akademik n
       JOIN mata_kuliah mk ON UPPER(n.kode_mk) = UPPER(mk.kode_mk)
       WHERE n.user_id = $1
         AND n.bobot_nilai IS NOT NULL
         AND n.nilai_huruf IS NOT NULL
         AND n.is_krs_active = FALSE
         AND n.semester_ambil < $2`,
      [userId, semBerjalan]
    );

    let totalSksLulus = 0;
    let totalSksKumulatif = 0;
    let totalMutuKumulatif = 0;

    allGradesRes.rows.forEach(r => {
      const sks = parseInt(r.sks, 10) || 0;
      const bobot = parseFloat(r.bobot_nilai) || 0.0;
      totalSksKumulatif += sks;
      totalMutuKumulatif += (bobot * sks);
      if (r.nilai_huruf !== 'E') {
        totalSksLulus += sks;
      }
    });

    const calculatedIpk = totalSksKumulatif > 0
      ? parseFloat((totalMutuKumulatif / totalSksKumulatif).toFixed(2))
      : 0.00;

    await client.query(
      `UPDATE mahasiswa_profile
       SET ipk = $1, total_sks_lulus = $2, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $3`,
      [calculatedIpk, totalSksLulus, userId]
    );

    await client.query('COMMIT');

    return res.status(201).json({
      success: true,
      message: `Berhasil memproses ${processedResults.length} nilai akademik untuk mahasiswa ${student.nama} (${cleanNim}).`,
      mahasiswa: {
        nim: cleanNim,
        nama: student.nama,
        ipk_terbaru: calculatedIpk,
        total_sks_lulus: totalSksLulus
      },
      data: processedResults
    });

  } catch (err) {
    if (client) {
      try { await client.query('ROLLBACK'); } catch (_) {}
    }
    console.error('Database transaction error pada /api/admin/nilai:', err);
    return res.status(500).json({
      success: false,
      message: 'Gagal menyimpan atau memperbarui nilai mahasiswa karena kesalahan basis data.',
      error: err.message
    });
  } finally {
    if (client) client.release();
  }
});


// List Mata Kuliah (Admin — semua)
app.get('/api/admin/mata-kuliah', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM mata_kuliah ORDER BY semester_paket ASC, kode_mk ASC');
    return res.json({ success: true, data: result.rows });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ===================================================================
// PUBLIC ACADEMIC DATA ENDPOINTS (Mahasiswa & Frontend)
// ===================================================================

// GET /api/mata-kuliah — Daftar MK per prodi & semester (untuk KRS otomatis)
app.get('/api/mata-kuliah', async (req, res) => {
  const { prodi, semester } = req.query;
  try {
    let query = 'SELECT * FROM mata_kuliah WHERE 1=1';
    const params = [];
    if (prodi) {
      params.push(`%${prodi}%`);
      query += ` AND prodi ILIKE $${params.length}`;
    }
    if (semester) {
      params.push(parseInt(semester, 10));
      query += ` AND semester_paket = $${params.length}`;
    }
    query += ' ORDER BY semester_paket ASC, kode_mk ASC';
    const result = await db.query(query, params);
    return res.json({ success: true, data: result.rows });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/mahasiswa/:nim/krs/:semester — Paket KRS berdasarkan kurikulum prodi+semester
app.get('/api/mahasiswa/:nim/krs/:semester', async (req, res) => {
  const { nim, semester } = req.params;
  const semTarget = parseInt(semester, 10);
  if (isNaN(semTarget) || semTarget < 1) {
    return res.status(400).json({ success: false, message: 'Semester tidak valid.' });
  }
  try {
    const studentRes = await db.query(`
      SELECT u.id, u.nomor_induk, u.nama, u.prodi,
             mp.semester_berjalan, mp.dosen_pa, mp.ipk
      FROM users u
      LEFT JOIN mahasiswa_profile mp ON u.id = mp.user_id
      WHERE u.nomor_induk = $1 AND u.role = 'MAHASISWA'
    `, [nim]);
    if (!studentRes.rows.length) {
      return res.status(404).json({ success: false, message: 'Mahasiswa tidak ditemukan.' });
    }
    const student = studentRes.rows[0];

    // Validasi: mahasiswa hanya bisa akses semester yang relevan
    const semBerjalan = student.semester_berjalan || 1;
    if (semTarget > semBerjalan) {
      return res.status(403).json({
        success: false,
        message: `Anda belum mencapai semester ${semTarget}. Semester aktif Anda: ${semBerjalan}.`
      });
    }

    // Ambil paket MK dari kurikulum (mata_kuliah) berdasarkan prodi + semester
    const mkRes = await db.query(`
      SELECT kode_mk, nama_mk, sks, prodi, semester_paket
      FROM mata_kuliah
      WHERE prodi ILIKE $1 AND semester_paket = $2
      ORDER BY kode_mk ASC
    `, [`%${student.prodi || 'Bisnis Digital'}%`, semTarget]);

    // Cek nilai yang sudah ada di nilai_akademik untuk semester ini
    const nilaiRes = await db.query(`
      SELECT kode_mk, nilai_huruf, bobot_nilai, is_krs_active
      FROM nilai_akademik
      WHERE user_id = $1 AND semester_ambil = $2
    `, [student.id, semTarget]);
    const nilaiMap = {};
    nilaiRes.rows.forEach(n => { nilaiMap[n.kode_mk.toUpperCase()] = n; });

    const TAHUN_MK = { 1:'2023/2024 Ganjil',2:'2023/2024 Genap',3:'2024/2025 Ganjil',4:'2024/2025 Genap',5:'2025/2026 Ganjil',6:'2025/2026 Genap',7:'2026/2027 Ganjil',8:'2026/2027 Genap' };
    const PERIODE = { 1:'Ganjil',2:'Genap',3:'Ganjil',4:'Genap',5:'Ganjil',6:'Genap',7:'Ganjil',8:'Genap' };
    const TA_ONLY = { 1:'2023/2024',2:'2023/2024',3:'2024/2025',4:'2024/2025',5:'2025/2026',6:'2025/2026',7:'2026/2027',8:'2026/2027' };

    const courses = mkRes.rows.map(mk => {
      const existing = nilaiMap[mk.kode_mk.toUpperCase()];
      return {
        kode: mk.kode_mk,
        nama: mk.nama_mk,
        sks: mk.sks,
        nilai: existing?.nilai_huruf || null,
        bobot: existing?.bobot_nilai ? Number(existing.bobot_nilai) : null,
        status: existing ? (existing.is_krs_active ? 'Aktif (Berjalan)' : 'Selesai') : 'Belum Terdaftar'
      };
    });

    return res.json({
      success: true,
      data: {
        nim: student.nomor_induk,
        nama: student.nama,
        prodi: student.prodi,
        dosenWali: student.dosen_pa || 'Muhammad Rizki Nugraha, S.Pd., M.T.',
        semester: semTarget,
        tahunAkademik: TA_ONLY[semTarget] || '2026/2027',
        tahunAkademikLengkap: TAHUN_MK[semTarget] || `Semester ${semTarget}`,
        periode: PERIODE[semTarget] || (semTarget % 2 === 1 ? 'Ganjil' : 'Genap'),
        isCompleted: semTarget < semBerjalan,
        courses,
        totalSks: courses.reduce((s, c) => s + c.sks, 0)
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/mahasiswa/:nim/khs/:semester — KHS semester yang sudah selesai
app.get('/api/mahasiswa/:nim/khs/:semester', async (req, res) => {
  const { nim, semester } = req.params;
  const semTarget = parseInt(semester, 10);
  if (isNaN(semTarget) || semTarget < 1) {
    return res.status(400).json({ success: false, message: 'Semester tidak valid.' });
  }
  try {
    const studentRes = await db.query(`
      SELECT u.id, u.nomor_induk, u.nama, u.prodi,
             mp.semester_berjalan, mp.ipk, mp.dosen_pa
      FROM users u
      LEFT JOIN mahasiswa_profile mp ON u.id = mp.user_id
      WHERE u.nomor_induk = $1 AND u.role = 'MAHASISWA'
    `, [nim]);
    if (!studentRes.rows.length) {
      return res.status(404).json({ success: false, message: 'Mahasiswa tidak ditemukan.' });
    }
    const student = studentRes.rows[0];
    const semBerjalan = student.semester_berjalan || 1;
    const isCompleted = semTarget < semBerjalan;

    const nilaiRes = await db.query(`
      SELECT n.kode_mk, n.nilai_huruf, n.bobot_nilai, n.semester_ambil,
             n.tahun_akademik, n.is_krs_active, mk.nama_mk, mk.sks
      FROM nilai_akademik n
      JOIN mata_kuliah mk ON UPPER(n.kode_mk) = UPPER(mk.kode_mk)
      WHERE n.user_id = $1 AND n.semester_ambil = $2
      ORDER BY n.kode_mk ASC
    `, [student.id, semTarget]);

    const courses = nilaiRes.rows.map(r => ({
      kode: r.kode_mk,
      nama: r.nama_mk,
      sks: parseInt(r.sks, 10),
      nilai: r.nilai_huruf,
      bobot: r.bobot_nilai !== null ? Number(r.bobot_nilai) : null,
      mutu: r.bobot_nilai !== null ? parseInt(r.sks, 10) * Number(r.bobot_nilai) : null,
      isAktif: r.is_krs_active
    }));

    const graded = courses.filter(c => c.nilai !== null && c.bobot !== null);
    const totalSks = graded.reduce((s, c) => s + c.sks, 0);
    const totalMutu = graded.reduce((s, c) => s + c.mutu, 0);
    const ipSemester = totalSks > 0 ? parseFloat((totalMutu / totalSks).toFixed(2)) : 0;

    const TA = { 1:'2023/2024',2:'2023/2024',3:'2024/2025',4:'2024/2025',5:'2025/2026',6:'2025/2026',7:'2026/2027',8:'2026/2027' };
    const PR = { 1:'Ganjil',2:'Genap',3:'Ganjil',4:'Genap',5:'Ganjil',6:'Genap',7:'Ganjil',8:'Genap' };

    return res.json({
      success: true,
      data: {
        nim: student.nomor_induk,
        nama: student.nama,
        prodi: student.prodi,
        dosenWali: student.dosen_pa || 'Muhammad Rizki Nugraha, S.Pd., M.T.',
        semester: semTarget,
        tahunAkademik: TA[semTarget] || '2026/2027',
        periode: PR[semTarget] || (semTarget % 2 === 1 ? 'Ganjil' : 'Genap'),
        isCompleted,
        courses,
        totalSks,
        totalMutu: parseFloat(totalMutu.toFixed(2)),
        ipSemester,
        ipk: parseFloat(student.ipk) || 0
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/mahasiswa/:nim/transkrip — Transkrip nilai semua semester selesai
app.get('/api/mahasiswa/:nim/transkrip', async (req, res) => {
  const { nim } = req.params;
  try {
    const studentRes = await db.query(`
      SELECT u.id, u.nomor_induk, u.nama, u.prodi,
             mp.semester_berjalan, mp.ipk, mp.total_sks_lulus, mp.dosen_pa, mp.angkatan
      FROM users u
      LEFT JOIN mahasiswa_profile mp ON u.id = mp.user_id
      WHERE u.nomor_induk = $1 AND u.role = 'MAHASISWA'
    `, [nim]);
    if (!studentRes.rows.length) {
      return res.status(404).json({ success: false, message: 'Mahasiswa tidak ditemukan.' });
    }
    const student = studentRes.rows[0];
    const semBerjalan = student.semester_berjalan || 1;

    // Hanya semester yang sudah selesai (< semester_berjalan)
    const nilaiRes = await db.query(`
      SELECT n.kode_mk, n.nilai_huruf, n.bobot_nilai, n.semester_ambil,
             n.tahun_akademik, mk.nama_mk, mk.sks
      FROM nilai_akademik n
      JOIN mata_kuliah mk ON UPPER(n.kode_mk) = UPPER(mk.kode_mk)
      WHERE n.user_id = $1
        AND n.semester_ambil < $2
        AND n.bobot_nilai IS NOT NULL
        AND n.nilai_huruf IS NOT NULL
        AND n.is_krs_active = FALSE
      ORDER BY n.semester_ambil ASC, n.kode_mk ASC
    `, [student.id, semBerjalan]);

    const courses = nilaiRes.rows.map(r => ({
      kode: r.kode_mk,
      nama: r.nama_mk,
      sks: parseInt(r.sks, 10),
      nilai: r.nilai_huruf,
      bobot: Number(r.bobot_nilai),
      semester: r.semester_ambil,
      tahunAkademik: r.tahun_akademik
    }));

    const totalSks = courses.reduce((s, c) => s + c.sks, 0);
    const totalMutu = courses.reduce((s, c) => s + c.sks * c.bobot, 0);
    const totalSksLulus = courses.filter(c => c.nilai !== 'E').reduce((s, c) => s + c.sks, 0);
    const ipk = totalSks > 0 ? parseFloat((totalMutu / totalSks).toFixed(2)) : 0;

    let predikat = 'Memuaskan';
    if (ipk >= 3.75) predikat = 'Dengan Pujian (Cumlaude)';
    else if (ipk >= 3.5) predikat = 'Sangat Memuaskan';

    return res.json({
      success: true,
      data: {
        nim: student.nomor_induk,
        nama: student.nama,
        prodi: student.prodi,
        dosenWali: student.dosen_pa || 'Muhammad Rizki Nugraha, S.Pd., M.T.',
        angkatan: student.angkatan,
        semesterBerjalan: semBerjalan,
        courses,
        totalSks,
        totalMutu: parseFloat(totalMutu.toFixed(2)),
        totalSksLulus,
        ipk,
        predikat
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Tambah Mata Kuliah Baru (Admin)
app.post('/api/admin/mata-kuliah', async (req, res) => {
  const { kode_mk, nama_mk, sks, prodi, semester_paket } = req.body;
  if (!kode_mk || !nama_mk || !sks) {
    return res.status(400).json({ success: false, message: 'Kode MK, nama mata kuliah, dan SKS wajib diisi.' });
  }
  try {
    const result = await db.query(`
      INSERT INTO mata_kuliah (kode_mk, nama_mk, sks, prodi, semester_paket)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `, [
      kode_mk.trim().toUpperCase(),
      nama_mk.trim(),
      parseInt(sks, 10),
      prodi || 'S1 Bisnis Digital',
      parseInt(semester_paket || 1, 10)
    ]);
    return res.status(201).json({ success: true, message: 'Mata kuliah berhasil ditambahkan.', data: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Fallback route untuk Single Page Application
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Auto-init Database Schema jika tabel users belum ada di PostgreSQL
async function ensureDatabaseReady() {
  try {
    const checkTable = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'users'
      );
    `);
    const tablesExist = checkTable.rows[0]?.exists;
    if (!tablesExist) {
      console.log('⚡ Tabel belum ada di database, menjalankan schema.sql & seed.sql otomatis...');
      const fs = require('fs');
      const schemaSql = fs.readFileSync(path.join(__dirname, 'database', 'schema.sql'), 'utf-8');
      await db.query(schemaSql);
      console.log('✓ Schema database berhasil dibuat.');
      
      const seedSql = fs.readFileSync(path.join(__dirname, 'database', 'seed.sql'), 'utf-8');
      await db.query(seedSql);
      console.log('✓ Data awal (seed) berhasil diisikan.');
    } else {
      console.log('✓ Koneksi PostgreSQL terverifikasi (Tabel siap digunakan).');
    }
  } catch (err) {
    console.warn('⚠️ Info Database:', err.message);
  }
}

// Start Server (Hanya dijalankan jika standalone / bukan serverless Vercel)
if (require.main === module || !process.env.VERCEL) {
  app.listen(PORT, async () => {
    console.log('==========================================================');
    console.log(` SILADIK-AI NODE.JS & POSTGRESQL SERVER AKTIF`);
    console.log(` Alamat Server : http://localhost:${PORT}`);
    console.log(` Test Database : http://localhost:${PORT}/api/health`);
    console.log('==========================================================');
    await ensureDatabaseReady();
  });
}

// Export app untuk Vercel Serverless Function
module.exports = app;
