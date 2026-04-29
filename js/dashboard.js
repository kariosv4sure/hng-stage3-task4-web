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
  if (prevBtn) prevBtn.onclick = () => {
    if (page > 1) {
      page--;
      loadProfiles();
    }
  };

  if (nextBtn) nextBtn.onclick = () => {
    page++;
    loadProfiles();
  };

  if (logoutBtn) logoutBtn.onclick = logout;
  if (exportBtn) exportBtn.onclick = exportCSV;
});

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

  } catch (err) {
    window.location.href = "./index.html";
  }
}

async function loadProfiles() {
  try {
    const res = await apiGet(`/profiles?page=${page}&limit=${limit}`);

    render(res.data);

    // ✅ FIXED IDS (matches your HTML)
    const totalEl = document.getElementById("totalCount");
    const countryEl = document.getElementById("countryCount");

    if (totalEl) totalEl.textContent = res.total;

    const countries = new Set(res.data.map(p => p.country_name)).size;
    if (countryEl) countryEl.textContent = countries;

    const pageInfo = document.getElementById("pageInfo");
    if (pageInfo) {
      pageInfo.textContent = `Page ${page} of ${Math.ceil(res.total / res.limit)}`;
    }

  } catch (err) {
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

async function search() {
  const input = document.getElementById("searchInput");
  const q = input ? input.value.trim() : "";

  if (!q) return loadProfiles();

  try {
    const res = await apiGet(
      `/profiles/search?q=${encodeURIComponent(q)}&page=${page}&limit=${limit}`
    );

    render(res.data);

  } catch (err) {
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
