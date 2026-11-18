-- ===================================================================
-- SISTEM INFORMASI LAYANAN AKADEMIK DIGITAL TERPADU (SILADIK-AI)
-- Universitas Pendidikan Indonesia Kampus Daerah Tasikmalaya
-- PostgreSQL Pure Schema (Tanpa Data Dummy)
-- ===================================================================

-- 1. Buat Ekstensi yang Dibutuhkan
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUM TYPES
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('MAHASISWA', 'STAF', 'KASI', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE jenis_dokumen AS ENUM ('KRS', 'KHS', 'TRANSKRIP_NILAI', 'SKMA');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE status_spp_type AS ENUM ('LUNAS', 'BELUM_LUNAS', 'PENANGGUHAN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE status_pengajuan_type AS ENUM (
        'DIAJUKAN',
        'VALIDASI_SIAKAD',
        'DALAM_ANTREAN',
        'DITINJAU_STAF',
        'SELESAI',
        'DITOLAK'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ===================================================================
-- 3. TABEL USERS & OTENTIKASI
-- ===================================================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    nomor_induk VARCHAR(50) UNIQUE NOT NULL, -- NIM (Mahasiswa) atau NIP (Staf/KASI)
    nama VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'MAHASISWA',
    prodi VARCHAR(100) DEFAULT 'S1 Bisnis Digital',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_nomor_induk ON users(nomor_induk);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ===================================================================
-- 4. TABEL PROFIL MAHASISWA
-- ===================================================================
CREATE TABLE IF NOT EXISTS mahasiswa_profile (
    id SERIAL PRIMARY KEY,
    user_id INT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    nim VARCHAR(50) UNIQUE NOT NULL,
    semester_berjalan INT NOT NULL DEFAULT 1,
    angkatan INT,
    dosen_pa VARCHAR(150),
    total_sks_lulus INT DEFAULT 0,
    ipk NUMERIC(3,2) DEFAULT 0.00,
    status_akademik VARCHAR(20) NOT NULL DEFAULT 'AKTIF', -- 'AKTIF', 'CUTI', 'NON-AKTIF'
    alamat TEXT,
    no_telepon VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ===================================================================
-- 5. TABEL STATUS PEMBAYARAN SPP (SIAKAD INTEGRATION)
-- ===================================================================
CREATE TABLE IF NOT EXISTS status_spp (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    semester INT NOT NULL,
    tahun_akademik VARCHAR(20) NOT NULL, -- Contoh: '2025/2026 Ganjil'
    status status_spp_type NOT NULL DEFAULT 'BELUM_LUNAS',
    tanggal_bayar TIMESTAMP WITH TIME ZONE,
    jumlah_bayar NUMERIC(12,2),
    nomor_transaksi VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_semester_spp UNIQUE (user_id, semester, tahun_akademik)
);

CREATE INDEX IF NOT EXISTS idx_status_spp_user ON status_spp(user_id, status);

-- ===================================================================
-- 6. TABEL MATA KULIAH & NILAI AKADEMIK (KRS & KHS)
-- ===================================================================
CREATE TABLE IF NOT EXISTS mata_kuliah (
    kode_mk VARCHAR(20) PRIMARY KEY,
    nama_mk VARCHAR(150) NOT NULL,
    sks INT NOT NULL CHECK (sks > 0),
    prodi VARCHAR(100) DEFAULT 'S1 Bisnis Digital',
    semester_paket INT DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS nilai_akademik (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    kode_mk VARCHAR(20) NOT NULL REFERENCES mata_kuliah(kode_mk) ON DELETE RESTRICT,
    semester_ambil INT NOT NULL,
    tahun_akademik VARCHAR(20) NOT NULL,
    nilai_huruf VARCHAR(5), -- 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'D', 'E'
    bobot_nilai NUMERIC(3,2), -- 4.00, 3.75, 3.00, dll.
    is_krs_active BOOLEAN DEFAULT FALSE, -- Ditandai TRUE jika sedang diambil semester berjalan
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_mk_semester UNIQUE (user_id, kode_mk, semester_ambil, tahun_akademik)
);

CREATE INDEX IF NOT EXISTS idx_nilai_user_semester ON nilai_akademik(user_id, semester_ambil);

-- ===================================================================
-- 7. TABEL PENGAJUAN DOKUMEN & ANTREAN SLA
-- ===================================================================
CREATE TABLE IF NOT EXISTS pengajuan_dokumen (
    id SERIAL PRIMARY KEY,
    nomor_pengajuan VARCHAR(50) UNIQUE NOT NULL, -- Misal: 'REQ-20261018-0001'
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    jenis_dokumen jenis_dokumen NOT NULL,
    keperluan TEXT,
    semester_dituju INT, -- Digunakan khusus KHS/KRS jika memilih semester tertentu
    status_pengajuan status_pengajuan_type NOT NULL DEFAULT 'DIAJUKAN',
    
    -- FIFO & SLA Management
    nomor_antrean INT,
    sla_target_menit INT DEFAULT 15,
    sla_waktu_mulai TIMESTAMP WITH TIME ZONE,
    sla_waktu_target TIMESTAMP WITH TIME ZONE,
    sla_waktu_selesai TIMESTAMP WITH TIME ZONE,
    
    -- Tracking Eksekusi Staf
    catatan_staf TEXT,
    diproses_oleh INT REFERENCES users(id) ON DELETE SET NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pengajuan_user ON pengajuan_dokumen(user_id);
CREATE INDEX IF NOT EXISTS idx_pengajuan_status ON pengajuan_dokumen(status_pengajuan);
CREATE INDEX IF NOT EXISTS idx_pengajuan_created ON pengajuan_dokumen(created_at);

-- ===================================================================
-- 8. TABEL DOKUMEN RESMI (HASIL GENERASI AI & PENGESAHAN)
-- ===================================================================
CREATE TABLE IF NOT EXISTS dokumen_resmi (
    id SERIAL PRIMARY KEY,
    pengajuan_id INT UNIQUE NOT NULL REFERENCES pengajuan_dokumen(id) ON DELETE CASCADE,
    nomor_dokumen_resmi VARCHAR(100) UNIQUE NOT NULL, -- Contoh: '421/UN40.D/AK/2026'
    file_path TEXT, -- Lokasi file PDF hasil generate di storage lokal / cloud
    qr_code_verification_url TEXT NOT NULL,
    qr_hash_token VARCHAR(255) UNIQUE NOT NULL,
    is_valid BOOLEAN DEFAULT TRUE,
    disahkan_oleh INT REFERENCES users(id) ON DELETE RESTRICT,
    tanggal_pengesahan TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_dokumen_qr_hash ON dokumen_resmi(qr_hash_token);

-- ===================================================================
-- 9. TABEL AUDIT LOGS SISTEM
-- ===================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    aksi VARCHAR(100) NOT NULL,
    rincian TEXT,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);
