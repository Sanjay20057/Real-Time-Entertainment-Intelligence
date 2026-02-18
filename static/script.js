/* ── CONFIG ──────────────────────────────────────────── */
const API_KEY = "6f3bbb8c4059102285b0a027b5a0092c";
const BASE    = "https://api.themoviedb.org/3";
const IMG     = "https://image.tmdb.org/t/p";

/* ── STATE ───────────────────────────────────────────── */
let currentMode = "movie"; // "movie" | "tv"

/* ── DOM REFS ────────────────────────────────────────── */
const searchInput        = document.getElementById("searchInput");
const searchInputLanding = document.getElementById("searchInputLanding");
const searchInputMobile  = document.getElementById("searchInputMobile");
const suggestionsList    = document.getElementById("suggestions");
const suggestionsLanding = document.getElementById("suggestionsLanding");
const mobileSuggestions  = document.getElementById("mobileSearchSuggestions");
const dashboard          = document.getElementById("dashboard");
const landing            = document.getElementById("landing");
const loader             = document.getElementById("loader");

const heroBg             = document.getElementById("heroBg");
const heroTitle          = document.getElementById("heroTitle");
const heroBadges         = document.getElementById("heroBadges");
const heroFinQuick       = document.getElementById("heroFinQuick");

const sidebarPoster      = document.getElementById("sidebarPoster");
const sidebarTitle       = document.getElementById("sidebarTitle");
const sidebarYear        = document.getElementById("sidebarYear");
const sidebarBadges      = document.getElementById("sidebarBadges");
const sidebarTagline     = document.getElementById("sidebarTagline");
const sidebarOverview    = document.getElementById("sidebarOverview");
const sidebarRating      = document.getElementById("sidebarRating");
const sidebarRuntime     = document.getElementById("sidebarRuntime");
const sidebarRuntimeLbl  = document.getElementById("sidebarRuntimeLbl");
const sidebarStatus      = document.getElementById("sidebarStatus");
const sidebarScoreWrap   = document.getElementById("sidebarScoreWrap");
const scoreRingFill      = document.getElementById("scoreRingFill");
const scoreCenter        = document.getElementById("scoreCenter");

const statRibbon         = document.getElementById("statRibbon");
const showStatBand       = document.getElementById("showStatBand");
const profitBarWrap      = document.getElementById("profitBarWrap");
const profitBarFill      = document.getElementById("profitBarFill");
const budgetLabel        = document.getElementById("budgetLabel");
const revenueLabel       = document.getElementById("revenueLabel");
const profitRatio        = document.getElementById("profitRatio");
const profitPills        = document.getElementById("profitPills");
const peopleGrid         = document.getElementById("peopleGrid");
const revPanel           = document.getElementById("revPanel");
const revPanelTitle      = document.getElementById("revPanelTitle");
const finPanel           = document.getElementById("finPanel");
const popPanel           = document.getElementById("popPanel");
const radarPanel         = document.getElementById("radarPanel");
const prodPanel          = document.getElementById("prodPanel");
const prodPanelTitle     = document.getElementById("prodPanelTitle");
const prodList           = document.getElementById("prodList");
const cumulativePanel    = document.getElementById("cumulativePanel");
const periodPanel        = document.getElementById("periodPanel");
const chartNote          = document.getElementById("chartNote");
const epsPanel           = document.getElementById("epsPanel");
const seasonsSection     = document.getElementById("seasonsSection");
const seasonsGrid        = document.getElementById("seasonsGrid");
const metaDuo            = document.getElementById("metaDuo");
const countriesList      = document.getElementById("countriesList");
const languagesList      = document.getElementById("languagesList");
const collectionInfo     = document.getElementById("collectionInfo");
const thirdMetaTitle     = document.getElementById("thirdMetaTitle");
const chartTabs          = document.getElementById("chartTabs");

let cumulativeChart = null;
let periodChart     = null;
let finChart        = null;
let popChart        = null;
let radarChart      = null;
let epsChart        = null;
let searchTimeout   = null;

/* ── HELPERS ─────────────────────────────────────────── */
function fmtMoney(v) {
  if (!v || v === 0) return "N/A";
  if (v >= 1e9) return `$${(v/1e9).toFixed(2)}B`;
  if (v >= 1e6) return `$${(v/1e6).toFixed(1)}M`;
  return `$${v.toLocaleString()}`;
}
function destroyChart(c) {
  if (c) { try { c.destroy(); } catch(e){} }
  return null;
}
function fmtRuntime(mins) {
  if (!mins) return "N/A";
  if (Array.isArray(mins)) mins = mins[0];
  if (!mins) return "N/A";
  return `${Math.floor(mins/60)}h ${mins%60}m`;
}

/* ── CHART DEFAULTS ──────────────────────────────────── */
const CHART_DEFAULTS = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: "index", intersect: false },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: "#111318",
      borderColor: "#272a38",
      borderWidth: 1,
      titleColor: "#c9a84c",
      bodyColor: "#e8e4dc",
      padding: 10,
      cornerRadius: 8,
    }
  },
  scales: {
    x: { grid:{display:false}, ticks:{color:"#3a3a4a",maxRotation:0}, border:{display:false} },
    y: { grid:{color:"#1a1c22"}, ticks:{color:"#3a3a4a"}, border:{display:false} }
  }
};

