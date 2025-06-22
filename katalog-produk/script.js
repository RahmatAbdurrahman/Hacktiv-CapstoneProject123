document.addEventListener('DOMContentLoaded', () => {
    // --- Elemen DOM ---
    const productForm = document.getElementById('productForm');
    const productIdInput = document.getElementById('productId');
    const productNameInput = document.getElementById('productName');
    const productDescriptionInput = document.getElementById('productDescription');
    const productPriceInput = document.getElementById('productPrice');
    const productCategoryInput = document.getElementById('productCategory');
    const productImageInput = document.getElementById('productImage');
    const submitBtn = document.getElementById('submitBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const formTitle = document.getElementById('formTitle');
    const productListDiv = document.getElementById('productList');
    const searchInput = document.getElementById('searchInput');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const sortSelect = document.getElementById('sortSelect');
    const noProductMessage = document.getElementById('noProductMessage');

    let currentProducts = []; // Untuk menyimpan data produk yang sedang ditampilkan setelah filter/sort
    let activeFilter = 'Semua';
    let activeSort = 'default';

    // --- Fungsi Utilitas Local Storage ---
    function getProductsFromLocalStorage() {
        const productsJSON = localStorage.getItem('products');
        return productsJSON ? JSON.parse(productsJSON) : [];
    }

    function saveProductsToLocalStorage(products) {
        localStorage.setItem('products', JSON.stringify(products));
    }

    // --- Data Dummy (untuk pertama kali jika Local Storage kosong) ---
    function initializeDummyProducts() {
        if (!getProductsFromLocalStorage().length) {
            const dummyProducts = [
                { id: 'prod-1', name: 'Laptop Gaming ROG Strix', description: 'Laptop gaming berperforma tinggi dengan RTX 4080.', price: 25000000, category: 'Elektronik', image_url: 'https://dlcdnwebimgs.asus.com/files/media/7307645F-321A-46F8-8DED-BEA6BFC2A968/v1/img-webp/kv/pd-back.webp' },
                { id: 'prod-2', name: 'Kemeja Batik Modern', description: 'Kemeja batik katun nyaman dengan motif kontemporer.', price: 350000, category: 'Pakaian', image_url: 'https://via.placeholder.com/200x150/FF9900/FFFFFF?text=Batik' },
                { id: 'prod-3', name: 'Buku Fiksi Ilmiah: Dune', description: 'Novel fiksi ilmiah epik karya Frank Herbert.', price: 120000, category: 'Buku', image_url: 'https://via.placeholder.com/200x150/FFD700/FFFFFF?text=DuneBook' },
                { id: 'prod-4', name: 'Lampu Meja Minimalis', description: 'Lampu meja dengan desain modern, cocok untuk ruang kerja.', price: 180000, category: 'Dekorasi Rumah', image_url: 'https://via.placeholder.com/200x150/ADFF2F/FFFFFF?text=Lampu' },
                { id: 'prod-5', name: 'Headphone Nirkabel Premium', description: 'Kualitas suara superior dengan pembatalan bising aktif.', price: 1800000, category: 'Elektronik', image_url: 'https://via.placeholder.com/200x150/4CAF50/FFFFFF?text=Headphone' },
                { id: 'prod-6', name: 'Celana Jeans Slim Fit', description: 'Celana jeans nyaman dengan potongan modern.', price: 450000, category: 'Pakaian', image_url: 'https://via.placeholder.com/200x150/2196F3/FFFFFF?text=Jeans' },
                { id: 'prod-7', name: 'Buku Resep Masakan Indonesia', description: 'Kumpulan resep masakan tradisional Indonesia.', price: 95000, category: 'Buku', image_url: 'https://via.placeholder.com/200x150/3F51B5/FFFFFF?text=ResepBuku' },
                { id: 'prod-8', name: 'Tanaman Hias Monstera', description: 'Monstera deliciosa, mempercantik ruangan Anda.', price: 280000, category: 'Dekorasi Rumah', image_url: 'https://via.placeholder.com/200x150/9C27B0/FFFFFF?text=Monstera' },
                { id: 'prod-9', name: 'Smartwatch Canggih', description: 'Smartwatch dengan fitur pelacakan kesehatan dan notifikasi.', price: 1200000, category: 'Elektronik', image_url: 'https://via.placeholder.com/200x150/E91E63/FFFFFF?text=Smartwatch' },
                { id: 'prod-10', name: 'Jaket Bomber Stylish', description: 'Jaket bomber dengan bahan berkualitas tinggi, nyaman dan modis.', price: 600000, category: 'Pakaian', image_url: 'https://via.placeholder.com/200x150/F44336/FFFFFF?text=Jaket' },
                { id: 'prod-11', name: 'Novel Misteri: Sherlock Holmes', description: 'Kumpulan cerita detektif klasik dari Arthur Conan Doyle.', price: 110000, category: 'Buku', image_url: 'https://via.placeholder.com/200x150/FFC107/FFFFFF?text=Sherlock' },
                { id: 'prod-12', name: 'Cangkir Kopi Keramik', description: 'Set 4 cangkir kopi keramik handmade.', price: 75000, category: 'Dekorasi Rumah', image_url: 'https://via.placeholder.com/200x150/8BC34A/FFFFFF?text=Cangkir' },
                { id: 'prod-13', name: 'Monitor Gaming Ultra-Wide', description: 'Monitor layar lebar untuk pengalaman gaming imersif.', price: 4500000, category: 'Elektronik', image_url: 'https://via.placeholder.com/200x150/03A9F4/FFFFFF?text=Monitor' },
                { id: 'prod-14', name: 'Tas Ransel Anti Air', description: 'Tas ransel kokoh dan anti air untuk petualangan.', price: 290000, category: 'Pakaian', image_url: 'https://via.placeholder.com/200x150/673AB7/FFFFFF?text=Ransel' },
                { id: 'prod-15', name: 'Komik Jepang: One Piece', description: 'Serial manga petualangan populer di seluruh dunia.', price: 35000, category: 'Buku', image_url: 'https://via.placeholder.com/200x150/FF5722/FFFFFF?text=OnePiece' }
            ];
            saveProductsToLocalStorage(dummyProducts);
        }
    }

    // Fungsi untuk membuat ID unik (bisa menggunakan Date.now() + random string)
    function generateUniqueId() {
        return 'prod-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
    }

    // --- Fungsi Menampilkan Produk ---
    function displayProducts(productsToDisplay) {
        productListDiv.innerHTML = ''; // Kosongkan daftar
        noProductMessage.classList.add('hidden'); // Sembunyikan pesan tidak ada produk

        if (productsToDisplay.length === 0) {
            noProductMessage.classList.remove('hidden'); // Tampilkan pesan
            return;
        }

        productsToDisplay.forEach(product => {
            const productCard = document.createElement('div');
            productCard.classList.add(
                'product-card',
                'bg-white', 'rounded-xl', 'shadow-lg', 'overflow-hidden',
                'transition-all', 'duration-300', 'hover:shadow-xl', 'hover:scale-102',
                'flex', 'flex-col', 'h-full' // Flexbox untuk membuat card memiliki tinggi yang sama
            );
            productCard.setAttribute('data-id', product.id);

            productCard.innerHTML = `
                <img src="${product.image_url || 'https://via.placeholder.com/200x150/DDDDDD/666666?text=No+Image'}" 
                     alt="${product.name}" class="w-full h-40 object-contain object-center">
                <div class="p-5 flex-grow flex flex-col">
                    <h3 class="text-xl font-semibold text-gray-900 mb-2">${product.name}</h3>
                    <p class="text-sm text-gray-600 mb-3 flex-grow">${product.description}</p>
                    <p class="text-lg font-bold text-blue-600 mt-auto">Rp ${product.price.toLocaleString('id-ID')}</p>
                    <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full self-start mt-2">${product.category || 'Lain-lain'}</span>
                </div>
                <div class="p-5 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                    <button class="edit-btn px-4 py-2 rounded-lg bg-yellow-500 text-white text-sm font-semibold hover:bg-yellow-600 transition-colors duration-200">Edit</button>
                    <button class="delete-btn px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors duration-200">Hapus</button>
                </div>
            `;
            productListDiv.appendChild(productCard);
        });

        addEventListenersToProductCards();
    }

    // --- Event Listeners untuk Tombol Edit & Hapus ---
    function addEventListenersToProductCards() {
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.onclick = (event) => {
                const productId = event.target.closest('.product-card').dataset.id;
                editProduct(productId);
            };
        });

        document.querySelectorAll('.delete-btn').forEach(button => {
            button.onclick = (event) => {
                const productId = event.target.closest('.product-card').dataset.id;
                deleteProduct(productId);
            };
        });
    }

    // --- Fungsi Pencarian, Filter, dan Sortir ---
    function applyFiltersAndSort() {
        let products = getProductsFromLocalStorage();
        let filteredProducts = products;

        // Apply Search
        const searchTerm = searchInput.value.toLowerCase().trim();
        if (searchTerm) {
            filteredProducts = filteredProducts.filter(product =>
                product.name.toLowerCase().includes(searchTerm) ||
                product.description.toLowerCase().includes(searchTerm) ||
                (product.category && product.category.toLowerCase().includes(searchTerm))
            );
        }

        // Apply Filter by Category
        if (activeFilter !== 'Semua') {
            filteredProducts = filteredProducts.filter(product =>
                product.category && product.category.toLowerCase() === activeFilter.toLowerCase()
            );
        }

        // Apply Sort
        switch (activeSort) {
            case 'name-asc':
                filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name-desc':
                filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case 'price-asc':
                filteredProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                filteredProducts.sort((a, b) => b.price - a.price);
                break;
            default:
                // No sort
                break;
        }

        currentProducts = filteredProducts; // Simpan hasil filter/sort
        displayProducts(currentProducts);
    }

    // --- Event Listeners untuk Search, Filter, Sort ---
    searchInput.addEventListener('input', applyFiltersAndSort);

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Hapus kelas aktif dari semua tombol filter
            filterButtons.forEach(btn => btn.classList.remove('bg-red-700', 'scale-105', 'font-bold'));
            filterButtons.forEach(btn => btn.classList.add('bg-red-400', 'hover:bg-red-500')); // Kembalikan ke default

            // Tambahkan kelas aktif ke tombol yang diklik
            button.classList.add('bg-red-700', 'scale-105', 'font-bold');
            button.classList.remove('bg-red-400', 'hover:bg-red-500'); // Hapus default agar tidak konflik

            activeFilter = button.dataset.category;
            applyFiltersAndSort();
        });
    });
    // Set 'Semua' sebagai filter aktif awal
    document.querySelector('.filter-btn[data-category="Semua"]').classList.add('bg-red-700', 'scale-105', 'font-bold');
    document.querySelector('.filter-btn[data-category="Semua"]').classList.remove('bg-red-400', 'hover:bg-red-500');


    sortSelect.addEventListener('change', (event) => {
        activeSort = event.target.value;
        applyFiltersAndSort();
    });

    // --- Fungsi Tambah/Edit Produk ---
    productForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const id = productIdInput.value;
        const name = productNameInput.value.trim();
        const description = productDescriptionInput.value.trim();
        const price = parseFloat(productPriceInput.value);
        const category = productCategoryInput.value.trim();
        const imageUrl = productImageInput.value.trim();

        if (!name || isNaN(price) || price <= 0) {
            alert('Nama produk dan Harga harus diisi dengan benar (harga harus angka positif)!');
            return;
        }

        const newProduct = {
            id: id || generateUniqueId(),
            name,
            description,
            price,
            category,
            image_url: imageUrl
        };

        let products = getProductsFromLocalStorage();

        if (id) { // Mode edit
            products = products.map(product => product.id === id ? newProduct : product);
        } else { // Mode tambah
            products.push(newProduct);
        }

        saveProductsToLocalStorage(products);
        resetForm(); // Reset formulir setelah submit
        applyFiltersAndSort(); // Perbarui tampilan dengan filter/sort yang sedang aktif
    });

    // --- Fungsi Edit Produk (memuat data ke formulir) ---
    function editProduct(id) {
        const products = getProductsFromLocalStorage();
        const productToEdit = products.find(product => product.id === id);

        if (productToEdit) {
            productIdInput.value = productToEdit.id;
            productNameInput.value = productToEdit.name;
            productDescriptionInput.value = productToEdit.description;
            productPriceInput.value = productToEdit.price;
            productCategoryInput.value = productToEdit.category;
            productImageInput.value = productToEdit.image_url;

            formTitle.textContent = 'Edit Produk';
            submitBtn.textContent = 'Simpan Perubahan';
            cancelEditBtn.style.display = 'inline-block';
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); // Scroll ke formulir
        }
    }

    // --- Fungsi Reset Formulir ---
    function resetForm() {
        productForm.reset();
        productIdInput.value = '';
        formTitle.textContent = 'Tambah Produk Baru';
        submitBtn.textContent = 'Tambah Produk';
        cancelEditBtn.style.display = 'none';
    }

    // --- Event Listener Tombol Batal Edit ---
    cancelEditBtn.addEventListener('click', resetForm);

    // --- Fungsi Hapus Produk ---
    function deleteProduct(id) {
        if (confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
            let products = getProductsFromLocalStorage();
            products = products.filter(product => product.id !== id);
            saveProductsToLocalStorage(products);
            applyFiltersAndSort(); // Perbarui tampilan
            resetForm(); // Pastikan formulir direset jika produk yang sedang diedit dihapus
        }
    }

    // --- Inisialisasi Aplikasi ---
    initializeDummyProducts(); // Muat produk dummy jika belum ada
    applyFiltersAndSort(); // Tampilkan semua produk saat pertama kali dimuat
});