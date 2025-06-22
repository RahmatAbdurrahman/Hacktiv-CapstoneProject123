document.addEventListener('DOMContentLoaded', () => {
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const messageDisplay = document.getElementById('message');

    // Fungsi untuk menampilkan pesan error/sukses
    function showMessage(msg, isError = true) {
        messageDisplay.textContent = msg;
        messageDisplay.className = isError ? 'error-message' : 'success-message';
    }

    // Fungsi untuk mendaftarkan akun baru
    registerBtn.addEventListener('click', () => {
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        if (!username || !password) {
            showMessage('Username dan password tidak boleh kosong.');
            return;
        }

        let users = JSON.parse(localStorage.getItem('users')) || [];

        // Cek apakah username sudah ada
        const userExists = users.some(user => user.username === username);
        if (userExists) {
            showMessage('Username sudah terdaftar. Silakan pilih username lain.');
            return;
        }

        // Tambahkan akun baru
        users.push({ username: username, password: password });
        localStorage.setItem('users', JSON.stringify(users));
        showMessage('Akun berhasil didaftarkan! Silakan masuk.', false);

        // Langsung login setelah daftar
        localStorage.setItem('currentUser', username);
        window.location.href = 'dashboard.html';
    });

    // Fungsi untuk login
    loginBtn.addEventListener('click', () => {
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        if (!username || !password) {
            showMessage('Username dan password tidak boleh kosong.');
            return;
        }

        let users = JSON.parse(localStorage.getItem('users')) || [];

        // Cek kredensial
        const user = users.find(u => u.username === username && u.password === password);
        if (user) {
            localStorage.setItem('currentUser', username); // Simpan username yang sedang login
            window.location.href = 'dashboard.html';
        } else {
            showMessage('Username atau password salah.');
        }
    });
});