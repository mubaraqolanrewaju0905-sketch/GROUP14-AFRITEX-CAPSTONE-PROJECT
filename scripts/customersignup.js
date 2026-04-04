import { apiRequest } from "./api.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("customersignupForm");
  const passwordInput = document.getElementById("password");
  const confirmInput = document.getElementById("confirmPassword");
  const submitBtn = document.getElementById("submitBtn");
  // ✅ password check UI
  function checkPasswordCriteria(password) {
    document.getElementById("lengthCheck").textContent =
      password.length >= 8 ? "✓" : "✗";
    document.getElementById("lengthCheck").className =
      password.length >= 8 ? "criteria-symbol active" : "criteria-symbol";

    document.getElementById("upperCheck").textContent = /[A-Z]/.test(password)
      ? "✓"
      : "✗";
    document.getElementById("upperCheck").className = /[A-Z]/.test(password)
      ? "criteria-symbol active"
      : "criteria-symbol";

    document.getElementById("numberCheck").textContent = /\d/.test(password)
      ? "✓"
      : "✗";
    document.getElementById("numberCheck").className = /\d/.test(password)
      ? "criteria-symbol active"
      : "criteria-symbol";

    document.getElementById("specialCheck").textContent = /[^A-Za-z0-9]/.test(
      password,
    )
      ? "✓"
      : "✗";
    document.getElementById("specialCheck").className = /[^A-Za-z0-9]/.test(
      password,
    )
      ? "criteria-symbol active"
      : "criteria-symbol";
  }

  passwordInput.addEventListener("input", (e) =>
    checkPasswordCriteria(e.target.value),
  );

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
  submitBtn.addEventListener("click", (e) => {
    console.log("signup button clicked");
  });

  // ✅ API SIGNUP
  submitBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    console.log("form = successfully, submitted");
    const fullName = document.getElementById("fullName").value;
    const email = document.getElementById("email").value;
    const password = passwordInput.value;
    const confirmPass = confirmInput.value;
    const country = document.getElementById("country").value;
    const phoneNumber = document.getElementById("phoneNumber").value;
    const countryCode = document.getElementById("countryCode").value;
    const phone = countryCode + phoneNumber;

    // password validation
    const complexityRegex =
      /^(?=.{8,})(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/;

    if (!complexityRegex.test(password)) {
      alert("Password must be 8+ chars, capital, number, special");
      return;
    }

    if (password !== confirmPass) {
      alert("Passwords do not match");
      return;
    }

    try {
      const result = await apiRequest("/api/auth/customer/register", "POST", {
        fullname: fullName,
        email,
        password,
        phoneNumber: phoneNumber,
        country,
      });

      if (!result) {
        alert("Signup failed: No response from server");
        console.error("API response:", result);
        return;
      }

      // Check for error response
      if (result.error || result.status === "Failed") {
        alert("Signup failed: " + (result?.message || "Please try again"));
        console.error("API response:", result);
        return;
      }
      if (result.success || result.status === "Success") {
        alert("Account created Successfully!...");
        console.log("API response:", result);
        // Save profile to localStorage for signin (includes password for local fallback)
        const customerData = {
          fullName: fullName,
          email,
          password,
          phoneNumber: phone,
          country,
          ...(result.user || {}),
        };
        localStorage.setItem("customerProfile", JSON.stringify(customerData));
        const newToken = result.token || `local-test-token-${Date.now()}`;
        localStorage.setItem("afritex_token", newToken);
        localStorage.setItem("token", newToken);

        // Clear form
        form.reset();

        // Redirect to customer sign-in page
        window.location.href = "customersignin.html";
        return;
      }
    } catch (err) {
      console.error("Signup error:", err);
      alert("Signup failed: " + (err?.message || "Please try again"));
    }
  });
});
