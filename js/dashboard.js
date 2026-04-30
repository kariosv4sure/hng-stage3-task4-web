// API Base URL (defined globally in api.js)
// const API_BASE is already available from api.js

let page = 1;
const limit = 10;

/**
 * Initialize dashboard
 */
document.addEventListener("DOMContentLoaded", () => {
  init();
});

function init() {
  console.log("Initializing dashboard...");
  
  // Load user info and profiles
  loadUser();
  loadProfiles();

  // Setup event listeners
  setupEventListeners();
}

function setupEventListeners() {
  // Search button
  const searchBtn = document.getElementById("searchBtn");
  if (searchBtn) {
    searchBtn.addEventListener("click", search);
  }

  // Search on Enter key
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        search();
      }
    });
  }

  // Pagination
  const prevBtn = document.getElementById("prevPage");
  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      if (page > 1) {
        page--;
        loadProfiles();
      }
    });
  }

  const nextBtn = document.getElementById("nextPage");
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      page++;
      loadProfiles();
    });
  }

  // Logout button
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }

  // Export button
  const exportBtn = document.getElementById("exportBtn");
  if (exportBtn) {
    exportBtn.addEventListener("click", exportCSV);
  }
}

/* ─────────────────────────────
   USER MANAGEMENT
   ───────────────────────────── */

/**
 * Load current user info
 */
async function loadUser() {
  try {
    const res = await apiGet("/auth/me");

    const el = document.getElementById("userDisplay");
    if (el && res) {
      const username = res.github_username || res.username || res.email || "User";
      el.textContent = `Welcome, ${username}`;
    }
  } catch (error) {
    console.error("Failed to load user:", error);
    // Don't immediately redirect, show error state
    const el = document.getElementById("userDisplay");
    if (el) {
      el.textContent = "Error loading user";
    }
    
    // Only redirect if unauthorized
    if (error.message.includes("401")) {
      window.location.href = "./index.html";
    }
  }
}

/* ─────────────────────────────
   PROFILES
   ───────────────────────────── */

/**
 * Load profiles from API
 */
async function loadProfiles() {
  showLoading(true);
  
  try {
    const res = await apiGet(`/profiles?page=${page}&limit=${limit}`);

    if (res) {
      render(res.data || []);
      updateStats(res);
      updatePagination(res);
    } else {
      render([]);
    }
  } catch (error) {
    console.error("Failed to load profiles:", error);
    render([]);
    showError("Failed to load profiles. Please try again.");
  } finally {
    showLoading(false);
  }
}

/**
 * Search profiles
 */
async function search() {
  const searchInput = document.getElementById("searchInput");
  const q = searchInput?.value?.trim();
  page = 1;

  if (!q) {
    return loadProfiles();
  }

  showLoading(true);
  
  try {
    const res = await apiGet(
      `/profiles/search?q=${encodeURIComponent(q)}&page=1&limit=${limit}`
    );

    if (res) {
      render(res.data || []);
      updateStats(res);
      updatePagination(res);
    } else {
      render([]);
    }
  } catch (error) {
    console.error("Search failed:", error);
    render([]);
    showError("Search failed. Please try again.");
  } finally {
    showLoading(false);
  }
}

/* ─────────────────────────────
   RENDERING
   ───────────────────────────── */

/**
 * Render profiles table
 */
function render(data) {
  const table = document.getElementById("tableBody");
  if (!table) return;

  if (!data || !data.length) {
    table.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; padding: 2rem;">
          <div class="empty-state">
            <p>📊 No profiles found</p>
            <p style="font-size: 0.9rem; color: #666;">Try adjusting your search criteria</p>
          </div>
        </td>
      </tr>`;
    return;
  }

  table.innerHTML = data
    .map(
      (p) => `
    <tr>
      <td>${escapeHtml(p.name || "N/A")}</td>
      <td>${escapeHtml(p.gender || "N/A")}</td>
      <td>${p.age || "N/A"}</td>
      <td>${escapeHtml(p.country_name || "N/A")}</td>
      <td>
        <div class="confidence-bar">
          <div class="confidence-fill" style="width: ${Math.round((p.gender_probability || 0) * 100)}%"></div>
          <span>${Math.round((p.gender_probability || 0) * 100)}%</span>
        </div>
      </td>
    </tr>`
    )
    .join("");
}

/**
 * Update statistics display
 */
function updateStats(res) {
  if (!res) return;
  
  const totalCount = document.getElementById("totalCount");
  if (totalCount) {
    totalCount.textContent = res.total ?? "0";
  }

  const pageInfo = document.getElementById("pageInfo");
  if (pageInfo) {
    const totalPages = Math.ceil((res.total || 0) / limit) || 1;
    pageInfo.textContent = `Page ${page} of ${totalPages}`;
  }
}

/**
 * Update pagination buttons
 */
function updatePagination(res) {
  if (!res) return;
  
  const totalPages = Math.ceil((res.total || 0) / limit) || 1;
  
  const prevBtn = document.getElementById("prevPage");
  const nextBtn = document.getElementById("nextPage");
  
  if (prevBtn) {
    prevBtn.disabled = page <= 1;
  }
  
  if (nextBtn) {
    nextBtn.disabled = page >= totalPages;
  }
}

/**
 * Show/hide loading state
 */
function showLoading(show) {
  const loader = document.getElementById("loadingIndicator");
  if (loader) {
    loader.style.display = show ? "block" : "none";
  }
}

/**
 * Show error message
 */
function showError(message) {
  const errorEl = document.getElementById("errorMessage");
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.style.display = "block";
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      errorEl.style.display = "none";
    }, 5000);
  }
}

/* ─────────────────────────────
   EXPORT
   ───────────────────────────── */

/**
 * Export profiles as CSV
 */
async function exportCSV() {
  try {
    const exportBtn = document.getElementById("exportBtn");
    if (exportBtn) {
      exportBtn.disabled = true;
      exportBtn.textContent = "Exporting...";
    }

    const res = await fetch(`${API_BASE}/export/profiles`, {
      method: "GET",
      credentials: "include",  // 👈 Critical: Send authentication cookies
      headers: {
        "Accept": "text/csv, application/json",
      }
    });

    if (!res.ok) {
      throw new Error(`Export failed: ${res.status}`);
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `profiles_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
    
    // Show success message
    console.log("Export completed successfully");
  } catch (error) {
    console.error("Export failed:", error);
    showError("Failed to export profiles. Please try again.");
  } finally {
    const exportBtn = document.getElementById("exportBtn");
    if (exportBtn) {
      exportBtn.disabled = false;
      exportBtn.textContent = "Export CSV";
    }
  }
}

/* ─────────────────────────────
   LOGOUT
   ───────────────────────────── */

/**
 * Logout user
 */
async function logout() {
  try {
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.disabled = true;
      logoutBtn.textContent = "Logging out...";
    }

    // Call logout endpoint to clear server-side cookies
    await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      }
    });

    // Clear any local storage
    localStorage.clear();
    sessionStorage.clear();

    // Redirect to home page
    window.location.href = "./index.html";
  } catch (error) {
    console.error("Logout failed:", error);
    // Force redirect even if API call fails
    window.location.href = "./index.html";
  }
}

/* ─────────────────────────────
   UTILITIES
   ───────────────────────────── */

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  if (!text) return "";
  
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Format date
 */
function formatDate(dateString) {
  if (!dateString) return "N/A";
  
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
