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
  const btn = document.getElementById("login-btn");
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

async function handleLogin(e) {
  e.preventDefault();
  e.stopPropagation();
  hideMessage();
  setLoading(true);

  const form = e.target;
  const data = {
    email: form.email.value.trim(),
    password: form.password.value
  };

  // Validation
  if (!data.email || !data.password) {
    showMessage("Please fill in all required fields", "error");
    setLoading(false);
    return false;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await res.json();

    // Backend returns: { success, accessToken, user, message } or { error, message }
    if (res.ok && (result.success || result.accessToken)) {
      localStorage.setItem("accessToken", result.accessToken || result.data?.accessToken);
      localStorage.setItem("user", JSON.stringify(result.user || result.data?.user || result.data));

      showMessage("Login successful! Redirecting...", "success");
      
      // Redirect to dashboard after 1 second
      setTimeout(() => {
        window.location.href = "/dashboard.html";
      }, 1000);
    } else {
      let errorMsg = result.error || result.message || "Login failed";
      
      // Translate common errors
      if (errorMsg.includes("Invalid email or password") || errorMsg.includes("invalid") || errorMsg.includes("credentials")) {
        errorMsg = "Invalid email or password";
      } else if (errorMsg.includes("Account is inactive") || errorMsg.includes("inactive")) {
        errorMsg = "Account is inactive. Please contact support";
      }
      
      console.error("Login failed:", result);
      showMessage(errorMsg, "error");
      setLoading(false);
    }
  } catch (error) {
    console.error("Login error:", error);
    showMessage("Server connection error. Make sure the server is running on http://localhost:3000", "error");
    setLoading(false);
  }
  
  return false;
}

// Make function globally available
window.handleLogin = handleLogin;
window.togglePassword = togglePassword;

// Attach event listener when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
  
  // Attach event listeners to password toggle buttons
  const passwordToggle = document.querySelector('.password-toggle');
  if (passwordToggle) {
    passwordToggle.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      const passwordId = this.getAttribute('data-password-id') || 'login-password';
      togglePassword(passwordId, e);
    });
  }
});
