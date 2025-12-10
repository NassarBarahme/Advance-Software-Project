const API_BASE_URL = 'http://localhost:3000/api/auth';

function togglePassword(id, event) {
  const input = document.getElementById(id);
  if (!input) {
    console.error('Input element not found with id:', id);
    return;
  }
  
  const toggleIcon = event?.target || document.querySelector(`[onclick*="${id}"]`);
  
  if (input.type === "password") {
    input.type = "text";
    if (toggleIcon) {
      toggleIcon.textContent = "👁️";
      toggleIcon.setAttribute('aria-label', 'Hide password');
    }
  } else {
    input.type = "password";
    if (toggleIcon) {
      toggleIcon.textContent = "👁️";
      toggleIcon.setAttribute('aria-label', 'Show password');
    }
  }
  
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
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
  e.stopPropagation();
  hideMessage();
  setLoading(true);

  const form = e.target;
  const formDataObj = new FormData(form);
  const formData = Object.fromEntries(formDataObj.entries());

  // Validation
  if (!formData.email || !formData.password || !formData.full_name || !formData.role) {
    showMessage("Please fill in all required fields", "error");
    setLoading(false);
    return false;
  }

  if (formData.password !== formData.confirm_password) {
    showMessage("Passwords do not match", "error");
    setLoading(false);
    return false;
  }

  if (formData.password.length < 6) {
    showMessage("Password must be at least 6 characters", "error");
    setLoading(false);
    return false;
  }

  // Remove confirm_password from data
  const { confirm_password, ...data } = formData;

  // Role validation
  if (data.role === 'doctor' && !data.specialization) {
    showMessage("Specialization is required for doctors", "error");
    setLoading(false);
    return false;
  }

  if (data.role === 'ngo' && !data.organization_name) {
    showMessage("Organization name is required for NGOs", "error");
    setLoading(false);
    return false;
  }

  // Clean empty fields
  Object.keys(data).forEach(key => {
    if (data[key] === '' || data[key] === null || data[key] === undefined) {
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

    if (res.ok && (result.success || result.accessToken)) {
      // Save tokens and user data
      localStorage.setItem("accessToken", result.accessToken || result.data?.accessToken);
      localStorage.setItem("user", JSON.stringify(result.user || result.data?.user || result.data));

      showMessage("Account created successfully! Redirecting...", "success");
      
      // Redirect to dashboard after 1 second
      setTimeout(() => {
        window.location.href = "/dashboard.html";
      }, 1000);
    } else {
      // Show error message from backend
      let errorMsg = result.error || result.message || "Registration failed";
      
      
      if (errorMsg.includes("Email already exists") || errorMsg.includes("email") || errorMsg.includes("already exists")) {
        errorMsg = "Email already exists";
      } else if (errorMsg.includes("Password must be")) {
        errorMsg = "Password must be at least 6 characters";
      } else if (errorMsg.includes("Invalid email")) {
        errorMsg = "Invalid email format";
      } else if (errorMsg.includes("organization_name") || errorMsg.includes("organization")) {
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
  
  return false;
}


window.handleRegister = handleRegister;
window.togglePassword = togglePassword;


document.addEventListener("DOMContentLoaded", () => {
  
  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }

 
  const passwordToggles = document.querySelectorAll('.password-toggle');
  passwordToggles.forEach(toggle => {
    toggle.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      const passwordId = this.getAttribute('data-password-id');
      if (passwordId) {
        togglePassword(passwordId, e);
      }
    });
  });

  // Handle role selection
  const roleSelect = document.getElementById("role-select");
  const specializationGroup = document.getElementById("specialization-group");
  const licenseGroup = document.getElementById("license-number-group");
  const organizationGroup = document.getElementById("organization-group");

  if (roleSelect) {
    roleSelect.addEventListener("change", () => {
      const role = roleSelect.value;

      // Reset all groups
      if (specializationGroup) specializationGroup.style.display = "none";
      if (licenseGroup) licenseGroup.style.display = "none";
      if (organizationGroup) organizationGroup.style.display = "none";

      // Clear required attributes
      if (specializationGroup) {
        const specInput = specializationGroup.querySelector("input");
        if (specInput) specInput.required = false;
      }
      if (organizationGroup) {
        const orgInput = organizationGroup.querySelector("input");
        if (orgInput) orgInput.required = false;
      }

      // Show relevant fields based on role
      if (role === "doctor") {
        if (specializationGroup) {
          specializationGroup.style.display = "block";
          const specInput = specializationGroup.querySelector("input");
          if (specInput) specInput.required = true;
        }
        if (licenseGroup) licenseGroup.style.display = "block";
      } else if (role === "ngo") {
        if (organizationGroup) {
          organizationGroup.style.display = "block";
          const orgInput = organizationGroup.querySelector("input");
          if (orgInput) orgInput.required = true;
        }
      }
    });
  }
});

