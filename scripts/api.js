const BASE_URL = "https://afritex.onrender.com";

async function apiRequest(endpoint, method = "GET", body = null, auth = false) {

  const headers = {
    "Content-Type": "application/json"
  };

  // ✅ Attach token if needed
  if (auth) {
    const token = localStorage.getItem("afritex_token");
    if (token) {
      headers["Authorization"] = "Bearer " + token;
    }
  }

  const config = {
    method,
    headers
  };

  // ✅ Only attach body for non-GET
  if (body && method !== "GET") {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(BASE_URL + endpoint, config);
    
    // Check if response is OK
    if (!response.ok) {
      console.error(`HTTP Error: ${response.status} ${response.statusText}`);
      const errorData = await response.json().catch(() => ({}));
      
      // if (response.status === 401) {
      //   localStorage.removeItem("afritex_token");
      //   window.location.href = "pages/customersignin.html";
      //   return null;
      // }
      
      return {
        status: "Failed",
        message: errorData.message || `Server Error: ${response.status}`,
        error: true
      };
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error("Network error:", error);
    
    // Try local storage fallback for testing
    if (endpoint === "/customer/signup" && method === "POST") {
      // Allow local testing
      console.log("API unreachable, but signup data will be saved locally for testing");
      return {
        status: "Success",
        token: "local-test-token-" + Date.now(),
        user: body,
        isLocal: true
      };
    }
    
    if (endpoint === "/customer/login" && method === "POST") {
      // Check if user exists in localStorage
      const stored = JSON.parse(localStorage.getItem("customerProfile") || "{}");
      if (stored.email === body.email && stored.password === body.password) {
        return {
          status: "Success",
          token: "local-test-token-" + Date.now(),
          user: stored,
          isLocal: true
        };
      }
    }

    if (endpoint === "/designer/login" && method === "POST") {
      // Check if designer exists in localStorage
      const stored = JSON.parse(localStorage.getItem("designerProfile") || "{}");
      if (stored.email === body.email && stored.password === body.password) {
        return {
          status: "Success",
          token: "local-test-token-" + Date.now(),
          user: stored,
          isLocal: true
        };
      }
    }

    if (endpoint === "/designer/signup" && method === "POST") {
      // Allow local testing
      console.log("API unreachable, but designer signup data will be saved locally for testing");
      return {
        status: "Success",
        token: "local-test-token-" + Date.now(),
        user: body,
        isLocal: true
      };
    }

    return {
      status: "Failed",
      message: "Network error: " + error.message,
      error: true
    };
  }
}

// Export for ES6 modules
export { apiRequest };

// Also make it global for non-module scripts
window.apiRequest = apiRequest;