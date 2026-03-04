const DB_BASE_URL = 'https://restaurant-6c90e-default-rtdb.firebaseio.com/';

let allProducts = [];
let categories = [];
let currentCategory = 'all';
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Sidebar elements
const hamburger = document.getElementById('hamburgerBtn');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const closeSidebar = document.getElementById('closeSidebar');
const darkModeToggle = document.getElementById('darkModeToggle');
const cartCountSpan = document.getElementById('cartCount');
const wishlistCountSpan = document.getElementById('wishlistCount');

// Toggle sidebar
function openSidebar() {
    sidebar.classList.add('active');
    overlay.classList.add('active');
}
function closeSidebarFunc() {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
}
hamburger.addEventListener('click', openSidebar);
closeSidebar.addEventListener('click', closeSidebarFunc);
overlay.addEventListener('click', closeSidebarFunc);

// Dark mode toggle
darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const icon = darkModeToggle.querySelector('i');
    if (document.body.classList.contains('dark-mode')) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
        darkModeToggle.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
        darkModeToggle.innerHTML = '<i class="fas fa-moon"></i> Dark Mode';
    }
});

// Smooth scroll to footer when contact link clicked
document.getElementById('contactLink').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('footer').scrollIntoView({ behavior: 'smooth' });
    closeSidebarFunc();
});

// Update counts
function updateCounts() {
    cartCountSpan.textContent = cart.length;
    wishlistCountSpan.textContent = wishlist.length;
}
updateCounts();

// Firebase functions
async function fetchData(endpoint) {
    try {
        const res = await fetch(DB_BASE_URL + endpoint + '.json');
        return await res.json();
    } catch (e) {
        console.error('Error fetching:', e);
        return null;
    }
}

// Show skeleton loading
function showSkeleton() {
    const grid = document.getElementById('productGrid');
    grid.innerHTML = '<div class="loading-skeleton">' + 
        '<div class="skeleton-card"></div>'.repeat(6) + '</div>';
}

async function loadData() {
    showSkeleton();

    const [catsData, prodsData] = await Promise.all([
        fetchData('categories'),
        fetchData('products')
    ]);

    categories = catsData ? Object.entries(catsData).map(([id, value]) => ({ id, ...value })) : [];
    allProducts = prodsData ? Object.entries(prodsData).map(([id, value]) => ({ id, ...value })) : [];

    renderCategoryButtons();
    filterAndRenderProducts();
}

function renderCategoryButtons() {
    const bar = document.getElementById('categoryBar');
    bar.innerHTML = '<button class="category-btn active" data-category="all">All Products</button>';
    
    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'category-btn';
        btn.dataset.category = cat.id;
        btn.textContent = cat.name;
        bar.appendChild(btn);
    });

    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.dataset.category;
            document.getElementById('categoryTitle').innerText = 
                currentCategory === 'all' ? 'All Products' : 
                (categories.find(c => c.id === currentCategory)?.name || 'Products');
            filterAndRenderProducts();
        });
    });
}

function filterAndRenderProducts() {
    const filtered = currentCategory === 'all' 
        ? allProducts 
        : allProducts.filter(p => p.categoryId === currentCategory);

    const grid = document.getElementById('productGrid');
    const noProducts = document.getElementById('noProducts');

    if (filtered.length === 0) {
        noProducts.style.display = 'block';
        grid.innerHTML = '';
        return;
    }
    noProducts.style.display = 'none';
    grid.innerHTML = '';

    filtered.forEach(prod => {
        const cat = categories.find(c => c.id === prod.categoryId);
        const catName = cat ? cat.name : 'Uncategorized';
        const isWishlisted = wishlist.includes(prod.id);
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-image">
                <img src="${prod.image || 'https://via.placeholder.com/300x200?text=No+Image'}" alt="${prod.name}" onerror="this.src='https://via.placeholder.com/300x200?text=Error'">
            </div>
            <div class="product-info">
                <div class="product-name">${prod.name}</div>
                <div class="product-price">${prod.price?.toLocaleString()} Tomans</div>
                <span class="product-category-badge">${catName}</span>
                <div class="product-actions">
                    <button class="add-to-cart" data-id="${prod.id}"><i class="fas fa-cart-plus"></i> Add</button>
                    <button class="wishlist-btn ${isWishlisted ? 'active' : ''}" data-id="${prod.id}"><i class="fas fa-heart"></i></button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });

    // Attach event listeners
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.id;
            addToCart(id);
        });
    });

    document.querySelectorAll('.wishlist-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.id;
            toggleWishlist(id, e.currentTarget);
        });
    });
}

// Cart functions
function addToCart(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    const existing = cart.find(item => item.id === productId);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCounts();
    alert('Product added to cart!');
}

// Wishlist functions
function toggleWishlist(productId, btn) {
    if (wishlist.includes(productId)) {
        wishlist = wishlist.filter(id => id !== productId);
        btn.classList.remove('active');
    } else {
        wishlist.push(productId);
        btn.classList.add('active');
    }
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    updateCounts();
}

loadData();

// Auto-refresh every 30 seconds (optional)
setInterval(loadData, 30000);