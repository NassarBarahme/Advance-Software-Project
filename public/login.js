

const API_BASE_URL = 'http://localhost:3000/api/auth';

function switchTab(tab) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.form-container').forEach(f => f.classList.remove('active'));

  if (tab === 'login') {
    document.querySelector('.tab:nth-child(1)').classList.add('active');
    document.getElementById('login-form').classList.add('active');
  } else {
    document.querySelector('.tab:nth-child(2)').classList.add('active');
    document.getElementById('register-form').classList.add('active');
  }
}

function togglePassword(id) {
  const input = document.getElementById(id);
  input.type = input.type === "password" ? "text" : "password";
}

function showMessage(msg, type="error") {
  const m = document.getElementById("message");
  m.textContent = msg;
  m.className = `message ${type} show`;
}

function hideMessage() {
  document.getElementById("message").classList.remove("show");
}

async function handleLogin(e) {
  e.preventDefault();

  hideMessage();

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

    if (res.ok && result.success) {
      localStorage.setItem("accessToken", result.data.accessToken);
      localStorage.setItem("user", JSON.stringify(result.data.user));

      window.location.href = "/dashboard.html";
    } else {
      showMessage(result.message || "Login failed");
    }
  } catch {
    showMessage("Server error. Is backend running?");
  }
}

async function handleRegister(e) {
  e.preventDefault();

  hideMessage();

  const form = new FormData(e.target);
  const data = Object.fromEntries(form.entries());

  if (data.password !== data.confirm_password) {
    showMessage("Passwords do not match");
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await res.json();

    if (res.ok && result.success) {
      localStorage.setItem("accessToken", result.data.accessToken);
      localStorage.setItem("user", JSON.stringify(result.data.user));

      const role = result.data.user.role;

      window.location.href = `/dashboards/${role}.html`;
    } else {
      showMessage(result.message || "Registration failed");
    }
  } catch {
    showMessage("Server error.");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const roleSelect = document.getElementById("role-select");
  const specialization = document.getElementById("specialization-group");

  roleSelect.addEventListener("change", () => {
    specialization.style.display =
      roleSelect.value === "doctor" ? "block" : "none";
  });
});

