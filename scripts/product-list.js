// ── CART STATE ──
let cart = [];
let currentModalProduct = { name: '', price: 0 };

// ══════════════════════════════════════
// TOPBAR SCROLL SHADOW
// ══════════════════════════════════════
window.addEventListener('scroll', () => {
  const topbar = document.getElementById('topbar');
  if (topbar) {
    topbar.style.boxShadow = window.scrollY > 10
      ? '0 2px 16px rgba(0,0,0,.1)'
      : '0 1px 8px rgba(0,0,0,.06)';
  }
});

// ══════════════════════════════════════
// MOBILE NAV
// ══════════════════════════════════════
function toggleMobileNav() {
  const nav = document.getElementById('mobileNav');
  if (nav) nav.classList.toggle('open');
}

// ══════════════════════════════════════
// SEARCH
// ══════════════════════════════════════
function handleSearch() {
  const query = document.getElementById('searchInput').value.trim().toLowerCase();
  const cards = document.querySelectorAll('.product-card');
  const sections = document.querySelectorAll('.product-section');

  if (!query) {
    cards.forEach(c => c.style.display = '');
    sections.forEach(s => s.classList.remove('hidden'));
    updateResultsCount();
    return;
  }

  let totalVisible = 0;

  sections.forEach(section => {
    const sectionCards = section.querySelectorAll('.product-card');
    let sectionVisible = 0;
    sectionCards.forEach(card => {
      const name = card.dataset.name.toLowerCase();
      const cat  = card.dataset.cat.toLowerCase();
      const matches = name.includes(query) || cat.includes(query);
      card.style.display = matches ? '' : 'none';
      if (matches) { sectionVisible++; totalVisible++; }
    });
    section.classList.toggle('hidden', sectionVisible === 0);
  });

  document.getElementById('resultsCount').textContent =
    `Showing ${totalVisible} result${totalVisible !== 1 ? 's' : ''} for "${query}"`;
}