/* ─────────────────────────────────────────────────────
   MOBILE FIXED SEARCH BAR
───────────────────────────────────────────────────── */
// Wire up the mobile search bar (always visible, fixed below header)
setupSearch(searchInputMobile, mobileSuggestions, true);
attachKeyboardNav(searchInputMobile, mobileSuggestions);

// Close mobile suggestions when clicking outside
document.addEventListener("click", e => {
  if (!e.target.closest("#mobileSearchRow")) {
    mobileSuggestions.classList.add("hidden");
  }
});

/* ─────────────────────────────────────────────────────
   DESKTOP MODE TOGGLE
───────────────────────────────────────────────────── */
const MOVIE_HINTS = ["Inception","Avengers: Endgame","Parasite","The Dark Knight","Oppenheimer"];
const TV_HINTS    = ["Breaking Bad","Game of Thrones","Stranger Things","The Office","Succession"];

document.querySelectorAll("#modeToggle .mode-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    setMode(btn.dataset.mode);
    document.querySelectorAll("#modeToggle .mode-btn").forEach(b =>
      b.classList.toggle("active", b.dataset.mode === currentMode)
    );
  });
});

function setMode(mode) {
  currentMode = mode;
  const isTV = mode === "tv";
  const moviePh = "Search movies…";
  const tvPh    = "Search TV shows…";

  searchInput.placeholder       = isTV ? tvPh : moviePh;
  searchInputMobile.placeholder = isTV ? tvPh : moviePh;
  searchInputLanding.placeholder = isTV
    ? "Try 'Breaking Bad', 'Game of Thrones', 'Succession'…"
    : "Try 'Inception', 'Avengers', 'The Dark Knight'…";

  document.getElementById("landingIcon").textContent    = isTV ? "📺" : "🎬";
  document.getElementById("landingTitle").textContent   = isTV ? "Discover Deep TV Show Analytics" : "Discover Deep Movie Analytics";
  document.getElementById("landingSubtitle").textContent = isTV
    ? "Seasons, episodes, networks, cast insights & popularity — all in one cinematic dashboard."
    : "Financial performance, cast insights, popularity trends, and more — all in one cinematic dashboard.";

  const hints = isTV ? TV_HINTS : MOVIE_HINTS;
  document.getElementById("landingHints").innerHTML = hints
    .map(q => `<span class="hint-chip" data-query="${q}">${q}</span>`).join("");
  attachHintChips();

  // Clear all search fields & suggestions
  [suggestionsList, suggestionsLanding, mobileSuggestions].forEach(s => s.classList.add("hidden"));
  searchInput.value = "";
  searchInputLanding.value = "";
  searchInputMobile.value = "";
}

function attachHintChips() {
  document.querySelectorAll(".hint-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      searchInputLanding.value = chip.dataset.query;
      fetchSuggestions(chip.dataset.query, suggestionsLanding);
    });
  });
}
attachHintChips();

/* ─────────────────────────────────────────────────────
   SEARCH SETUP
───────────────────────────────────────────────────── */
function setupSearch(input, sugList, isMobile = false) {
  input.addEventListener("input", () => {
    clearTimeout(searchTimeout);
    const q = input.value.trim();
    if (!q) { sugList.classList.add("hidden"); return; }
    searchTimeout = setTimeout(() => fetchSuggestions(q, sugList, isMobile), 300);
  });
}

setupSearch(searchInput, suggestionsList);
setupSearch(searchInputLanding, suggestionsLanding);

document.addEventListener("click", e => {
  if (!e.target.closest(".search-wrap") && !e.target.closest(".landing-search-wrap")) {
    suggestionsList.classList.add("hidden");
    suggestionsLanding.classList.add("hidden");
  }
});

document.addEventListener("keydown", e => {
  if ((e.metaKey || e.ctrlKey) && e.key === "k") {
    e.preventDefault();
    if (window.innerWidth <= 768) {
      searchInputMobile.focus();
    } else if (dashboard.classList.contains("hidden")) {
      searchInputLanding.focus();
    } else {
      searchInput.focus();
    }
  }
  if (e.key === "Escape") {
    [suggestionsList, suggestionsLanding, mobileSuggestions].forEach(s => s.classList.add("hidden"));
  }
});

async function fetchSuggestions(query, sugList, isMobile = false) {
  try {
    const endpoint = currentMode === "tv" ? "search/tv" : "search/movie";
    const res  = await fetch(`${BASE}/${endpoint}?api_key=${API_KEY}&query=${encodeURIComponent(query)}`);
    const data = await res.json();
    const results = (data.results || []).slice(0, 8);

    if (!results.length) { sugList.classList.add("hidden"); return; }

    sugList.innerHTML = "";
    results.forEach(item => {
      const name = item.title || item.name || "Unknown";
      const date = item.release_date || item.first_air_date || "";
      const year = date ? date.slice(0, 4) : "N/A";
      const li   = document.createElement("li");
      li.textContent  = `${name} (${year})`;
      li.dataset.id   = item.id;
      li.addEventListener("click", () => {
        // Always update both desktop and mobile inputs with selection
        const label = `${name} (${year})`;
        searchInput.value       = label;
        searchInputMobile.value = label;
        sugList.classList.add("hidden");
        if (currentMode === "tv") loadShow(item.id);
        else loadMovie(item.id);
      });
      sugList.appendChild(li);
    });
    sugList.classList.remove("hidden");
  } catch (err) {
    console.error("Search error:", err);
  }
}

