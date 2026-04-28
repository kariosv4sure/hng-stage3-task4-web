const API_BASE = "https://hng-stage3-task4-backend-production.up.railway.app/api/v1";

document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("loginBtn");
  if (loginBtn) {
    loginBtn.addEventListener("click", handleLogin);
  }
  checkSession();
});

function handleLogin() {
  const btn = document.getElementById("loginBtn");
  
  // Show loading state
  btn.innerHTML = "Redirecting to GitHub...";
  btn.disabled = true;
  
  // Redirect directly - backend handles the GitHub OAuth flow
  window.location.href = `${API_BASE}/auth/login?client=web`;
}

async function checkSession() {
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      credentials: "include"
    });

    if (res.ok) {
      window.location.href = "./dashboard.html";
    }
  } catch (err) {
    console.log("No active session");
  }
}

