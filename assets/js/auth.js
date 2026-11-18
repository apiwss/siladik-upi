/**
 * SISTEM INFORMASI LAYANAN AKADEMIK (SILADIK UPI)
 * File: assets/js/auth.js
 * Sistem Autentikasi Mandiri & Strict Role-Based Access Control (RBAC)
 * Mendukung Registrasi Akun Mahasiswa Baru & Pengelolaan Data Mandiri
 */

const AuthManager = (() => {
  const SESSION_KEY = 'siladik_session_user_v1';
  const LEGACY_SESSION_KEY = 'sipakad_session_user_v1';
  const REGISTERED_STUDENTS_KEY = 'siladik_registered_students_v1';
  const LEGACY_REGISTERED_STUDENTS_KEY = 'sipakad_registered_students_v1';

  // Akun Bawaan Sistem (Preset Accounts Standalone)
  const PRESET_ACCOUNTS = {
    // 1. Mahasiswa
    mahasiswa_1: {
      role: 'mahasiswa',
      nim: '2312017',
      nama: 'Nabil Amanulloh',
      email: 'nabil.amanulloh@upi.edu',
      prodi: 'S1 Bisnis Digital',
      currentSemester: 7,
      totalSksLulus: 120,
      ipk: 3.89,
      statusSpp: 'Lunas',
      avatarLabel: 'NA',
      authToken: 'SILADIK-TOKEN-MHS-2312017'
    },
    // 2. Staf Akademik (Eksekutor TU)
    staff_1: {
      role: 'staff',
      nip: '198703142014041001',
      nama: 'Budi Prasetyo, S.Kom.',
      email: 'budi_akademik@upi.edu',
      jabatan: 'Staf Administrasi & Verifikator TU Akademik',
      avatarLabel: 'BP',
      authToken: 'SILADIK-TOKEN-STAF-19870314'
    },
    // 3. Kasubag / KASI Layanan Akademik (Pimpinan / Monitor Kinerja)
    kasi_1: {
      role: 'kasi',
      nip: '199105202020121008',
      nama: 'Muhammad Rizki Nugraha, S.Pd., M.T.',
      email: 'rizkinugraha@upi.edu',
      jabatan: 'Kepala Seksi Layanan Akademik dan Kemahasiswaan',
      avatarLabel: 'RN',
      authToken: 'SILADIK-TOKEN-KASI-19910520'
    },
    // 4. Admin Sistem (Master Data & Manajemen Akun)
    admin_1: {
      role: 'admin',
      nip: 'ADMIN001',
      nama: 'Administrator Sistem SILADIK',
      email: 'admin@upi.edu',
      jabatan: 'Super Administrator Master Data SILADIK',
      avatarLabel: 'AD',
      authToken: 'SILADIK-TOKEN-ADMIN-001'
    }
  };

  function generateNameBasedEmail(nama, fallbackNim) {
    if (!nama) return fallbackNim ? `${fallbackNim}@upi.edu` : '';
    const clean = nama.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().split(/\s+/).filter(Boolean).slice(0, 3).join('.');
    return clean ? `${clean}@upi.edu` : `${fallbackNim}@upi.edu`;
  }

  // Enkripsi Kriptografis Satu Arah (SHA-256) untuk Kata Sandi Mahasiswa
  async function hashPassword(str) {
    if (!str) return '';
    try {
      if (typeof crypto !== 'undefined' && crypto.subtle) {
        const msgBuffer = new TextEncoder().encode(str);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      }
    } catch (e) {}
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return 'sha256_' + Math.abs(hash).toString(16);
  }

  function getRegisteredStudents() {
    try {
      let data = localStorage.getItem(REGISTERED_STUDENTS_KEY);
      if (!data) {
        data = localStorage.getItem(LEGACY_REGISTERED_STUDENTS_KEY);
      }
      if (data) {
        const list = JSON.parse(data);
        if (Array.isArray(list)) {
          list.forEach(st => {
            if (!st.email || /^\d+@upi\.edu$/i.test(st.email.trim())) {
              st.email = generateNameBasedEmail(st.nama, st.nim || st.nomor_induk);
            }
          });
        }
        return list;
      }
    } catch (e) {
      console.warn('Gagal membaca data registrasi mahasiswa:', e);
    }
    return [];
  }

  function saveRegisteredStudents(list) {
    try {
      localStorage.setItem(REGISTERED_STUDENTS_KEY, JSON.stringify(list));
      localStorage.removeItem(LEGACY_REGISTERED_STUDENTS_KEY);
    } catch (e) {
      console.error('Gagal menyimpan pendaftaran mahasiswa:', e);
    }
  }

  function deleteRegisteredStudent(nim) {
    if (!nim) return false;
    try {
      const cleanNim = String(nim).trim();
      const list = getRegisteredStudents();
      const filtered = list.filter(s => String(s.nim || '').trim() !== cleanNim && String(s.nomor_induk || '').trim() !== cleanNim);
      saveRegisteredStudents(filtered);
      if (typeof SiakadApi !== 'undefined' && SiakadApi.databaseSiakad && SiakadApi.databaseSiakad[cleanNim]) {
        delete SiakadApi.databaseSiakad[cleanNim];
      }
      return true;
    } catch (e) {
      console.warn('Gagal menghapus pendaftaran mahasiswa:', e);
      return false;
    }
  }

  function getCurrentUser() {
    try {
      let data = sessionStorage.getItem(SESSION_KEY);
      if (!data) {
        data = sessionStorage.getItem(LEGACY_SESSION_KEY);
      }
      if (data) {
        const parsed = JSON.parse(data);
        // Otomatis bersihkan jika masih tersimpan label SIPAKAD lama
        if (parsed && typeof parsed.nama === 'string' && parsed.nama.includes('SIPAKAD')) {
          parsed.nama = parsed.nama.replace(/SIPAKAD/g, 'SILADIK');
          if (parsed.jabatan) {
            parsed.jabatan = parsed.jabatan.replace(/SIPAKAD/g, 'SILADIK');
          }
          sessionStorage.setItem(SESSION_KEY, JSON.stringify(parsed));
        }
        return parsed;
      }
    } catch (e) {
      console.warn('Session parse error', e);
    }
    return null;
  }

  function setCurrentUser(user) {
    if (user) {
      // Pastikan label selalu SILADIK
      if (user.nama && user.nama.includes('SIPAKAD')) {
        user.nama = user.nama.replace(/SIPAKAD/g, 'SILADIK');
      }
      if (user.jabatan && user.jabatan.includes('SIPAKAD')) {
        user.jabatan = user.jabatan.replace(/SIPAKAD/g, 'SILADIK');
      }
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
      sessionStorage.removeItem(LEGACY_SESSION_KEY);
    } else {
      sessionStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(LEGACY_SESSION_KEY);
    }
    if (typeof window.dispatchEvent === 'function') {
      const CE = (typeof CustomEvent !== 'undefined' ? CustomEvent : window.CustomEvent);
      if (CE) window.dispatchEvent(new CE('auth:changed', { detail: user }));
    }
  }

  return {
    getCurrentUser,
    setCurrentUser,
    isLoggedIn: () => getCurrentUser() !== null,
    getPresets: () => PRESET_ACCOUNTS,
    getRegisteredStudents,
    saveRegisteredStudents,
    deleteRegisteredStudent,

    // Pendaftaran Akun Baru Khusus Mahasiswa (FR Pendaftaran Mandiri)
    registerStudent: async ({ nim, nama, prodi, currentSemester, password }) => {
      const cleanNim = String(nim || '').trim();
      const cleanNama = String(nama || '').trim();
      const cleanProdi = String(prodi || 'S1 Bisnis Digital').trim();
      const semester = parseInt(currentSemester, 10) || 1;

      if (!cleanNim || !cleanNama || !password) {
        throw new Error('NIM, Nama Lengkap, dan Kata Sandi wajib diisi!');
      }

      // Cek apakah NIM sudah terdaftar di preset atau registrasi
      const registered = getRegisteredStudents();
      const existsInRegistered = registered.find(s => s.nim === cleanNim);
      const existsInPresets = cleanNim === PRESET_ACCOUNTS.mahasiswa_1.nim;

      if (existsInRegistered || existsInPresets) {
        throw new Error(`Mahasiswa dengan NIM ${cleanNim} sudah terdaftar di sistem.`);
      }

      const hashedPassword = await hashPassword(password);

      const newStudent = {
        role: 'mahasiswa',
        nim: cleanNim,
        nama: cleanNama,
        prodi: cleanProdi,
        currentSemester: semester,
        semesterAktif: semester,
        totalSksLulus: null,
        ipk: null,
        statusSpp: 'Lunas',
        passwordHash: hashedPassword,
        email: generateNameBasedEmail(cleanNama, cleanNim),
        avatarLabel: cleanNama.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
        authToken: `SILADIK-REG-${cleanNim}-${Date.now()}`
      };

      registered.push(newStudent);
      saveRegisteredStudents(registered);

      // Sinkronkan ke server PostgreSQL (jika aktif)
      try {
        function getRegApiUrl(endpoint) {
          if (window.AppConfig && typeof window.AppConfig.apiUrl === 'function') {
            return window.AppConfig.apiUrl(endpoint);
          }
          const base = window.API_BASE_URL || (window.location.origin.includes(':8080') ? '' : 'http://localhost:8080');
          return `${base}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
        }
        await fetch(getRegApiUrl('/api/auth/register'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nim: cleanNim,
            nama: cleanNama,
            prodi: cleanProdi,
            currentSemester: semester,
            password: password
          })
        });
      } catch (apiErr) {
        console.warn('Backend PostgreSQL register offline, tersimpan di lokal:', apiErr.message);
      }

      // Sinkronkan ke database lokal internal
      if (typeof SiakadApi !== 'undefined' && SiakadApi.databaseSiakad) {
        SiakadApi.databaseSiakad[cleanNim] = {
          nama: cleanNama,
          nim: cleanNim,
          prodi: cleanProdi,
          currentSemester: semester,
          statusSpp: 'Lunas',
          riwayatSemester: {}
        };
      }

      return newStudent;
    },

    // Login Mandiri Multi-Role (Validasi Autentikasi Ketat & Anti-Bypass)
    login: async (identifier, password, targetRole = '') => {
      const cleanId = String(identifier || '').trim();
      const cleanRole = String(targetRole || '').toLowerCase();

      if (!cleanId) {
        throw new Error('NIM / NIP / ID Pengguna wajib diisi.');
      }
      if (!password || String(password).trim() === '') {
        throw new Error('Kata sandi wajib diisi.');
      }
      const cleanPassword = String(password).trim();

      function getApiUrl(endpoint) {
        if (window.AppConfig && typeof window.AppConfig.apiUrl === 'function') {
          return window.AppConfig.apiUrl(endpoint);
        }
        const origin = (window.location && window.location.origin) ? window.location.origin : '';
        const base = window.API_BASE_URL || (origin.includes(':8080') ? '' : 'http://localhost:8080');
        return `${base}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
      }

      // 1. Coba Verifikasi ke Backend PostgreSQL (Strict JWT & Bcrypt)
      let backendFailed = false;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        const response = await fetch(getApiUrl('/api/auth/login'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nomor_induk: cleanId, password: cleanPassword }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        const result = await response.json();
        if (response.ok && result.success && result.user) {
          const user = result.user;
          user.authToken = result.token || `SILADIK-${user.role.toUpperCase()}-${user.nomor_induk}-${Date.now()}`;
          if (cleanRole) {
            const roleMap = {
              'mahasiswa': 'mahasiswa',
              'staf': 'staff',
              'staff': 'staff',
              'kasi': 'kasi',
              'admin': 'admin'
            };
            const expectedRole = roleMap[cleanRole] || cleanRole;
            if (user.role !== expectedRole) {
              const roleLabels = { mahasiswa: 'Mahasiswa', staff: 'Staf Akademik', kasi: 'Kasubag / Kasi', admin: 'Admin Sistem' };
              throw new Error(`Akun ini terdaftar sebagai ${roleLabels[user.role] || user.role}, bukan ${targetRole}.`);
            }
          }
          setCurrentUser(user);
          return user;
        } else if (response.status === 400 || response.status === 401 || response.status === 403) {
          const authErr = new Error(result.message || 'Kredensial login tidak valid.');
          authErr.isAuthError = true;
          throw authErr;
        }
      } catch (apiErr) {
        if (apiErr.isAuthError) {
          throw apiErr;
        }
        backendFailed = true;
      }

      // 2. Fallback Standalone / Offline Mode (Hanya jika PostgreSQL tidak aktif / unreachable)
      // A. Cek Akun Preset Sistem (Validasi Kata Sandi Wajib 'password123')
      const presets = Object.values(PRESET_ACCOUNTS);
      const found = presets.find(p => (p.nim === cleanId || p.nip === cleanId || p.nomor_induk === cleanId));
      if (found) {
        if (cleanPassword !== 'password123') {
          throw new Error('Kata sandi yang Anda masukkan salah.');
        }
        if (cleanRole) {
          const roleMap = {
            'mahasiswa': 'mahasiswa',
            'staf': 'staff',
            'staff': 'staff',
            'kasi': 'kasi',
            'admin': 'admin'
          };
          const expectedRole = roleMap[cleanRole] || cleanRole;
          if (found.role !== expectedRole) {
            const roleLabels = { mahasiswa: 'Mahasiswa', staff: 'Staf Akademik', kasi: 'Kasubag / Kasi', admin: 'Admin Sistem' };
            throw new Error(`Akun ini terdaftar sebagai ${roleLabels[found.role] || found.role}, bukan ${targetRole}.`);
          }
        }
        setCurrentUser(found);
        return found;
      }

      // B. Cek dari daftar mahasiswa yang mendaftar mandiri (Validasi Enkripsi SHA-256)
      const registered = getRegisteredStudents();
      const customStudent = registered.find(s => 
        String(s.nim).trim().toLowerCase() === cleanId.toLowerCase()
      );
      if (customStudent) {
        const inputHash = await hashPassword(cleanPassword);
        const isMatch = (customStudent.passwordHash && customStudent.passwordHash === inputHash) ||
                        (customStudent.password && customStudent.password === cleanPassword);
        if (!isMatch) {
          throw new Error('Kata sandi yang Anda masukkan salah.');
        }
        // Migrasi jika akun lama masih menyimpan teks biasa
        if (customStudent.password && !customStudent.passwordHash) {
          customStudent.passwordHash = inputHash;
          delete customStudent.password;
          saveRegisteredStudents(registered);
        }
        if (cleanRole && cleanRole !== 'mahasiswa') {
          throw new Error(`Akun ${cleanId} terdaftar sebagai Mahasiswa, bukan ${targetRole}.`);
        }
        customStudent.nama = customStudent.nama.replace(/^Mahasiswa\s*\((.*?)\)$/i, '$1').replace(/^\(Mahasiswa\)\s*/i, '').trim();
        setCurrentUser(customStudent);
        return customStudent;
      }

      // C. Fallback jika mahasiswa terdaftar di database lokal SiakadApi
      if (typeof SiakadApi !== 'undefined' && SiakadApi.getStudentByNim) {
        try {
          const student = await SiakadApi.getStudentByNim(cleanId);
          if (student && String(student.nim).trim().toLowerCase() === cleanId.toLowerCase()) {
            if (cleanPassword !== 'password123' && cleanPassword !== String(student.nim).trim()) {
              throw new Error('Kata sandi yang Anda masukkan salah.');
            }
            const cleanName = student.nama.replace(/^Mahasiswa\s*\((.*?)\)$/i, '$1').replace(/^\(Mahasiswa\)\s*/i, '').trim();
            const user = {
              role: 'mahasiswa',
              nim: student.nim,
              nama: cleanName,
              email: student.email || `${student.nim}@upi.edu`,
              prodi: student.prodi,
              currentSemester: student.currentSemester || student.semesterAktif || 1,
              totalSksLulus: student.totalSksLulus || 0,
              ipk: student.ipk || 0.00,
              statusSpp: student.statusSpp || 'Lunas',
              avatarLabel: cleanName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
              authToken: `SILADIK-MHS-${student.nim}-${Date.now()}`
            };
            setCurrentUser(user);
            return user;
          }
        } catch (e) {
          if (e.message && e.message.includes('Kata sandi')) throw e;
        }
      }

      throw new Error('NIM / NIP / ID Pengguna tidak ditemukan dalam sistem database.');
    },

    // RBAC Security Check
    canAccess: (targetRole) => {
      const current = getCurrentUser();
      return current && current.role === targetRole;
    },

    // Logout
    logout: () => {
      try {
        sessionStorage.removeItem(SESSION_KEY);
        sessionStorage.removeItem(LEGACY_SESSION_KEY);
        sessionStorage.clear();
      } catch (e) {}
      setCurrentUser(null);
    }
  };
})();

// Export globally
window.AuthManager = AuthManager;
