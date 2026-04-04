// ✅ BASE URL — always at the top
const BASE_URL = "https://afritex.onrender.com";

// ══════════════════════════════════════
// API FUNCTIONS
// ══════════════════════════════════════
async function getProducts() {
  try {
    const res = await fetch(BASE_URL + "/products");
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return null;
  }
}

async function loginUser(email, password) {
  try {
    const res = await fetch(BASE_URL + "/customer/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error("Login failed:", error);
    return null;
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById("emailInput").value;
  const password = document.getElementById("passwordInput").value;
  const data = await loginUser(email, password);

  if (data && data.token) {
    localStorage.setItem("afritex_token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    window.location.href = "pages/customerdashboard.html";
  } else {
    alert("Login failed: " + (data?.message || "Invalid credentials"));
  }
}

// ══════════════════════════════════════
// TOPBAR SHADOW ON SCROLL
// ══════════════════════════════════════
window.addEventListener("scroll", () => {
  const topbar = document.getElementById("topbar");
  if (topbar) {
    topbar.style.boxShadow =
      window.scrollY > 10 ? "0 2px 16px rgba(0,0,0,.1)" : "none";
  }
});

// ══════════════════════════════════════
// MOBILE NAV TOGGLE
// ══════════════════════════════════════
function toggleMobileNav() {
  const nav = document.getElementById("mobileNav");
  if (nav) nav.classList.toggle("open");
}
window.toggleMobileNav = toggleMobileNav;

// ══════════════════════════════════════
// CART BADGE
// ══════════════════════════════════════
let cartCount = 0;
function updateCartBadge() {
  const badge = document.querySelector(".cart-badge");
  if (badge) badge.textContent = cartCount;
}

// ══════════════════════════════════════
// DOM READY — single listener
// ══════════════════════════════════════
document.addEventListener("DOMContentLoaded", async () => {
  // Close mobile nav on link click
  document.querySelectorAll(".mobile-nav a").forEach((a) => {
    a.addEventListener("click", () => {
      const nav = document.getElementById("mobileNav");
      if (nav) nav.classList.remove("open");
    });
  });

  // Scroll reveal
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add("visible"), i * 70);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 },
  );
  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const target = document.querySelector(a.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  // Load products into trending grid
  const grid = document.querySelector(".trending-grid");
  if (grid) {
    try {
      const data = await getProducts();
      if (data) {
        const products = data.products || data;
        grid.innerHTML = products
          .map(
            (product) => `
          <div class="product-card">
            <div class="product-card-img">
              <img src="${product.image}" alt="${product.name}"/>
            </div>
            <div class="product-card-body">
              <div class="product-name">${product.name}</div>
              <div class="product-designer">${product.designer}</div>
              <div class="product-price">$${product.price}</div>
            </div>
          </div>
        `,
          )
          .join("");
      }
    } catch (error) {
      console.error("Failed to load products:", error);
      // Keep the existing static content if API fails
    }
  }
});
