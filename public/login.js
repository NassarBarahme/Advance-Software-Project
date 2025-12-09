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
  hideMessage();
  setLoading(true);

  const data = {
    email: e.target.email.value,
    password: e.target.password.value
  };

  try {
    const res = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await res.json();

    // Backend returns: { success, accessToken, user, message }
    if (res.ok && result.success) {
      localStorage.setItem("accessToken", result.accessToken);
      localStorage.setItem("user", JSON.stringify(result.user));

      showMessage("Login successful! Redirecting...", "success");
      
      // Redirect to dashboard after 1 second
      setTimeout(() => {
        window.location.href = "/dashboard.html";
      }, 1000);
    } else {
      let errorMsg = result.error || result.message || "Login failed";
      
      // Translate common errors
      if (errorMsg.includes("Invalid email or password")) {
        errorMsg = "Invalid email or password";
      } else if (errorMsg.includes("Account is inactive")) {
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
}
