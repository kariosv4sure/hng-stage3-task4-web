let page = 1;
const limit = 10;

document.addEventListener("DOMContentLoaded", () => {
  init();
});

function init() {
  loadUser();
  loadProfiles();

  document.getElementById("searchBtn")?.addEventListener("click", search);
  document.getElementById("prevPage")?.addEventListener("click", prevPage);
  document.getElementById("nextPage")?.addEventListener("click", nextPage);
  document.getElementById("logoutBtn")?.addEventListener("click", logout);
  document.getElementById("exportBtn")?.addEventListener("click", exportCSV);
}

/* ---------------- PAGINATION ---------------- */
function prevPage() {
  if (page > 1) {
    page--;
    loadProfiles();
  }
}

function nextPage() {
  page++;
  loadProfiles();
}

/* ---------------- USER ---------------- */
async function loadUser() {
  try {
    const res = await apiGet("/auth/me");

    const userDisplay = document.getElementById("userDisplay");
    const logoutBtn = document.getElementById("logoutBtn");

    if (userDisplay) {
      userDisplay.textContent = res.github_username || "User";
      userDisplay.classList.remove("hidden");
    }

    logoutBtn?.classList.remove("hidden");

  } catch {
    window.location.href = "./index.html";
  }
}

/* ---------------- PROFILES ---------------- */
async function loadProfiles() {
  try {
    const res = await apiGet(`/profiles?page=${page}&limit=${limit}`);

    render(res?.data || []);

    updateStats(res);

  } catch (err) {
    console.log("Load profiles error:", err);
    render([]);
  }
}

/* ---------------- STATS ---------------- */
function updateStats(res) {
  const totalEl = document.getElementById("totalCount");
  const countryEl = document.getElementById("countryCount");
  const pageInfo = document.getElementById("pageInfo");

  if (totalEl) totalEl.textContent = res?.total ?? "-";

  const countries = new Set((res?.data || []).map(p => p.country_name)).size;
  if (countryEl) countryEl.textContent = countries;

  if (pageInfo && res?.total) {
    pageInfo.textContent = `Page ${page} of ${Math.ceil(res.total / limit)}`;
  }
}

/* ---------------- SEARCH (SAFE MODE) ---------------- */
async function search() {
  const q = document.getElementById("searchInput")?.value?.trim();

  page = 1;

  if (!q) return loadProfiles();

  try {
    const res = await apiGet(
      `/profiles/search?q=${encodeURIComponent(q)}&page=1&limit=${limit}`
    );

    render(res?.data || []);

    const pageInfo = document.getElementById("pageInfo");
    if (pageInfo) pageInfo.textContent = "Search results";

  } catch (err) {
    console.log("Search error:", err);
    render([]);
  }
}

/* ---------------- RENDER ---------------- */
function render(data) {
  const table = document.getElementById("tableBody");
  if (!table) return;

  if (!Array.isArray(data) || data.length === 0) {
    table.innerHTML = `
      <tr>
        <td colspan="5" class="p-4 text-center text-gray-500">
          No data found
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
      <td class="p-3">${Math.round((p.gender_probability || 0) * 100)}%</td>
    </tr>
  `).join("");
}

/* ---------------- EXPORT ---------------- */
async function exportCSV() {
  try {
    const res = await fetch(`${API_BASE}/export/profiles`, {
      credentials: "include"
    });

    if (!res.ok) throw new Error("Export failed");

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "profiles.csv";
    a.click();

    URL.revokeObjectURL(url);

  } catch (err) {
    console.log(err);
  }
}

/* ---------------- LOGOUT ---------------- */
async function logout() {
  try {
    await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      credentials: "include"
    });
  } catch (err) {
    console.log(err);
  } finally {
    window.location.href = "./index.html";
  }
}
