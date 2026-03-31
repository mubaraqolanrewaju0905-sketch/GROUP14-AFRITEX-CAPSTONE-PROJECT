import { apiRequest } from "./api.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("designerForm");
  const passwordInput = document.getElementById("password");
  const confirmInput = document.getElementById("confirmPassword");

  // Function to check password criteria
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

  // Check password criteria on input
  passwordInput.addEventListener("input", (e) => {
    checkPasswordCriteria(e.target.value);
  });

  const uploadBox = document.getElementById("uploadBox");
  const idFileInput = document.getElementById("idFile");
  const imagePreview = document.getElementById("imagePreview");
  const uploadIcon = document.getElementById("uploadIcon");
  const removeBtn = document.getElementById("removePhoto");

  // Profile Photo Elements
  const profileUploadBox = document.getElementById("profileUploadBox");
  const profileFileInput = document.getElementById("profileFile");
  const profileImagePreview = document.getElementById("profileImagePreview");
  const profileUploadIcon = document.getElementById("profileUploadIcon");
  const removeProfileBtn = document.getElementById("removeProfilePhoto");

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

  // 1. Handle ID Upload Box click
  uploadBox.addEventListener("click", (e) => {
    if (e.target !== removeBtn) {
      idFileInput.click();
    }
  });

  // 2. Handle File Selection & Preview
  idFileInput.addEventListener("change", function () {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        imagePreview.src = e.target.result;
        imagePreview.style.display = "block";
        uploadIcon.style.display = "none";
        removeBtn.style.display = "block";
      };
      reader.readAsDataURL(file);
    }
  });

  // 3. Handle Remove Photo
  removeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    idFileInput.value = "";
    imagePreview.src = "";
    imagePreview.style.display = "none";
    uploadIcon.style.display = "block";
    removeBtn.style.display = "none";
  });

  // Profile Photo Upload Handlers
  profileUploadBox.addEventListener("click", (e) => {
    if (e.target !== removeProfileBtn) {
      profileFileInput.click();
    }
  });

  profileFileInput.addEventListener("change", function () {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        profileImagePreview.src = e.target.result;
        profileImagePreview.style.display = "block";
        profileUploadIcon.style.display = "none";
        removeProfileBtn.style.display = "block";
      };
      reader.readAsDataURL(file);
    }
  });

  removeProfileBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    profileFileInput.value = "";
    profileImagePreview.src = "";
    profileImagePreview.style.display = "none";
    profileUploadIcon.style.display = "block";
    removeProfileBtn.style.display = "none";
  });

  // ✅ API SIGNUP - Single consolidated handler
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fullName = document.getElementById("fullName").value;
    const email = document.getElementById("email").value;
    const password = passwordInput.value;
    const confirmPass = confirmInput.value;
    const country = document.getElementById("country").value;
    const phoneNumber = document.getElementById("phoneNumber").value;
      document.getElementById("countryCode").value +
      document.getElementById("phoneNumber").value;
    const portfolio = document.getElementById("portfolioUrl").value;

    // Validation: password complexity
    const complexityRegex =
      /^(?=.{8,})(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/;
    if (!complexityRegex.test(password)) {
      alert("Password must be 8+ chars, capital, number, special");
      return;
    }

    // Validation: Passwords match
    if (password !== confirmPass) {
      alert("Passwords do not match");
      return;
    }

    // Validation: Ensure ID is uploaded
    if (!idFileInput.files[0]) {
      alert("Please upload your ID");
      return;
    }

    // Validation: Ensure Profile Photo is uploaded
    if (!profileFileInput.files[0]) {
      alert("Please upload your profile photo");
      return;
    }

    try {
      const result = await apiRequest("/api/auth/designer/register", "POST", {
        fullname: fullName,
        email,
        password,
        phoneNumber: phoneNumber,
        country,
        portfolio,
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

      alert("Designer account created successfully! Redirecting to sign in...");

      // Save profile to localStorage for signin
      localStorage.setItem(
        "designerProfile",
        JSON.stringify(result.user || result.data || {}),
      );
      localStorage.setItem("afritex_token", result.token);

      // Reset form
      form.reset();
      idFileInput.value = "";
      imagePreview.src = "";
      imagePreview.style.display = "none";
      uploadIcon.style.display = "block";
      removeBtn.style.display = "none";
      profileFileInput.value = "";
      profileImagePreview.src = "";
      profileImagePreview.style.display = "none";
      profileUploadIcon.style.display = "block";
      removeProfileBtn.style.display = "none";

      // Redirect to designer sign-in page
      setTimeout(() => {
        window.location.href = "designersignin.html";
      }, 500);
    } catch (err) {
      console.error("Signup error:", err);
      alert("Signup failed: " + (err?.message || "Please try again"));
    }
  });
});
