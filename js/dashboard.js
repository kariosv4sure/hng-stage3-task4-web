// API Base URL is defined in api.js and available globally
// const API_BASE = "https://hng-stage3-task4-backend-production.up.railway.app/api/v1";

let page = 1;
const limit = 10;
let totalProfiles = 0;
let currentFilters = {
    gender: '',
    ageGroup: ''
};

/* ================================
   TOKEN FALLBACK (Cross-Domain Fix)
   ================================ */

function handleTokenFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const encodedToken = urlParams.get('token');
    
    if (encodedToken) {
        try {
            const decoded = atob(encodedToken.replace(/-/g, '+').replace(/_/g, '/'));
            const tokenData = JSON.parse(decoded);
            
            if (tokenData.access_token) {
                sessionStorage.setItem('access_token', tokenData.access_token);
            }
            if (tokenData.refresh_token) {
                sessionStorage.setItem('refresh_token', tokenData.refresh_token);
            }
            
            console.log('✅ Token stored from URL fallback');
            window.history.replaceState({}, document.title, './dashboard.html');
        } catch (error) {
            console.error('❌ Failed to parse token from URL:', error);
        }
    }
}

const originalApiGet = apiGet;
apiGet = async function(path, includeCredentials = true) {
    const token = sessionStorage.getItem('access_token');
    
    if (token) {
        const options = {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        };
        
        try {
            const res = await fetch(`${API_BASE}${path}`, options);
            if (res.ok) return res.json();
            
            if (res.status === 401) {
                console.warn('🔒 Token expired, clearing session');
                sessionStorage.clear();
                window.location.href = './index.html';
                return null;
            }
            
            throw new Error(`API error: ${res.status}`);
        } catch (error) {
            console.error('API call failed:', error);
            throw error;
        }
    }
    
    return originalApiGet(path, includeCredentials);
};

const originalApiPost = apiPost;
apiPost = async function(path, body = {}, includeCredentials = true) {
    const token = sessionStorage.getItem('access_token');
    
    if (token) {
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body)
        };
        
        try {
            const res = await fetch(`${API_BASE}${path}`, options);
            if (res.ok) return res.json();
            
            if (res.status === 401) {
                console.warn('🔒 Token expired, clearing session');
                sessionStorage.clear();
                window.location.href = './index.html';
                return null;
            }
            
            throw new Error(`API error: ${res.status}`);
        } catch (error) {
            console.error('API call failed:', error);
            throw error;
        }
    }
    
    return originalApiPost(path, body, includeCredentials);
};

/* ================================
   DASHBOARD INITIALIZATION
   ================================ */

document.addEventListener("DOMContentLoaded", () => {
    console.log("🚀 Dashboard initializing...");
    handleTokenFromURL();
    init();
});

function init() {
    loadUser();
    loadProfiles();
    loadStats();
    setupEventListeners();
    console.log("✅ Dashboard initialized");
}

function setupEventListeners() {
    const searchBtn = document.getElementById("searchBtn");
    if (searchBtn) searchBtn.addEventListener("click", search);

    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") search();
        });
    }

    const applyFiltersBtn = document.getElementById("applyFilters");
    if (applyFiltersBtn) applyFiltersBtn.addEventListener("click", applyFilters);

    const filterGender = document.getElementById("filterGender");
    if (filterGender) filterGender.addEventListener("change", applyFilters);

    const filterAgeGroup = document.getElementById("filterAgeGroup");
    if (filterAgeGroup) filterAgeGroup.addEventListener("change", applyFilters);

    const prevBtn = document.getElementById("prevPage");
    if (prevBtn) {
        prevBtn.addEventListener("click", () => {
            if (page > 1) { page--; loadProfiles(); }
        });
    }

    const nextBtn = document.getElementById("nextPage");
    if (nextBtn) {
        nextBtn.addEventListener("click", () => {
            const totalPages = Math.ceil(totalProfiles / limit) || 1;
            if (page < totalPages) { page++; loadProfiles(); }
        });
    }

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) logoutBtn.addEventListener("click", logout);

    const exportBtn = document.getElementById("exportBtn");
    if (exportBtn) exportBtn.addEventListener("click", exportCSV);
}