function attachKeyboardNav(input, sugList) {
  let activeIdx = -1;
  input.addEventListener("keydown", e => {
    const items = sugList.querySelectorAll("li");
    if (!items.length) return;
    if (e.key === "ArrowDown")  activeIdx = (activeIdx + 1) % items.length;
    else if (e.key === "ArrowUp") activeIdx = (activeIdx - 1 + items.length) % items.length;
    else if (e.key === "Enter" && activeIdx >= 0) { items[activeIdx].click(); activeIdx = -1; return; }
    else if (e.key === "Escape") { sugList.classList.add("hidden"); activeIdx = -1; return; }
    items.forEach((li, i) => li.classList.toggle("active", i === activeIdx));
  });
}

attachKeyboardNav(searchInput, suggestionsList);
attachKeyboardNav(searchInputLanding, suggestionsLanding);

/* ─────────────────────────────────────────────────────
   LOAD MOVIE
───────────────────────────────────────────────────── */
async function loadMovie(id) {
  dashboard.classList.add("hidden");
  landing.classList.add("hidden");
  loader.classList.remove("hidden");
  document.getElementById("loaderText").textContent = "Analyzing movie data…";
  document.getElementById("loaderSub").textContent  = "Fetching box office, cast & financials";

  try {
    const [details, credits] = await Promise.all([
      fetch(`${BASE}/movie/${id}?api_key=${API_KEY}`).then(r => r.json()),
      fetch(`${BASE}/movie/${id}/credits?api_key=${API_KEY}`).then(r => r.json()),
    ]);
    renderMovieDashboard(details, credits);
  } catch (err) { console.error(err); }
  finally { loader.classList.add("hidden"); }
}

/* ─────────────────────────────────────────────────────
   LOAD TV SHOW
───────────────────────────────────────────────────── */
async function loadShow(id) {
  dashboard.classList.add("hidden");
  landing.classList.add("hidden");
  loader.classList.remove("hidden");
  document.getElementById("loaderText").textContent = "Analyzing show data…";
  document.getElementById("loaderSub").textContent  = "Fetching seasons, cast & networks";

  try {
    const [details, credits] = await Promise.all([
      fetch(`${BASE}/tv/${id}?api_key=${API_KEY}`).then(r => r.json()),
      fetch(`${BASE}/tv/${id}/credits?api_key=${API_KEY}`).then(r => r.json()),
    ]);
    renderShowDashboard(details, credits);
  } catch (err) { console.error(err); }
  finally { loader.classList.add("hidden"); }
}

/* ─────────────────────────────────────────────────────
   SHARED SIDEBAR / HERO
───────────────────────────────────────────────────── */
function setupSidebarHero({ posterPath, backdropPath, title, year, tagline, overview, genres, rating, runtimeLabel, runtimeValue, status }) {
  if (backdropPath) heroBg.style.backgroundImage = `url('${IMG}/w1280${backdropPath}')`;
  heroTitle.textContent = title || "";
  heroBadges.innerHTML  = genres.slice(0,5).map(g => `<span class="badge">${g.name}</span>`).join("");

  sidebarPoster.src = posterPath ? `${IMG}/w500${posterPath}` : "";
  sidebarPoster.alt = title || "";

  sidebarTitle.textContent    = title    || "";
  sidebarYear.textContent     = year     || "";
  sidebarTagline.textContent  = tagline  || "";
  sidebarOverview.textContent = overview || "";
  sidebarBadges.innerHTML     = genres.slice(0,4).map(g => `<span class="badge">${g.name}</span>`).join("");
  sidebarRating.textContent   = rating ? rating.toFixed(1) : "N/A";
  sidebarRuntimeLbl.textContent = runtimeLabel;
  sidebarRuntime.textContent  = runtimeValue;
  sidebarStatus.textContent   = status  || "N/A";

  if (rating) {
    sidebarScoreWrap.style.display = "flex";
    scoreCenter.textContent = rating.toFixed(1);
    const circ = 163.4;
    setTimeout(() => {
      scoreRingFill.style.strokeDashoffset = circ - ((rating/10) * circ);
      scoreRingFill.style.stroke = rating >= 7 ? "#3d9b5c" : rating >= 5 ? "#c9a84c" : "#c04a4a";
    }, 200);
  } else {
    sidebarScoreWrap.style.display = "none";
  }
}

