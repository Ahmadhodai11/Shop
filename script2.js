const DB_BASE_URL = 'https://restaurant-6c90e-default-rtdb.firebaseio.com/';
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
let allProducts = [];

async function loadProducts() {
    const res = await fetch(DB_BASE_URL + 'products.json');
    const prodsData = await res.json();
    allProducts = prodsData ? Object.entries(prodsData).map(([id, value]) => ({ id, ...value })) : [];
    renderWishlist();
}

function renderWishlist() {
    const container = document.getElementById('wishlistItems');
    const wishlistProducts = allProducts.filter(p => wishlist.includes(p.id));

    if (wishlistProducts.length === 0) {
        container.innerHTML = '<p>Your wishlist is empty.</p>';
        return;
    }

    let html = '';
    wishlistProducts.forEach(prod => {
        html += `
            <div class="wishlist-item">
                <img src="${prod.image || 'https://via.placeholder.com/80'}" alt="${prod.name}">
                <div class="item-details">
                    <div class="item-name">${prod.name}</div>
                    <div class="item-price">${prod.price?.toLocaleString()} Tomans</div>
                </div>
                <button class="add-to-cart-btn" onclick="addToCart('${prod.id}')">Add to Cart</button>
                <button class="remove-btn" onclick="removeFromWishlist('${prod.id}')">Remove</button>
            </div>
        `;
    });
    container.innerHTML = html;
}

window.addToCart = (id) => {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const product = allProducts.find(p => p.id === id);
    if (!product) return;
    const existing = cart.find(item => item.id === id);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    alert('Product added to cart!');
};

window.removeFromWishlist = (id) => {
    wishlist = wishlist.filter(item => item !== id);
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    renderWishlist();
};

loadProducts();