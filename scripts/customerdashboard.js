import { apiRequest } from "./api.js";
async function apiRequest(endpoint, method = "GET", body = null) {
  const token = localStorage.getItem("token");
  const config = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  if (token) config.headers.Authorization = "Bearer " + token;
  if (body) config.body = JSON.stringify(body);

  try {
    const res = await fetch(BASE_URL + endpoint, config);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("API error:", err);
    return null;
  }
}

// ══════════════════════════════════════
// DATA — will be replaced by API data
// ══════════════════════════════════════
let orders = [
  {
    id: "#AFR1308",
    product: "Ankara Maxi Dress",
    designer: "House of Angola",
    date: "Feb 10",
    status: "delivered",
    price: "$250",
    total: "$250",
  },
  {
    id: "#AFR4810",
    product: "Kente Midi Dress",
    designer: "Zuri Atelier",
    date: "Feb 14",
    status: "shipped",
    price: "$100",
    total: "$100",
  },
  {
    id: "#AFR7223",
    product: "Beaded Necklace",
    designer: "Amina Threads",
    date: "Feb 20",
    status: "delivered",
    price: "$80",
    total: "$80",
  },
  {
    id: "#AFR9901",
    product: "Agbada Set",
    designer: "Lagos Designs",
    date: "Mar 1",
    status: "processing",
    price: "$300",
    total: "$300",
  },
  {
    id: "#AFR6612",
    product: "Travel Necklace",
    designer: "Sohona Craft",
    date: "Mar 5",
    status: "processing",
    price: "$55",
    total: "$55",
  },
  {
    id: "#AFR3421",
    product: "Adire Trouser",
    designer: "Kenny Love",
    date: "Mar 10",
    status: "cancelled",
    price: "$100",
    total: "$100",
  },
];

let savedProducts = [
  { name: "Batik Kimono", price: "$55", oldPrice: null, emoji: "👘" },
  { name: "Cowrie Necklace", price: "$35", oldPrice: "$50", emoji: "📿" },
  { name: "Adire Tote Bag", price: "$42", oldPrice: null, emoji: "👜" },
  { name: "Beaded Earrings", price: "$22", oldPrice: "$30", emoji: "💎" },
];

let cart = [];
let currentFilter = "all";

// ══════════════════════════════════════
// SINGLE DOMContentLoaded
// ══════════════════════════════════════
document.addEventListener("DOMContentLoaded", async () => {
  // ── STEP 1: Check login token ──
  const token =
    localStorage.getItem("token") || localStorage.getItem("afritex_token");
  if (!token) {
    window.location.href = "customersignin.html";
    return;
  }

  // ── STEP 2: Fetch profile from API (fallback to localStorage) ──
  let profileData = null;
  try {
    const profile = await apiRequest("/customer/profile");
    if (profile && (profile.name || profile.fullName || profile.username)) {
      profileData = profile;
    }
  } catch (err) {
    console.warn(
      "Profile fetch failed, using local profile if available:",
      err,
    );
  }

  if (!profileData) {
    const local = localStorage.getItem("customerProfile");
    if (local) {
      try {
        profileData = JSON.parse(local);
      } catch {}
    }
  }

  if (profileData) {
    const name =
      profileData.name ||
      profileData.fullName ||
      profileData.username ||
      "Customer";
    const welcome = document.querySelector(".main-content h2");
    if (welcome) welcome.textContent = `Welcome back, ${name}!`;
  } else {
    localStorage.clear();
    window.location.href = "customersignin.html";
    return;
  }

  // ── STEP 3: Fetch orders from API ──
  try {
    const apiOrders = await apiRequest("/customer/orders");
    if (apiOrders && Array.isArray(apiOrders)) {
      orders = apiOrders; // ✅ replace static data with real API data
    }
  } catch (err) {
    console.warn("Orders fetch failed, using static data:", err);
  }

  // ── STEP 4: Fetch saved products from API ──
  try {
    const apiSaved = await apiRequest("/customer/saved");
    if (apiSaved && Array.isArray(apiSaved)) {
      savedProducts = apiSaved; // ✅ replace static data with real API data
    }
  } catch (err) {
    console.warn("Saved products fetch failed, using static data:", err);
  }

  // ── STEP 5: Set date ──
  const dateEl =
    document.getElementById("todayDate") ||
    document.querySelector(".main-content p");
  if (dateEl) {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    dateEl.textContent = new Date().toLocaleDateString("en-US", options);
  }

  // ── STEP 6: Animate counters ──
  document.querySelectorAll(".stat-value[data-target]").forEach((el) => {
    const target = parseInt(el.dataset.target);
    const step = target / (1200 / 16);
    let current = 0;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent = Math.floor(current);
    }, 16);
  });

  // ── STEP 7: Render UI ──
  renderOrders("all");
  renderSavedProducts();
  initSearch();
  closeMenusOnOutsideClick();

  // ── STEP 8: Logout ──
  const logoutBtn =
    document.querySelector(".logout") ||
    document.querySelector(".bottom-links li:last-child button");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.clear();
      window.location.href = "../index.html";
    });
  }
});

