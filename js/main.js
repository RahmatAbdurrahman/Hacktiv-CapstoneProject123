document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const body = document.body;
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    const dashboardUsername = document.getElementById('dashboardUsername');
    const logoutBtn = document.getElementById('logoutBtn');
    const addAccountBtn = document.getElementById('addAccountBtn');
    const accountList = document.getElementById('accountList');

    // --- Autentikasi dan Pengalihan ---
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        window.location.href = 'index.html'; // Arahkan kembali ke login jika belum login
        return; // Hentikan eksekusi script lebih lanjut
    } else {
        dashboardUsername.textContent = currentUser;
    }

    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('currentUser'); // Hapus sesi pengguna
        localStorage.removeItem('selectedAccount'); // Hapus akun yang dipilih
        window.location.href = 'index.html'; // Kembali ke halaman login
    });

    // --- Pengelolaan Tema ---
    // Muat tema yang terakhir disimpan
    const savedTheme = localStorage.getItem('theme') || 'light-theme';
    body.className = savedTheme;
    if (savedTheme === 'dark-theme') {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    } else {
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
    }

    themeToggle.addEventListener('click', () => {
        if (body.classList.contains('light-theme')) {
            body.classList.remove('light-theme');
            body.classList.add('dark-theme');
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
            localStorage.setItem('theme', 'dark-theme');
        } else {
            body.classList.remove('dark-theme');
            body.classList.add('light-theme');
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
            localStorage.setItem('theme', 'light-theme');
        }
    });

    // --- Menu Hamburger dan Sidebar ---
    hamburgerMenu.addEventListener('click', () => {
        sidebar.classList.toggle('active');
        mainContent.classList.toggle('shifted');
        // Membuat overlay untuk klik di luar sidebar
        let overlay = document.querySelector('.overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.classList.add('overlay');
            document.body.appendChild(overlay);
            overlay.addEventListener('click', () => {
                sidebar.classList.remove('active');
                mainContent.classList.remove('shifted');
                overlay.classList.remove('active');
            });
        }
        overlay.classList.toggle('active');
    });

    // --- Pengelolaan Akun (Fitur Tambahan) ---
    // Fungsi untuk mendapatkan semua akun yang terdaftar
    function getAllUsers() {
        return JSON.parse(localStorage.getItem('users')) || [];
    }

    // Fungsi untuk memuat daftar akun di sidebar
    function loadAccountsIntoSidebar() {
        accountList.innerHTML = ''; // Kosongkan daftar yang ada
        const users = getAllUsers();
        const currentUser = localStorage.getItem('currentUser');
        const selectedAccount = localStorage.getItem('selectedAccount') || currentUser; // Akun yang sedang aktif

        users.forEach(user => {
            if (user.username !== currentUser) { // Jangan tampilkan akun yang sedang login sebagai opsi pilih akun lain
                const li = document.createElement('li');
                li.textContent = user.username;
                li.classList.add('account-item');
                if (user.username === selectedAccount) {
                    li.classList.add('active-account');
                }
                li.addEventListener('click', () => {
                    localStorage.setItem('selectedAccount', user.username);
                    // Disini Anda bisa memuat ulang data dashboard sesuai akun yang dipilih
                    alert(`Akun "${user.username}" dipilih. Data dashboard akan diperbarui.`);
                    loadAccountsIntoSidebar(); // Perbarui tampilan daftar akun
                    // Tutup sidebar setelah memilih akun
                    sidebar.classList.remove('active');
                    mainContent.classList.remove('shifted');
                    document.querySelector('.overlay')?.classList.remove('active');
                });
                accountList.appendChild(li);
            }
        });

        // Tampilkan akun yang sedang aktif di bagian atas
        const currentAccountLi = document.createElement('li');
        currentAccountLi.innerHTML = `<strong>${currentUser}</strong> (Aktif)`;
        currentAccountLi.classList.add('active-user-display');
        accountList.prepend(currentAccountLi); // Tambahkan di awal daftar
    }

    // Panggil saat halaman dimuat
    loadAccountsIntoSidebar();

    addAccountBtn.addEventListener('click', () => {
        // Logika untuk menambah akun baru.
        // Ini akan mengarahkan pengguna ke halaman pendaftaran lagi,
        // atau pop-up untuk membuat akun baru tanpa logout dari akun saat ini.
        // Untuk contoh ini, kita akan arahkan ke halaman pendaftaran.
        // Anda mungkin ingin membangun modal (pop-up) untuk pengalaman yang lebih baik.
        alert('Fitur tambah akun baru akan mengarahkan Anda ke halaman pendaftaran.');
        window.location.href = 'index.html';
    });

    // --- Konten Dashboard (placeholder) ---
    // Di sini Anda akan menambahkan logika untuk menampilkan data keuangan
    // berdasarkan `currentUser` dan `selectedAccount`
});