/* ─────────────────────────────────────────────────────
   RENDER MOVIE DASHBOARD
───────────────────────────────────────────────────── */
function renderMovieDashboard(d, credits) {
  const revenue  = d.revenue  || 0;
  const budget   = d.budget   || 0;
  const profit   = revenue - budget;
  const release  = d.release_date || "N/A";
  const genres   = d.genres   || [];
  const cast     = (credits.cast  || []).slice(0, 10);
  const crew     = credits.crew   || [];
  const director = crew.find(p => p.job === "Director") || null;
  const rating   = d.vote_average || 0;

  showStatBand.style.display   = "none";
  seasonsSection.style.display = "none";
  epsPanel.style.display       = "none";
  chartTabs.style.display      = "flex";

  setupSidebarHero({
    posterPath: d.poster_path, backdropPath: d.backdrop_path,
    title: d.title, year: release ? release.slice(0,4) : "",
    tagline: d.tagline, overview: d.overview, genres, rating,
    runtimeLabel: "Runtime", runtimeValue: fmtRuntime(d.runtime), status: d.status,
  });

  heroFinQuick.innerHTML = [
    { label:"Box Office", value: fmtMoney(revenue) },
    { label:"Budget",     value: fmtMoney(budget) },
    { label:"Rating",     value: rating ? rating.toFixed(1)+"/10" : "N/A" },
  ].filter(x => x.value !== "N/A").map(x => `
    <div class="fin-quick-item">
      <div class="fq-label">${x.label}</div>
      <div class="fq-val">${x.value}</div>
    </div>`).join("");

  const roiStr = budget > 0 && revenue > 0 ? `${((profit/budget)*100).toFixed(0)}% ROI` : null;
  statRibbon.innerHTML = [
    { label:"Rating",     value: rating ? rating.toFixed(1) : "N/A", sub:`${(d.vote_count||0).toLocaleString()} votes`, cls:"neutral" },
    { label:"Runtime",    value: fmtRuntime(d.runtime), sub:"", cls:"neutral" },
    { label:"Release",    value: release || "N/A", sub:"", cls:"neutral" },
    { label:"Budget",     value: fmtMoney(budget), sub:"Production cost", cls:"neutral" },
    { label:"Box Office", value: fmtMoney(revenue), sub:"Worldwide gross", cls:"" },
    { label:"Profit",     value: profit!==0&&(budget||revenue) ? fmtMoney(Math.abs(profit)) : "N/A", sub:roiStr||"", cls:profit<0?"loss":"" },
    { label:"Popularity", value: d.popularity ? d.popularity.toFixed(0) : "N/A", sub:"TMDB score", cls:"neutral" },
  ].map(s => `<div class="stat-ribbon-item">
    <div class="stat-rib-label">${s.label}</div>
    <div class="stat-rib-value">${s.value}</div>
    ${s.sub ? `<div class="stat-rib-sub ${s.cls}">${s.sub}</div>` : ""}
  </div>`).join("");

  if (budget > 0 && revenue > 0) {
    profitBarWrap.style.display = "block";
    budgetLabel.textContent  = `Budget: ${fmtMoney(budget)}`;
    revenueLabel.textContent = `Revenue: ${fmtMoney(revenue)}`;
    profitRatio.textContent  = `${(revenue/budget).toFixed(2)}× return`;
    profitBarFill.style.background = profit >= 0 ? "linear-gradient(90deg,#3d9b5c,#6ccc94)" : "linear-gradient(90deg,#c04a4a,#e87a7a)";
    setTimeout(() => { profitBarFill.style.width = `${Math.min((revenue/(budget*3))*100,100).toFixed(1)}%`; }, 150);
    profitPills.innerHTML = [
      { label:"Budget",   value:fmtMoney(budget) },
      { label:"Revenue",  value:fmtMoney(revenue) },
      { label:profit>=0?"Net Profit":"Net Loss", value:fmtMoney(Math.abs(profit)) },
      { label:"Multiple", value:budget>0?`${(revenue/budget).toFixed(2)}×`:"N/A" },
    ].map(p => `<div class="profit-pill">${p.label}: <strong>${p.value}</strong></div>`).join("");
  } else {
    profitBarWrap.style.display = "none";
  }

  renderTalent(director, cast.slice(0,9));
  renderProdPanel(d.production_companies || [], "🏢 PRODUCTION COMPANIES");
  renderMeta(d.production_countries || [], d.spoken_languages || [], d.belongs_to_collection, false, []);
  revPanelTitle.textContent = "📈 REVENUE TREND";
  renderRevenueCharts(revenue, release);
  renderFinChart(budget, revenue, profit);
  renderPopChart(rating, d.popularity, d.vote_count);
  renderRadarChart(genres);

  dashboard.classList.remove("hidden");
  window.scrollTo({ top:0, behavior:"smooth" });
}

