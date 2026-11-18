-- ===================================================================
-- SILADIK-AI: Seed Data Awal (1 Mahasiswa, 1 Staf, 1 KASI, 1 Admin)
-- Password semua akun: password123 (bcrypt hash)
-- ===================================================================

-- 1. INSERT USERS (Password: password123)
INSERT INTO users (nomor_induk, nama, email, password_hash, role, prodi, is_active) VALUES
  ('2300159', 'Nazwa Salsabila', 'nazwa.salsabila@upi.edu', '$2a$10$BReidprKIM0eINWrqeG20eMwYiz7hSz9SlLsWAbZpjgHWNuqXp8my', 'MAHASISWA', 'S1 Bisnis Digital', true),
  ('2312017', 'Nabil Amanulloh', 'nabil.amanulloh@upi.edu', '$2a$10$BReidprKIM0eINWrqeG20eMwYiz7hSz9SlLsWAbZpjgHWNuqXp8my', 'MAHASISWA', 'S1 Bisnis Digital', true),
  ('198703142014041001', 'Budi Prasetyo, S.Kom.', 'budi_akademik@upi.edu', '$2a$10$BReidprKIM0eINWrqeG20eMwYiz7hSz9SlLsWAbZpjgHWNuqXp8my', 'STAF', 'S1 Bisnis Digital', true),
  ('199105202020121008', 'Muhammad Rizki Nugraha, S.Pd., M.T.', 'rizkinugraha@upi.edu', '$2a$10$BReidprKIM0eINWrqeG20eMwYiz7hSz9SlLsWAbZpjgHWNuqXp8my', 'KASI', 'S1 Bisnis Digital', true),
  ('ADMIN001', 'Administrator Sistem SILADIK', 'admin@upi.edu', '$2a$10$BReidprKIM0eINWrqeG20eMwYiz7hSz9SlLsWAbZpjgHWNuqXp8my', 'ADMIN', 'S1 Bisnis Digital', true),
  ('2312080', 'Nazwa Difa Nailla', 'nazwa.difa@upi.edu', '$2a$10$BReidprKIM0eINWrqeG20eMwYiz7hSz9SlLsWAbZpjgHWNuqXp8my', 'MAHASISWA', 'S1 Bisnis Digital', true),
  ('2300687', 'Zahra Agniasari', 'zahra.agniasari@upi.edu', '$2a$10$BReidprKIM0eINWrqeG20eMwYiz7hSz9SlLsWAbZpjgHWNuqXp8my', 'MAHASISWA', 'S1 Bisnis Digital', true)
ON CONFLICT (nomor_induk) DO UPDATE SET password_hash = EXCLUDED.password_hash;

-- 2. INSERT PROFIL MAHASISWA
INSERT INTO mahasiswa_profile (user_id, nim, semester_berjalan, angkatan, dosen_pa, total_sks_lulus, ipk, alamat, no_telepon)
SELECT id, '2312017', 7, 2023, 'Muhammad Rizki Nugraha, S.Pd., M.T.', 120, 3.89, 'Jl. Mayor Utarya No. 29, Kota Tasikmalaya', '081234567890'
FROM users WHERE nomor_induk = '2312017'
ON CONFLICT (user_id) DO UPDATE SET ipk = EXCLUDED.ipk, semester_berjalan = EXCLUDED.semester_berjalan;

-- 3. INSERT STATUS SPP (Semester 1 s/d 7 Lunas)
INSERT INTO status_spp (user_id, semester, tahun_akademik, status, tanggal_bayar, jumlah_bayar, nomor_transaksi)
SELECT u.id, 1, '2023/2024 Ganjil', 'LUNAS', '2023-08-15'::timestamptz, 3500000, 'TRX-SPP-20231-001' FROM users u WHERE u.nomor_induk = '2312017'
ON CONFLICT (user_id, semester, tahun_akademik) DO NOTHING;

INSERT INTO status_spp (user_id, semester, tahun_akademik, status, tanggal_bayar, jumlah_bayar, nomor_transaksi)
SELECT u.id, 2, '2023/2024 Genap', 'LUNAS', '2024-01-20'::timestamptz, 3500000, 'TRX-SPP-20232-002' FROM users u WHERE u.nomor_induk = '2312017'
ON CONFLICT (user_id, semester, tahun_akademik) DO NOTHING;

INSERT INTO status_spp (user_id, semester, tahun_akademik, status, tanggal_bayar, jumlah_bayar, nomor_transaksi)
SELECT u.id, 3, '2024/2025 Ganjil', 'LUNAS', '2024-08-18'::timestamptz, 3500000, 'TRX-SPP-20241-003' FROM users u WHERE u.nomor_induk = '2312017'
ON CONFLICT (user_id, semester, tahun_akademik) DO NOTHING;

