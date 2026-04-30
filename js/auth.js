// API Base URL (already defined in api.js, but keeping here for safety)
const API_BASE = "https://hng-stage3-task4-backend-production.up.railway.app/api/v1";

/**
 * Initialize authentication page
 */
document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("loginBtn");

  if (loginBtn) {
    loginBtn.addEventListener("click", login);
  }

  // Check if user is already logged in
  checkSession();
});

/**
 * Redirect to GitHub OAuth login
 */
function login() {
  const btn = document.getElementById("loginBtn");

  if (!btn) return;
  
  btn.innerText = "Redirecting...";
  btn.disabled = true;

  // Add loading state
  btn.style.opacity = "0.7";
  btn.style.cursor = "wait";

  // Redirect to backend login endpoint
  window.location.href = `${API_BASE}/auth/login?client=web`;
}

/**
 * Check if user has valid session
 */
async function checkSession() {
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      method: "GET",
      credentials: "include",  // 👈 Critical: Send cookies
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      }
    });

    if (res.ok) {
      // User is authenticated, redirect to dashboard
      console.log("User already authenticated, redirecting to dashboard");
      window.location.href = "./dashboard.html";
    } else {
      console.log("No active session found");
    }
  } catch (error) {
    // No active session, stay on login page
    console.log("Session check failed:", error);
  }
}

/**
 * Handle OAuth callback (if needed)
 */
function handleCallback() {
  const urlParams = new URLSearchParams(window.location.search);
  
  // If we have error params, show error
  if (urlParams.has('error')) {
    const errorMsg = urlParams.get('error_description') || urlParams.get('error') || 'Authentication failed';
    showError(errorMsg);
    return;
  }
  
  // Check for successful authentication (cookies should be set by backend)
  checkSession();
}

/**
 * Show error message on login page
 */
function showError(message) {
  const errorEl = document.getElementById("errorMessage");
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.style.display = "block";
  }
  
  // Re-enable login button
  const btn = document.getElementById("loginBtn");
  if (btn) {
    btn.innerText = "Try Again";
    btn.disabled = false;
    btn.style.opacity = "1";
    btn.style.cursor = "pointer";
  }
}