// ══════════════════════════════════════
// RENDER ORDERS
// ══════════════════════════════════════
function renderOrders(filter) {
  const tbody = document.getElementById("orderTableBody");
  if (!tbody) return;

  const filtered =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:2rem;color:#999;font-size:.82rem;">No orders found.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered
    .map(
      (order) => `
    <tr>
      <td>
        <div class="product-cell">
          <div class="product-thumb-placeholder">${getInitials(order.product)}</div>
          <span class="product-cell-name">${order.product}</span>
        </div>
      </td>
      <td style="color:#666;font-size:.72rem;">${order.id}</td>
      <td style="font-size:.76rem;">${order.designer}</td>
      <td style="color:#666;font-size:.76rem;">${order.date}</td>
      <td><span class="badge badge-${order.status}">${capitalize(order.status)}</span></td>
      <td style="font-weight:600;">${order.price}</td>
      <td style="font-weight:700;">${order.total}</td>
      <td>
        <div class="action-row">
          <button class="btn-sm btn-sm-outline" onclick="showTrackModal('${order.id}','${order.status}')">Track</button>
          <button class="btn-sm btn-sm-gold" onclick="showToast('Messaging...')">Message</button>
        </div>
      </td>
    </tr>
  `,
    )
    .join("");
}

function filterOrders(filter, btn) {
  currentFilter = filter;
  document
    .querySelectorAll(".tab-btn")
    .forEach((b) => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
  renderOrders(filter);
}

// ══════════════════════════════════════
// RENDER SAVED PRODUCTS
// ══════════════════════════════════════
function renderSavedProducts() {
  const grid = document.getElementById("savedGrid");
  if (!grid) return;
  grid.innerHTML = savedProducts
    .map(
      (p) => `
    <div class="saved-card">
      <div class="saved-card-img-placeholder">${p.emoji || "🛍️"}</div>
      <div class="saved-card-body">
        <div class="saved-card-name">${p.name}</div>
        <div class="saved-card-price">
          ${p.price}
          ${p.oldPrice ? `<span class="saved-card-old">${p.oldPrice}</span>` : ""}
        </div>
        <button class="btn-add-cart" onclick="addToCart('${p.name}','${p.price}',this)">
          Add to Cart
        </button>
      </div>
    </div>
  `,
    )
    .join("");
}

// ══════════════════════════════════════
// CART
// ══════════════════════════════════════
function addToCart(name, price, btn) {
  const existing = cart.find((i) => i.name === name);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ name, price, qty: 1 });
  }
  updateCartCount();
  showToast(`🛍️ ${name} added to cart`);
  if (btn) {
    btn.textContent = "✓ Added";
    btn.classList.add("added");
    setTimeout(() => {
      btn.textContent = "Add to Cart";
      btn.classList.remove("added");
    }, 1800);
  }
}

function updateCartCount() {
  const el = document.getElementById("cartCount");
  if (el) el.textContent = cart.reduce((sum, i) => sum + i.qty, 0);
}

// ══════════════════════════════════════
// TRACK ORDER
// ══════════════════════════════════════
function trackOrder() {
  const input = document.getElementById("trackInput");
  const value = input ? input.value.trim() : "";
  if (!value) {
    showToast("Please enter an order number");
    return;
  }
  const found = orders.find((o) => o.id.toLowerCase() === value.toLowerCase());
  if (found) showTrackModal(found.id, found.status);
  else showToast(`Order "${value}" not found`);
}