/* ─────────────────────────────────────────────────────
   RENDER SHOW DASHBOARD
───────────────────────────────────────────────────── */
function renderShowDashboard(d, credits) {
  const genres   = d.genres       || [];
  const rating   = d.vote_average || 0;
  const firstAir = d.first_air_date || "N/A";
  const lastAir  = d.last_air_date  || "";
  const seasons  = (d.seasons||[]).filter(s => s.season_number > 0);
  const networks = d.networks     || [];
  const cast     = (credits.cast  || []).slice(0, 10);
  const creators = d.created_by   || [];

  profitBarWrap.style.display = "none";
  finPanel.style.display      = "none";
  revPanel.style.display      = "none";
  chartTabs.style.display     = "none";

  setupSidebarHero({
    posterPath: d.poster_path, backdropPath: d.backdrop_path,
    title: d.name, year: firstAir ? firstAir.slice(0,4) : "",
    tagline: d.tagline, overview: d.overview, genres, rating,
    runtimeLabel: "Ep. Length", runtimeValue: fmtRuntime(d.episode_run_time), status: d.status,
  });

  heroFinQuick.innerHTML = [
    { label:"Seasons",  value: seasons.length ? `${seasons.length}` : "N/A" },
    { label:"Episodes", value: d.number_of_episodes ? `${d.number_of_episodes}` : "N/A" },
    { label:"Rating",   value: rating ? rating.toFixed(1)+"/10" : "N/A" },
  ].filter(x => x.value!=="N/A").map(x => `
    <div class="fin-quick-item">
      <div class="fq-label">${x.label}</div>
      <div class="fq-val">${x.value}</div>
    </div>`).join("");

  const statusText = d.status || "N/A";
  statRibbon.innerHTML = [
    { label:"Rating",    value: rating ? rating.toFixed(1) : "N/A", sub:`${(d.vote_count||0).toLocaleString()} votes`, cls:"neutral" },
    { label:"Seasons",   value: d.number_of_seasons  || "N/A", sub:"", cls:"neutral" },
    { label:"Episodes",  value: d.number_of_episodes || "N/A", sub:"Total episodes", cls:"neutral" },
    { label:"First Air", value: firstAir!=="N/A" ? firstAir : "N/A", sub:"", cls:"neutral" },
    { label:"Last Air",  value: lastAir || "N/A", sub:"", cls:"neutral" },
    { label:"Status",    value: statusText, sub:"", cls:statusText==="Ended"||statusText==="Canceled"?"loss":"neutral" },
    { label:"Popularity",value: d.popularity ? d.popularity.toFixed(0) : "N/A", sub:"TMDB score", cls:"neutral" },
  ].map(s => `<div class="stat-ribbon-item">
    <div class="stat-rib-label">${s.label}</div>
    <div class="stat-rib-value">${s.value}</div>
    ${s.sub ? `<div class="stat-rib-sub ${s.cls}">${s.sub}</div>` : ""}
  </div>`).join("");

  showStatBand.style.display = "grid";
  showStatBand.innerHTML = [
    { lbl:"Type",     val: d.type || "N/A" },
    { lbl:"Networks", val: networks.map(n=>n.name).join(", ") || "N/A" },
    { lbl:"Country",  val: (d.origin_country||[]).join(", ") || "N/A" },
    { lbl:"Language", val: d.original_language ? d.original_language.toUpperCase() : "N/A" },
  ].map(i => `<div class="show-stat-card">
    <div class="lbl">${i.lbl}</div>
    <div class="val" style="font-size:${i.val.length>12?'0.85rem':'1.1rem'}">${i.val}</div>
  </div>`).join("");

  // Creators first in talent
  const lead = creators[0] ? { ...creators[0], job:"Creator" } : null;
  renderTalent(lead, cast.slice(0,9));

  // Networks panel
  if (networks.length) {
    prodPanel.style.display = "block";
    prodPanelTitle.textContent = "📡 NETWORKS";
    prodList.innerHTML = networks.map((n,i) => {
      const logo = n.logo_path
        ? `<img class="prod-logo" src="${IMG}/w92${n.logo_path}" alt="${n.name}" loading="lazy" />`
        : `<div class="prod-no-logo">📡</div>`;
      return `<div class="prod-item" style="animation-delay:${i*0.08}s">${logo}
        <div class="prod-info">
          <div class="prod-name">${n.name}</div>
          <div class="prod-country">${n.origin_country||""}</div>
        </div></div>`;
    }).join("");
  } else {
    prodPanel.style.display = "none";
  }

  // Seasons
  if (seasons.length) {
    seasonsSection.style.display = "block";
    seasonsGrid.innerHTML = seasons.map((s,i) => {
      const img = s.poster_path
        ? `<img src="${IMG}/w185${s.poster_path}" alt="${s.name}" loading="lazy" />`
        : `<div class="season-card-no-img">📺</div>`;
      const yr = s.air_date ? s.air_date.slice(0,4) : "";
      return `<div class="season-card" style="animation-delay:${i*0.04}s">
        ${img}
        <div class="season-card-body">
          <div class="season-card-name">${s.name}</div>
          <div class="season-card-eps">${s.episode_count} episodes${yr?" · "+yr:""}</div>
        </div></div>`;
    }).join("");
  } else {
    seasonsSection.style.display = "none";
  }

  renderMeta(d.production_countries||[], d.spoken_languages||[], null, true, networks);
  renderEpisodesChart(seasons);
  renderPopChart(rating, d.popularity, d.vote_count);
  renderRadarChart(genres);

  dashboard.classList.remove("hidden");
  window.scrollTo({ top:0, behavior:"smooth" });
}

/* ─────────────────────────────────────────────────────
   TALENT
───────────────────────────────────────────────────── */
function renderTalent(lead, cast) {
  const talent = [];
  if (lead) talent.push({ person:lead, role:lead.job||"Director", gold:true });
  cast.forEach((a,i) => talent.push({ person:a, role:a.character||a.job||"Actor", gold:i===0&&!lead }));

  peopleGrid.innerHTML = talent.map(({ person, role, gold }, i) => {
    const img = person.profile_path
      ? `<img src="${IMG}/w185${person.profile_path}" alt="${person.name}" loading="lazy" />`
      : `<div class="person-no-img">🎭</div>`;
    return `<div class="person-card" style="animation-delay:${i*0.05}s">
      ${img}
      <div class="person-name">${person.name}</div>
      <div class="person-role ${gold?'gold':''}">${role}</div>
    </div>`;
  }).join("");
}

