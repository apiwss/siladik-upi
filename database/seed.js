/**
 * SILADIK-AI Database Seeder
 * Mengisi 1 Mahasiswa, 1 Staf, 1 KASI, dan 1 Admin beserta data akademik lengkap
 * Password default semua akun: password123
 */

const bcrypt = require('bcryptjs');
const db = require('../db');

async function runSeed() {
  console.log('--- Memulai Database Seeding SILADIK-AI ---');
  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Hash password
    const hashedPassword = await bcrypt.hash('password123', 10);

    // 2. Clear existing initial data (jika ada) untuk re-seed yang bersih
    console.log('1. Membersihkan data lama...');
    await client.query('DELETE FROM dokumen_resmi');
    await client.query('DELETE FROM pengajuan_dokumen');
    await client.query('DELETE FROM nilai_akademik');
    await client.query('DELETE FROM status_spp');
    await client.query('DELETE FROM mahasiswa_profile');
    await client.query('DELETE FROM users');

    // 3. Insert Users (Mahasiswa, Staf, KASI, Admin)
    console.log('2. Mengisi Users (Mahasiswa, Staf, KASI, Admin)...');
    const insertUsersQuery = `
      INSERT INTO users (nomor_induk, nama, email, password_hash, role, prodi, is_active)
      VALUES 
        ($1, $2, $3, $4, 'MAHASISWA', 'S1 Bisnis Digital', true),
        ($5, $6, $7, $4, 'STAF', 'S1 Bisnis Digital', true),
        ($8, $9, $10, $4, 'KASI', 'S1 Bisnis Digital', true),
        ($11, $12, $13, $4, 'ADMIN', 'S1 Bisnis Digital', true),
        ('2300159', 'Nazwa Salsabila', 'nazwa.salsabila@upi.edu', $4, 'MAHASISWA', 'S1 Bisnis Digital', true),
        ('2312080', 'Nazwa Difa Nailla', 'nazwa.difa@upi.edu', $4, 'MAHASISWA', 'S1 Bisnis Digital', true),
        ('2300687', 'Zahra Agniasari', 'zahra.agniasari@upi.edu', $4, 'MAHASISWA', 'S1 Bisnis Digital', true)
      RETURNING id, nomor_induk, role;
    `;

    const userRows = await client.query(insertUsersQuery, [
      '2312017', 'Nabil Amanulloh', 'nabil.amanulloh@upi.edu', hashedPassword,
      '198703142014041001', 'Budi Prasetyo, S.Kom.', 'budi_akademik@upi.edu',
      '199105202020121008', 'Muhammad Rizki Nugraha, S.Pd., M.T.', 'rizkinugraha@upi.edu',
      'ADMIN001', 'Administrator Sistem SILADIK', 'admin@upi.edu'
    ]);

    const userByNim = {};
    userRows.rows.forEach(u => {
      userByNim[u.nomor_induk] = u.id;
    });

    const mhsUserId = userByNim['2312017'];
    const stafUserId = userByNim['198703142014041001'];

    // 4. Insert Mahasiswa Profile
    console.log('3. Mengisi Profil Mahasiswa...');
    const mhsProfiles = [
      ['2312017', 'Muhammad Rizki Nugraha, S.Pd., M.T.', 120, 3.89, 7, 2023],
      ['2300159', 'Muhammad Rizki Nugraha, S.Pd., M.T.', 120, 3.84, 7, 2023],
      ['2312080', 'Muhammad Rizki Nugraha, S.Pd., M.T.', 120, 3.75, 7, 2023],
      ['2300687', 'Muhammad Rizki Nugraha, S.Pd., M.T.', 120, 3.75, 7, 2023]
    ];

    for (const [nim, dosenPa, sks, ipk, sem, angk] of mhsProfiles) {
      const uid = userByNim[nim];
      if (uid) {
        await client.query(`
          INSERT INTO mahasiswa_profile (
            user_id, nim, semester_berjalan, angkatan, dosen_pa,
            total_sks_lulus, ipk, alamat, no_telepon
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'Tasikmalaya', '081234567890')
          ON CONFLICT (user_id) DO UPDATE SET ipk = EXCLUDED.ipk, semester_berjalan = EXCLUDED.semester_berjalan;
        `, [uid, nim, sem, angk, dosenPa, sks, ipk]);
      }
    }

    // 5. Insert Status SPP (Semester 1 - 7 LUNAS)
    console.log('4. Mengisi Status Pembayaran SPP...');
    const sppRecords = [
      [1, '2023/2024 Ganjil', 'LUNAS', '2023-08-15', 3500000, 'TRX-SPP-20231-001'],
      [2, '2023/2024 Genap', 'LUNAS', '2024-01-20', 3500000, 'TRX-SPP-20232-002'],
      [3, '2024/2025 Ganjil', 'LUNAS', '2024-08-18', 3500000, 'TRX-SPP-20241-003'],
      [4, '2024/2025 Genap', 'LUNAS', '2025-01-22', 3500000, 'TRX-SPP-20242-004'],
      [5, '2025/2026 Ganjil', 'LUNAS', '2025-08-14', 3500000, 'TRX-SPP-20251-005'],
      [6, '2025/2026 Genap', 'LUNAS', '2026-01-19', 3500000, 'TRX-SPP-20262-006'],
      [7, '2026/2027 Ganjil', 'LUNAS', '2026-08-10', 3500000, 'TRX-SPP-20261-007']
    ];

    for (const record of sppRecords) {
      await client.query(`
        INSERT INTO status_spp (user_id, semester, tahun_akademik, status, tanggal_bayar, jumlah_bayar, nomor_transaksi)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (user_id, semester, tahun_akademik) DO UPDATE
        SET status = EXCLUDED.status, tanggal_bayar = EXCLUDED.tanggal_bayar
      `, [mhsUserId, ...record]);
    }

    // 6. Insert Mata Kuliah (jika belum ada)
    console.log('5. Mengisi Mata Kuliah...');
    const mataKuliahList = [
      ['UFO101', 'Pendidikan Agama', 2, 'S1 Bisnis Digital', 1],
      ['BD101', 'Pengantar Bisnis Digital', 3, 'S1 Bisnis Digital', 1],
      ['UFO102', 'Pancasila & Kewarganegaraan', 2, 'S1 Bisnis Digital', 2],
      ['BD103', 'Prinsip Manajemen', 3, 'S1 Bisnis Digital', 2],
      ['BD301', 'Analisis & Perancangan Sistem', 3, 'S1 Bisnis Digital', 3],
      ['BD302', 'E-Commerce', 3, 'S1 Bisnis Digital', 3],
      ['BD401', 'Pemrograman Web Bisnis', 3, 'S1 Bisnis Digital', 4],
      ['BD402', 'Manajemen Keuangan Digital', 3, 'S1 Bisnis Digital', 4],
      ['BD501', 'Digital Marketing', 3, 'S1 Bisnis Digital', 5],
      ['BD502', 'FinTech', 3, 'S1 Bisnis Digital', 5],
      ['BD601', 'Metodologi Penelitian Bisnis', 3, 'S1 Bisnis Digital', 6],
      ['BD602', 'Manajemen Risiko', 3, 'S1 Bisnis Digital', 6],
      ['BD701', 'Manajemen Strategis Bisnis Digital', 3, 'S1 Bisnis Digital', 7],
      ['BD702', 'Business Intelligence', 3, 'S1 Bisnis Digital', 7]
    ];

    for (const mk of mataKuliahList) {
      await client.query(`
        INSERT INTO mata_kuliah (kode_mk, nama_mk, sks, prodi, semester_paket)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (kode_mk) DO NOTHING;
      `, mk);
    }

    // 7. Insert Nilai Akademik Mahasiswa
    console.log('6. Mengisi Nilai Akademik Mahasiswa...');
    const nilaiList = [
      ['UFO101', 1, '2023/2024 Ganjil', 'A', 4.00, false],
      ['BD101', 1, '2023/2024 Ganjil', 'A', 4.00, false],
      ['UFO102', 2, '2023/2024 Genap', 'A', 4.00, false],
      ['BD103', 2, '2023/2024 Genap', 'A-', 3.75, false],
      ['BD301', 3, '2024/2025 Ganjil', 'A', 4.00, false],
      ['BD302', 3, '2024/2025 Ganjil', 'A-', 3.75, false],
      ['BD401', 4, '2024/2025 Genap', 'A', 4.00, false],
      ['BD402', 4, '2024/2025 Genap', 'A', 4.00, false],
      ['BD501', 5, '2025/2026 Ganjil', 'A', 4.00, false],
      ['BD502', 5, '2025/2026 Ganjil', 'A-', 3.75, false],
      ['BD601', 6, '2025/2026 Genap', 'A', 4.00, false],
      ['BD602', 6, '2025/2026 Genap', 'A-', 3.75, false],
      ['BD701', 7, '2026/2027 Ganjil', 'A', 4.00, true],
      ['BD702', 7, '2026/2027 Ganjil', 'A-', 3.75, true]
    ];

    for (const n of nilaiList) {
      await client.query(`
        INSERT INTO nilai_akademik (user_id, kode_mk, semester_ambil, tahun_akademik, nilai_huruf, bobot_nilai, is_krs_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (user_id, kode_mk, semester_ambil, tahun_akademik) DO UPDATE
        SET nilai_huruf = EXCLUDED.nilai_huruf, bobot_nilai = EXCLUDED.bobot_nilai, is_krs_active = EXCLUDED.is_krs_active;
      `, [mhsUserId, ...n]);
    }

    // 8. Insert Contoh Pengajuan Dokumen awal
    console.log('7. Mengisi Contoh Pengajuan Dokumen Awal...');
    const pengajuanList = [
      [
        'REQ-2026-001', mhsUserId, 'SKMA',
        'Tunjangan Gaji Orang Tua PNS (SKUMPTK)', 7, 'SELESAI',
        1, 15, stafUserId
      ],
      [
        'REQ-2026-002', mhsUserId, 'KRS',
        'Administrasi Magang Merdeka Batch 7', 7, 'DITINJAU_STAF',
        2, 25, null
      ],
      [
        'REQ-2026-003', mhsUserId, 'TRANSKRIP_NILAI',
        'Pendaftaran Beasiswa Indonesia Bangkit 2026', 7, 'DALAM_ANTREAN',
        3, 60, null
      ]
    ];

    for (const p of pengajuanList) {
      const pRes = await client.query(`
        INSERT INTO pengajuan_dokumen (
          nomor_pengajuan, user_id, jenis_dokumen, keperluan, semester_dituju,
          status_pengajuan, nomor_antrean, sla_target_menit, sla_waktu_mulai,
          sla_waktu_target, diproses_oleh
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, NOW(),
          NOW() + make_interval(mins => $8), $9
        )
        RETURNING id;
      `, p);

      // Jika status selesai, buat dokumen resmi
      if (p[5] === 'SELESAI') {
        const pengajuanId = pRes.rows[0].id;
        await client.query(`
          INSERT INTO dokumen_resmi (
            pengajuan_id, nomor_dokumen_resmi, qr_code_verification_url,
            qr_hash_token, is_valid, disahkan_oleh
          ) VALUES (
            $1, '421/UN40.D/AK/2026', 'https://siladik.upi.edu/verify/421-UN40.D-AK-2026',
            'HASH-VERIFY-SKMA-2312017-2026', true, $2
          );
        `, [pengajuanId, stafUserId]);
      }
    }

    await client.query('COMMIT');

    console.log('--- SEED BERHASIL SEPENUHNYA! ---');
    console.log('Akun Tersedia (Password: password123):');
    console.log('1. Mahasiswa : 2312017 (Nabil Amanulloh)');
    console.log('2. Staf      : 198703142014041001 (Budi Prasetyo, S.Kom.)');
    console.log('3. KASI      : 199105202020121008 (Muhammad Rizki Nugraha, S.Pd., M.T.)');
    console.log('4. Admin     : ADMIN001 (Administrator Sistem SILADIK)');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error saat seeding database:', err);
    throw err;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  runSeed().then(() => {
    process.exit(0);
  }).catch(e => {
    console.error(e);
    process.exit(1);
  });
}

module.exports = { runSeed };