INSERT INTO status_spp (user_id, semester, tahun_akademik, status, tanggal_bayar, jumlah_bayar, nomor_transaksi)
SELECT u.id, 4, '2024/2025 Genap', 'LUNAS', '2025-01-22'::timestamptz, 3500000, 'TRX-SPP-20242-004' FROM users u WHERE u.nomor_induk = '2312017'
ON CONFLICT (user_id, semester, tahun_akademik) DO NOTHING;

INSERT INTO status_spp (user_id, semester, tahun_akademik, status, tanggal_bayar, jumlah_bayar, nomor_transaksi)
SELECT u.id, 5, '2025/2026 Ganjil', 'LUNAS', '2025-08-14'::timestamptz, 3500000, 'TRX-SPP-20251-005' FROM users u WHERE u.nomor_induk = '2312017'
ON CONFLICT (user_id, semester, tahun_akademik) DO NOTHING;

INSERT INTO status_spp (user_id, semester, tahun_akademik, status, tanggal_bayar, jumlah_bayar, nomor_transaksi)
SELECT u.id, 6, '2025/2026 Genap', 'LUNAS', '2026-01-19'::timestamptz, 3500000, 'TRX-SPP-20262-006' FROM users u WHERE u.nomor_induk = '2312017'
ON CONFLICT (user_id, semester, tahun_akademik) DO NOTHING;

INSERT INTO status_spp (user_id, semester, tahun_akademik, status, tanggal_bayar, jumlah_bayar, nomor_transaksi)
SELECT u.id, 7, '2026/2027 Ganjil', 'LUNAS', '2026-08-10'::timestamptz, 3500000, 'TRX-SPP-20261-007' FROM users u WHERE u.nomor_induk = '2312017'
ON CONFLICT (user_id, semester, tahun_akademik) DO NOTHING;

-- 4. INSERT MATA KULIAH
INSERT INTO mata_kuliah (kode_mk, nama_mk, sks, prodi, semester_paket) VALUES
  ('UFO101', 'Pendidikan Agama', 2, 'S1 Bisnis Digital', 1),
  ('BD101', 'Pengantar Bisnis Digital', 3, 'S1 Bisnis Digital', 1),
  ('UFO102', 'Pancasila & Kewarganegaraan', 2, 'S1 Bisnis Digital', 2),
  ('BD103', 'Prinsip Manajemen', 3, 'S1 Bisnis Digital', 2),
  ('BD301', 'Analisis & Perancangan Sistem', 3, 'S1 Bisnis Digital', 3),
  ('BD302', 'E-Commerce', 3, 'S1 Bisnis Digital', 3),
  ('BD401', 'Pemrograman Web Bisnis', 3, 'S1 Bisnis Digital', 4),
  ('BD402', 'Manajemen Keuangan Digital', 3, 'S1 Bisnis Digital', 4),
  ('BD501', 'Digital Marketing', 3, 'S1 Bisnis Digital', 5),
  ('BD502', 'FinTech', 3, 'S1 Bisnis Digital', 5),
  ('BD601', 'Metodologi Penelitian Bisnis', 3, 'S1 Bisnis Digital', 6),
  ('BD602', 'Manajemen Risiko', 3, 'S1 Bisnis Digital', 6),
  ('BD701', 'Manajemen Strategis Bisnis Digital', 3, 'S1 Bisnis Digital', 7),
  ('BD702', 'Business Intelligence', 3, 'S1 Bisnis Digital', 7)
ON CONFLICT (kode_mk) DO NOTHING;

-- 5. INSERT NILAI AKADEMIK
INSERT INTO nilai_akademik (user_id, kode_mk, semester_ambil, tahun_akademik, nilai_huruf, bobot_nilai, is_krs_active)
SELECT u.id, mk.kode_mk, mk.semester_paket,
  CASE mk.semester_paket
    WHEN 1 THEN '2023/2024 Ganjil'
    WHEN 2 THEN '2023/2024 Genap'
    WHEN 3 THEN '2024/2025 Ganjil'
    WHEN 4 THEN '2024/2025 Genap'
    WHEN 5 THEN '2025/2026 Ganjil'
    WHEN 6 THEN '2025/2026 Genap'
    WHEN 7 THEN '2026/2027 Ganjil'
  END,
  CASE
    WHEN mk.kode_mk IN ('UFO101','BD101','BD301','BD401','BD501','BD601','BD701') THEN 'A'
    ELSE 'A-'
  END,
  CASE
    WHEN mk.kode_mk IN ('UFO101','BD101','BD301','BD401','BD501','BD601','BD701') THEN 4.00
    ELSE 3.75
  END,
  CASE WHEN mk.semester_paket = 7 THEN TRUE ELSE FALSE END
FROM users u, mata_kuliah mk
WHERE u.nomor_induk = '2312017'
ON CONFLICT (user_id, kode_mk, semester_ambil, tahun_akademik) DO NOTHING;