/* ─────────────────────────────────────────────────────
   PROD PANEL
───────────────────────────────────────────────────── */
function renderProdPanel(companies, title) {
  if (companies.length) {
    prodPanel.style.display = "block";
    prodPanelTitle.textContent = title;
    prodList.innerHTML = companies.slice(0,6).map((c,i) => {
      const logo = c.logo_path
        ? `<img class="prod-logo" src="${IMG}/w92${c.logo_path}" alt="${c.name}" loading="lazy" />`
        : `<div class="prod-no-logo">🏢</div>`;
      return `<div class="prod-item" style="animation-delay:${i*0.08}s">${logo}
        <div class="prod-info">
          <div class="prod-name">${c.name}</div>
          <div class="prod-country">${c.origin_country||""}</div>
        </div></div>`;
    }).join("");
  } else {
    prodPanel.style.display = "none";
  }
}

/* ─────────────────────────────────────────────────────
   META SECTION
───────────────────────────────────────────────────── */
function renderMeta(countries, langs, collection, isTV, networks) {
  if (countries.length || langs.length || collection || isTV) {
    metaDuo.style.display = "grid";
    countriesList.innerHTML = countries.length
      ? countries.map(c => `<span class="meta-tag">🌐 ${c.name}</span>`).join("")
      : '<span style="color:var(--muted)">N/A</span>';
    languagesList.innerHTML = langs.length
      ? langs.map(l => `<span class="meta-tag">💬 ${l.english_name||l.name}</span>`).join("")
      : '<span style="color:var(--muted)">N/A</span>';
    if (isTV) {
      thirdMetaTitle.textContent = "📡 NETWORKS";
      collectionInfo.innerHTML = networks.length
        ? networks.map(n => `<span class="meta-tag">📡 ${n.name}</span>`).join("")
        : '<span style="color:var(--muted)">N/A</span>';
    } else {
      thirdMetaTitle.textContent = "🏆 COLLECTION";
      collectionInfo.innerHTML = collection
        ? `<span class="meta-tag">🎬 ${collection.name}</span>`
        : '<span style="color:var(--muted)">Not part of a collection</span>';
    }
  } else {
    metaDuo.style.display = "none";
  }
}

/* ─────────────────────────────────────────────────────
   EPISODES PER SEASON CHART
───────────────────────────────────────────────────── */
function renderEpisodesChart(seasons) {
  epsChart = destroyChart(epsChart);
  if (!seasons||!seasons.length) { epsPanel.style.display="none"; return; }
  epsPanel.style.display = "block";

  const ctx = document.getElementById("epsChart").getContext("2d");
  const grad = ctx.createLinearGradient(0,0,0,200);
  grad.addColorStop(0,"rgba(201,168,76,0.5)");
  grad.addColorStop(1,"rgba(201,168,76,0.05)");

  epsChart = new Chart(ctx, {
    type:"bar",
    data:{
      labels: seasons.map(s => s.name.replace("Season ","S")),
      datasets:[{ data:seasons.map(s=>s.episode_count), backgroundColor:grad, borderColor:"#c9a84c", borderWidth:1.5, borderRadius:8, borderSkipped:false }]
    },
    options:{
      ...CHART_DEFAULTS,
      plugins:{...CHART_DEFAULTS.plugins, tooltip:{...CHART_DEFAULTS.plugins.tooltip, callbacks:{label:ctx=>` ${ctx.parsed.y} episodes`}}},
      scales:{
        x:{grid:{display:false},ticks:{color:"#6a6a8a",font:{size:11}},border:{display:false}},
        y:{grid:{color:"#1a1c22"},ticks:{color:"#3a3a4a",stepSize:5},border:{display:false}}
      }
    }
  });
}