function showTrackModal(orderId, status) {
  const steps = [
    { label: "Order Placed", desc: "Your order has been received" },
    { label: "Processing", desc: "Your order is being prepared" },
    { label: "Shipped", desc: "Your order is on the way" },
    { label: "Out for Delivery", desc: "Your order is out for delivery" },
    { label: "Delivered", desc: "Your order has been delivered" },
  ];
  const statusRank = { processing: 1, shipped: 3, delivered: 5, cancelled: 0 };
  const currentRank = statusRank[status] || 0;

  document.getElementById("trackSteps").innerHTML = steps
    .map((step, i) => {
      const rank = i + 1;
      const dotClass =
        rank < currentRank
          ? "done"
          : rank === currentRank
            ? "active"
            : "pending";
      const icon = rank < currentRank ? "✓" : rank === currentRank ? "●" : "○";
      return `
      <div class="track-step">
        <div class="step-dot ${dotClass}">${icon}</div>
        <div class="step-info">
          <h4>${step.label}</h4>
          <p>${rank <= currentRank ? step.desc : "Pending"}</p>
        </div>
      </div>`;
    })
    .join("");

  const modal = document.getElementById("trackModal");
  modal.querySelector("h3").textContent = `Tracking: ${orderId}`;
  modal.classList.add("open");
}

function closeTrackModal() {
  document.getElementById("trackModal").classList.remove("open");
}

// ══════════════════════════════════════
// SIDEBAR
// ══════════════════════════════════════
function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const main = document.getElementById("dashboardMain");
  if (!sidebar) return;
  sidebar.classList.toggle("open");
  if (window.innerWidth > 900) {
    const collapsed = sidebar.style.width === "60px";
    sidebar.style.width = collapsed ? "220px" : "60px";
    sidebar.querySelectorAll(".nav-item span").forEach((s) => {
      s.style.display = collapsed ? "" : "none";
    });
    if (main) main.style.marginLeft = collapsed ? "220px" : "60px";
  }
}

// ══════════════════════════════════════
// NAV + PROFILE MENU
// ══════════════════════════════════════
function setActive(el) {
  document
    .querySelectorAll(".nav-item")
    .forEach((i) => i.classList.remove("active"));
  el.classList.add("active");
}

function toggleProfileMenu() {
  const avatar = document.querySelector(".nav-avatar");
  const menu = document.getElementById("profileMenu");
  if (avatar) avatar.classList.toggle("open");
  if (menu) menu.classList.toggle("open");
}

function closeMenusOnOutsideClick() {
  document.addEventListener("click", (e) => {
    const avatar = document.querySelector(".nav-avatar");
    if (avatar && !avatar.contains(e.target)) {
      avatar.classList.remove("open");
      document.getElementById("profileMenu")?.classList.remove("open");
    }
  });
}

// ══════════════════════════════════════
// SEARCH
// ══════════════════════════════════════
function initSearch() {
  const input = document.getElementById("globalSearch");
  if (!input) return;
  input.addEventListener("keyup", (e) => {
    const query = e.target.value.trim().toLowerCase();
    if (!query) {
      renderOrders(currentFilter);
      return;
    }
    const filtered = orders.filter(
      (o) =>
        o.product.toLowerCase().includes(query) ||
        o.designer.toLowerCase().includes(query) ||
        o.id.toLowerCase().includes(query),
    );
    const tbody = document.getElementById("orderTableBody");
    if (!tbody) return;
    if (!filtered.length) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:2rem;color:#999;">No results for "${query}"</td></tr>`;
      return;
    }
    tbody.innerHTML = filtered
      .map(
        (order) => `
      <tr>
        <td><div class="product-cell"><div class="product-thumb-placeholder">${getInitials(order.product)}</div><span class="product-cell-name">${order.product}</span></div></td>
        <td style="color:#666;font-size:.72rem;">${order.id}</td>
        <td style="font-size:.76rem;">${order.designer}</td>
        <td style="color:#666;font-size:.76rem;">${order.date}</td>
        <td><span class="badge badge-${order.status}">${capitalize(order.status)}</span></td>
        <td style="font-weight:600;">${order.price}</td>
        <td style="font-weight:700;">${order.total}</td>
        <td><div class="action-row">
          <button class="btn-sm btn-sm-outline" onclick="showTrackModal('${order.id}','${order.status}')">Track</button>
          <button class="btn-sm btn-sm-gold" onclick="showToast('Messaging...')">Message</button>
        </div></td>
      </tr>
    `,
      )
      .join("");
  });
}

// ══════════════════════════════════════
// TOAST
// ══════════════════════════════════════
let toastTimer = null;
function showToast(msg) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
}

// ══════════════════════════════════════
// HELPERS
// ══════════════════════════════════════
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getInitials(name) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}
