// App Logic

// State
let cart = [];
const MIN_ITEMS_FOR_CHECKOUT = 10;

// DOM Elements
const productGrid = document.getElementById('product-grid');
const cartDrawer = document.getElementById('cart-drawer');
const overlay = document.getElementById('overlay');
const cartItemsContainer = document.getElementById('cart-items');
const cartCountElement = document.getElementById('cart-count');
const cartTotalElement = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');
const checkoutModal = document.getElementById('checkout-modal');

// Initialize
function init() {
    renderProducts();
    updateCartUI();
}

// Render Products
function renderProducts() {
    productGrid.innerHTML = products.map(product => `
        <div class="product-card">
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <span class="product-price">${formatCurrency(product.price)}</span>
                <button class="btn btn-primary btn-block" onclick="addToCart(${product.id})">
                    Add to Cart
                </button>
            </div>
        </div>
    `).join('');
}

// Cart Functions
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        cart.push(product);
        updateCartUI();

        // Show feedback (optional)
        const btn = event.target;
        const originalText = btn.innerText;
        btn.innerText = "Added!";
        setTimeout(() => btn.innerText = originalText, 1000);

        // Open cart if it's the first item
        if (cart.length === 1) {
            toggleCart();
        }
    }
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartUI();
}

function updateCartUI() {
    // Update count
    cartCountElement.innerText = cart.length;

    // Update items list
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart-msg">Your cart is empty.</p>';
    } else {
        cartItemsContainer.innerHTML = cart.map((item, index) => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-details">
                    <div class="cart-item-title">${item.name}</div>
                    <div class="cart-item-price">${formatCurrency(item.price)}</div>
                    <button class="remove-btn" onclick="removeFromCart(${index})">Remove</button>
                </div>
            </div>
        `).join('');
    }

    // Update total
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    cartTotalElement.innerText = formatCurrency(total);

    // Update checkout button state
    if (cart.length >= MIN_ITEMS_FOR_CHECKOUT) {
        checkoutBtn.disabled = false;
        checkoutBtn.innerText = "Checkout Now";
    } else {
        checkoutBtn.disabled = true;
        checkoutBtn.innerText = `Checkout (Add ${MIN_ITEMS_FOR_CHECKOUT - cart.length} more)`;
    }
}

function toggleCart() {
    cartDrawer.classList.toggle('open');
    overlay.classList.toggle('active');
}

// Checkout Functions
function openCheckout() {
    toggleCart(); // Close drawer
    checkoutModal.classList.add('active');
    updateCheckoutSummary();
}

function closeCheckout() {
    checkoutModal.classList.remove('active');
}

function calculateDeliveryCost() {
    const distanceInput = document.getElementById('distance-input');
    const distance = parseFloat(distanceInput.value) || 0;

    const cost = api.calculateDeliveryCost(distance);

    document.getElementById('delivery-fee').innerText = formatCurrency(cost);
    updateCheckoutSummary(cost);
}

function updateCheckoutSummary(deliveryCost = 0) {
    // If deliveryCost is not passed, calculate it from current input
    if (deliveryCost === 0) {
        const distance = parseFloat(document.getElementById('distance-input').value) || 0;
        deliveryCost = api.calculateDeliveryCost(distance);
    }

    const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
    const total = subtotal + deliveryCost;

    document.getElementById('checkout-subtotal').innerText = formatCurrency(subtotal);
    document.getElementById('checkout-delivery').innerText = formatCurrency(deliveryCost);
    document.getElementById('checkout-total').innerText = formatCurrency(total);
}

async function handlePayment(event) {
    event.preventDefault();

    const form = event.target;
    const btn = form.querySelector('button[type="submit"]');
    const originalBtnText = btn.innerText;

    // Get form data
    const distance = parseFloat(document.getElementById('distance-input').value);
    const paymentMethod = form.querySelector('input[name="payment"]:checked').value;
    const phone = form.querySelector('input[type="tel"]').value;
    const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
    const deliveryCost = api.calculateDeliveryCost(distance);
    const totalAmount = subtotal + deliveryCost;

    // UI Loading State
    btn.disabled = true;
    btn.innerText = "Processing Payment...";

    try {
        const result = await api.processPayment(paymentMethod, phone, totalAmount);

        // Success
        alert(`Success! ${result.message}\nTransaction ID: ${result.transactionId}`);

        // Reset App
        cart = [];
        updateCartUI();
        closeCheckout();
        form.reset();
        document.getElementById('delivery-fee').innerText = formatCurrency(0);

    } catch (error) {
        alert("Error: " + error.message);
    } finally {
        btn.disabled = false;
        btn.innerText = originalBtnText;
    }
}

// Utility
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX', maximumFractionDigits: 0 }).format(amount);
}

// Start
init();
