// ---------- DOM ----------
const grid = document.getElementById("grid");
const statusBox = document.getElementById("status");
const form = document.getElementById("search-form");
const input = document.getElementById("query");

// ---------- Config: backend en Render ----------
const API_BASE =
  (location.hostname === "localhost" || location.hostname === "127.0.0.1")
    ? location.origin // cuando probás local (sirviendo /public)
    : "https://server-marvel.onrender.com"; // <- tu backend en Render

function buildUrl(path, params = {}) {
  const url = new URL(path, API_BASE); // base absoluta (Render o localhost)
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && `${v}`.length) url.searchParams.set(k, v);
  });
  return url.toString();
}

// ---------- UI helpers ----------
function showStatus(msg){
  statusBox.hidden = false;
  statusBox.textContent = msg;
}
function clearStatus(){
  statusBox.hidden = true;
  statusBox.textContent = "";
}
function skeleton(n=8){
  grid.innerHTML = Array.from({length:n}).map(() => `
    <article class="card">
      <div class="card__img skeleton" style="aspect-ratio:3/4"></div>
      <div class="card__body">
        <h3 class="card__title skeleton" style="height:18px;border-radius:6px"></h3>
        <p class="meta skeleton" style="height:14px;border-radius:6px;margin-top:8px"></p>
        <p class="desc skeleton" style="height:46px;border-radius:8px;margin-top:10px"></p>
      </div>
    </article>
  `).join("");
}

// ---------- Card ----------
function cardHTML({name, thumbnail, description, firstComic, firstYear, urls, source}) {
  const img = thumbnail ? `<img class="card__img" src="${thumbnail}" alt="${name}" loading="lazy"/>` : `<div class="card__img skeleton"></div>`;
  const yearTxt = firstYear ? ` • ${firstYear}` : "";
  const meta = (firstComic || firstYear)
    ? `<p class="meta"><strong>Primera aparición:</strong> ${firstComic ? firstComic : "Desconocido"}${yearTxt}</p>`
    : `<p class="meta">Sin datos de primera aparición.</p>`;
  const desc = description && description.trim().length ? description : "Sin descripción oficial.";
  const links = (urls||[]).slice(0,3).map(u => `<a class="link" href="${u.url}" target="_blank" rel="noreferrer noopener">${u.type}</a>`).join("");
  const badge = source ? `<span class="meta">Fuente: ${source}</span>` : "";

  return `
  <article class="card">
    ${img}
    <div class="card__body">
      <h3 class="card__title">${name}</h3>
      ${badge}
      ${meta}
      <p class="desc">${desc}</p>
      <div class="links">${links}</div>
    </div>
  </article>`;
}

// ---------- Fetch ----------
async function search(q){
  try{
    clearStatus();
    skeleton();

    const url = buildUrl("/api/characters", q ? { q } : {});
    const r = await fetch(url);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const data = await r.json();
    if (!data.ok) throw new Error(data.error || "Error inesperado");

    if (!data.results.length){
      grid.innerHTML = "";
      showStatus("No se encontraron personajes para esa búsqueda.");
      return;
    }

    grid.innerHTML = data.results.map(cardHTML).join("");
  }catch(err){
    console.error(err);
    grid.innerHTML = "";
    showStatus("No pudimos cargar los datos. Verificá la URL del backend o intenta nuevamente.");
  }
}

// ---------- Events ----------
form.addEventListener("submit", (e) => {
  e.preventDefault();
  search(input.value.trim());
});

// ---------- Initial ----------
search("Spider");