/* ─────────────────────────────────────────────────────
   REVENUE TREND CHARTS
───────────────────────────────────────────────────── */
function renderRevenueCharts(revenue, release) {
  cumulativeChart = destroyChart(cumulativeChart);
  periodChart     = destroyChart(periodChart);

  if (!revenue || !release || release==="N/A") { revPanel.style.display="none"; return; }
  const releaseDate = new Date(release);
  const today = new Date();
  if (releaseDate > today) { revPanel.style.display="none"; return; }
  const totalDays = Math.floor((today - releaseDate)/86400000);
  if (totalDays < 1) { revPanel.style.display="none"; return; }

  const theatricalDays = Math.min(totalDays, 120);
  const halfLife = 18;
  const numPoints = Math.min(totalDays, 200);

  const datePoints = Array.from({length:numPoints},(_,i) =>
    new Date(releaseDate.getTime()+(i/(numPoints-1))*totalDays*86400000));
  const daysArr = datePoints.map(d => (d-releaseDate)/86400000);

  const cumTh = daysArr.map(d => 1-Math.exp(-Math.min(d,theatricalDays)/halfLife));
  const maxTh = cumTh[cumTh.length-1];
  const normTh = cumTh.map(v => v/maxTh);
  const tail   = daysArr.map(d => d>theatricalDays ? 0.12*(1-Math.exp(-(d-theatricalDays)/60)) : 0);
  let raw = normTh.map((v,i) => v+tail[i]);
  const maxRaw = raw[raw.length-1];
  raw = raw.map(v => v/maxRaw);

  const cumVals  = raw.map(v => (v*revenue)/1e6);
  const perVals  = cumVals.map((v,i) => Math.max(0, v-(i>0?cumVals[i-1]:0)));
  const labels   = datePoints.map(d => d.toISOString().slice(0,10));

  const timeUnit = totalDays>365?"year":totalDays>90?"month":"week";
  const sharedOpts = {
    ...CHART_DEFAULTS,
    plugins:{...CHART_DEFAULTS.plugins, tooltip:{...CHART_DEFAULTS.plugins.tooltip, callbacks:{label:ctx=>` $${ctx.parsed.y.toFixed(2)}M`}}},
    scales:{
      x:{type:"time",time:{unit:timeUnit,displayFormats:{week:"MMM d",month:"MMM yyyy",year:"yyyy"}},grid:{display:false},ticks:{color:"#3a3a4a",maxRotation:0,maxTicksLimit:7},border:{display:false}},
      y:{grid:{color:"#1a1c22"},ticks:{color:"#3a3a4a",callback:v=>`$${v.toFixed(0)}M`},border:{display:false}}
    }
  };

  const cumCtx = document.getElementById("cumulativeChart").getContext("2d");
  const grad = cumCtx.createLinearGradient(0,0,0,220);
  grad.addColorStop(0,"rgba(201,168,76,0.22)"); grad.addColorStop(1,"rgba(201,168,76,0.01)");

  cumulativeChart = new Chart(cumCtx,{type:"line",data:{labels,datasets:[{data:cumVals,borderColor:"#c9a84c",borderWidth:2.5,pointRadius:0,pointHoverRadius:5,pointHoverBackgroundColor:"#e8d5a3",fill:true,backgroundColor:grad,tension:0.4}]},options:sharedOpts});

  const perCtx = document.getElementById("periodChart").getContext("2d");
  periodChart = new Chart(perCtx,{type:"bar",data:{labels,datasets:[{data:perVals,backgroundColor:"rgba(201,168,76,0.6)",borderColor:"#c9a84c",borderWidth:0.5,borderRadius:3}]},options:sharedOpts});

  const relStr   = releaseDate.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
  const todayStr = today.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
  chartNote.textContent = `📅 ${relStr} → ${todayStr}  ·  ${totalDays} days since release  ·  Modelled distribution`;

  revPanel.style.display = "block";
  cumulativePanel.classList.remove("hidden");
  periodPanel.classList.add("hidden");
}

/* ─────────────────────────────────────────────────────
   FINANCIAL BREAKDOWN
───────────────────────────────────────────────────── */
function renderFinChart(budget, revenue, profit) {
  finChart = destroyChart(finChart);
  if (!budget||!revenue) { finPanel.style.display="none"; return; }
  finPanel.style.display="block";

  const ctx = document.getElementById("finChart").getContext("2d");
  finChart = new Chart(ctx,{
    type:"bar",
    data:{
      labels:["Budget","Box Office",profit>=0?"Profit":"Loss"],
      datasets:[{
        data:[budget/1e6,revenue/1e6,Math.abs(profit)/1e6],
        backgroundColor:["rgba(91,143,201,0.7)","rgba(201,168,76,0.7)",profit>=0?"rgba(61,155,92,0.7)":"rgba(192,74,74,0.7)"],
        borderColor:["#5b8fc9","#c9a84c",profit>=0?"#3d9b5c":"#c04a4a"],
        borderWidth:1.5,borderRadius:8,borderSkipped:false,
      }]
    },
    options:{
      ...CHART_DEFAULTS,
      plugins:{...CHART_DEFAULTS.plugins, tooltip:{...CHART_DEFAULTS.plugins.tooltip, callbacks:{label:ctx=>` $${ctx.parsed.y.toFixed(1)}M`}}},
      scales:{
        x:{grid:{display:false},ticks:{color:"#6a6a8a",font:{size:12}},border:{display:false}},
        y:{grid:{color:"#1a1c22"},ticks:{color:"#3a3a4a",callback:v=>`$${v.toFixed(0)}M`},border:{display:false}}
      }
    }
  });
}

