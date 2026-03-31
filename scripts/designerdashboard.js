// ══════════════════════════════════════
// API — base URL and request function
// ══════════════════════════════════════
const BASE_URL = "https://afritex-0sb7.onrender.com";

async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('token') || localStorage.getItem('afritex_token');
  const res = await fetch(BASE_URL + endpoint, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
    ...options
  });
  if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
  return await res.json();
}

// ══════════════════════════════════════
// LOAD PRODUCTS FROM API
// ══════════════════════════════════════
async function loadAPIProducts() {
  const container = document.getElementById("productsList"); // ✅ correct ID
  if (!container) return;

  try {
    const products = await apiRequest("/products");
    container.innerHTML = "";
    products.forEach(product => {
      container.innerHTML += `
        <div class="product-item">
          <div class="prod-info">
            <img src="${product.image || ''}" alt="${product.name}"/>
            <span>${product.name}</span>
          </div>
          <span>${product.price}</span>
          <span>${product.stock || '—'}</span>
          <div>
            <span class="status-active">${product.status || 'Active'}</span>
          </div>
        </div>
      `;
    });
  } catch (err) {
    console.error('Failed to load products from API:', err);
  }
}

// ══════════════════════════════════════
// DOM READY
// ══════════════════════════════════════
document.addEventListener('DOMContentLoaded', async () => {

  // Set current date
  const dateOptions = { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' };
  document.getElementById('currentDate').innerText =
    new Date().toLocaleDateString('en-GB', dateOptions);

  // Load profile from API or localStorage
  let designerData = null;

  try {
    const p = await apiRequest('/designer/profile');
    if (p && (p.name || p.fullName || p.username)) {
      designerData = p;
    }
  } catch (err) {
    console.warn('Designer profile fetch failed, using local data if available:', err);
  }

  if (!designerData) {
    const stored = localStorage.getItem('designerProfile');
    if (stored) {
      try {
        designerData = JSON.parse(stored);
      } catch { designerData = null; }
    }
  }

  if (designerData) {
    const displayName = designerData.fullName || designerData.name || designerData.username || 'Designer';
    document.querySelector('.welcome-header h2').innerText = `Welcome back, ${displayName.split(' ')[0]}!`;

    if (designerData.profilePhotoData) {
      const profilePhoto = document.getElementById('profilePhoto');
      const defaultIcon  = document.getElementById('defaultProfileIcon');
      profilePhoto.src   = designerData.profilePhotoData;
      profilePhoto.style.display = 'block';
      defaultIcon.style.display  = 'none';
    }
  }

  // ── PRODUCTS (localStorage) ──
  let products = [
    { name: "Ankara Bracelet", price: "$32", stock: "12 units", status: "Active", image: "../images/ankara bracelet.jpg" },
    { name: "Cowrie Necklace",  price: "$12", stock: "12 units", status: "Active", image: "../images/cowries necklace.jpg" },
    { name: "Beaded Earrings",  price: "$11", stock: "12 units", status: "Active", image: "../images/beaded-earrings.jpg" },
    { name: "Ankara Sandals",   price: "$24", stock: "12 units", status: "Active", image: "../images/ankara-sandals.jpg" }
  ];

  function saveProducts() {
    try { localStorage.setItem('designerProducts', JSON.stringify(products)); }
    catch (err) { console.warn('Could not save products', err); }
  }

  function loadLocalProducts() {           // ✅ renamed to avoid conflict
    const storedProducts = localStorage.getItem('designerProducts');
    if (storedProducts) {
      try {
        const parsed = JSON.parse(storedProducts);
        if (Array.isArray(parsed)) products = parsed;
      } catch (err) { console.warn('Could not parse stored products', err); }
    }
  }

  loadLocalProducts();                     // ✅ call correct function name

  const productsList      = document.getElementById('productsList');
  const totalProductsCount = document.getElementById('totalProductsCount');
  let editingIndex = null;

  function renderProducts() {
    productsList.innerHTML = '';
    products.forEach((prod, idx) => {
      const div = document.createElement('div');
      div.className    = 'product-item';
      div.dataset.index = idx;
      div.innerHTML = `
        <div class="prod-info">
          <img src="${prod.image || ''}" alt="">
          <span>${prod.name}</span>
        </div>
        <span>${prod.price}</span>
        <span>${prod.stock}</span>
        <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;">
          <span class="status-active">${prod.status}</span>
          <div style="display:flex;gap:10px;align-items:center;">
            <i class="fa-solid fa-pen edit-icon" title="Edit product"></i>
            <i class="fa-solid fa-trash delete-icon" title="Delete product"></i>
          </div>
        </div>
      `;
      productsList.appendChild(div);
    });

    totalProductsCount.innerText = products.length;
    saveProducts();

    document.querySelectorAll('.edit-icon').forEach(icon => {
      icon.addEventListener('click', (e) => {
        const item = e.target.closest('.product-item');
        editingIndex = parseInt(item.dataset.index, 10);
        const prod = products[editingIndex];
        document.getElementById('prodName').value  = prod.name;
        document.getElementById('prodPrice').value = prod.price.replace(/\$/g, '');
        document.getElementById('prodStock').value = prod.stock.replace(/[^0-9]/g, '');
        if (prod.image) {
          prodImgPreview.src = prod.image;
          prodImgPreview.style.display = 'block';
          prodImgIcon.style.display    = 'none';
        }
        modal.style.display = 'flex';
      });
    });

    document.querySelectorAll('.delete-icon').forEach(icon => {
      icon.addEventListener('click', (e) => {
        const item         = e.target.closest('.product-item');
        const indexToDelete = parseInt(item.dataset.index, 10);
        if (!confirm('Remove this product?')) return;
        products.splice(indexToDelete, 1);
        renderProducts();
      });
    });
  }

  const ordersList = document.getElementById('ordersList');
  function filterOrders(filterStatus = "All") {
    ordersList.querySelectorAll('.order-item').forEach(item => {
      const status = item.dataset.status;
      item.style.display =
        (filterStatus === "All" || status === filterStatus) ? 'flex' : 'none';
    });
  }

  renderProducts();
  filterOrders();

  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      e.target.classList.add('active');
      filterOrders(e.target.dataset.tab);
    });
  });

  // ── SIDEBAR ──
  const dashboardContainer = document.querySelector('.dashboard-container');
  const sidebarToggle      = document.getElementById('sidebarToggle');
  const sidebarOverlay     = document.getElementById('sidebarOverlay');

  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', () => {
      dashboardContainer.classList.toggle('sidebar-open');
    });
  }
  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', () => {
      dashboardContainer.classList.remove('sidebar-open');
    });
  }
  document.querySelectorAll('.sidebar nav a').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 900)
        dashboardContainer.classList.remove('sidebar-open');
    });
  });

  // ── PRODUCT MODAL ──
  const modal          = document.getElementById('addProductModal');
  const openModalBtn   = document.getElementById('addProductBtn');
  const closeBtn       = document.querySelector('.close-btn');
  const newProductForm = document.getElementById('newProductForm');
  const prodImgBox     = document.getElementById('prodImgBox');
  const prodImageInput = document.getElementById('prodImage');
  const prodImgPreview = document.getElementById('prodImgPreview');
  const prodImgIcon    = document.getElementById('prodImgIcon');

  prodImgBox.addEventListener('click', () => prodImageInput.click());
  prodImageInput.addEventListener('change', function () {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        prodImgPreview.src           = e.target.result;
        prodImgPreview.style.display = 'block';
        prodImgIcon.style.display    = 'none';
      };
      reader.readAsDataURL(file);
    }
  });

  openModalBtn.addEventListener('click', () => { modal.style.display = 'flex'; });
  closeBtn.addEventListener('click',     () => { modal.style.display = 'none'; });
  window.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
  });

  newProductForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const prodObject = {
      name:   document.getElementById('prodName').value,
      price:  `$${document.getElementById('prodPrice').value}`,
      stock:  `${document.getElementById('prodStock').value} units`,
      status: "Active",
      image:  prodImgPreview.src
    };
    if (editingIndex !== null) {
      products[editingIndex] = prodObject;
    } else {
      products.unshift(prodObject);
    }
    renderProducts();
    editingIndex = null;
    newProductForm.reset();
    prodImgPreview.src           = "";
    prodImgPreview.style.display = 'none';
    prodImgIcon.style.display    = 'block';
    modal.style.display          = 'none';
  });

  // ── PROFILE MODAL ──
  const profileModal  = document.getElementById('profileModal');
  const profileLink   = document.getElementById('profileLink');
  const profileClose  = document.getElementById('profileClose');
  const profileForm   = document.getElementById('profileForm');

  function loadProfile() {
    const s = localStorage.getItem('designerProfile');
    if (s) {
      try {
        const d = JSON.parse(s);
        document.getElementById('profileName').value      = d.fullName  || '';
        document.getElementById('profileEmail').value     = d.email     || '';
        document.getElementById('profileCountry').value   = d.country   || '';
        document.getElementById('profilePhone').value     = d.phone     || '';
        document.getElementById('profilePortfolio').value = d.portfolio || '';
        if (d.profilePhotoData) {
          document.getElementById('modalProfilePhoto').src = d.profilePhotoData;
        }
      } catch (err) { console.warn('Failed to parse profile', err); }
    }
  }

  profileLink.addEventListener('click', (e) => {
    e.preventDefault();
    loadProfile();
    profileModal.style.display = 'flex';
  });
  profileClose.addEventListener('click', () => { profileModal.style.display = 'none'; });
  window.addEventListener('click', (e) => {
    if (e.target === profileModal) profileModal.style.display = 'none';
  });

  profileForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const existing = JSON.parse(localStorage.getItem('designerProfile') || '{}');
    const updated  = {
      fullName:         document.getElementById('profileName').value,
      email:            document.getElementById('profileEmail').value,
      country:          document.getElementById('profileCountry').value,
      phone:            document.getElementById('profilePhone').value,
      portfolio:        document.getElementById('profilePortfolio').value,
      idFileName:       existing.idFileName       || '',
      profileFileName:  existing.profileFileName  || '',
      profilePhotoData: existing.profilePhotoData || ''
    };
    localStorage.setItem('designerProfile', JSON.stringify(updated));
    alert('Profile updated successfully.');
    profileModal.style.display = 'none';
  });

  // ── LOGOUT ──
  const logoutLink = document.querySelector('.logout');
  logoutLink.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('designerProfile');
    localStorage.removeItem('designerProducts');
    alert('You have been logged out.');
    window.location.href = '../index.html';
  });

  // ✅ Load products from API
  loadAPIProducts();
});