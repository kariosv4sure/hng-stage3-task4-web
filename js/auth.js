const API_BASE = "https://hng-stage3-task4-backend-production.up.railway.app/api/v1";

document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("loginBtn");

  if (loginBtn) {
    loginBtn.addEventListener("click", handleLogin);
  }

  // auto-check session on load
  checkSession();
});

async function handleLogin() {
  try {
    loginBtnLoading(true);

    const res = await fetch(`${API_BASE}/auth/login?client=web`, {
      method: "GET",
      credentials: "include"
    });

    if (!res.ok) throw new Error("Login init failed");

    // backend sends redirect response, so we just follow it
    window.location.href = `${API_BASE}/auth/login?client=web`;

  } catch (err) {
    console.error(err);
    alert("Login failed. Try again.");
  } finally {
    loginBtnLoading(false);
  }
}

async function checkSession() {
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      credentials: "include"
    });

    if (res.ok) {
      // already logged in → go dashboard
      window.location.href = "./dashboard.html";
    }
  } catch (err) {
    console.log("No active session");
  }
}

function loginBtnLoading(state) {
  const btn = document.getElementById("loginBtn");
  if (!btn) return;

  if (state) {
    btn.innerHTML = "Redirecting...";
    btn.disabled = true;
  } else {
    btn.innerHTML = `<i class="fa-brands fa-github text-xl"></i> Login with GitHub`;
    btn.disabled = false;
  }
}