/* ─────────────────────────────────────────────────────
   POPULARITY CHART
───────────────────────────────────────────────────── */
function renderPopChart(rating, popularity, voteCount) {
  popChart = destroyChart(popChart);
  if (!rating&&!popularity) { popPanel.style.display="none"; return; }
  popPanel.style.display="block";

  const ctx = document.getElementById("popChart").getContext("2d");
  popChart = new Chart(ctx,{
    type:"bar",
    data:{
      labels:["Audience Rating","TMDB Popularity","Vote Engagement"],
      datasets:[{
        data:[((rating||0)/10)*100, Math.min((popularity||0)/500*100,100), Math.min((voteCount||0)/50000*100,100)],
        backgroundColor:["rgba(201,168,76,0.7)","rgba(122,91,156,0.7)","rgba(91,143,201,0.7)"],
        borderColor:["#c9a84c","#7a5b9c","#5b8fc9"],
        borderWidth:1.5,borderRadius:8,borderSkipped:false,
      }]
    },
    options:{
      ...CHART_DEFAULTS,
      indexAxis:"y",
      plugins:{...CHART_DEFAULTS.plugins, tooltip:{...CHART_DEFAULTS.plugins.tooltip,
        callbacks:{label:ctx=>{
          const raw=[rating?`${rating.toFixed(1)}/10`:"N/A",popularity?popularity.toFixed(0):"N/A",voteCount?voteCount.toLocaleString():"N/A"];
          return ` ${raw[ctx.dataIndex]}`;
        }}
      }},
      scales:{
        x:{grid:{color:"#1a1c22"},ticks:{color:"#3a3a4a",callback:v=>`${v}%`},border:{display:false},max:100},
        y:{grid:{display:false},ticks:{color:"#6a6a8a",font:{size:11}},border:{display:false}}
      }
    }
  });
}

/* ─────────────────────────────────────────────────────
   GENRE RADAR
───────────────────────────────────────────────────── */
const GENRE_SCORES = {
  "Action":          {action:95,adventure:60,drama:30,thriller:65,comedy:15,romance:10},
  "Adventure":       {action:55,adventure:95,drama:35,thriller:40,comedy:20,romance:20},
  "Drama":           {action:15,adventure:20,drama:95,thriller:40,comedy:15,romance:50},
  "Thriller":        {action:50,adventure:30,drama:60,thriller:95,comedy:5,romance:15},
  "Comedy":          {action:10,adventure:25,drama:30,thriller:10,comedy:95,romance:40},
  "Romance":         {action:5,adventure:20,drama:65,thriller:15,comedy:35,romance:95},
  "Horror":          {action:30,adventure:10,drama:25,thriller:80,comedy:5,romance:5},
  "Science Fiction": {action:60,adventure:70,drama:30,thriller:50,comedy:10,romance:15},
  "Sci-Fi & Fantasy":{action:55,adventure:75,drama:30,thriller:45,comedy:10,romance:20},
  "Animation":       {action:30,adventure:75,drama:20,thriller:5,comedy:70,romance:20},
  "Crime":           {action:40,adventure:20,drama:70,thriller:80,comedy:10,romance:15},
  "Fantasy":         {action:45,adventure:80,drama:35,thriller:20,comedy:25,romance:30},
  "Mystery":         {action:15,adventure:25,drama:55,thriller:85,comedy:5,romance:20},
  "Family":          {action:20,adventure:60,drama:25,thriller:5,comedy:65,romance:15},
  "History":         {action:25,adventure:30,drama:85,thriller:30,comedy:10,romance:30},
  "War":             {action:70,adventure:40,drama:80,thriller:55,comedy:5,romance:20},
  "Music":           {action:5,adventure:15,drama:70,thriller:10,comedy:35,romance:55},
  "Reality":         {action:10,adventure:20,drama:40,thriller:15,comedy:50,romance:35},
  "Documentary":     {action:10,adventure:30,drama:70,thriller:30,comedy:10,romance:10},
  "Western":         {action:75,adventure:65,drama:60,thriller:50,comedy:10,romance:20},
};

function renderRadarChart(genres) {
  radarChart = destroyChart(radarChart);
  if (!genres||!genres.length) { radarPanel.style.display="none"; return; }
  radarPanel.style.display="block";

  const dims = ["action","adventure","drama","thriller","comedy","romance"];
  const scores = dims.map(dim => {
    let total=0,count=0;
    genres.forEach(g => { const gs=GENRE_SCORES[g.name]; if(gs){total+=gs[dim]||0;count++;} });
    return count>0 ? total/count : 20;
  });

  const ctx = document.getElementById("radarChart").getContext("2d");
  radarChart = new Chart(ctx,{
    type:"radar",
    data:{
      labels:["Action","Adventure","Drama","Thriller","Comedy","Romance"],
      datasets:[{data:scores,backgroundColor:"rgba(201,168,76,0.15)",borderColor:"#c9a84c",borderWidth:2,pointBackgroundColor:"#c9a84c",pointBorderColor:"#13151c",pointRadius:4,pointHoverRadius:6}]
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      plugins:{legend:{display:false},tooltip:{backgroundColor:"#111318",borderColor:"#272a38",borderWidth:1,titleColor:"#c9a84c",bodyColor:"#e8e4dc",padding:10,cornerRadius:8,callbacks:{label:ctx=>` ${ctx.parsed.r.toFixed(0)}`}}},
      scales:{r:{min:0,max:100,backgroundColor:"transparent",grid:{color:"#1e2030"},angleLines:{color:"#1e2030"},pointLabels:{color:"#5a5a7a",font:{size:11,family:"'DM Sans'"}},ticks:{display:false}}}
    }
  });
}

/* ─────────────────────────────────────────────────────
   TAB SWITCHING
───────────────────────────────────────────────────── */
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    if (btn.dataset.tab === "cumulative") {
      cumulativePanel.classList.remove("hidden");
      periodPanel.classList.add("hidden");
    } else {
      periodPanel.classList.remove("hidden");
      cumulativePanel.classList.add("hidden");
    }
  });
});