// ══════════════════════════════════════
// CATEGORY FILTER
// ══════════════════════════════════════
function filterCategory(cat, el) {
  // Update active state
  document.querySelectorAll('.cat-item').forEach(i => i.classList.remove('active'));
  el.classList.add('active');

  const sections = document.querySelectorAll('.product-section');

  if (cat === 'all') {
    sections.forEach(s => {
      s.classList.remove('hidden');
      s.querySelectorAll('.product-card').forEach(c => c.style.display = '');
    });
  } else {
    sections.forEach(s => {
      const sectionCat = s.dataset.section;
      if (sectionCat === cat) {
        s.classList.remove('hidden');
        s.querySelectorAll('.product-card').forEach(c => c.style.display = '');
      } else {
        s.classList.add('hidden');
      }
    });
  }

  updateResultsCount();

  // Smooth scroll to top of content
  const content = document.querySelector('.shop-content');
  if (content) content.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ══════════════════════════════════════
// SORT PRODUCTS
// ══════════════════════════════════════
function sortProducts(method) {
  document.querySelectorAll('.product-section').forEach(section => {
    const grid = section.querySelector('.product-grid');
    if (!grid) return;

    const cards = Array.from(grid.querySelectorAll('.product-card'));

    cards.sort((a, b) => {
      switch (method) {
        case 'price-asc':
          return parseFloat(a.dataset.price) - parseFloat(b.dataset.price);
        case 'price-desc':
          return parseFloat(b.dataset.price) - parseFloat(a.dataset.price);
        case 'rating':
          return parseFloat(b.dataset.rating) - parseFloat(a.dataset.rating);
        case 'name':
          return a.dataset.name.localeCompare(b.dataset.name);
        default:
          return 0;
      }
    });

    // Re-append in sorted order
    cards.forEach(c => grid.appendChild(c));
  });

  showToast(`Sorted by: ${getSortLabel(method)}`);
}

function getSortLabel(method) {
  const labels = {
    'default':    'Default',
    'price-asc':  'Price: Low to High',
    'price-desc': 'Price: High to Low',
    'rating':     'Top Rated',
    'name':       'Name A–Z'
  };
  return labels[method] || method;
}

// ══════════════════════════════════════
// FILTER TOGGLES
// ══════════════════════════════════════
function toggleFilter(id) {
  const body = document.getElementById('filter-' + id);
  if (!body) return;
  body.classList.toggle('hidden');

  // Rotate chevron
  const label = body.previousElementSibling;
  if (label) {
    const chevron = label.querySelector('.filter-chevron');
    if (chevron) chevron.classList.toggle('open');
  }
}

// ══════════════════════════════════════
// PRICE RANGE
// ══════════════════════════════════════
function updatePrice(val) {
  document.getElementById('priceMax').textContent = '$' + val;

  // Update slider gradient
  const slider = document.getElementById('priceSlider');
  const pct = (val / 500) * 100;
  slider.style.background = `linear-gradient(to right, #E8A020 0%, #E8A020 ${pct}%, #E8E8E8 ${pct}%)`;
}

// ══════════════════════════════════════
// SIZE SELECT
// ══════════════════════════════════════
function selectSize(el) {
  el.closest('.size-options').querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
}

// ══════════════════════════════════════
// COLOR SELECT
// ══════════════════════════════════════
function selectColor(el) {
  el.closest('.color-options').querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
  el.classList.add('active');
}

// ══════════════════════════════════════
// APPLY FILTER
// ══════════════════════════════════════
function applyFilter() {
  const maxPrice = parseInt(document.getElementById('priceSlider').value);
  const cards = document.querySelectorAll('.product-card');
  const sections = document.querySelectorAll('.product-section');

  let visible = 0;

  sections.forEach(section => {
    const sectionCards = section.querySelectorAll('.product-card');
    let sectionVisible = 0;
    sectionCards.forEach(card => {
      const price = parseFloat(card.dataset.price);
      if (price <= maxPrice) {
        card.style.display = '';
        sectionVisible++;
        visible++;
      } else {
        card.style.display = 'none';
      }
    });
    section.classList.toggle('hidden', sectionVisible === 0);
  });

  updateResultsCount();
  showToast(`Filter applied — max price $${maxPrice}`);
}

// ══════════════════════════════════════
// WISHLIST
// ══════════════════════════════════════
function toggleWishlist(btn) {
  btn.classList.toggle('wished');
  const card = btn.closest('.product-card');
  const name = card ? card.dataset.name : 'Item';
  if (btn.classList.contains('wished')) {
    showToast(`💛 ${name} added to wishlist`);
  } else {
    showToast(`Removed from wishlist`);
  }
}

// ══════════════════════════════════════
// QUICK VIEW MODAL
// ══════════════════════════════════════
function quickView(name, price) {
  currentModalProduct = { name, price };
  document.getElementById('modalName').textContent  = name;
  document.getElementById('modalPrice').textContent = '$' + price;
  document.getElementById('quickViewModal').classList.add('open');
  document.getElementById('modalOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('quickViewModal').classList.remove('open');
  document.getElementById('modalOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

function addToCartFromModal() {
  addToCartItem(currentModalProduct.name, currentModalProduct.price);
  closeModal();
}

// ══════════════════════════════════════
// CART
// ══════════════════════════════════════
function addToCart(name, price, btn) {
  addToCartItem(name, price);

  // Button feedback
  if (btn) {
    const original = btn.textContent;
    btn.textContent = '✓ Added';
    btn.classList.add('added');
    setTimeout(() => {
      btn.textContent = original;
      btn.classList.remove('added');
    }, 1800);
  }
}

function addToCartItem(name, price) {
  const existing = cart.find(i => i.name === name);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ name, price, qty: 1 });
  }
  updateCartUI();
  showToast(`🛍️ ${name} added to cart`);
}

function updateCartUI() {
  const count = cart.reduce((sum, i) => sum + i.qty, 0);
  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  document.getElementById('cartCount').textContent = count;
  document.getElementById('cartTotal').textContent = '$' + total;

  const cartItems = document.getElementById('cartItems');
  const cartEmpty = document.getElementById('cartEmpty');

  if (cart.length === 0) {
    cartEmpty.style.display = 'block';
    cartItems.innerHTML = '';
  } else {
    cartEmpty.style.display = 'none';
    cartItems.innerHTML = cart.map((item, idx) => `
      <div class="cart-item">
        <div style="flex:1;">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">$${item.price}</div>
          <div class="cart-item-qty">
            <button class="qty-btn" onclick="changeQty(${idx}, -1)">−</button>
            <span class="qty-num">${item.qty}</span>
            <button class="qty-btn" onclick="changeQty(${idx}, 1)">+</button>
          </div>
        </div>
        <span class="cart-item-remove" onclick="removeFromCart(${idx})">✕</span>
      </div>
    `).join('');
  }
}

function changeQty(idx, delta) {
  cart[idx].qty += delta;
  if (cart[idx].qty <= 0) cart.splice(idx, 1);
  updateCartUI();
}

function removeFromCart(idx) {
  const name = cart[idx].name;
  cart.splice(idx, 1);
  updateCartUI();
  showToast(`Removed: ${name}`);
}

function toggleCart() {
  const drawer  = document.getElementById('cartDrawer');
  const overlay = document.getElementById('cartOverlay');
  drawer.classList.toggle('open');
  overlay.classList.toggle('open');
  document.body.style.overflow = drawer.classList.contains('open') ? 'hidden' : '';
}

function checkout() {
  if (cart.length === 0) {
    showToast('Your cart is empty!');
    return;
  }
  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  showToast(`✅ Order placed! Total: $${total}`);
  cart = [];
  updateCartUI();
  toggleCart();
}

// ══════════════════════════════════════
// PROMO ALERT
// ══════════════════════════════════════
function showPromoAlert() {
  showToast('🎉 Use code AFRITEX10 for 10% off your first order!');
}

// ══════════════════════════════════════
// RESULTS COUNT
// ══════════════════════════════════════
function updateResultsCount() {
  const visible = Array.from(document.querySelectorAll('.product-card'))
    .filter(c => c.style.display !== 'none').length;
  document.getElementById('resultsCount').textContent =
    `Showing ${visible} product${visible !== 1 ? 's' : ''}`;
}

// ══════════════════════════════════════
// TOAST NOTIFICATION
// ══════════════════════════════════════
let toastTimer = null;
function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

// ══════════════════════════════════════
// INIT — SCROLL REVEAL ON CARDS
// ══════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  // Init results count
  updateResultsCount();

  // Init price slider gradient
  updatePrice(document.getElementById('priceSlider').value);

  // Scroll reveal for product cards
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, i * 60);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.product-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity .5s ease, transform .5s ease, box-shadow .25s, transform .25s';
    observer.observe(card);
  });

  // Close mobile nav when clicking a link
  document.querySelectorAll('.mobile-nav a').forEach(a => {
    a.addEventListener('click', () => {
      document.getElementById('mobileNav').classList.remove('open');
    });
  });

  // Close modal on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
      const drawer = document.getElementById('cartDrawer');
      if (drawer.classList.contains('open')) toggleCart();
    }
  });
});
   const orders = [
      { emoji: '🧣', name: 'Ankara Bracelet',  id: '#AFRI1208', designer: 'House of Angela',   date: 'Feb 21', status: 'delivered',  total: '$24' },
      { emoji: '📿', name: 'Cowrie Necklace',  id: '#AFRI1203', designer: 'Zuri Accessories',  date: 'Feb 28', status: 'shipped',    total: '$23' },
      { emoji: '💎', name: 'Beaded Earrings',  id: '#AFRI1197', designer: 'Nairobi Craft',     date: 'Feb 29', status: 'delivered',  total: '$12' },
      { emoji: '👟', name: 'Ankara Sandals',   id: '#AFRI1185', designer: 'Lagos Designs',     date: 'Mar 25', status: 'processing', total: '$23' },
      { emoji: '📿', name: 'Tribal Necklace',  id: '#AFRI1288', designer: 'Sahara Craft',      date: 'Jul 01', status: 'delivered',  total: '$34' },
      { emoji: '👜', name: 'Adire Tote Bag',   id: '#AFRI1223', designer: 'Kemi Luxe',         date: 'Jul 11', status: 'processing', total: '$22' },
    ];

    const saved = [
      { emoji: '🥻', name: 'Batik Kimono',    designer: 'House of Angela',    price: '$56', rating: '4.5' },
      { emoji: '📿', name: 'Cowrie Necklace', designer: 'Lagos Luxe Designs', price: '$35', rating: '4.5' },
      { emoji: '👜', name: 'Adire Tote Bag',  designer: 'Kemi Luxe',          price: '$22', rating: '4.5' },
      { emoji: '💎', name: 'Beaded Earrings', designer: 'Nairobi Craft',      price: '$12', rating: '4.5' },
    ];

    const actionMap = {
      delivered:  ['Reorder', 'Message'],
      shipped:    ['Track',   'Message'],
      processing: ['Cancel',  'Message'],
      cancelled:  ['Reorder', 'Message'],
    };

    function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

    function renderOrders(filter) {
      const body = document.getElementById('orderBody');
      const list = filter === 'all' ? orders : orders.filter(o => o.status === filter);

      if (!list.length) {
        body.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:2rem;color:#9CA3AF;font-size:.8rem;">No orders found.</td></tr>';
        return;
      }
            body.innerHTML = list.map(o => {
        const [b1, b2] = actionMap[o.status] || ['View', 'Message'];
        return 
            }
import { apiRequest } from "./api.js";

async function loadProducts() {

  const list = document.getElementById("products");

  if (!list) return;

  try {

    const products = await apiRequest("/products");

    list.innerHTML = "";

    products.forEach(product => {

      list.innerHTML += `
        <div class="product-card"
             data-name="${product.name}"
             data-price="${product.price}"
             data-cat="${product.category || ""}"
             data-rating="${product.rating || 5}">

          <h4>${product.name}</h4>
          <p>₦${product.price}</p>

          <button onclick="addToCart('${product.name}', ${product.price})">
            Add to cart
          </button>

        </div>
      `;

    });

  } catch (err) {

    console.log(err);
    showToast("Failed to load products");

  }

}

document.addEventListener("DOMContentLoaded", loadProducts);