const API_BASE_URL = 'http://localhost:3000/api/auth';

function togglePassword(id) {
  const input = document.getElementById(id);
  input.type = input.type === "password" ? "text" : "password";
}

function showMessage(msg, type = "error") {
  const m = document.getElementById("message");
  m.textContent = msg;
  m.className = `message ${type} show`;
  
  // Auto hide after 5 seconds for success messages
  if (type === "success") {
    setTimeout(() => {
      m.classList.remove("show");
    }, 5000);
  }
}

function hideMessage() {
  document.getElementById("message").classList.remove("show");
}

function setLoading(loading) {
  const btn = document.getElementById("register-btn");
  const btnText = document.getElementById("btn-text");
  const btnLoading = document.getElementById("btn-loading");
  
  if (loading) {
    btn.disabled = true;
    btnText.style.display = "none";
    btnLoading.style.display = "inline-block";
  } else {
    btn.disabled = false;
    btnText.style.display = "inline";
    btnLoading.style.display = "none";
  }
}

async function handleRegister(e) {
  e.preventDefault();
  hideMessage();
  setLoading(true);

  const form = new FormData(e.target);
  const formData = Object.fromEntries(form.entries());

  // Validation
  if (formData.password !== formData.confirm_password) {
    showMessage("Passwords do not match", "error");
    setLoading(false);
    return;
  }

  if (formData.password.length < 6) {
    showMessage("Password must be at least 6 characters", "error");
    setLoading(false);
    return;
  }

  // Remove confirm_password from data
  const { confirm_password, ...data } = formData;

  // Role-specific validation
  if (data.role === 'doctor' && !data.specialization) {
    showMessage("Specialization is required for doctors", "error");
    setLoading(false);
    return;
  }

  if (data.role === 'ngo' && !data.organization_name) {
    showMessage("Organization name is required for NGOs", "error");
    setLoading(false);
    return;
  }

  // Clean empty fields
  Object.keys(data).forEach(key => {
    if (data[key] === '' || data[key] === null) {
      delete data[key];
    }
  });

  try {
    const res = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await res.json();

    if (res.ok && result.success) {
      // Save tokens and user data
      localStorage.setItem("accessToken", result.accessToken);
      localStorage.setItem("user", JSON.stringify(result.user));

      showMessage("Account created successfully! Redirecting...", "success");
      
      // Redirect to dashboard after 1 second
      setTimeout(() => {
        window.location.href = "/dashboard.html";
      }, 1000);
    } else {
      // Show error message from backend
      let errorMsg = result.error || result.message || "Registration failed";
      
      // Translate common errors
      if (errorMsg.includes("Email already exists") || errorMsg.includes("email")) {
        errorMsg = "Email already exists";
      } else if (errorMsg.includes("Password must be")) {
        errorMsg = "Password must be at least 6 characters";
      } else if (errorMsg.includes("Invalid email")) {
        errorMsg = "Invalid email format";
      } else if (errorMsg.includes("organization_name")) {
        errorMsg = "Organization name is required for NGOs";
      } else if (errorMsg.includes("specialization")) {
        errorMsg = "Specialization is required for doctors";
      }
      
      console.error("Registration failed:", result);
      showMessage(errorMsg, "error");
      setLoading(false);
    }
  } catch (error) {
    console.error("Registration error:", error);
    showMessage("Server connection error. Make sure the server is running on http://localhost:3000", "error");
    setLoading(false);
  }
}

// Handle role selection to show/hide fields
document.addEventListener("DOMContentLoaded", () => {
  const roleSelect = document.getElementById("role-select");
  const specializationGroup = document.getElementById("specialization-group");
  const licenseGroup = document.getElementById("license-number-group");
  const organizationGroup = document.getElementById("organization-group");

  roleSelect.addEventListener("change", () => {
    const role = roleSelect.value;

    // Reset all groups
    specializationGroup.style.display = "none";
    licenseGroup.style.display = "none";
    organizationGroup.style.display = "none";

    // Clear required attributes
    specializationGroup.querySelector("input").required = false;
    organizationGroup.querySelector("input").required = false;

    // Show relevant fields based on role
    if (role === "doctor") {
      specializationGroup.style.display = "block";
      licenseGroup.style.display = "block";
      specializationGroup.querySelector("input").required = true;
    } else if (role === "ngo") {
      organizationGroup.style.display = "block";
      organizationGroup.querySelector("input").required = true;
    }
  });
});

