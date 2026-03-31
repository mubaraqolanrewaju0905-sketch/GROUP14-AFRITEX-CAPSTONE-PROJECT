import { apiRequest } from "./api.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("signinForm");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const errormesage = document.getElementById("error-message");

  // toggle password visibility
  document.querySelectorAll(".toggle-password").forEach((el) => {
    el.addEventListener("click", () => {
      const target = document.getElementById(el.dataset.target);
      if (target) {
        target.type = target.type === "password" ? "text" : "password";
        el.textContent = target.type === "password" ? "👁️" : "🙈";
      }
    });
  });

  // ✅ API LOGIN
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    try {
      const result = await apiRequest("/api/auth/login", "POST", {
        email,
        password,
      });
      // console.log(result);
      // if (!result) {
      //   alert("Login failed: No response from server");
      //   console.error("API response:", result);
      //   return;
      // }
      //successfully login
      if (result.status === "Success") {
        // console.log("Login successful!");
        errormesage.style.display = "none";
        // console.log("Login successful, redirecting...");
        // alert("Login successful! Redirecting to dashboard...");
        setTimeout(() => {
          window.location.href = "customerdashboard.html";
        }, 500);
      }
      // Check for error response
      if (result.status === "Failed") {
        // alert("Login failed: " + (result?.message || "Invalid credentials"));
        // console.error("API response:", result);
        errormesage.style.display = "block";
        return;
      }
      // Check if token exists in response
      if (!result.token) {
        console.log("Debug - API result:", result);

        // // Attempt local fallback with stored profile
        // const stored = JSON.parse(localStorage.getItem("customerProfile") || "{}");
        // if (stored.email === email && stored.password === password) {
        //   const localToken = `local-test-token-${Date.now()}`;
        //   localStorage.setItem("afritex_token", localToken);
        //   localStorage.setItem("customerProfile", JSON.stringify(stored));
        //   alert("Login successful (local fallback)! Redirecting to dashboard...");
        //   setTimeout(() => {
        //     window.location.href = "customerdashboard.html";
        //   }, 500);
        //   return;
        // }

        // alert("Login failed: Invalid credentials or account not found.");
        return;
      }

      // save token with consistent keys for all scripts
      localStorage.setItem("afritex_token", result.token);
      localStorage.setItem("token", result.token);
      localStorage.setItem(
        "customerProfile",
        JSON.stringify(result.user || {}),
      );

    } catch (err) {
      // console.error("Login error:", err);
      alert("Login failed: " + (err?.message || "Please try again"));
    }
  });
});
