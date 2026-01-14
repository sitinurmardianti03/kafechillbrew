document.addEventListener('DOMContentLoaded', () => {
    // --- Mobile Navigation Toggle ---
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileBtn && navLinks) {
        mobileBtn.addEventListener('click', () => {
            // Very simple toggle for now, could be animated better
            const isFlex = navLinks.style.display === 'flex';
            navLinks.style.display = isFlex ? 'none' : 'flex';

            // Basic mobile styling injection if active
            if (!isFlex) {
                navLinks.style.flexDirection = 'column';
                navLinks.style.position = 'absolute';
                navLinks.style.top = '100%';
                navLinks.style.left = '0';
                navLinks.style.width = '100%';
                navLinks.style.background = 'white';
                navLinks.style.padding = '1rem';
                navLinks.style.boxShadow = '0 4px 10px rgba(0,0,0,0.1)';
            } else {
                navLinks.style = ''; // reset
            }
        });
    }

    // --- Menu Category Filtering ---
    const categoryBtns = document.querySelectorAll('.category-btn');
    const menuCards = document.querySelectorAll('.menu-card');

    if (categoryBtns.length > 0) {
        categoryBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all
                categoryBtns.forEach(b => b.classList.remove('active'));
                // Add active to clicked
                btn.classList.add('active');

                const category = btn.textContent.trim();

                menuCards.forEach(card => {
                    const cardCategory = card.getAttribute('data-category');

                    if (category === 'All' || category === cardCategory) {
                        card.style.display = 'block';
                        // Add a small animation reset if needed
                        card.style.animation = 'none';
                        card.offsetHeight; /* trigger reflow */
                        card.style.animation = 'fadeInUp 0.5s ease-out';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }

    // --- Cart Logic ---
    // Load from LocalStorage if available
    let cartItems = JSON.parse(localStorage.getItem('chillBrewCart')) || [];

    // UI Elements
    const cartBtn = document.getElementById('cartBtn');
    const cartBadge = document.getElementById('cartBadge');

    // Check if we need to update badge on load
    if (cartBadge) updateCartBadge();

    // Modal Elements
    const cartModal = document.getElementById('cartModal');
    const closeBtn = document.querySelector('.close-modal');
    const cartItemsContainer = document.getElementById('cartItemsContainer');
    const cartTotalValue = document.getElementById('cartTotalValue');
    const btnCheckout = document.getElementById('btnCheckout');

    // 1. Add Item to Cart
    if (menuCards.length > 0) {
        menuCards.forEach(card => {
            card.addEventListener('click', () => {
                const itemName = card.querySelector('h3').textContent;
                const priceText = card.querySelector('.price').textContent; // e.g., "Rp 28.000"

                // Parse Price: "Rp 28.000" -> 28000
                const rawPrice = parseInt(priceText.replace(/[^0-9]/g, ''));

                // Add to Array
                cartItems.push({
                    name: itemName,
                    price: priceText,
                    rawPrice: rawPrice
                });

                // Save & Update
                localStorage.setItem('chillBrewCart', JSON.stringify(cartItems));
                updateCartBadge();

                // Visual Feedback
                const originalTransform = card.style.transform;
                card.style.transform = "scale(0.95)";
                setTimeout(() => { card.style.transform = originalTransform; }, 100);

                cartBtn.classList.add('shake');
                setTimeout(() => { cartBtn.classList.remove('shake'); }, 500);

                // Silent add (no toast) as requested previously
            });
        });
    }

    // 2. Open / Close Cart Modal
    if (cartBtn && cartModal) {
        cartBtn.addEventListener('click', () => {
            renderCartItems();
            cartModal.classList.add('open');
        });

        closeBtn.addEventListener('click', () => {
            cartModal.classList.remove('open');
        });

        // Close on clicking outside
        cartModal.addEventListener('click', (e) => {
            if (e.target === cartModal) {
                cartModal.classList.remove('open');
            }
        });
    }

    // 3. Render Cart Items
    function renderCartItems() {
        cartItemsContainer.innerHTML = '';
        let grandTotal = 0;

        if (cartItems.length === 0) {
            cartItemsContainer.innerHTML = '<div class="empty-cart-msg">Belum ada menu yang dipilih.</div>';
        } else {
            cartItems.forEach((item, index) => {
                grandTotal += item.rawPrice;

                const itemEl = document.createElement('div');
                itemEl.classList.add('cart-item');
                itemEl.innerHTML = `
                    <div class="item-info">
                        <h4>${item.name}</h4>
                        <span class="item-price">${item.price}</span>
                    </div>
                    <button class="item-remove" data-index="${index}">Hapus</button>
                `;
                cartItemsContainer.appendChild(itemEl);
            });

            // Add Event Listeners for Remove Buttons
            document.querySelectorAll('.item-remove').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const indexToRemove = parseInt(e.target.getAttribute('data-index'));
                    cartItems.splice(indexToRemove, 1);
                    localStorage.setItem('chillBrewCart', JSON.stringify(cartItems)); // Save
                    updateCartBadge();
                    renderCartItems(); // Re-render
                });
            });
        }

        // Update Total Text
        cartTotalValue.textContent = `Rp ${grandTotal.toLocaleString('id-ID')}`;
    }

    // 4. Update Badge
    function updateCartBadge() {
        const count = cartItems.length;
        cartBadge.textContent = count;
        if (count > 0) {
            cartBadge.classList.add('show');
        } else {
            cartBadge.classList.remove('show');
        }
    }

    // --- Receipt Modal Logic ---

    // Inject Receipt Modal HTML
    const receiptModalHTML = `
        <div class="receipt-modal-overlay" id="receiptModal">
            <div class="receipt-modal">
                <div class="receipt-content">
                    <div class="receipt-header">
                        <h2>Chill Brew</h2>
                        <div class="receipt-meta" id="receiptDate"></div>
                        <div class="receipt-meta">Transaction ID: <span id="receiptId"></span></div>
                    </div>
                    <div class="receipt-items" id="receiptItems">
                        <!-- Items injected here -->
                    </div>
                    <div class="receipt-divider"></div>
                    <div class="receipt-total">
                        <span>TOTAL</span>
                        <span id="receiptTotal"></span>
                    </div>
                    <div class="receipt-footer">
                        <p>Terima Kasih!</p>
                        <p>Silahkan tunjukkan struk ini ke kasir.</p>
                        <div style="display: flex; gap: 10px; justify-content: center; margin-top: 20px;">
                            <button class="btn-close-receipt" id="btnDownloadReceipt" style="background-color: var(--color-primary);">Download</button>
                            <button class="btn-close-receipt" id="btnCloseReceipt">Tutup</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', receiptModalHTML);

    const receiptModal = document.getElementById('receiptModal');
    const receiptDate = document.getElementById('receiptDate');
    const receiptId = document.getElementById('receiptId');
    const receiptItemsContainer = document.getElementById('receiptItems');
    const receiptTotal = document.getElementById('receiptTotal');
    const btnCloseReceipt = document.getElementById('btnCloseReceipt');
    const btnDownloadReceipt = document.getElementById('btnDownloadReceipt');

    function showReceipt(paymentMethod = '-') {
        const now = new Date();
        receiptDate.textContent = now.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
        receiptId.innerHTML = `TRX-${Math.floor(Math.random() * 1000000)}<br>Pay: ${paymentMethod}`;

        receiptItemsContainer.innerHTML = '';
        let total = 0;
        cartItems.forEach(item => {
            const el = document.createElement('div');
            el.classList.add('receipt-item');
            el.innerHTML = `
                <span>${item.name}</span>
                <span>${item.price}</span>
            `;
            receiptItemsContainer.appendChild(el);
            total += item.rawPrice;
        });

        receiptTotal.textContent = `Rp ${total.toLocaleString('id-ID')}`;
        receiptModal.classList.add('open');
    }

    if (btnDownloadReceipt) {
        btnDownloadReceipt.addEventListener('click', () => {
            const receiptContent = document.querySelector('.receipt-content');

            // Hide buttons for capture
            const originalBtnText = btnDownloadReceipt.textContent;
            btnDownloadReceipt.textContent = 'Downloading...';

            // Exclude the buttons div via CSS temporarily or clone node, but simpler to just hide
            // actually better to capture the whole .receipt-content but we want to exclude the footer buttons? 
            // Let's just capture .receipt-content for simplicity, the buttons will show. 
            // Users usually want the buttons invisible.
            const buttonsDiv = receiptContent.querySelector('.receipt-footer div');
            if (buttonsDiv) buttonsDiv.style.opacity = '0';

            html2canvas(receiptContent, {
                scale: 2, // higher quality
                backgroundColor: '#ffffff'
            }).then(canvas => {
                const link = document.createElement('a');
                link.download = `ChillBrew-Receipt-${receiptId.textContent}.png`;
                link.href = canvas.toDataURL();
                link.click();

                // Restore
                if (buttonsDiv) buttonsDiv.style.opacity = '1';
                btnDownloadReceipt.textContent = originalBtnText;
            }).catch(err => {
                console.error("Screenshot failed", err);
                alert("Gagal mengunduh struk. Silakan coba lagi.");
                if (buttonsDiv) buttonsDiv.style.opacity = '1';
                btnDownloadReceipt.textContent = originalBtnText;
            });
        });
    }

    if (btnCloseReceipt) {
        btnCloseReceipt.addEventListener('click', () => {
            receiptModal.classList.remove('open');
            cartItems = [];
            localStorage.removeItem('chillBrewCart');
            updateCartBadge();
            renderCartItems();
        });
    }

    // --- Inline Payment Logic ---
    const paymentMethods = document.querySelectorAll('.payment-method');
    let selectedPaymentMethod = '';

    // Handle Payment Selection
    paymentMethods.forEach(method => {
        method.addEventListener('click', () => {
            paymentMethods.forEach(m => m.classList.remove('selected'));
            method.classList.add('selected');
            selectedPaymentMethod = method.getAttribute('data-method');
        });
    });

    // Reset selection when opening cart
    if (cartBtn) {
        cartBtn.addEventListener('click', () => {
            selectedPaymentMethod = '';
            paymentMethods.forEach(m => m.classList.remove('selected'));
        });
    }

    // 5. Checkout Action
    if (btnCheckout) {
        btnCheckout.addEventListener('click', () => {
            if (cartItems.length === 0) {
                alert('Keranjang Anda kosong!');
                return;
            }

            if (!selectedPaymentMethod) {
                alert('Silakan pilih metode pembayaran terlebih dahulu!');
                return;
            }

            // Close Cart Modal
            cartModal.classList.remove('open');

            // Show Receipt
            showReceipt(selectedPaymentMethod);
        });
    }
});
