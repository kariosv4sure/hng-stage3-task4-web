let page = 1;
const limit = 10;

document.addEventListener("DOMContentLoaded", () => {
  init();
});

function init() {
  loadUser();
  loadProfiles();

  document.getElementById("searchBtn")?.addEventListener("click", search);
  document.getElementById("prevPage")?.addEventListener("click", () => {
    if (page > 1) {
      page--;
      loadProfiles();
    }
  });

  document.getElementById("nextPage")?.addEventListener("click", () => {
    page++;
    loadProfiles();
  });

  document.getElementById("logoutBtn")?.addEventListener("click", logout);
  document.getElementById("exportBtn")?.addEventListener("click", exportCSV);
}

/* USER */
async function loadUser() {
  try {
    const res = await apiGet("/auth/me");

    const el = document.getElementById("userDisplay");
    if (el) el.textContent = res.github_username || "User";
  } catch {
    window.location.href = "./index.html";
  }
}

/* PROFILES */
async function loadProfiles() {
  try {
    const res = await apiGet(`/profiles?page=${page}&limit=${limit}`);

    render(res.data || []);
    updateStats(res);
  } catch {
    render([]);
  }
}

/* SEARCH */
async function search() {
  const q = document.getElementById("searchInput")?.value?.trim();
  page = 1;

  if (!q) return loadProfiles();

  const res = await apiGet(
    `/profiles/search?q=${encodeURIComponent(q)}&page=1&limit=${limit}`
  );

  render(res.data || []);
}

/* RENDER */
function render(data) {
  const table = document.getElementById("tableBody");
  if (!table) return;

  if (!data.length) {
    table.innerHTML = `<tr><td colspan="5">No data</td></tr>`;
    return;
  }

  table.innerHTML = data
    .map(
      (p) => `
    <tr>
      <td>${p.name}</td>
      <td>${p.gender}</td>
      <td>${p.age}</td>
      <td>${p.country_name}</td>
      <td>${Math.round((p.gender_probability || 0) * 100)}%</td>
    </tr>`
    )
    .join("");
}

/* STATS */
function updateStats(res) {
  document.getElementById("totalCount").textContent = res.total ?? "-";
  document.getElementById("pageInfo").textContent =
    `Page ${page} of ${Math.ceil(res.total / limit)}`;
}

/* EXPORT */
async function exportCSV() {
  const res = await fetch(`${API_BASE}/export/profiles`, {
    credentials: "include",
  });

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "profiles.csv";
  a.click();

  URL.revokeObjectURL(url);
}

/* LOGOUT */
async function logout() {
  await fetch(`${API_BASE}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });

  window.location.href = "./index.html";
}
