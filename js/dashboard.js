let page = 1;
const limit = 10;

document.addEventListener("DOMContentLoaded", () => {
  loadUser();
  loadProfiles();

  document.getElementById("searchBtn").onclick = search;
  document.getElementById("prevPage").onclick = () => { if (page > 1) { page--; loadProfiles(); } };
  document.getElementById("nextPage").onclick = () => { page++; loadProfiles(); };
  document.getElementById("logoutBtn").onclick = logout;
  document.getElementById("exportBtn").onclick = exportCSV;
});

async function loadUser() {
  try {
    const res = await apiGet("/auth/me");
    document.getElementById("userDisplay").textContent = res.github_username;
    document.getElementById("userDisplay").classList.remove("hidden");
    document.getElementById("logoutBtn").classList.remove("hidden");
  } catch {
    window.location.href = "./index.html";
  }
}

async function loadProfiles() {
  try {
    const res = await apiGet(`/profiles?page=${page}&limit=${limit}`);
    render(res.data);

    document.getElementById("totalProfiles").textContent = res.total;

    const countries = new Set(res.data.map(p => p.country_name)).size;
    document.getElementById("countries").textContent = countries;

    document.getElementById("pageInfo").textContent =
      `Page ${page} of ${Math.ceil(res.total / res.limit)}`;

  } catch {
    document.getElementById("tableBody").innerHTML =
      `<tr><td colspan="5" class="p-4 text-center text-red-400">Failed to load</td></tr>`;
  }
}

async function search() {
  const q = document.getElementById("searchInput").value;
  if (!q) return loadProfiles();

  try {
    const res = await apiGet(`/profiles/search?q=${encodeURIComponent(q)}&page=${page}&limit=${limit}`);
    render(res.data);
  } catch {
    document.getElementById("tableBody").innerHTML =
      `<tr><td colspan="5" class="p-4 text-center text-red-400">Search failed</td></tr>`;
  }
}

function render(data) {
  if (!data.length) {
    document.getElementById("tableBody").innerHTML =
      `<tr><td colspan="5" class="p-4 text-center text-gray-500">No data</td></tr>`;
    return;
  }

  document.getElementById("tableBody").innerHTML = data.map(p => `
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
  const res = await fetch(`${API_BASE}/export/profiles`, {
    credentials: "include"
  });

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "profiles.csv";
  a.click();
}

async function logout() {
  await fetch(`${API_BASE}/auth/logout`, {
    method: "POST",
    credentials: "include"
  });

  window.location.href = "./index.html";
}