/* ================================
   USER MANAGEMENT
   ================================ */

async function loadUser() {
    try {
        const res = await apiGet("/auth/me");
        const userDisplay = document.getElementById("userDisplay");
        const logoutBtn = document.getElementById("logoutBtn");

        if (userDisplay && res) {
            const username = res.github_username || res.username || res.email || "User";
            userDisplay.textContent = `👤 ${username}`;
            userDisplay.classList.remove("hidden");
            if (logoutBtn) logoutBtn.classList.remove("hidden");
            console.log(`✅ User loaded: ${username}`);
        }
    } catch (error) {
        console.error("❌ Failed to load user:", error);
        if (error.message && error.message.includes("401")) {
            sessionStorage.clear();
            window.location.href = "./index.html";
        }
    }
}

/* ================================
   PROFILES
   ================================ */

async function loadProfiles() {
    showLoading(true);
    try {
        let queryParams = `?page=${page}&limit=${limit}`;
        const searchInput = document.getElementById("searchInput");
        const q = searchInput?.value?.trim();
        if (q) queryParams += `&q=${encodeURIComponent(q)}`;
        if (currentFilters.gender) queryParams += `&gender=${encodeURIComponent(currentFilters.gender)}`;
        if (currentFilters.ageGroup) queryParams += `&age_group=${encodeURIComponent(currentFilters.ageGroup)}`;

        const endpoint = q ? "/profiles/search" : "/profiles";
        const res = await apiGet(`${endpoint}${queryParams}`);

        if (res) {
            totalProfiles = res.total || 0;
            render(res.data || []);
            updatePagination(res);
        } else {
            render([]);
        }
    } catch (error) {
        console.error("❌ Failed to load profiles:", error);
        render([]);
    } finally {
        showLoading(false);
    }
}

async function loadStats() {
    try {
        const res = await apiGet("/profiles?page=1&limit=1");
        const totalCount = document.getElementById("totalCount");
        if (totalCount && res) {
            totalCount.textContent = res.total?.toLocaleString() || "0";
        }
        const countryCount = document.getElementById("countryCount");
        if (countryCount) {
            countryCount.textContent = "54";
        }
    } catch (error) {
        console.error("❌ Failed to load stats:", error);
    }
}

async function search() {
    page = 1;
    await loadProfiles();
}

function applyFilters() {
    const filterGender = document.getElementById("filterGender");
    const filterAgeGroup = document.getElementById("filterAgeGroup");
    currentFilters.gender = filterGender?.value || '';
    currentFilters.ageGroup = filterAgeGroup?.value || '';
    page = 1;
    loadProfiles();
}

/* ================================
   RENDERING
   ================================ */

