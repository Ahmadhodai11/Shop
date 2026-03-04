const DB_BASE_URL = 'https://restaurant-6c90e-default-rtdb.firebaseio.com/';
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Get references
const placeOrderBtn = document.getElementById('placeOrderBtn');
const customerName = document.getElementById('customerName');
const customerPhone = document.getElementById('customerPhone');
const customerAddress = document.getElementById('customerAddress');

function renderCart() {
    const container = document.getElementById('cartItems');
    const totalDiv = document.getElementById('total');
    const checkoutForm = document.getElementById('checkoutForm');

    if (cart.length === 0) {
        container.innerHTML = '<p>Your cart is empty.</p>';
        totalDiv.innerHTML = '';
        checkoutForm.style.display = 'none';
        return;
    }

    let html = '';
    let total = 0;
    cart.forEach((item, index) => {
        total += item.price * item.quantity;
        html += `
            <div class="cart-item">
                <img src="${item.image || 'https://via.placeholder.com/80'}" alt="${item.name}">
                <div class="item-details">
                    <div class="item-name">${item.name}</div>
                    <div class="item-price">${item.price.toLocaleString()} Tomans</div>
                    <div class="item-quantity">
                        <button class="quantity-btn" onclick="changeQty(${index}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn" onclick="changeQty(${index}, 1)">+</button>
                    </div>
                </div>
                <button class="remove-btn" onclick="removeItem(${index})">Remove</button>
            </div>
        `;
    });
    container.innerHTML = html;
    totalDiv.innerHTML = `Total: ${total.toLocaleString()} Tomans`;
    checkoutForm.style.display = 'block';
}

window.changeQty = (index, delta) => {
    cart[index].quantity += delta;
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
};

window.removeItem = (index) => {
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
};

// Place order with loading and redirect to admin panel
placeOrderBtn.addEventListener('click', async (e) => {
    const name = customerName.value.trim();
    const phone = customerPhone.value.trim();
    const address = customerAddress.value.trim();

    if (!name || !phone || !address) {
        alert('Please fill all fields');
        return;
    }

    if (cart.length === 0) {
        alert('Cart is empty');
        return;
    }

    // Show loading state
    const originalText = placeOrderBtn.innerHTML;
    placeOrderBtn.innerHTML = '<span class="spinner"></span> Placing order...';
    placeOrderBtn.disabled = true;

    const order = {
        customer: { name, phone, address },
        items: cart,
        total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
        timestamp: new Date().toISOString()
    };

    try {
        await fetch(DB_BASE_URL + 'orders.json', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(order)
        });

        // Success: clear cart and redirect to admin panel
        localStorage.removeItem('cart');
        cart = [];
        window.location.href = 'admin.html'; // Change to your admin page URL
    } catch (e) {
        alert('Error placing order. Please try again.');
        // Re-enable button and restore text
        placeOrderBtn.innerHTML = originalText;
        placeOrderBtn.disabled = false;
    }
});

// Initial render
renderCart();