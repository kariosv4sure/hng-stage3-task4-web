let page = 1;
const limit = 10;

document.addEventListener("DOMContentLoaded", () => {
  loadUser();
  loadProfiles();

  const searchBtn = document.getElementById("searchBtn");
  const prevBtn = document.getElementById("prevPage");
  const nextBtn = document.getElementById("nextPage");
  const logoutBtn = document.getElementById("logoutBtn");
  const exportBtn = document.getElementById("exportBtn");

  if (searchBtn) searchBtn.onclick = search;

  if (prevBtn) {
    prevBtn.onclick = () => {
      if (page > 1) {
        page--;
        loadProfiles();
      }
    };
  }

  if (nextBtn) {
    nextBtn.onclick = () => {
      page++;
      loadProfiles();
    };
  }

  if (logoutBtn) logoutBtn.onclick = logout;
  if (exportBtn) exportBtn.onclick = exportCSV;
});

/* ---------------- USER ---------------- */
async function loadUser() {
  try {
    const res = await apiGet("/auth/me");

    const userDisplay = document.getElementById("userDisplay");
    const logoutBtn = document.getElementById("logoutBtn");

    if (userDisplay) {
      userDisplay.textContent = res.github_username;
      userDisplay.classList.remove("hidden");
    }

    if (logoutBtn) logoutBtn.classList.remove("hidden");

  } catch {
    window.location.href = "./index.html";
  }
}

/* ---------------- PROFILES ---------------- */
async function loadProfiles() {
  try {
    const res = await apiGet(`/profiles?page=${page}&limit=${limit}`);

    render(res.data);

    const totalEl = document.getElementById("totalCount");
    const countryEl = document.getElementById("countryCount");
    const pageInfo = document.getElementById("pageInfo");

    if (totalEl) totalEl.textContent = res.total;

    const countries = new Set(res.data.map(p => p.country_name)).size;
    if (countryEl) countryEl.textContent = countries;

    if (pageInfo) {
      pageInfo.textContent = `Page ${page} of ${Math.ceil(res.total / res.limit)}`;
    }

  } catch {
    const table = document.getElementById("tableBody");

    if (table) {
      table.innerHTML = `
        <tr>
          <td colspan="5" class="p-4 text-center text-red-400">
            Failed to load
          </td>
        </tr>
      `;
    }
  }
}

/* ---------------- SEARCH (FIXED 🔥) ---------------- */
async function search() {
  const input = document.getElementById("searchInput");
  const q = input ? input.value.trim() : "";

  // reset pagination on every search (IMPORTANT FIX)
  page = 1;

  if (!q) return loadProfiles();

  try {
    const res = await apiGet(
      `/profiles/search?q=${encodeURIComponent(q)}&page=1&limit=${limit}`
    );

    render(res.data);

    const pageInfo = document.getElementById("pageInfo");
    if (pageInfo) pageInfo.textContent = "Search results";

  } catch {
    const table = document.getElementById("tableBody");

    if (table) {
      table.innerHTML = `
        <tr>
          <td colspan="5" class="p-4 text-center text-red-400">
            Search failed
          </td>
        </tr>
      `;
    }
  }
}

/* ---------------- RENDER ---------------- */
function render(data) {
  const table = document.getElementById("tableBody");
  if (!table) return;

  if (!data || data.length === 0) {
    table.innerHTML = `
      <tr>
        <td colspan="5" class="p-4 text-center text-gray-500">
          No data
        </td>
      </tr>
    `;
    return;
  }

  table.innerHTML = data.map(p => `
    <tr class="border-t border-gray-800">
      <td class="p-3">${p.name}</td>
      <td class="p-3">${p.gender}</td>
      <td class="p-3">${p.age}</td>
      <td class="p-3">${p.country_name}</td>
      <td class="p-3">${Math.round(p.gender_probability * 100)}%</td>
    </tr>
  `).join("");
}

/* ---------------- EXPORT ---------------- */
async function exportCSV() {
  try {
    const res = await fetch(`${API_BASE}/export/profiles`, {
      credentials: "include"
    });

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "profiles.csv";
    a.click();

  } catch (err) {
    console.log("Export failed", err);
  }
}

/* ---------------- LOGOUT ---------------- */
async function logout() {
  try {
    await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      credentials: "include"
    });
  } finally {
    window.location.href = "./index.html";
  }
}