function render(data) {
    const tableBody = document.getElementById("tableBody");
    if (!tableBody) return;

    if (!data || !data.length) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="px-4 py-8 text-center text-gray-500">
                    <div class="text-3xl mb-2">📊</div>
                    <p class="text-lg mb-1">No profiles found</p>
                    <p class="text-sm text-gray-600">Try adjusting your search or filters</p>
                </td>
            </tr>`;
        return;
    }

    tableBody.innerHTML = data
        .map((p) => `
            <tr class="border-b border-gray-800 hover:bg-gray-800/30 transition-colors animate-fade-in">
                <td class="px-4 py-3 font-medium">${escapeHtml(p.name || "N/A")}</td>
                <td class="px-4 py-3">
                    <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                        ${p.gender === 'male' ? 'bg-blue-900/50 text-blue-300' : 
                          p.gender === 'female' ? 'bg-pink-900/50 text-pink-300' : 
                          'bg-gray-800 text-gray-400'}">
                        <i class="fa-solid ${p.gender === 'male' ? 'fa-mars' : 
                                             p.gender === 'female' ? 'fa-venus' : 
                                             'fa-question'}"></i>
                        ${escapeHtml(p.gender || "N/A")}
                    </span>
                </td>
                <td class="px-4 py-3 text-gray-300">${p.age || "N/A"}</td>
                <td class="px-4 py-3 text-gray-300">${p.country_name ? escapeHtml(p.country_name) : "N/A"}</td>
                <td class="px-4 py-3">
                    <div class="flex items-center gap-2">
                        <div class="flex-1 bg-gray-800 rounded-full h-2">
                            <div class="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500" 
                                 style="width: ${Math.round((p.gender_probability || 0) * 100)}%"></div>
                        </div>
                        <span class="text-xs text-gray-400 w-10 text-right">${Math.round((p.gender_probability || 0) * 100)}%</span>
                    </div>
                </td>
            </tr>
        `)
        .join("");
}

function updatePagination(res) {
    if (!res) return;
    const totalPages = Math.ceil((res.total || 0) / limit) || 1;
    const prevBtn = document.getElementById("prevPage");
    const nextBtn = document.getElementById("nextPage");
    const pageInfo = document.getElementById("pageInfo");
    if (prevBtn) prevBtn.disabled = page <= 1;
    if (nextBtn) nextBtn.disabled = page >= totalPages;
    if (pageInfo) pageInfo.textContent = `Page ${page} of ${totalPages}`;
}

function showLoading(show) {
    const tableBody = document.getElementById("tableBody");
    if (show && tableBody) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="px-4 py-8 text-center text-gray-500">
                    <div class="loader mx-auto mb-2"></div>
                    Loading profiles...
                </td>
            </tr>`;
    }
}

/* ================================
   EXPORT
   ================================ */

async function exportCSV() {
    const exportBtn = document.getElementById("exportBtn");
    const token = sessionStorage.getItem('access_token');
    
    try {
        if (exportBtn) {
            exportBtn.disabled = true;
            exportBtn.innerHTML = '<span class="loader inline-block mr-2"></span> Exporting...';
        }
        
        const headers = { "Accept": "text/csv, application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;
        
        const res = await fetch(`${API_BASE}/export/profiles`, {
            method: "GET",
            credentials: "include",
            headers: headers,
        });
        
        if (!res.ok) throw new Error(`Export failed: ${res.status}`);
        
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `insighta_profiles_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log("✅ Export completed");
        if (exportBtn) {
            exportBtn.innerHTML = '<i class="fa-solid fa-check mr-1"></i> Exported!';
            setTimeout(() => {
                exportBtn.innerHTML = '<i class="fa-solid fa-download mr-1"></i> CSV Export';
                exportBtn.disabled = false;
            }, 2000);
        }
    } catch (error) {
        console.error("❌ Export failed:", error);
        alert("Failed to export profiles. Please try again.");
        if (exportBtn) exportBtn.disabled = false;
    }
}

/* ================================
   LOGOUT
   ================================ */

async function logout() {
    if (!confirm("Are you sure you want to logout?")) return;
    
    const logoutBtn = document.getElementById("logoutBtn");
    try {
        if (logoutBtn) {
            logoutBtn.disabled = true;
            logoutBtn.innerHTML = '<span class="loader inline-block mr-1"></span> Logging out...';
        }
        
        const headers = {};
        const token = sessionStorage.getItem('access_token');
        if (token) headers["Authorization"] = `Bearer ${token}`;
        
        await fetch(`${API_BASE}/auth/logout`, {
            method: "POST",
            credentials: "include",
            headers: headers,
        });
        console.log("✅ Logged out");
    } catch (error) {
        console.error("❌ Logout failed:", error);
    } finally {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "./index.html";
    }
}

/* ================================
   UTILITIES
   ================================ */

function escapeHtml(text) {
    if (!text) return "";
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}
