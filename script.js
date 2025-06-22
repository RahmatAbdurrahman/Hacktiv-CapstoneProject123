document.addEventListener('DOMContentLoaded', () => {
    // --- Elemen Layar ---
    const onboardingScreen = document.getElementById('onboarding-screen');
    const registrationScreen = document.getElementById('registration-screen');
    const initialAmountScreen = document.getElementById('initial-amount-screen');
    const mainDashboard = document.getElementById('main-dashboard');
    const transactionModalScreen = document.getElementById('transaction-modal-screen');

    // --- Tombol Navigasi ---
    const onboardingNextButton = document.getElementById('onboarding-next-button');
    const registerNextButton = document.getElementById('register-next-button');
    const initialAmountNextButton = document.getElementById('initial-amount-next-button');
    const fabAddTransactionButton = document.getElementById('fab-add-transaction');

    // --- Elemen Input & Display ---
    const usernameInput = document.getElementById('username-input');
    const displayUsernameHeader = document.getElementById('header-username');
    const displayUsernameDashboard = document.getElementById('display-username');

    const amountInputDisplay = document.getElementById('amount-input-display'); // Numpad Jumlah Awal
    const amountDeleteButton = document.getElementById('amount-delete-button'); // Delete Numpad Jumlah Awal
    const numpadButtonsInitial = document.querySelectorAll('.numpad-grid:not(.transaction-numpad-grid) .numpad-button'); // Hanya numpad di Jumlah Awal

    const currentTotalMoneyDisplay = document.getElementById('current-total-money');
    const displayInitialAmountDashboard = document.getElementById('display-initial-amount');
    const noTransactionMessage = document.getElementById('no-transaction-message');
    const transactionsListContainer = document.getElementById('transactions-list'); // Container daftar transaksi

    // --- Sidebar Elemen ---
    const hamburgerMenuButton = document.getElementById('hamburger-menu');
    const sidebarMenu = document.getElementById('sidebar-menu');
    const closeSidebarButton = document.getElementById('close-sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');

    const summaryIncomeDisplay = document.getElementById('summary-income');
    const summaryExpenseDisplay = document.getElementById('summary-expense');
    const summaryTotalDisplay = document.getElementById('summary-total');

    const accountListContainer = document.getElementById('account-list');
    const addAccountButton = document.getElementById('add-account-button');

    // --- Elemen Modal Transaksi ---
    const closeTransactionModalButton = document.getElementById('close-transaction-modal');
    const btnExpense = document.getElementById('btn-expense');
    const btnIncome = document.getElementById('btn-income');
    const transactionAmountDisplay = document.getElementById('transaction-amount-display');
    const transactionAmountDeleteButton = document.getElementById('transaction-amount-delete-button');
    const numpadButtonsTransaction = document.querySelectorAll('.transaction-numpad-grid .numpad-button'); // Numpad di Modal Transaksi

    const transactionCategoryInput = document.getElementById('transaction-category-input');
    const transactionDateInput = document.getElementById('transaction-date-input');
    const transactionDescriptionInput = document.getElementById('transaction-description-input');
    const saveTransactionButton = document.getElementById('save-transaction-button');

    // --- Kunci localStorage ---
    const STORAGE_KEY_ACCOUNTS = 'budgyAccounts';
    const STORAGE_KEY_ACTIVE_ACCOUNT_ID = 'activeAccountId';

    // --- State untuk Input Numpad ---
    let currentInitialAmountInput = "0"; // Untuk halaman Jumlah Awal
    let currentTransactionAmountInput = "0"; // Untuk modal Transaksi
    let currentTransactionType = "expense"; // "expense" atau "income"

    // --- Fungsi Bantuan ---

    function generateUniqueId() {
        return '_' + Math.random().toString(36).substr(2, 9);
    }

    function formatRupiah(numberString) {
        if (numberString === undefined || numberString === null || numberString.trim() === "") {
            numberString = "0";
        }

        if (numberString.startsWith("Rp ")) {
            numberString = numberString.replace("Rp ", "").replace(/\./g, '').replace(',', '.');
        }

        let num = parseFloat(numberString);
        if (isNaN(num)) return "Rp 0";

        let formattedNum = new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(num);

        return `Rp ${formattedNum.replace('IDR', '').trim()}`;
    }

    function transitionScreen(fromScreen, toScreen) {
        if (fromScreen) {
            fromScreen.style.opacity = '0';
            fromScreen.style.pointerEvents = 'none';

            fromScreen.addEventListener('transitionend', function handler() {
                fromScreen.style.display = 'none';
                fromScreen.removeEventListener('transitionend', handler);

                if (toScreen) {
                    toScreen.style.display = 'flex';
                    setTimeout(() => {
                        toScreen.style.opacity = '1';
                        toScreen.style.pointerEvents = 'auto';
                    }, 50);
                }
            }, { once: true });
        } else if (toScreen) {
            toScreen.style.display = 'flex';
            setTimeout(() => {
                toScreen.style.opacity = '1';
                toScreen.style.pointerEvents = 'auto';
            }, 50);
        }
    }

    function getActiveAccount() {
        const accounts = JSON.parse(localStorage.getItem(STORAGE_KEY_ACCOUNTS) || '[]');
        const activeAccountId = localStorage.getItem(STORAGE_KEY_ACTIVE_ACCOUNT_ID);
        return accounts.find(acc => acc.id === activeAccountId);
    }

    function setActiveAccount(accountId) {
        localStorage.setItem(STORAGE_KEY_ACTIVE_ACCOUNT_ID, accountId);
        updateDashboard();
        renderAccountsInSidebar();
    }

    // Fungsi untuk Merender Daftar Transaksi di Dashboard
    function renderTransactions() {
        const activeAccount = getActiveAccount();
        if (!activeAccount || !activeAccount.transactions || activeAccount.transactions.length === 0) {
            noTransactionMessage.style.display = 'block';
            transactionsListContainer.innerHTML = '';
            return;
        }

        noTransactionMessage.style.display = 'none';
        transactionsListContainer.innerHTML = '';

        const transactionsByDate = {};
        activeAccount.transactions.forEach(transaction => {
            const dateKey = transaction.date; // YYYY-MM-DD
            if (!transactionsByDate[dateKey]) {
                transactionsByDate[dateKey] = [];
            }
            transactionsByDate[dateKey].push(transaction);
        });

        const sortedDates = Object.keys(transactionsByDate).sort((a, b) => new Date(b) - new Date(a));

        sortedDates.forEach(dateKey => {
            const dailyTransactions = transactionsByDate[dateKey].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            const transactionDate = new Date(dateKey);
            const dayOfMonth = transactionDate.getDate();
            const monthYear = transactionDate.toLocaleDateString('id-ID', { weekday: 'long', month: 'long', year: 'numeric' });

            let dailyTotal = 0;
            dailyTransactions.forEach(t => {
                const amount = parseFloat(t.amount);
                if (!isNaN(amount)) {
                    if (t.type === 'income') {
                        dailyTotal += amount;
                    } else if (t.type === 'expense') {
                        dailyTotal -= amount;
                    }
                }
            });

            const dateGroupWrapper = document.createElement('div');
            dateGroupWrapper.classList.add('transaction-item-wrapper');

            const dateHeader = document.createElement('div');
            dateHeader.classList.add('transaction-date-header');
            dateHeader.innerHTML = `
                <span class="day">${dayOfMonth}</span>
                <span class="month-year">${monthYear}</span>
                <span class="daily-total">${formatRupiah(dailyTotal.toString())}</span>
            `;
            dateGroupWrapper.appendChild(dateHeader);

            dailyTransactions.forEach(transaction => {
                const transactionCardItem = document.createElement('div');
                transactionCardItem.classList.add('transaction-card-item');

                let iconName = 'tag';
                if (transaction.type === 'expense') {
                    iconName = 'minus-circle';
                } else if (transaction.type === 'income') {
                    iconName = 'plus-circle';
                }
                // Mapping ikon berdasarkan kategori (bisa diperluas)
                if (transaction.category && transaction.category.toLowerCase().includes('makan')) iconName = 'shopping-bag';
                else if (transaction.category && transaction.category.toLowerCase().includes('transportasi')) iconName = 'truck';
                else if (transaction.category && transaction.category.toLowerCase().includes('gaji')) iconName = 'dollar-sign';
                else if (transaction.category && transaction.category.toLowerCase().includes('tagihan')) iconName = 'clipboard';


                const amountClass = transaction.type === 'expense' ? 'expense' : 'income';
                const amountPrefix = transaction.type === 'expense' ? '-' : '+';
                const formattedAmount = formatRupiah(transaction.amount.toString()).replace('Rp ', '');

                transactionCardItem.innerHTML = `
                    <div class="icon-category">
                        ${feather.icons[iconName] ? feather.icons[iconName].toSvg({ width: 22, height: 22 }) : feather.icons['tag'].toSvg({ width: 22, height: 22 })}
                    </div>
                    <div class="details">
                        <span class="category-name">${transaction.category || 'Tidak Berkategori'}</span>
                        <span class="time">${new Date(transaction.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                        ${transaction.description ? `<span class="description-text">${transaction.description}</span>` : ''}
                    </div>
                    <span class="amount ${amountClass}">${amountPrefix} Rp ${formattedAmount}</span>
                `;
                dateGroupWrapper.appendChild(transactionCardItem);
            });
            transactionsListContainer.appendChild(dateGroupWrapper);
        });
        feather.replace();
    }


    function updateDashboard() {
        const activeAccount = getActiveAccount();
        let totalIncome = 0;
        let totalExpense = 0;

        if (activeAccount) {
            displayUsernameHeader.textContent = activeAccount.name;
            displayUsernameDashboard.textContent = activeAccount.name;
            currentTotalMoneyDisplay.textContent = formatRupiah(activeAccount.balance.toString());
            displayInitialAmountDashboard.textContent = formatRupiah(activeAccount.balance.toString());
            
            activeAccount.transactions.forEach(t => {
                const amount = parseFloat(t.amount);
                if (!isNaN(amount)) {
                    if (t.type === 'income') {
                        totalIncome += amount;
                    } else if (t.type === 'expense') {
                        totalExpense += amount;
                    }
                }
            });
        } else {
            displayUsernameHeader.textContent = 'Pengguna';
            displayUsernameDashboard.textContent = 'Pengguna';
            currentTotalMoneyDisplay.textContent = 'Rp 0';
            displayInitialAmountDashboard.textContent = 'Rp 0';
        }

        summaryIncomeDisplay.textContent = formatRupiah(totalIncome.toString());
        summaryExpenseDisplay.textContent = formatRupiah(totalExpense.toString());
        summaryTotalDisplay.textContent = formatRupiah((totalIncome - totalExpense).toString());

        renderTransactions();
    }

    function renderAccountsInSidebar() {
        const accounts = JSON.parse(localStorage.getItem(STORAGE_KEY_ACCOUNTS) || '[]');
        const activeAccountId = localStorage.getItem(STORAGE_KEY_ACTIVE_ACCOUNT_ID);
        accountListContainer.innerHTML = '';

        if (accounts.length === 0) {
            accountListContainer.innerHTML = '<p style="font-size:14px; color:#888; text-align:left; margin-top:10px;">Belum ada akun.</p>';
            return;
        }

        accounts.forEach(account => {
            const accountItem = document.createElement('div');
            accountItem.classList.add('account-item');
            if (account.id === activeAccountId) {
                accountItem.classList.add('active');
            }
            accountItem.dataset.accountId = account.id;

            accountItem.innerHTML = `
                <div class="account-details">
                    <span class="account-name">${account.name}</span>
                    <span class="account-balance">${formatRupiah(account.balance.toString())}</span>
                </div>
                <span class="account-selected-indicator">${feather.icons['check-circle'].toSvg({ width: 20, height: 20 })}</span>
            `;

            accountItem.addEventListener('click', () => {
                setActiveAccount(account.id);
                sidebarMenu.classList.remove('sidebar-active');
                sidebarMenu.classList.add('sidebar-hidden');
                sidebarOverlay.classList.remove('overlay-active');
                sidebarOverlay.classList.add('overlay-hidden');
            });
            accountListContainer.appendChild(accountItem);
        });
        feather.replace();
    }

    // --- Inisialisasi Tampilan Awal (Perbaikan Utama di sini) ---
    // Sembunyikan semua layar terlebih dahulu secara eksplisit
    // Lakukan ini untuk setiap screen yang ada
    if (onboardingScreen) onboardingScreen.style.display = 'none';
    if (registrationScreen) registrationScreen.style.display = 'none';
    if (initialAmountScreen) initialAmountScreen.style.display = 'none';
    if (mainDashboard) mainDashboard.style.display = 'none';
    if (transactionModalScreen) transactionModalScreen.style.display = 'none';

    // Kemudian, tentukan layar mana yang harus aktif
    const accountsOnLoad = JSON.parse(localStorage.getItem(STORAGE_KEY_ACCOUNTS) || '[]');
    const activeAccountIdOnLoad = localStorage.getItem(STORAGE_KEY_ACTIVE_ACCOUNT_ID);

    if (accountsOnLoad.length > 0 && activeAccountIdOnLoad) {
        if (mainDashboard) {
            mainDashboard.style.display = 'flex';
            mainDashboard.style.opacity = '1';
            mainDashboard.style.pointerEvents = 'auto';
            updateDashboard();
        }
    } else if (accountsOnLoad.length > 0 && !activeAccountIdOnLoad) {
        // Ini adalah skenario jika akun ada tetapi tidak ada yang aktif (misal, user menghapus activeAccountId dari localstorage)
        // Set akun pertama sebagai aktif, lalu ke Dashboard
        if (accountsOnLoad.length > 0) {
            setActiveAccount(accountsOnLoad[0].id);
            if (mainDashboard) {
                mainDashboard.style.display = 'flex';
                mainDashboard.style.opacity = '1';
                mainDashboard.style.pointerEvents = 'auto';
                updateDashboard();
            }
        } else { // Jika tidak ada akun sama sekali (seharusnya tidak tercapai)
            if (onboardingScreen) {
                onboardingScreen.style.display = 'flex';
                onboardingScreen.style.opacity = '1';
                onboardingScreen.style.pointerEvents = 'auto';
            }
        }
    } else {
        // Pengguna baru -> tampilkan onboarding
        if (onboardingScreen) {
            onboardingScreen.style.display = 'flex';
            onboardingScreen.style.opacity = '1';
            onboardingScreen.style.pointerEvents = 'auto';
        }
    }

    // --- Event Listeners Navigasi ---
    if (onboardingNextButton) {
        onboardingNextButton.addEventListener('click', () => {
            transitionScreen(onboardingScreen, registrationScreen);
        });
    }

    if (registerNextButton) {
        registerNextButton.addEventListener('click', () => {
            const username = usernameInput.value.trim();
            if (username) {
                usernameInput.dataset.tempUsername = username;
                transitionScreen(registrationScreen, initialAmountScreen);
                currentInitialAmountInput = "0";
                if(amountInputDisplay) amountInputDisplay.textContent = formatRupiah(currentInitialAmountInput);
            } else {
                alert('Username tidak boleh kosong!');
                usernameInput.focus();
            }
        });
    }

    if (initialAmountNextButton) {
        initialAmountNextButton.addEventListener('click', () => {
            const amountValueForParsing = currentInitialAmountInput.replace(/\./g, '').replace(',', '.');
            const parsedAmount = parseFloat(amountValueForParsing);
            const tempUsername = usernameInput.dataset.tempUsername;

            if (!isNaN(parsedAmount) && parsedAmount >= 0 && tempUsername) {
                const newAccountId = generateUniqueId();
                const newAccount = {
                    id: newAccountId,
                    name: tempUsername,
                    balance: parsedAmount,
                    transactions: []
                };

                let accounts = JSON.parse(localStorage.getItem(STORAGE_KEY_ACCOUNTS) || '[]');
                accounts.push(newAccount);

                localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(accounts));
                localStorage.setItem(STORAGE_KEY_ACTIVE_ACCOUNT_ID, newAccountId);

                transitionScreen(initialAmountScreen, mainDashboard);
                updateDashboard();
                usernameInput.dataset.tempUsername = '';
            } else {
                alert('Mohon masukkan jumlah awal yang valid dan pastikan username sudah ada!');
            }
        });
    }

    // --- Logika Numpad untuk Halaman Initial Amount ---
    if (numpadButtonsInitial) {
        numpadButtonsInitial.forEach(button => {
            button.addEventListener('click', () => {
                const value = button.textContent;
                if (value === '⌫') {
                    if (currentInitialAmountInput.length > 1) {
                        currentInitialAmountInput = currentInitialAmountInput.slice(0, -1);
                    } else {
                        currentInitialAmountInput = "0";
                    }
                } else if (value === ',') {
                    if (!currentInitialAmountInput.includes(',')) {
                        if (currentInitialAmountInput === "" || currentInitialAmountInput === "0") {
                            currentInitialAmountInput = "0,";
                        } else {
                            currentInitialAmountInput += ',';
                        }
                    }
                } else {
                    if (currentInitialAmountInput === "0" && value === "0") {
                        currentInitialAmountInput = "0";
                    } else if (currentInitialAmountInput === "0" && value !== "0") {
                        currentInitialAmountInput = value;
                    } else {
                        if (currentInitialAmountInput.includes(',')) {
                            const parts = currentInitialAmountInput.split(',');
                            if (parts[1].length < 2) {
                                currentInitialAmountInput += value;
                            }
                        } else {
                            currentInitialAmountInput += value;
                        }
                    }
                }
                if(amountInputDisplay) amountInputDisplay.textContent = formatRupiah(currentInitialAmountInput);
            });
        });
    }

    if (amountDeleteButton) {
        amountDeleteButton.addEventListener('click', () => {
            if (currentInitialAmountInput.length > 1) {
                currentInitialAmountInput = currentInitialAmountInput.slice(0, -1);
            } else {
                currentInitialAmountInput = "0";
            }
            if(amountInputDisplay) amountInputDisplay.textContent = formatRupiah(currentInitialAmountInput);
        });
    }

    // --- Logika Sidebar ---
    if (hamburgerMenuButton) {
        hamburgerMenuButton.addEventListener('click', () => {
            sidebarMenu.classList.remove('sidebar-hidden');
            sidebarMenu.classList.add('sidebar-active');
            sidebarOverlay.classList.remove('overlay-hidden');
            sidebarOverlay.classList.add('overlay-active');
            renderAccountsInSidebar();
        });
    }

    if (closeSidebarButton) {
        closeSidebarButton.addEventListener('click', () => {
            sidebarMenu.classList.remove('sidebar-active');
            sidebarMenu.classList.add('sidebar-hidden');
            sidebarOverlay.classList.remove('overlay-active');
            sidebarOverlay.classList.add('overlay-hidden');
        });
    }

    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', () => {
            sidebarMenu.classList.remove('sidebar-active');
            sidebarMenu.classList.add('sidebar-hidden');
            sidebarOverlay.classList.remove('overlay-active');
            sidebarOverlay.classList.add('overlay-hidden');
        });
    }

    // --- Logika Penambahan Akun Baru (Placeholder) ---
    if (addAccountButton) {
        addAccountButton.addEventListener('click', () => {
            alert('Fitur "Menambahkan akun" akan dikembangkan selanjutnya! Ini akan membawa Anda ke alur pendaftaran akun baru.');
            // Implementasi nyata: Anda mungkin ingin membuat modal baru
            // atau transisi ke halaman pendaftaran/initial amount lagi,
            // tetapi dengan flag khusus untuk "akun baru"
        });
    }

    // --- Logika Modal Transaksi ---
    if (fabAddTransactionButton) {
        fabAddTransactionButton.addEventListener('click', () => {
            transactionModalScreen.style.display = 'flex';
            setTimeout(() => {
                transactionModalScreen.style.opacity = '1';
                transactionModalScreen.style.pointerEvents = 'auto';
            }, 50);
            
            // Reset modal state
            currentTransactionAmountInput = "0";
            if(transactionAmountDisplay) transactionAmountDisplay.textContent = formatRupiah(currentTransactionAmountInput);
            if(transactionCategoryInput) transactionCategoryInput.value = "";
            if(transactionDescriptionInput) transactionDescriptionInput.value = "";
            if(transactionDateInput) transactionDateInput.valueAsDate = new Date(); // Set tanggal hari ini
            
            // Atur tipe default ke 'Pengeluaran'
            currentTransactionType = "expense";
            if(btnExpense) btnExpense.classList.add('active');
            if(btnIncome) btnIncome.classList.remove('active');
            
            feather.replace(); // Refresh icons in modal
        });
    }

    if (closeTransactionModalButton) {
        closeTransactionModalButton.addEventListener('click', () => {
            transactionModalScreen.style.opacity = '0';
            transactionModalScreen.style.pointerEvents = 'none';
            transactionModalScreen.addEventListener('transitionend', function handler() {
                transactionModalScreen.style.display = 'none';
                transactionModalScreen.removeEventListener('transitionend', handler);
            }, { once: true });
        });
    }

    // Logika pemilihan tipe transaksi (Pengeluaran / Pemasukan)
    if (btnExpense) {
        btnExpense.addEventListener('click', () => {
            currentTransactionType = "expense";
            btnExpense.classList.add('active');
            btnIncome.classList.remove('active');
        });
    }

    if (btnIncome) {
        btnIncome.addEventListener('click', () => {
            currentTransactionType = "income";
            btnIncome.classList.add('active');
            btnExpense.classList.remove('active');
        });
    }

    // Logika Numpad untuk Modal Transaksi
    if (numpadButtonsTransaction) {
        numpadButtonsTransaction.forEach(button => {
            button.addEventListener('click', () => {
                const value = button.textContent;
                if (value === '⌫') {
                    if (currentTransactionAmountInput.length > 1) {
                        currentTransactionAmountInput = currentTransactionAmountInput.slice(0, -1);
                    } else {
                        currentTransactionAmountInput = "0";
                    }
                } else if (value === ',') {
                    if (!currentTransactionAmountInput.includes(',')) {
                        if (currentTransactionAmountInput === "" || currentTransactionAmountInput === "0") {
                            currentTransactionAmountInput = "0,";
                        } else {
                            currentTransactionAmountInput += ',';
                        }
                    }
                } else {
                    if (currentTransactionAmountInput === "0" && value === "0") {
                        currentTransactionAmountInput = "0";
                    } else if (currentTransactionAmountInput === "0" && value !== "0") {
                        currentTransactionAmountInput = value;
                    } else {
                        if (currentTransactionAmountInput.includes(',')) {
                            const parts = currentTransactionAmountInput.split(',');
                            if (parts[1].length < 2) {
                                currentTransactionAmountInput += value;
                            }
                        } else {
                            currentTransactionAmountInput += value;
                        }
                    }
                }
                if(transactionAmountDisplay) transactionAmountDisplay.textContent = formatRupiah(currentTransactionAmountInput);
            });
        });
    }

    if (transactionAmountDeleteButton) {
        transactionAmountDeleteButton.addEventListener('click', () => {
            if (currentTransactionAmountInput.length > 1) {
                currentTransactionAmountInput = currentTransactionAmountInput.slice(0, -1);
            } else {
                currentTransactionAmountInput = "0";
            }
            if(transactionAmountDisplay) transactionAmountDisplay.textContent = formatRupiah(currentTransactionAmountInput);
        });
    }

    // Logika Simpan Transaksi
    if (saveTransactionButton) {
        saveTransactionButton.addEventListener('click', () => {
            const amountForSave = parseFloat(currentTransactionAmountInput.replace(/\./g, '').replace(',', '.'));
            const category = transactionCategoryInput.value.trim();
            const date = transactionDateInput.value;
            const description = transactionDescriptionInput.value.trim();

            if (isNaN(amountForSave) || amountForSave <= 0) {
                alert('Jumlah transaksi harus angka positif!');
                return;
            }
            if (!category) {
                alert('Kategori tidak boleh kosong!');
                return;
            }
            if (!date) {
                alert('Tanggal tidak boleh kosong!');
                return;
            }

            const newTransaction = {
                id: generateUniqueId(),
                type: currentTransactionType,
                amount: amountForSave,
                category: category,
                date: date,
                description: description,
                timestamp: new Date().toISOString()
            };

            let accounts = JSON.parse(localStorage.getItem(STORAGE_KEY_ACCOUNTS) || '[]');
            let activeAccount = accounts.find(acc => acc.id === localStorage.getItem(STORAGE_KEY_ACTIVE_ACCOUNT_ID));

            if (activeAccount) {
                activeAccount.transactions.push(newTransaction);
                // Update balance
                if (newTransaction.type === 'income') {
                    activeAccount.balance += newTransaction.amount;
                } else {
                    activeAccount.balance -= newTransaction.amount;
                }

                localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(accounts));
                
                if (closeTransactionModalButton) closeTransactionModalButton.click();
                updateDashboard(); // Memperbarui dashboard setelah menyimpan transaksi
            } else {
                alert('Tidak ada akun aktif yang ditemukan. Transaksi tidak dapat disimpan.');
            }
        });
    }


    // --- Inisialisasi Chart.js ---
    const ctx = document.getElementById('myChart');
    if (ctx) {
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'],
                datasets: [{
                    label: 'Pengeluaran Bulanan',
                    data: [0, 0, 0, 0, 0, 0],
                    backgroundColor: 'rgba(0, 135, 235, 0.6)',
                    borderColor: 'rgba(0, 135, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
});