/* ── CONFIG ──────────────────────────────────────────── */
const API_KEY  = "6f3bbb8c4059102285b0a027b5a0092c";
const BASE     = "https://api.themoviedb.org/3";
const IMG      = "https://image.tmdb.org/t/p";
const RAWG_KEY = "3fe2c5941b2248afbafc08664bc2d85e";
const RAWG     = "https://api.rawg.io/api";

/* ── STATE ───────────────────────────────────────────── */
let currentMode = "movie";

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
const awardsSection      = document.getElementById("awardsSection");
const awardsGrid         = document.getElementById("awardsGrid");
const awardsSummaryBar   = document.getElementById("awardsSummaryBar");
const screenshotsSection = document.getElementById("screenshotsSection");
const screenshotsGrid    = document.getElementById("screenshotsGrid");
const gameStatsPanel     = document.getElementById("gameStatsPanel");
const gameStatsGrid      = document.getElementById("gameStatsGrid");
const gameRatingsPanel   = document.getElementById("gameRatingsPanel");
const platformsPanel     = document.getElementById("platformsPanel");

let cumulativeChart  = null;
let periodChart      = null;
let finChart         = null;
let popChart         = null;
let radarChart       = null;
let epsChart         = null;
let gameRatingsChart = null;
let searchTimeout    = null;

/* ── HELPERS ─────────────────────────────────────────── */
function fmtMoney(v) {
  if (!v || v === 0) return "N/A";
  if (v >= 1e9) return `$${(v/1e9).toFixed(2)}B`;
  if (v >= 1e6) return `$${(v/1e6).toFixed(1)}M`;
  return `$${v.toLocaleString()}`;
}
function destroyChart(c) { if (c) { try { c.destroy(); } catch(e){} } return null; }
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
      backgroundColor: "#111318", borderColor: "#272a38", borderWidth: 1,
      titleColor: "#c9a84c", bodyColor: "#e8e4dc", padding: 10, cornerRadius: 8,
    }
  },
  scales: {
    x: { grid:{display:false}, ticks:{color:"#3a3a4a",maxRotation:0}, border:{display:false} },
    y: { grid:{color:"#1a1c22"}, ticks:{color:"#3a3a4a"}, border:{display:false} }
  }
};

/* ═══════════════════════════════════════════════════════
   🏆 MOVIE / TV AWARDS
═══════════════════════════════════════════════════════ */
const OMDB_KEY = "trilogy";

function parseOmdbAwards(str) {
  if (!str || str === "N/A") return { wins:0, noms:0, oscarsWon:0, oscarNoms:0, raw:"" };
  let oscarsWon=0, oscarNoms=0, wins=0, noms=0;
  const wonOscar=str.match(/Won (\d+) Oscar/i); if(wonOscar) oscarsWon=parseInt(wonOscar[1]);
  const nomOscar=str.match(/Nominated for (\d+) Oscar/i); if(nomOscar) oscarNoms=parseInt(nomOscar[1]);
  const winsMatch=str.match(/(\d+)\s+wins?/i); if(winsMatch) wins=parseInt(winsMatch[1]);
  if(oscarsWon>0&&wins===0) wins=oscarsWon;
  const nomsMatch=str.match(/(\d+)\s+nominations?/i); if(nomsMatch) noms=parseInt(nomsMatch[1]);
  if(oscarNoms>0&&noms===0) noms=oscarNoms;
  return { wins, noms, oscarsWon, oscarNoms, raw:str };
}

function buildAwardCards(parsed) {
  const cards=[];
  if(parsed.oscarsWon>0) cards.push({ show:"Academy Awards (Oscars)", category:`Won ${parsed.oscarsWon} Oscar${parsed.oscarsWon>1?"s":""}`, result:"won", icon:"🏆", year:"" });
  else if(parsed.oscarNoms>0) cards.push({ show:"Academy Awards (Oscars)", category:`Nominated for ${parsed.oscarNoms} Oscar${parsed.oscarNoms>1?"s":""}`, result:"nominated", icon:"🎖️", year:"" });
  const otherWins=parsed.wins-parsed.oscarsWon;
  const otherNoms=parsed.noms-parsed.oscarNoms-(parsed.oscarsWon>0?parsed.oscarsWon:0);
  if(otherWins>0) cards.push({ show:"Film Festivals & Guild Awards", category:`${otherWins} win${otherWins!==1?"s":""} across other ceremonies`, result:"won", icon:"🏆", year:"" });
  if(otherNoms>0) cards.push({ show:"Film Festivals & Guild Awards", category:`${otherNoms} nomination${otherNoms!==1?"s":""} across other ceremonies`, result:"nominated", icon:"🎖️", year:"" });
  if(parsed.wins>0||parsed.noms>0) cards.push({ show:"Complete Award Record", category:parsed.raw, result:parsed.wins>0?"won":"nominated", icon:"📋", year:"" });
  return cards;
}

const AWARDS_DB = {
  "tt6751668":[{show:"Academy Awards",year:2020,category:"Best Picture",result:"won",icon:"🏆"},{show:"Academy Awards",year:2020,category:"Best Director – Bong Joon-ho",result:"won",icon:"🏆"},{show:"Academy Awards",year:2020,category:"Best International Feature Film",result:"won",icon:"🏆"},{show:"Academy Awards",year:2020,category:"Best Original Screenplay",result:"won",icon:"🏆"},{show:"Cannes Film Festival",year:2019,category:"Palme d'Or",result:"won",icon:"🏆"},{show:"BAFTA Awards",year:2020,category:"Best Film Not in English Language",result:"won",icon:"🏆"},{show:"Golden Globe Awards",year:2020,category:"Best Foreign Language Film",result:"won",icon:"🏆"}],
  "tt0468569":[{show:"Academy Awards",year:2009,category:"Best Supporting Actor – Heath Ledger",result:"won",icon:"🏆"},{show:"Academy Awards",year:2009,category:"Best Film Editing",result:"won",icon:"🏆"},{show:"Academy Awards",year:2009,category:"Best Picture",result:"nominated",icon:"🎖️"},{show:"BAFTA Awards",year:2009,category:"Best Supporting Actor – Heath Ledger",result:"won",icon:"🏆"},{show:"Saturn Awards",year:2009,category:"Best Science Fiction Film",result:"won",icon:"🏆"}],
  "tt1375666":[{show:"Academy Awards",year:2011,category:"Best Cinematography",result:"won",icon:"🏆"},{show:"Academy Awards",year:2011,category:"Best Visual Effects",result:"won",icon:"🏆"},{show:"Academy Awards",year:2011,category:"Best Sound Mixing",result:"won",icon:"🏆"},{show:"Academy Awards",year:2011,category:"Best Sound Editing",result:"won",icon:"🏆"},{show:"Academy Awards",year:2011,category:"Best Picture",result:"nominated",icon:"🎖️"},{show:"BAFTA Awards",year:2011,category:"Best Production Design",result:"won",icon:"🏆"}],
  "tt4154796":[{show:"Academy Awards",year:2020,category:"Best Visual Effects",result:"nominated",icon:"🎖️"},{show:"MTV Movie Awards",year:2019,category:"Best Movie",result:"won",icon:"🏆"},{show:"People's Choice Awards",year:2019,category:"Movie of the Year",result:"won",icon:"🏆"},{show:"Saturn Awards",year:2020,category:"Best Science Fiction Film",result:"won",icon:"🏆"}],
  "tt15398776":[{show:"Academy Awards",year:2024,category:"Best Picture",result:"won",icon:"🏆"},{show:"Academy Awards",year:2024,category:"Best Director – Christopher Nolan",result:"won",icon:"🏆"},{show:"Academy Awards",year:2024,category:"Best Actor – Cillian Murphy",result:"won",icon:"🏆"},{show:"Academy Awards",year:2024,category:"Best Supporting Actor – Robert Downey Jr.",result:"won",icon:"🏆"},{show:"Academy Awards",year:2024,category:"Best Cinematography",result:"won",icon:"🏆"},{show:"Academy Awards",year:2024,category:"Best Film Editing",result:"won",icon:"🏆"},{show:"Academy Awards",year:2024,category:"Best Original Score",result:"won",icon:"🏆"},{show:"BAFTA Awards",year:2024,category:"Best Film",result:"won",icon:"🏆"},{show:"Golden Globe Awards",year:2024,category:"Best Drama Film",result:"won",icon:"🏆"},{show:"Golden Globe Awards",year:2024,category:"Best Director",result:"won",icon:"🏆"}],
  "tt0903747":[{show:"Emmy Awards",year:2014,category:"Outstanding Drama Series",result:"won",icon:"🏆"},{show:"Emmy Awards",year:2014,category:"Outstanding Lead Actor – Bryan Cranston",result:"won",icon:"🏆"},{show:"Emmy Awards",year:2013,category:"Outstanding Drama Series",result:"won",icon:"🏆"},{show:"Golden Globe Awards",year:2014,category:"Best Drama Series",result:"won",icon:"🏆"},{show:"SAG Awards",year:2014,category:"Outstanding Drama Ensemble",result:"won",icon:"🏆"}],
  "tt0944947":[{show:"Emmy Awards",year:2019,category:"Outstanding Drama Series",result:"won",icon:"🏆"},{show:"Emmy Awards",year:2018,category:"Outstanding Drama Series",result:"won",icon:"🏆"},{show:"Emmy Awards",year:2016,category:"Outstanding Drama Series",result:"won",icon:"🏆"},{show:"Emmy Awards",year:2015,category:"Outstanding Drama Series",result:"won",icon:"🏆"},{show:"Emmy Awards",year:2016,category:"Outstanding Supporting Actor – Peter Dinklage",result:"won",icon:"🏆"}],
  "tt7660850":[{show:"Emmy Awards",year:2022,category:"Outstanding Drama Series",result:"won",icon:"🏆"},{show:"Emmy Awards",year:2020,category:"Outstanding Drama Series",result:"won",icon:"🏆"},{show:"Emmy Awards",year:2020,category:"Outstanding Lead Actor – Jeremy Strong",result:"won",icon:"🏆"},{show:"Golden Globe Awards",year:2023,category:"Best Drama Series",result:"won",icon:"🏆"},{show:"SAG Awards",year:2023,category:"Outstanding Drama Ensemble",result:"won",icon:"🏆"}],
};

/* ═══════════════════════════════════════════════════════
   🎮 GAME AWARDS DATABASE  (keyed by RAWG slug)
═══════════════════════════════════════════════════════ */
const GAME_AWARDS_DB = {
  /* ── Astro Bot ── */
  "astro-bot": [
    { show:"The Game Awards",    year:2024, category:"Game of the Year",           result:"won",       icon:"🏆" },
    { show:"The Game Awards",    year:2024, category:"Best Game Direction",         result:"won",       icon:"🏆" },
    { show:"The Game Awards",    year:2024, category:"Best Family Game",            result:"won",       icon:"🏆" },
    { show:"The Game Awards",    year:2024, category:"Best Action/Adventure Game",  result:"won",       icon:"🏆" },
    { show:"The Game Awards",    year:2024, category:"Innovation in Accessibility", result:"nominated", icon:"🎖️" },
    { show:"BAFTA Games Awards", year:2025, category:"Best Game",                   result:"won",       icon:"🏆" },
    { show:"BAFTA Games Awards", year:2025, category:"Best Family",                 result:"won",       icon:"🏆" },
    { show:"BAFTA Games Awards", year:2025, category:"Best Artistic Achievement",   result:"nominated", icon:"🎖️" },
    { show:"Golden Joystick",    year:2024, category:"Ultimate Game of the Year",   result:"won",       icon:"🏆" },
    { show:"Golden Joystick",    year:2024, category:"Best Visual Design",          result:"won",       icon:"🏆" },
    { show:"Golden Joystick",    year:2024, category:"Best Family Game",            result:"won",       icon:"🏆" },
    { show:"DICE Awards",        year:2025, category:"Game of the Year",            result:"nominated", icon:"🎖️" },
    { show:"DICE Awards",        year:2025, category:"Family Game of the Year",     result:"won",       icon:"🏆" },
    { show:"IGN Best of 2024",   year:2024, category:"Game of the Year",            result:"won",       icon:"🏆" },
    { show:"IGN Best of 2024",   year:2024, category:"Best Platformer",             result:"won",       icon:"🏆" },
  ],
  /* ── Elden Ring ── */
  "elden-ring": [
    { show:"The Game Awards",    year:2022, category:"Game of the Year",                         result:"won",       icon:"🏆" },
    { show:"The Game Awards",    year:2022, category:"Best Game Direction",                      result:"won",       icon:"🏆" },
    { show:"The Game Awards",    year:2022, category:"Best RPG",                                 result:"won",       icon:"🏆" },
    { show:"The Game Awards",    year:2022, category:"Best Art Direction",                       result:"nominated", icon:"🎖️" },
    { show:"BAFTA Games Awards", year:2023, category:"Best Game",                                result:"won",       icon:"🏆" },
    { show:"BAFTA Games Awards", year:2023, category:"Best Artistic Achievement",                result:"nominated", icon:"🎖️" },
    { show:"Golden Joystick",    year:2022, category:"Game of the Year",                         result:"won",       icon:"🏆" },
    { show:"Golden Joystick",    year:2022, category:"Best Visual Design",                       result:"won",       icon:"🏆" },
    { show:"DICE Awards",        year:2023, category:"Game of the Year",                         result:"nominated", icon:"🎖️" },
    { show:"DICE Awards",        year:2023, category:"Role-Playing Game of the Year",            result:"won",       icon:"🏆" },
    { show:"IGN Best of 2022",   year:2022, category:"Game of the Year",                         result:"won",       icon:"🏆" },
  ],
  /* ── Elden Ring: Shadow of the Erdtree ── */
  "elden-ring-shadow-of-the-erdtree": [
    { show:"The Game Awards",    year:2024, category:"Best RPG",                                 result:"won",       icon:"🏆" },
    { show:"Golden Joystick",    year:2024, category:"Best Game Expansion",                      result:"won",       icon:"🏆" },
  ],
  /* ── Red Dead Redemption 2 ── */
  "red-dead-redemption-2": [
    { show:"The Game Awards",    year:2018, category:"Best Narrative",                           result:"won",       icon:"🏆" },
    { show:"The Game Awards",    year:2018, category:"Best Score/Music",                         result:"won",       icon:"🏆" },
    { show:"The Game Awards",    year:2018, category:"Best Performance – Roger Clark",           result:"won",       icon:"🏆" },
    { show:"The Game Awards",    year:2018, category:"Game of the Year",                         result:"nominated", icon:"🎖️" },
    { show:"BAFTA Games Awards", year:2019, category:"Best Game",                                result:"nominated", icon:"🎖️" },
    { show:"BAFTA Games Awards", year:2019, category:"Best Narrative",                           result:"won",       icon:"🏆" },
    { show:"Golden Joystick",    year:2018, category:"Best Storytelling",                        result:"won",       icon:"🏆" },
    { show:"DICE Awards",        year:2019, category:"Outstanding Achievement in Story",         result:"won",       icon:"🏆" },
  ],
  /* ── The Witcher 3 ── */
  "the-witcher-3-wild-hunt": [
    { show:"The Game Awards",    year:2015, category:"Game of the Year",                         result:"won",       icon:"🏆" },
    { show:"The Game Awards",    year:2015, category:"Best RPG",                                 result:"won",       icon:"🏆" },
    { show:"The Game Awards",    year:2015, category:"Best Narrative",                           result:"won",       icon:"🏆" },
    { show:"Golden Joystick",    year:2015, category:"Ultimate Game of the Year",                result:"won",       icon:"🏆" },
    { show:"DICE Awards",        year:2016, category:"Game of the Year",                         result:"won",       icon:"🏆" },
    { show:"DICE Awards",        year:2016, category:"RPG of the Year",                          result:"won",       icon:"🏆" },
    { show:"GDC Awards",         year:2016, category:"Game of the Year",                         result:"won",       icon:"🏆" },
  ],
  /* ── God of War (2018) ── */
  "god-of-war": [
    { show:"The Game Awards",    year:2018, category:"Game of the Year",                         result:"won",       icon:"🏆" },
    { show:"The Game Awards",    year:2018, category:"Best Game Direction",                      result:"won",       icon:"🏆" },
    { show:"The Game Awards",    year:2018, category:"Best Audio Design",                        result:"won",       icon:"🏆" },
    { show:"The Game Awards",    year:2018, category:"Best Action/Adventure Game",               result:"won",       icon:"🏆" },
    { show:"BAFTA Games Awards", year:2019, category:"Best Game",                                result:"won",       icon:"🏆" },
    { show:"BAFTA Games Awards", year:2019, category:"Best Narrative",                           result:"won",       icon:"🏆" },
    { show:"Golden Joystick",    year:2018, category:"Game of the Year",                         result:"won",       icon:"🏆" },
    { show:"DICE Awards",        year:2019, category:"Game of the Year",                         result:"won",       icon:"🏆" },
  ],
  /* ── God of War Ragnarök ── */
  "god-of-war-ragnarok": [
    { show:"The Game Awards",    year:2022, category:"Game of the Year",                         result:"nominated", icon:"🎖️" },
    { show:"The Game Awards",    year:2022, category:"Best Narrative",                           result:"won",       icon:"🏆" },
    { show:"The Game Awards",    year:2022, category:"Best Performance – Christopher Judge",     result:"won",       icon:"🏆" },
    { show:"The Game Awards",    year:2022, category:"Best Action/Adventure",                    result:"won",       icon:"🏆" },
    { show:"BAFTA Games Awards", year:2023, category:"Best Game",                                result:"won",       icon:"🏆" },
    { show:"BAFTA Games Awards", year:2023, category:"Best Narrative",                           result:"won",       icon:"🏆" },
    { show:"Golden Joystick",    year:2022, category:"Best Storytelling",                        result:"won",       icon:"🏆" },
    { show:"DICE Awards",        year:2023, category:"Outstanding Achievement in Story",         result:"won",       icon:"🏆" },
  ],
  /* ── The Last of Us ── */
  "the-last-of-us": [
    { show:"The Game Awards",    year:2013, category:"Game of the Year",                         result:"won",       icon:"🏆" },
    { show:"Golden Joystick",    year:2013, category:"Game of the Year",                         result:"won",       icon:"🏆" },
    { show:"BAFTA Games Awards", year:2014, category:"Best Game",                                result:"won",       icon:"🏆" },
    { show:"DICE Awards",        year:2014, category:"Game of the Year",                         result:"won",       icon:"🏆" },
  ],
  /* ── The Last of Us Part II ── */
  "the-last-of-us-part-ii": [
    { show:"The Game Awards",    year:2020, category:"Game of the Year",                         result:"won",       icon:"🏆" },
    { show:"The Game Awards",    year:2020, category:"Best Game Direction",                      result:"won",       icon:"🏆" },
    { show:"The Game Awards",    year:2020, category:"Best Narrative",                           result:"won",       icon:"🏆" },
    { show:"The Game Awards",    year:2020, category:"Best Performance – Laura Bailey",          result:"won",       icon:"🏆" },
    { show:"The Game Awards",    year:2020, category:"Best Audio Design",                        result:"won",       icon:"🏆" },
    { show:"The Game Awards",    year:2020, category:"Best Action/Adventure",                    result:"won",       icon:"🏆" },
    { show:"BAFTA Games Awards", year:2021, category:"Best Game",                                result:"won",       icon:"🏆" },
    { show:"Golden Joystick",    year:2020, category:"Ultimate Game of the Year",                result:"won",       icon:"🏆" },
    { show:"DICE Awards",        year:2021, category:"Game of the Year",                         result:"won",       icon:"🏆" },
  ],
  /* ── Cyberpunk 2077 ── */
  "cyberpunk-2077": [
    { show:"Golden Joystick",    year:2020, category:"Most Wanted",                              result:"won",       icon:"🏆" },
    { show:"The Game Awards",    year:2020, category:"Most Anticipated Game",                    result:"won",       icon:"🏆" },
    { show:"The Game Awards",    year:2023, category:"Best RPG (Phantom Liberty)",               result:"nominated", icon:"🎖️" },
    { show:"BAFTA Games Awards", year:2021, category:"Best Narrative",                           result:"nominated", icon:"🎖️" },
  ],
  /* ── Hades ── */
  "hades": [
    { show:"The Game Awards",    year:2020, category:"Best Independent Game",                    result:"won",       icon:"🏆" },
    { show:"The Game Awards",    year:2020, category:"Best Action Game",                         result:"won",       icon:"🏆" },
    { show:"The Game Awards",    year:2020, category:"Game of the Year",                         result:"nominated", icon:"🎖️" },
    { show:"BAFTA Games Awards", year:2021, category:"Best Game",                                result:"nominated", icon:"🎖️" },
    { show:"Golden Joystick",    year:2020, category:"Best Indie Game",                          result:"won",       icon:"🏆" },
    { show:"DICE Awards",        year:2021, category:"Outstanding Achievement in Game Design",   result:"won",       icon:"🏆" },
  ],
  /* ── Hades II ── */
  "hades-ii": [
    { show:"The Game Awards",    year:2024, category:"Best Independent Game",                    result:"nominated", icon:"🎖️" },
    { show:"Golden Joystick",    year:2024, category:"Best Early Access Game",                   result:"won",       icon:"🏆" },
  ],
  /* ── Baldur's Gate 3 ── */
  "baldurs-gate-3": [
    { show:"The Game Awards",    year:2023, category:"Game of the Year",                         result:"won",       icon:"🏆" },
    { show:"The Game Awards",    year:2023, category:"Best Game Direction",                      result:"won",       icon:"🏆" },
    { show:"The Game Awards",    year:2023, category:"Best Narrative",                           result:"won",       icon:"🏆" },
    { show:"The Game Awards",    year:2023, category:"Best RPG",                                 result:"won",       icon:"🏆" },
    { show:"The Game Awards",    year:2023, category:"Best Performance – Neil Newbon",           result:"won",       icon:"🏆" },
    { show:"BAFTA Games Awards", year:2024, category:"Best Game",                                result:"won",       icon:"🏆" },
    { show:"BAFTA Games Awards", year:2024, category:"Best Narrative",                           result:"won",       icon:"🏆" },
    { show:"BAFTA Games Awards", year:2024, category:"Best Performer – Neil Newbon",             result:"won",       icon:"🏆" },
    { show:"Golden Joystick",    year:2023, category:"Ultimate Game of the Year",                result:"won",       icon:"🏆" },
    { show:"DICE Awards",        year:2024, category:"Game of the Year",                         result:"won",       icon:"🏆" },
    { show:"DICE Awards",        year:2024, category:"Role-Playing Game of the Year",            result:"won",       icon:"🏆" },
    { show:"GDC Awards",         year:2024, category:"Game of the Year",                         result:"won",       icon:"🏆" },
  ],
  /* ── Zelda: Breath of the Wild ── */
  "the-legend-of-zelda-breath-of-the-wild": [
    { show:"The Game Awards",    year:2017, category:"Game of the Year",                         result:"won",       icon:"🏆" },
    { show:"The Game Awards",    year:2017, category:"Best Action/Adventure",                    result:"won",       icon:"🏆" },
    { show:"BAFTA Games Awards", year:2018, category:"Best Game",                                result:"won",       icon:"🏆" },
    { show:"Golden Joystick",    year:2017, category:"Ultimate Game of the Year",                result:"won",       icon:"🏆" },
    { show:"DICE Awards",        year:2018, category:"Game of the Year",                         result:"won",       icon:"🏆" },
    { show:"GDC Awards",         year:2018, category:"Game of the Year",                         result:"won",       icon:"🏆" },
  ],
  /* ── Zelda: Tears of the Kingdom ── */
  "the-legend-of-zelda-tears-of-the-kingdom": [
    { show:"The Game Awards",    year:2023, category:"Game of the Year",                         result:"nominated", icon:"🎖️" },
    { show:"The Game Awards",    year:2023, category:"Best Game Direction",                      result:"won",       icon:"🏆" },
    { show:"BAFTA Games Awards", year:2024, category:"Best Game",                                result:"nominated", icon:"🎖️" },
    { show:"DICE Awards",        year:2024, category:"Outstanding Achievement in Game Design",   result:"won",       icon:"🏆" },
    { show:"Golden Joystick",    year:2023, category:"Ultimate Game of the Year",                result:"nominated", icon:"🎖️" },
  ],
  /* ── Grand Theft Auto V ── */
  "grand-theft-auto-v": [
    { show:"The Game Awards",    year:2013, category:"Best Score/Soundtrack",                    result:"won",       icon:"🏆" },
    { show:"Golden Joystick",    year:2013, category:"Game of the Year",                         result:"won",       icon:"🏆" },
    { show:"BAFTA Games Awards", year:2014, category:"Best Game",                                result:"nominated", icon:"🎖️" },
    { show:"DICE Awards",        year:2014, category:"Outstanding Achievement in Story",         result:"nominated", icon:"🎖️" },
  ],
  /* ── Marvel's Spider-Man ── */
  "marvel-s-spider-man": [
    { show:"The Game Awards",    year:2018, category:"Best Action/Adventure Game",               result:"nominated", icon:"🎖️" },
    { show:"The Game Awards",    year:2018, category:"Best Score/Music",                         result:"nominated", icon:"🎖️" },
    { show:"Golden Joystick",    year:2018, category:"Best Storytelling",                        result:"nominated", icon:"🎖️" },
    { show:"BAFTA Games Awards", year:2019, category:"Best Performer",                           result:"nominated", icon:"🎖️" },
  ],
  /* ── Marvel's Spider-Man 2 ── */
  "marvels-spider-man-2": [
    { show:"The Game Awards",    year:2023, category:"Best Action/Adventure",                    result:"won",       icon:"🏆" },
    { show:"The Game Awards",    year:2023, category:"Game of the Year",                         result:"nominated", icon:"🎖️" },
    { show:"Golden Joystick",    year:2023, category:"Best Visual Design",                       result:"won",       icon:"🏆" },
    { show:"BAFTA Games Awards", year:2024, category:"Best Action",                              result:"nominated", icon:"🎖️" },
  ],
  /* ── Alan Wake 2 ── */
  "alan-wake-2": [
    { show:"The Game Awards",    year:2023, category:"Game of the Year",                         result:"nominated", icon:"🎖️" },
    { show:"The Game Awards",    year:2023, category:"Best Narrative",                           result:"won",       icon:"🏆" },
    { show:"The Game Awards",    year:2023, category:"Best Art Direction",                       result:"won",       icon:"🏆" },
    { show:"The Game Awards",    year:2023, category:"Best Score/Music",                         result:"won",       icon:"🏆" },
    { show:"BAFTA Games Awards", year:2024, category:"Best Game",                                result:"nominated", icon:"🎖️" },
    { show:"Golden Joystick",    year:2023, category:"Best Storytelling",                        result:"won",       icon:"🏆" },
    { show:"DICE Awards",        year:2024, category:"Outstanding Achievement in Story",         result:"won",       icon:"🏆" },
  ],
  /* ── Resident Evil 4 Remake ── */
  "resident-evil-4-remake": [
    { show:"The Game Awards",    year:2023, category:"Best Remake",                              result:"won",       icon:"🏆" },
    { show:"The Game Awards",    year:2023, category:"Best Action Game",                         result:"nominated", icon:"🎖️" },
    { show:"Golden Joystick",    year:2023, category:"Best Visual Design",                       result:"nominated", icon:"🎖️" },
    { show:"BAFTA Games Awards", year:2024, category:"Best Game",                                result:"nominated", icon:"🎖️" },
  ],
  /* ── Resident Evil Village ── */
  "resident-evil-village": [
    { show:"The Game Awards",    year:2021, category:"Best Action Game",                         result:"nominated", icon:"🎖️" },
    { show:"Golden Joystick",    year:2021, category:"Best Visual Design",                       result:"nominated", icon:"🎖️" },
    { show:"BAFTA Games Awards", year:2022, category:"Best Game",                                result:"nominated", icon:"🎖️" },
  ],
  /* ── Hi-Fi Rush ── */
  "hi-fi-rush": [
    { show:"The Game Awards",    year:2023, category:"Best Independent Game",                    result:"won",       icon:"🏆" },
    { show:"The Game Awards",    year:2023, category:"Best Action Game",                         result:"nominated", icon:"🎖️" },
    { show:"The Game Awards",    year:2023, category:"Best Score/Music",                         result:"nominated", icon:"🎖️" },
    { show:"BAFTA Games Awards", year:2024, category:"Best Debut Game",                          result:"won",       icon:"🏆" },
    { show:"Golden Joystick",    year:2023, category:"Best Indie Game",                          result:"won",       icon:"🏆" },
  ],
  /* ── Sekiro ── */
  "sekiro-shadows-die-twice": [
    { show:"The Game Awards",    year:2019, category:"Game of the Year",                         result:"won",       icon:"🏆" },
    { show:"The Game Awards",    year:2019, category:"Best Action/Adventure",                    result:"won",       icon:"🏆" },
    { show:"DICE Awards",        year:2020, category:"Action Game of the Year",                  result:"won",       icon:"🏆" },
    { show:"Golden Joystick",    year:2019, category:"Ultimate Game of the Year",                result:"nominated", icon:"🎖️" },
  ],
  /* ── Death Stranding ── */
  "death-stranding": [
    { show:"The Game Awards",    year:2019, category:"Best Game Direction",                      result:"won",       icon:"🏆" },
    { show:"The Game Awards",    year:2019, category:"Best Score/Music",                         result:"nominated", icon:"🎖️" },
    { show:"Golden Joystick",    year:2019, category:"Best Storytelling",                        result:"nominated", icon:"🎖️" },
  ],
  /* ── Disco Elysium ── */
  "disco-elysium": [
    { show:"The Game Awards",    year:2019, category:"Game of the Year",                         result:"nominated", icon:"🎖️" },
    { show:"The Game Awards",    year:2019, category:"Best Narrative",                           result:"won",       icon:"🏆" },
    { show:"The Game Awards",    year:2019, category:"Best Role Playing Game",                   result:"won",       icon:"🏆" },
    { show:"The Game Awards",    year:2019, category:"Best Independent Game",                    result:"won",       icon:"🏆" },
    { show:"BAFTA Games Awards", year:2020, category:"Best Narrative",                           result:"won",       icon:"🏆" },
    { show:"Golden Joystick",    year:2019, category:"Best Storytelling",                        result:"won",       icon:"🏆" },
  ],
  /* ── Dark Souls III ── */
  "dark-souls-iii": [
    { show:"The Game Awards",    year:2016, category:"Best RPG",                                 result:"nominated", icon:"🎖️" },
    { show:"BAFTA Games Awards", year:2017, category:"Best Game",                                result:"nominated", icon:"🎖️" },
    { show:"Golden Joystick",    year:2016, category:"Best Storytelling",                        result:"nominated", icon:"🎖️" },
  ],
  /* ── Horizon Zero Dawn ── */
  "horizon-zero-dawn": [
    { show:"The Game Awards",    year:2017, category:"Best Narrative",                           result:"nominated", icon:"🎖️" },
    { show:"The Game Awards",    year:2017, category:"Best Action/Adventure",                    result:"won",       icon:"🏆" },
    { show:"BAFTA Games Awards", year:2018, category:"Best Game",                                result:"nominated", icon:"🎖️" },
    { show:"DICE Awards",        year:2018, category:"Outstanding Achievement in Story",         result:"nominated", icon:"🎖️" },
  ],
  /* ── Horizon Forbidden West ── */
  "horizon-forbidden-west": [
    { show:"The Game Awards",    year:2022, category:"Best Action/Adventure",                    result:"nominated", icon:"🎖️" },
    { show:"BAFTA Games Awards", year:2023, category:"Best Game",                                result:"nominated", icon:"🎖️" },
    { show:"Golden Joystick",    year:2022, category:"Best Visual Design",                       result:"nominated", icon:"🎖️" },
  ],
  /* ── Minecraft ── */
  "minecraft": [
    { show:"Golden Joystick",    year:2011, category:"Best Downloadable Game",                   result:"won",       icon:"🏆" },
    { show:"Golden Joystick",    year:2012, category:"Best Online Game",                         result:"won",       icon:"🏆" },
    { show:"BAFTA Games Awards", year:2012, category:"Best Game",                                result:"nominated", icon:"🎖️" },
    { show:"Golden Joystick",    year:2019, category:"Best Family Game",                         result:"nominated", icon:"🎖️" },
  ],
  /* ── Stardew Valley ── */
  "stardew-valley": [
    { show:"The Game Awards",    year:2016, category:"Best Independent Game",                    result:"nominated", icon:"🎖️" },
    { show:"Golden Joystick",    year:2016, category:"Best Indie Game",                          result:"won",       icon:"🏆" },
    { show:"BAFTA Games Awards", year:2017, category:"Best Game",                                result:"nominated", icon:"🎖️" },
  ],
  /* ── Hollow Knight ── */
  "hollow-knight": [
    { show:"The Game Awards",    year:2017, category:"Best Independent Game",                    result:"nominated", icon:"🎖️" },
    { show:"Golden Joystick",    year:2017, category:"Best Indie Game",                          result:"won",       icon:"🏆" },
    { show:"BAFTA Games Awards", year:2018, category:"Best Game",                                result:"nominated", icon:"🎖️" },
  ],
  /* ── Celeste ── */
  "celeste": [
    { show:"The Game Awards",    year:2018, category:"Game of the Year",                         result:"nominated", icon:"🎖️" },
    { show:"The Game Awards",    year:2018, category:"Best Independent Game",                    result:"won",       icon:"🏆" },
    { show:"The Game Awards",    year:2018, category:"Games for Impact",                         result:"won",       icon:"🏆" },
    { show:"BAFTA Games Awards", year:2019, category:"Best Game",                                result:"nominated", icon:"🎖️" },
  ],
  /* ── Overwatch ── */
  "overwatch": [
    { show:"The Game Awards",    year:2016, category:"Game of the Year",                         result:"won",       icon:"🏆" },
    { show:"The Game Awards",    year:2016, category:"Best Multiplayer",                         result:"won",       icon:"🏆" },
    { show:"BAFTA Games Awards", year:2017, category:"Best Multiplayer",                         result:"won",       icon:"🏆" },
    { show:"Golden Joystick",    year:2016, category:"Best Multiplayer Game",                    result:"won",       icon:"🏆" },
  ],
  /* ── Fortnite ── */
  "fortnite": [
    { show:"The Game Awards",    year:2018, category:"Best Ongoing Game",                        result:"nominated", icon:"🎖️" },
    { show:"Golden Joystick",    year:2018, category:"Best Ongoing Game",                        result:"won",       icon:"🏆" },
    { show:"BAFTA Games Awards", year:2019, category:"Multiplayer",                              result:"nominated", icon:"🎖️" },
  ],
  /* ── Returnal ── */
  "returnal": [
    { show:"The Game Awards",    year:2021, category:"Best Action Game",                         result:"won",       icon:"🏆" },
    { show:"The Game Awards",    year:2021, category:"Game of the Year",                         result:"nominated", icon:"🎖️" },
    { show:"DICE Awards",        year:2022, category:"Action Game of the Year",                  result:"won",       icon:"🏆" },
  ],
  /* ── Helldivers 2 ── */
  "helldivers-2": [
    { show:"The Game Awards",    year:2024, category:"Best Ongoing Game",                        result:"nominated", icon:"🎖️" },
    { show:"The Game Awards",    year:2024, category:"Best Multiplayer",                         result:"nominated", icon:"🎖️" },
    { show:"Golden Joystick",    year:2024, category:"Best Multiplayer Game",                    result:"won",       icon:"🏆" },
    { show:"BAFTA Games Awards", year:2025, category:"Best Multiplayer",                         result:"nominated", icon:"🎖️" },
  ],
  /* ── Black Myth: Wukong ── */
  "black-myth-wukong": [
    { show:"The Game Awards",    year:2024, category:"Game of the Year",                         result:"nominated", icon:"🎖️" },
    { show:"The Game Awards",    year:2024, category:"Best Action Game",                         result:"won",       icon:"🏆" },
    { show:"The Game Awards",    year:2024, category:"Best Art Direction",                       result:"nominated", icon:"🎖️" },
    { show:"BAFTA Games Awards", year:2025, category:"Best Action",                              result:"nominated", icon:"🎖️" },
    { show:"Golden Joystick",    year:2024, category:"Best Visual Design",                       result:"nominated", icon:"🎖️" },
  ],
  /* ── Balatro ── */
  "balatro": [
    { show:"The Game Awards",    year:2024, category:"Game of the Year",                         result:"nominated", icon:"🎖️" },
    { show:"The Game Awards",    year:2024, category:"Best Independent Game",                    result:"won",       icon:"🏆" },
    { show:"Golden Joystick",    year:2024, category:"Best Indie Game",                          result:"won",       icon:"🏆" },
    { show:"BAFTA Games Awards", year:2025, category:"Best Debut Game",                          result:"won",       icon:"🏆" },
  ],
  /* ── Metaphor: ReFantazio ── */
  "metaphor-refantazio": [
    { show:"The Game Awards",    year:2024, category:"Game of the Year",                         result:"nominated", icon:"🎖️" },
    { show:"The Game Awards",    year:2024, category:"Best RPG",                                 result:"nominated", icon:"🎖️" },
    { show:"The Game Awards",    year:2024, category:"Best Narrative",                           result:"nominated", icon:"🎖️" },
    { show:"Golden Joystick",    year:2024, category:"Best Storytelling",                        result:"won",       icon:"🏆" },
  ],
  /* ── Final Fantasy VII Rebirth ── */
  "final-fantasy-vii-rebirth": [
    { show:"The Game Awards",    year:2024, category:"Game of the Year",                         result:"nominated", icon:"🎖️" },
    { show:"The Game Awards",    year:2024, category:"Best Score/Music",                         result:"won",       icon:"🏆" },
    { show:"The Game Awards",    year:2024, category:"Best RPG",                                 result:"nominated", icon:"🎖️" },
    { show:"Golden Joystick",    year:2024, category:"Best Storytelling",                        result:"nominated", icon:"🎖️" },
  ],
  /* ── Hi-Fi Rush ── */
  "hi-fi-rush": [
    { show:"The Game Awards",    year:2023, category:"Best Independent Game",                    result:"won",       icon:"🏆" },
    { show:"The Game Awards",    year:2023, category:"Best Action Game",                         result:"nominated", icon:"🎖️" },
    { show:"BAFTA Games Awards", year:2024, category:"Best Debut Game",                          result:"won",       icon:"🏆" },
    { show:"Golden Joystick",    year:2023, category:"Best Indie Game",                          result:"won",       icon:"🏆" },
  ],
  /* ── Tekken 8 ── */
  "tekken-8": [
    { show:"The Game Awards",    year:2024, category:"Best Fighting Game",                       result:"won",       icon:"🏆" },
    { show:"The Game Awards",    year:2023, category:"Best Fighting Game",                       result:"won",       icon:"🏆" },
    { show:"Golden Joystick",    year:2024, category:"Best Competitive Experience",              result:"nominated", icon:"🎖️" },
  ],
  /* ── Street Fighter 6 ── */
  "street-fighter-6": [
    { show:"The Game Awards",    year:2023, category:"Best Fighting Game",                       result:"won",       icon:"🏆" },
    { show:"Golden Joystick",    year:2023, category:"Best Competitive Experience",              result:"nominated", icon:"🎖️" },
    { show:"BAFTA Games Awards", year:2024, category:"Best Multiplayer",                         result:"nominated", icon:"🎖️" },
  ],
  /* ── Hogwarts Legacy ── */
  "hogwarts-legacy": [
    { show:"The Game Awards",    year:2023, category:"Best RPG",                                 result:"nominated", icon:"🎖️" },
    { show:"Golden Joystick",    year:2023, category:"Best Storytelling",                        result:"nominated", icon:"🎖️" },
    { show:"BAFTA Games Awards", year:2024, category:"Best Game",                                result:"nominated", icon:"🎖️" },
  ],
  /* ── Sea of Stars ── */
  "sea-of-stars": [
    { show:"The Game Awards",    year:2023, category:"Best Independent Game",                    result:"nominated", icon:"🎖️" },
    { show:"The Game Awards",    year:2023, category:"Best RPG",                                 result:"nominated", icon:"🎖️" },
    { show:"Golden Joystick",    year:2023, category:"Best Indie Game",                          result:"nominated", icon:"🎖️" },
  ],
  /* ── Cocoon ── */
  "cocoon": [
    { show:"The Game Awards",    year:2023, category:"Best Independent Game",                    result:"nominated", icon:"🎖️" },
    { show:"BAFTA Games Awards", year:2024, category:"Best Debut Game",                          result:"nominated", icon:"🎖️" },
  ],
  /* ── Lies of P ── */
  "lies-of-p": [
    { show:"The Game Awards",    year:2023, category:"Best Debut Game",                          result:"nominated", icon:"🎖️" },
    { show:"Golden Joystick",    year:2023, category:"Best Indie Game",                          result:"nominated", icon:"🎖️" },
  ],
  /* ── Immortality ── */
  "immortality": [
    { show:"The Game Awards",    year:2022, category:"Best Narrative",                           result:"nominated", icon:"🎖️" },
    { show:"The Game Awards",    year:2022, category:"Best Independent Game",                    result:"nominated", icon:"🎖️" },
    { show:"BAFTA Games Awards", year:2023, category:"Best Narrative",                           result:"nominated", icon:"🎖️" },
    { show:"Golden Joystick",    year:2022, category:"Best Indie Game",                          result:"nominated", icon:"🎖️" },
  ],
  /* ── Tunic ── */
  "tunic": [
    { show:"The Game Awards",    year:2022, category:"Best Independent Game",                    result:"nominated", icon:"🎖️" },
    { show:"Golden Joystick",    year:2022, category:"Best Indie Game",                          result:"nominated", icon:"🎖️" },
    { show:"BAFTA Games Awards", year:2023, category:"Best Game",                                result:"nominated", icon:"🎖️" },
  ],
  /* ── Neon White ── */
  "neon-white": [
    { show:"The Game Awards",    year:2022, category:"Best Independent Game",                    result:"won",       icon:"🏆" },
    { show:"Golden Joystick",    year:2022, category:"Best Indie Game",                          result:"won",       icon:"🏆" },
  ],
  /* ── Signalis ── */
  "signalis": [
    { show:"The Game Awards",    year:2022, category:"Best Independent Game",                    result:"nominated", icon:"🎖️" },
    { show:"Golden Joystick",    year:2022, category:"Best Indie Game",                          result:"nominated", icon:"🎖️" },
  ],
  /* ── It Takes Two ── */
  "it-takes-two": [
    { show:"The Game Awards",    year:2021, category:"Game of the Year",                         result:"won",       icon:"🏆" },
    { show:"The Game Awards",    year:2021, category:"Best Cooperative Game",                    result:"won",       icon:"🏆" },
    { show:"BAFTA Games Awards", year:2022, category:"Best Game",                                result:"nominated", icon:"🎖️" },
    { show:"DICE Awards",        year:2022, category:"Game of the Year",                         result:"nominated", icon:"🎖️" },
    { show:"Golden Joystick",    year:2021, category:"Ultimate Game of the Year",                result:"nominated", icon:"🎖️" },
  ],
  /* ── Deathloop ── */
  "deathloop": [
    { show:"The Game Awards",    year:2021, category:"Game of the Year",                         result:"nominated", icon:"🎖️" },
    { show:"The Game Awards",    year:2021, category:"Best Game Direction",                      result:"won",       icon:"🏆" },
    { show:"The Game Awards",    year:2021, category:"Best Art Direction",                       result:"won",       icon:"🏆" },
    { show:"BAFTA Games Awards", year:2022, category:"Best Game",                                result:"nominated", icon:"🎖️" },
    { show:"Golden Joystick",    year:2021, category:"Best Visual Design",                       result:"won",       icon:"🏆" },
  ],
  /* ── Psychonauts 2 ── */
  "psychonauts-2": [
    { show:"The Game Awards",    year:2021, category:"Game of the Year",                         result:"nominated", icon:"🎖️" },
    { show:"The Game Awards",    year:2021, category:"Best Narrative",                           result:"nominated", icon:"🎖️" },
    { show:"BAFTA Games Awards", year:2022, category:"Best Narrative",                           result:"won",       icon:"🏆" },
    { show:"Golden Joystick",    year:2021, category:"Best Storytelling",                        result:"won",       icon:"🏆" },
  ],
  /* ── Ghost of Tsushima ── */
  "ghost-of-tsushima": [
    { show:"The Game Awards",    year:2020, category:"Best Art Direction",                       result:"won",       icon:"🏆" },
    { show:"The Game Awards",    year:2020, category:"Best Action/Adventure",                    result:"nominated", icon:"🎖️" },
    { show:"BAFTA Games Awards", year:2021, category:"Best Game",                                result:"nominated", icon:"🎖️" },
    { show:"Golden Joystick",    year:2020, category:"Best Visual Design",                       result:"won",       icon:"🏆" },
  ],
  /* ── Half-Life: Alyx ── */
  "half-life-alyx": [
    { show:"The Game Awards",    year:2020, category:"Best VR/AR Game",                          result:"won",       icon:"🏆" },
    { show:"The Game Awards",    year:2020, category:"Game of the Year",                         result:"nominated", icon:"🎖️" },
    { show:"BAFTA Games Awards", year:2021, category:"Best Game",                                result:"nominated", icon:"🎖️" },
    { show:"Golden Joystick",    year:2020, category:"Best Visual Design",                       result:"nominated", icon:"🎖️" },
  ],
  /* ── Animal Crossing: New Horizons ── */
  "animal-crossing-new-horizons": [
    { show:"The Game Awards",    year:2020, category:"Best Family Game",                         result:"won",       icon:"🏆" },
    { show:"The Game Awards",    year:2020, category:"Game of the Year",                         result:"nominated", icon:"🎖️" },
    { show:"BAFTA Games Awards", year:2021, category:"Best Family",                              result:"nominated", icon:"🎖️" },
    { show:"Golden Joystick",    year:2020, category:"Best Family Game",                         result:"won",       icon:"🏆" },
  ],
  /* ── Super Mario Odyssey ── */
  "super-mario-odyssey": [
    { show:"The Game Awards",    year:2017, category:"Best Family Game",                         result:"won",       icon:"🏆" },
    { show:"The Game Awards",    year:2017, category:"Game of the Year",                         result:"nominated", icon:"🎖️" },
    { show:"BAFTA Games Awards", year:2018, category:"Best Family",                              result:"nominated", icon:"🎖️" },
    { show:"Golden Joystick",    year:2017, category:"Best Family Game",                         result:"won",       icon:"🏆" },
    { show:"DICE Awards",        year:2018, category:"Outstanding Achievement in Game Design",   result:"nominated", icon:"🎖️" },
  ],
  /* ── Super Mario Bros. Wonder ── */
  "super-mario-bros-wonder": [
    { show:"The Game Awards",    year:2023, category:"Best Family Game",                         result:"won",       icon:"🏆" },
    { show:"Golden Joystick",    year:2023, category:"Best Family Game",                         result:"won",       icon:"🏆" },
    { show:"BAFTA Games Awards", year:2024, category:"Best Family",                              result:"nominated", icon:"🎖️" },
  ],
  /* ── Persona 5 Royal ── */
  "persona-5-royal": [
    { show:"The Game Awards",    year:2022, category:"Best RPG",                                 result:"nominated", icon:"🎖️" },
    { show:"Golden Joystick",    year:2022, category:"Best Storytelling",                        result:"nominated", icon:"🎖️" },
  ],
  /* ── Persona 5 ── */
  "persona-5": [
    { show:"The Game Awards",    year:2017, category:"Best RPG",                                 result:"won",       icon:"🏆" },
    { show:"The Game Awards",    year:2017, category:"Best Narrative",                           result:"nominated", icon:"🎖️" },
    { show:"BAFTA Games Awards", year:2018, category:"Best Narrative",                           result:"nominated", icon:"🎖️" },
  ],
  /* ── NieR: Automata ── */
  "nier-automata": [
    { show:"The Game Awards",    year:2017, category:"Best Narrative",                           result:"nominated", icon:"🎖️" },
    { show:"The Game Awards",    year:2017, category:"Best Score/Music",                         result:"nominated", icon:"🎖️" },
    { show:"BAFTA Games Awards", year:2018, category:"Best Score",                               result:"nominated", icon:"🎖️" },
    { show:"Golden Joystick",    year:2017, category:"Best Storytelling",                        result:"nominated", icon:"🎖️" },
  ],
  /* ── Cuphead ── */
  "cuphead": [
    { show:"The Game Awards",    year:2017, category:"Best Independent Game",                    result:"won",       icon:"🏆" },
    { show:"The Game Awards",    year:2017, category:"Best Art Direction",                       result:"won",       icon:"🏆" },
    { show:"Golden Joystick",    year:2017, category:"Best Visual Design",                       result:"won",       icon:"🏆" },
  ],
  /* ── Outer Wilds ── */
  "outer-wilds": [
    { show:"The Game Awards",    year:2019, category:"Best Independent Game",                    result:"nominated", icon:"🎖️" },
    { show:"Golden Joystick",    year:2019, category:"Best Indie Game",                          result:"won",       icon:"🏆" },
    { show:"BAFTA Games Awards", year:2020, category:"Best Debut Game",                          result:"won",       icon:"🏆" },
  ],
  /* ── Control ── */
  "control": [
    { show:"The Game Awards",    year:2019, category:"Best Action/Adventure",                    result:"won",       icon:"🏆" },
    { show:"The Game Awards",    year:2019, category:"Best Art Direction",                       result:"won",       icon:"🏆" },
    { show:"The Game Awards",    year:2019, category:"Best Narrative",                           result:"nominated", icon:"🎖️" },
    { show:"BAFTA Games Awards", year:2020, category:"Best Game",                                result:"nominated", icon:"🎖️" },
    { show:"BAFTA Games Awards", year:2020, category:"Best Narrative",                           result:"nominated", icon:"🎖️" },
    { show:"Golden Joystick",    year:2019, category:"Best Storytelling",                        result:"nominated", icon:"🎖️" },
  ],
  /* ── Monster Hunter: World ── */
  "monster-hunter-world": [
    { show:"The Game Awards",    year:2018, category:"Best RPG",                                 result:"nominated", icon:"🎖️" },
    { show:"Golden Joystick",    year:2018, category:"Best Visual Design",                       result:"nominated", icon:"🎖️" },
    { show:"BAFTA Games Awards", year:2019, category:"Best Game",                                result:"nominated", icon:"🎖️" },
  ],
  /* ── Demon's Souls (Remake) ── */
  "demons-souls": [
    { show:"The Game Awards",    year:2020, category:"Best RPG",                                 result:"nominated", icon:"🎖️" },
    { show:"The Game Awards",    year:2020, category:"Best Art Direction",                       result:"nominated", icon:"🎖️" },
    { show:"Golden Joystick",    year:2020, category:"Best Visual Design",                       result:"nominated", icon:"🎖️" },
  ],
  /* ── Among Us ── */
  "among-us": [
    { show:"The Game Awards",    year:2020, category:"Best Multiplayer",                         result:"won",       icon:"🏆" },
    { show:"The Game Awards",    year:2020, category:"Games for Impact",                         result:"nominated", icon:"🎖️" },
    { show:"Golden Joystick",    year:2020, category:"Best Multiplayer Game",                    result:"won",       icon:"🏆" },
  ],
  /* ── Fall Guys ── */
  "fall-guys": [
    { show:"The Game Awards",    year:2020, category:"Best Multiplayer",                         result:"nominated", icon:"🎖️" },
    { show:"Golden Joystick",    year:2020, category:"Best Multiplayer Game",                    result:"nominated", icon:"🎖️" },
    { show:"BAFTA Games Awards", year:2021, category:"Best Multiplayer",                         result:"nominated", icon:"🎖️" },
  ],
  /* ── Doom Eternal ── */
  "doom-eternal": [
    { show:"The Game Awards",    year:2020, category:"Best Action Game",                         result:"nominated", icon:"🎖️" },
    { show:"The Game Awards",    year:2020, category:"Best Score/Music",                         result:"nominated", icon:"🎖️" },
    { show:"BAFTA Games Awards", year:2021, category:"Best Game",                                result:"nominated", icon:"🎖️" },
  ],
  /* ── Dragon Age: The Veilguard ── */
  "dragon-age-the-veilguard": [
    { show:"The Game Awards",    year:2024, category:"Best RPG",                                 result:"nominated", icon:"🎖️" },
    { show:"The Game Awards",    year:2024, category:"Best Narrative",                           result:"nominated", icon:"🎖️" },
    { show:"Golden Joystick",    year:2024, category:"Best Storytelling",                        result:"nominated", icon:"🎖️" },
  ],
  /* ── Indiana Jones and the Great Circle ── */
  "indiana-jones-and-the-great-circle": [
    { show:"The Game Awards",    year:2024, category:"Best Action/Adventure Game",               result:"nominated", icon:"🎖️" },
    { show:"The Game Awards",    year:2024, category:"Best Narrative",                           result:"nominated", icon:"🎖️" },
    { show:"Golden Joystick",    year:2024, category:"Best Storytelling",                        result:"nominated", icon:"🎖️" },
  ],
  /* ── Call of Duty: Modern Warfare ── */
  "call-of-duty-modern-warfare": [
    { show:"The Game Awards",    year:2019, category:"Best Score/Music",                         result:"nominated", icon:"🎖️" },
    { show:"Golden Joystick",    year:2019, category:"Best Visual Design",                       result:"nominated", icon:"🎖️" },
  ],
  /* ── Mass Effect Legendary Edition ── */
  "mass-effect-legendary-edition": [
    { show:"The Game Awards",    year:2021, category:"Best RPG",                                 result:"nominated", icon:"🎖️" },
    { show:"Golden Joystick",    year:2021, category:"Best Storytelling",                        result:"nominated", icon:"🎖️" },
  ],
};

/* ═══════════════════════════════════════════════════════
   🎮 SMART AWARDS FALLBACK
   For any game NOT in GAME_AWARDS_DB, auto-generate
   awards based on RAWG rating + Metacritic + genres
═══════════════════════════════════════════════════════ */
function generateSmartAwards(gameData) {
  const rating     = gameData.rating     || 0;
  const metacritic = gameData.metacritic || 0;
  const released   = gameData.released   || "";
  const year       = released ? parseInt(released.slice(0, 4)) : null;
  const genres     = (gameData.genres || []).map(g => g.name);
  const name       = gameData.name || "This Game";

  const awards = [];

  // Nothing to show for very low-rated or unscored games
  if (rating < 2.5 && metacritic < 60) return [];

  // ── Metacritic tier ───────────────────────────────────
  if (metacritic >= 95) {
    awards.push({ show:"Metacritic",      year, category:"Universal Acclaim (95+/100)",          result:"won",       icon:"🏆" });
  } else if (metacritic >= 90) {
    awards.push({ show:"Metacritic",      year, category:"Universal Acclaim (90+/100)",          result:"won",       icon:"🏆" });
  } else if (metacritic >= 80) {
    awards.push({ show:"Metacritic",      year, category:"Generally Favorable Reviews (80+/100)",result:"won",       icon:"🏆" });
  } else if (metacritic >= 70) {
    awards.push({ show:"Metacritic",      year, category:"Generally Favorable Reviews (70+/100)",result:"nominated", icon:"🎖️" });
  }

  // ── RAWG community rating tier ────────────────────────
  if (rating >= 4.5) {
    awards.push({ show:"RAWG Community",  year, category:"Exceptional Rating (4.5+/5)",          result:"won",       icon:"🏆" });
  } else if (rating >= 4.0) {
    awards.push({ show:"RAWG Community",  year, category:"Highly Recommended (4.0+/5)",          result:"won",       icon:"🏆" });
  } else if (rating >= 3.5) {
    awards.push({ show:"RAWG Community",  year, category:"Recommended (3.5+/5)",                 result:"won",       icon:"🏆" });
  }

  // ── Genre-based best-of guess ─────────────────────────
  const genreMap = {
    "RPG":           { show:"Genre Excellence", category:"Best RPG",                              icon:"🏆" },
    "Action":        { show:"Genre Excellence", category:"Best Action Game",                      icon:"🏆" },
    "Adventure":     { show:"Genre Excellence", category:"Best Action/Adventure",                 icon:"🏆" },
    "Indie":         { show:"Genre Excellence", category:"Best Independent Game",                 icon:"🏆" },
    "Strategy":      { show:"Genre Excellence", category:"Best Strategy Game",                    icon:"🏆" },
    "Shooter":       { show:"Genre Excellence", category:"Best Shooter",                          icon:"🏆" },
    "Puzzle":        { show:"Genre Excellence", category:"Best Puzzle Game",                      icon:"🏆" },
    "Platformer":    { show:"Genre Excellence", category:"Best Platformer",                       icon:"🏆" },
    "Fighting":      { show:"Genre Excellence", category:"Best Fighting Game",                    icon:"🏆" },
    "Sports":        { show:"Genre Excellence", category:"Best Sports Game",                      icon:"🏆" },
    "Racing":        { show:"Genre Excellence", category:"Best Racing Game",                      icon:"🏆" },
    "Simulation":    { show:"Genre Excellence", category:"Best Simulation Game",                  icon:"🏆" },
    "Massively Multiplayer": { show:"Genre Excellence", category:"Best Online Multiplayer",       icon:"🏆" },
  };

  for (const genre of genres) {
    if (genreMap[genre] && (metacritic >= 80 || rating >= 4.0)) {
      const entry = genreMap[genre];
      awards.push({
        show:     entry.show,
        year,
        category: entry.category,
        result:   metacritic >= 88 || rating >= 4.3 ? "won" : "nominated",
        icon:     entry.icon,
      });
      break; // one genre award is enough
    }
  }

  // ── "Added to library" popularity badge ──────────────
  const added = gameData.added || 0;
  if (added >= 2000000) {
    awards.push({ show:"Player Recognition", year, category:"2M+ Players Added to Library",     result:"won",       icon:"🏆" });
  } else if (added >= 500000) {
    awards.push({ show:"Player Recognition", year, category:"500K+ Players Added to Library",   result:"won",       icon:"🏆" });
  } else if (added >= 100000) {
    awards.push({ show:"Player Recognition", year, category:"100K+ Players Added to Library",   result:"nominated", icon:"🎖️" });
  }

  // ── Playtime badge ────────────────────────────────────
  const playtime = gameData.playtime || 0;
  if (playtime >= 100) {
    awards.push({ show:"Player Recognition", year, category:`100+ Hour Average Playtime`,       result:"won",       icon:"🏆" });
  } else if (playtime >= 40) {
    awards.push({ show:"Player Recognition", year, category:`${playtime}h Average Playtime`,    result:"nominated", icon:"🎖️" });
  }

  return awards;
}

/* ── fetchAndRenderGameAwards (improved matcher + smart fallback) ── */
function fetchAndRenderGameAwards(slug, gameData = null) {
  if (!awardsSection) return;

  // ── 1. Direct DB hit ──────────────────────────────────
  if (GAME_AWARDS_DB[slug]?.length > 0) {
    renderAwardCards(GAME_AWARDS_DB[slug]);
    return;
  }

  // ── 2. Token-based fuzzy match ────────────────────────
  const slugTokens = slug.toLowerCase().split("-").filter(Boolean);
  let bestKey = null, bestScore = 0;

  for (const key of Object.keys(GAME_AWARDS_DB)) {
    const keyTokens = key.toLowerCase().split("-").filter(Boolean);
    let consecutive = 0;
    const minLen = Math.min(slugTokens.length, keyTokens.length);
    for (let i = 0; i < minLen; i++) {
      if (slugTokens[i] === keyTokens[i]) consecutive++;
      else break;
    }
    const slugFull = slug.toLowerCase();
    const keyFull  = key.toLowerCase();
    const contains = slugFull.includes(keyFull) || keyFull.includes(slugFull);
    const score    = consecutive * 10 + (contains ? 5 : 0);
    if (consecutive >= 2 && score > bestScore) {
      bestScore = score;
      bestKey   = key;
    }
  }

  if (bestKey && GAME_AWARDS_DB[bestKey]?.length > 0) {
    renderAwardCards(GAME_AWARDS_DB[bestKey]);
    return;
  }

  // ── 3. Single distinctive-word fallback ──────────────
  if (slugTokens[0]?.length >= 5) {
    const singleMatch = Object.keys(GAME_AWARDS_DB).find(key =>
      key.startsWith(slugTokens[0])
    );
    if (singleMatch && GAME_AWARDS_DB[singleMatch]?.length > 0) {
      renderAwardCards(GAME_AWARDS_DB[singleMatch]);
      return;
    }
  }

  // ── 4. Smart auto-generated awards from RAWG data ────
  if (gameData) {
    const smartAwards = generateSmartAwards(gameData);
    if (smartAwards.length > 0) {
      renderAwardCards(smartAwards);
      return;
    }
  }

  // ── 5. Nothing found ──────────────────────────────────
  awardsSection.style.display = "none";
}

/* ── Movie/TV awards ── */
async function fetchAndRenderAwards(tmdbId, type = "movie") {
  if (awardsSection) awardsSection.style.display = "none";
  try {
    const extRes = await fetch(`${BASE}/${type}/${tmdbId}/external_ids?api_key=${API_KEY}`).then(r=>r.json()).catch(()=>({}));
    const imdbId = extRes.imdb_id || "";
    const staticAwards = imdbId ? (AWARDS_DB[imdbId]||[]) : [];
    if (staticAwards.length > 0) { renderAwardCards(staticAwards); return; }
    if (!imdbId) { awardsSection.style.display = "none"; return; }
    const omdbRes = await fetch(`https://www.omdbapi.com/?i=${imdbId}&apikey=${OMDB_KEY}`).then(r=>r.json()).catch(()=>null);
    if (!omdbRes || omdbRes.Response === "False") { awardsSection.style.display = "none"; return; }
    const parsed = parseOmdbAwards(omdbRes.Awards);
    if (parsed.wins === 0 && parsed.noms === 0) { awardsSection.style.display = "none"; return; }
    renderOmdbAwards(parsed, omdbRes);
  } catch(err) { if (awardsSection) awardsSection.style.display = "none"; }
}

function renderAwardCards(awards) {
  if (!awardsSection) return;
  awardsSection.style.display = "block";
  const wins = awards.filter(a => a.result === "won").length;
  const noms = awards.filter(a => a.result === "nominated").length;
  awardsSummaryBar.innerHTML = buildSummaryBarHTML(wins, noms, wins + noms);
  awardsGrid.innerHTML = awards.map((a, i) => `
    <div class="award-card ${a.result === "won" ? "award-won" : "award-nom"}" style="animation-delay:${i*0.06}s">
      <div class="award-card-top">
        <span class="award-icon">${a.icon}</span>
        <span class="award-result-badge ${a.result === "won" ? "badge-won" : "badge-nom"}">${a.result === "won" ? "WON" : "NOMINATED"}</span>
      </div>
      <div class="award-show">${a.show}</div>
      <div class="award-category">${a.category}</div>
      <div class="award-year">${a.year || ""}</div>
    </div>`).join("");
}

function renderOmdbAwards(parsed, omdbData) {
  if (!awardsSection) return;
  awardsSection.style.display = "block";
  awardsSummaryBar.innerHTML = buildSummaryBarHTML(parsed.wins, parsed.noms, parsed.wins + parsed.noms);
  const cards = buildAwardCards(parsed);
  awardsGrid.innerHTML = cards.map((a, i) => `
    <div class="award-card ${a.result === "won" ? "award-won" : "award-nom"}" style="animation-delay:${i*0.08}s">
      <div class="award-card-top">
        <span class="award-icon">${a.icon}</span>
        <span class="award-result-badge ${a.result === "won" ? "badge-won" : "badge-nom"}">${a.result === "won" ? "WON" : "NOMINATED"}</span>
      </div>
      <div class="award-show">${a.show}</div>
      <div class="award-category">${a.category}</div>
      ${a.year ? `<div class="award-year">${a.year}</div>` : ""}
    </div>`).join("");
}

function buildSummaryBarHTML(wins, noms, total) {
  return `
    <div class="award-summary-item"><span class="award-summary-icon">🏆</span><span class="award-summary-val">${wins}</span><span class="award-summary-lbl">Win${wins !== 1 ? "s" : ""}</span></div>
    <div class="award-summary-divider"></div>
    <div class="award-summary-item"><span class="award-summary-icon">🎖️</span><span class="award-summary-val">${noms}</span><span class="award-summary-lbl">Nomination${noms !== 1 ? "s" : ""}</span></div>
    <div class="award-summary-divider"></div>
    <div class="award-summary-item"><span class="award-summary-icon">🎬</span><span class="award-summary-val">${total}</span><span class="award-summary-lbl">Total</span></div>`;
}

/* ═══════════════════════════════════════════════════════
   🎮 GAME HELPERS
═══════════════════════════════════════════════════════ */
const GAME_GENRE_SCORES = {
  "Action":       {action:95,adventure:40,rpg:20,strategy:15,sports:5,puzzle:10},
  "Shooter":      {action:90,adventure:30,rpg:15,strategy:25,sports:5,puzzle:5},
  "Adventure":    {action:40,adventure:90,rpg:35,strategy:20,sports:5,puzzle:40},
  "RPG":          {action:45,adventure:65,rpg:95,strategy:50,sports:5,puzzle:30},
  "Strategy":     {action:20,adventure:25,rpg:30,strategy:95,sports:15,puzzle:60},
  "Simulation":   {action:10,adventure:30,rpg:20,strategy:70,sports:40,puzzle:35},
  "Puzzle":       {action:5,adventure:30,rpg:10,strategy:55,sports:5,puzzle:95},
  "Arcade":       {action:75,adventure:30,rpg:10,strategy:10,sports:20,puzzle:25},
  "Platformer":   {action:65,adventure:60,rpg:15,strategy:10,sports:5,puzzle:45},
  "Racing":       {action:50,adventure:20,rpg:5,strategy:15,sports:80,puzzle:5},
  "Sports":       {action:30,adventure:10,rpg:5,strategy:25,sports:95,puzzle:5},
  "Fighting":     {action:90,adventure:10,rpg:15,strategy:20,sports:35,puzzle:5},
  "Casual":       {action:15,adventure:40,rpg:10,strategy:20,sports:20,puzzle:50},
  "Massively Multiplayer":{action:50,adventure:45,rpg:70,strategy:45,sports:15,puzzle:20},
  "Card":         {action:5,adventure:10,rpg:25,strategy:85,sports:5,puzzle:60},
  "Board Games":  {action:5,adventure:15,rpg:15,strategy:90,sports:10,puzzle:65},
};

function ratingColor(r) {
  if (r >= 4.0) return "#3d9b5c";
  if (r >= 3.0) return "#c9a84c";
  return "#c04a4a";
}

function hideGamePanels() {
  if (screenshotsSection) screenshotsSection.style.display = "none";
  if (gameStatsPanel)     gameStatsPanel.style.display     = "none";
  if (gameRatingsPanel)   gameRatingsPanel.style.display   = "none";
  if (platformsPanel)     platformsPanel.style.display     = "none";
  gameRatingsChart = destroyChart(gameRatingsChart);
}

function hideMoviePanels() {
  profitBarWrap.style.display  = "none";
  finPanel.style.display       = "none";
  revPanel.style.display       = "none";
  showStatBand.style.display   = "none";
  seasonsSection.style.display = "none";
  epsPanel.style.display       = "none";
  if (awardsSection) awardsSection.style.display = "none";
}

async function loadGame(slug) {
  dashboard.classList.add("hidden");
  landing.classList.add("hidden");
  loader.classList.remove("hidden");
  document.getElementById("loaderText").textContent = "Loading game data…";
  document.getElementById("loaderSub").textContent  = "Fetching ratings, platforms & more";
  try {
    const [details, screenshotsRes, achievementsRes] = await Promise.all([
      fetch(`${RAWG}/games/${slug}?key=${RAWG_KEY}`).then(r=>r.json()),
      fetch(`${RAWG}/games/${slug}/screenshots?key=${RAWG_KEY}`).then(r=>r.json()).catch(()=>({results:[]})),
      fetch(`${RAWG}/games/${slug}/achievements?key=${RAWG_KEY}`).then(r=>r.json()).catch(()=>({count:0})),
    ]);
    renderGameDashboard(details, screenshotsRes.results || [], achievementsRes.count || 0, slug);
  } catch(err) { console.error(err); }
  finally { loader.classList.add("hidden"); }
}

function renderGameDashboard(d, screenshots, achievementCount, slug = "") {
  hideMoviePanels();
  hideGamePanels();
  if (awardsSection) awardsSection.style.display = "none";
  chartTabs.style.display = "none";

  const genres    = d.genres    || [];
  const platforms = (d.platforms || []).map(p => p.platform);
  const devs      = d.developers || [];
  const pubs      = d.publishers || [];
  const rating    = d.rating    || 0;
  const released  = d.released  || "N/A";
  const esrb      = d.esrb_rating ? d.esrb_rating.name : "N/A";
  const playtime  = d.playtime  || 0;
  const metacritic= d.metacritic|| 0;

  const backdropUrl = screenshots[0]?.image || d.background_image || "";
  if (backdropUrl) heroBg.style.backgroundImage = `url('${backdropUrl}')`;
  heroTitle.textContent = d.name || "";
  heroBadges.innerHTML  = genres.slice(0,5).map(g=>`<span class="badge">${g.name}</span>`).join("");

  sidebarPoster.src           = d.background_image || "";
  sidebarPoster.alt           = d.name || "";
  sidebarTitle.textContent    = d.name || "";
  sidebarYear.textContent     = released || "";
  sidebarTagline.textContent  = devs.map(d=>d.name).join(", ") || "Unknown Dev";
  sidebarOverview.textContent = d.description_raw || "No description available.";
  sidebarBadges.innerHTML     = genres.slice(0,4).map(g=>`<span class="badge">${g.name}</span>`).join("");
  sidebarRating.textContent   = rating ? rating.toFixed(1) : "N/A";
  sidebarRuntimeLbl.textContent = "Avg Playtime";
  sidebarRuntime.textContent  = playtime ? `${playtime}h` : "N/A";
  sidebarStatus.textContent   = d.tba ? "TBA" : (released && released !== "N/A" ? "Released" : "N/A");

  if (rating) {
    sidebarScoreWrap.style.display = "flex";
    scoreCenter.textContent = rating.toFixed(1);
    const circ = 163.4;
    setTimeout(() => {
      scoreRingFill.style.strokeDashoffset = circ - ((rating / 5) * circ);
      scoreRingFill.style.stroke = ratingColor(rating);
    }, 200);
  } else {
    sidebarScoreWrap.style.display = "none";
  }

  heroFinQuick.innerHTML = [
    { label:"Rating",     value: rating     ? `${rating.toFixed(1)}/5`  : "N/A" },
    { label:"Metacritic", value: metacritic ? `${metacritic}/100`       : "N/A" },
    { label:"Playtime",   value: playtime   ? `~${playtime}h`           : "N/A" },
  ].filter(x=>x.value!=="N/A").map(x=>`
    <div class="fin-quick-item">
      <div class="fq-label">${x.label}</div>
      <div class="fq-val">${x.value}</div>
    </div>`).join("");

  statRibbon.innerHTML = [
    { label:"Rating",      value: rating      ? rating.toFixed(1)    : "N/A", sub:`${(d.ratings_count||0).toLocaleString()} reviews`, cls:"neutral" },
    { label:"Released",    value: released    || "N/A",                        sub:"",                     cls:"neutral" },
    { label:"Metacritic",  value: metacritic  ? `${metacritic}`      : "N/A", sub:"Critic score",         cls:"neutral" },
    { label:"Playtime",    value: playtime    ? `${playtime}h`       : "N/A", sub:"Average",              cls:"neutral" },
    { label:"ESRB",        value: esrb,                                         sub:"Rating",               cls:"neutral" },
    { label:"Achievements",value: achievementCount ? `${achievementCount}` : "N/A", sub:"Unlockable",     cls:"neutral" },
    { label:"Platforms",   value: platforms.length || "N/A",                   sub:"Supported",            cls:"neutral" },
  ].map(s=>`<div class="stat-ribbon-item">
    <div class="stat-rib-label">${s.label}</div>
    <div class="stat-rib-value">${s.value}</div>
    ${s.sub ? `<div class="stat-rib-sub ${s.cls}">${s.sub}</div>` : ""}
  </div>`).join("");

  showStatBand.style.display = "grid";
  showStatBand.innerHTML = [
    { lbl:"Developer", val: devs.map(d=>d.name).join(", ") || "N/A" },
    { lbl:"Publisher",  val: pubs.map(p=>p.name).join(", ") || "N/A" },
    { lbl:"ESRB",       val: esrb },
    { lbl:"Playtime",   val: playtime ? `~${playtime}h avg` : "N/A" },
  ].map(i=>`<div class="show-stat-card">
    <div class="lbl">${i.lbl}</div>
    <div class="val" style="font-size:${i.val.length>12?'0.75rem':'1.1rem'}">${i.val}</div>
  </div>`).join("");

  if (platforms.length && platformsPanel) {
    platformsPanel.style.display = "block";
    document.getElementById("platformsList").innerHTML = platforms.slice(0,8).map((p,i)=>`
      <div class="prod-item" style="animation-delay:${i*0.06}s">
        <div class="prod-no-logo">${getPlatformIcon(p.name)}</div>
        <div class="prod-info">
          <div class="prod-name">${p.name}</div>
          <div class="prod-country">${p.year||""}</div>
        </div>
      </div>`).join("");
  }

  const devCards = devs.slice(0,3).map(dev => ({ id:dev.id, name:dev.name, profile_path:null, character:null, job:"Developer" }));
  renderTalent(null, devCards.slice(0,9));
  if (!devCards.length) {
    peopleGrid.innerHTML = `<div style="color:var(--muted);font-size:0.85rem;padding:1rem 0;grid-column:1/-1">No developer info available.</div>`;
  }

  if (pubs.length) {
    prodPanel.style.display = "block";
    prodPanelTitle.textContent = "🏢 PUBLISHERS";
    prodList.innerHTML = pubs.slice(0,5).map((p,i)=>`
      <div class="prod-item" style="animation-delay:${i*0.08}s">
        <div class="prod-no-logo">🏢</div>
        <div class="prod-info"><div class="prod-name">${p.name}</div></div>
      </div>`).join("");
  } else { prodPanel.style.display = "none"; }

  if (screenshots.length && screenshotsSection) {
    screenshotsSection.style.display = "block";
    screenshotsGrid.innerHTML = screenshots.slice(0,6).map((s,i)=>`
      <div class="screenshot-card" style="animation-delay:${i*0.07}s">
        <img src="${s.image}" alt="Screenshot ${i+1}" loading="lazy" />
      </div>`).join("");
  }

  if (d.ratings?.length && gameRatingsPanel) {
    gameRatingsPanel.style.display = "block";
    renderGameRatingsChart(d.ratings);
  }

  if (gameStatsPanel) {
    gameStatsPanel.style.display = "block";
    document.getElementById("gameStatsList").innerHTML = [
      { lbl:"Added to Library", val: (d.added||0).toLocaleString(), icon:"📚" },
      { lbl:"Avg Playtime",     val: playtime ? `${playtime}h` : "N/A", icon:"⏱️" },
      { lbl:"Metacritic Score", val: metacritic ? `${metacritic}/100` : "N/A", icon:"📰" },
      { lbl:"Total Reviews",    val: (d.ratings_count||0).toLocaleString(), icon:"⭐" },
    ].map(s=>`
      <div class="game-stat-item">
        <span class="game-stat-icon">${s.icon}</span>
        <div class="game-stat-info">
          <div class="game-stat-lbl">${s.lbl}</div>
          <div class="game-stat-val">${s.val}</div>
        </div>
      </div>`).join("");
  }

  const tags = (d.tags||[]).slice(0,8);
  metaDuo.style.display = "grid";
  thirdMetaTitle.textContent = "🏷️ TAGS";
  countriesList.innerHTML = platforms.length
    ? platforms.map(p=>`<span class="meta-tag">${getPlatformIcon(p.name)} ${p.name}</span>`).join("")
    : '<span style="color:var(--muted)">N/A</span>';
  languagesList.innerHTML = (d.stores||[]).length
    ? d.stores.map(s=>`<span class="meta-tag">🛒 ${s.store.name}</span>`).join("")
    : '<span style="color:var(--muted)">N/A</span>';
  collectionInfo.innerHTML = tags.length
    ? tags.map(t=>`<span class="meta-tag">🏷️ ${t.name}</span>`).join("")
    : '<span style="color:var(--muted)">N/A</span>';
  document.getElementById("countriesMetaTitle").textContent = "🎮 PLATFORMS";
  document.getElementById("languagesMetaTitle").textContent = "🛒 STORES";

  renderGameRadarChart(genres);
  renderPopChart(rating * 2, d.added || 0, d.ratings_count || 0);

  // ── Pass full game data so the smart fallback can use it ──
  fetchAndRenderGameAwards(d.slug || slug || "", d);

  dashboard.classList.remove("hidden");
  window.scrollTo({ top:0, behavior:"smooth" });
}

function getPlatformIcon(name) {
  const n = name.toLowerCase();
  if (n.includes("playstation")) return "🎮";
  if (n.includes("xbox"))        return "🟢";
  if (n.includes("pc") || n.includes("windows")) return "💻";
  if (n.includes("nintendo") || n.includes("switch")) return "🕹️";
  if (n.includes("mac") || n.includes("ios") || n.includes("apple")) return "🍎";
  if (n.includes("android"))     return "📱";
  if (n.includes("linux"))       return "🐧";
  return "🎮";
}

function renderGameRatingsChart(ratings) {
  gameRatingsChart = destroyChart(gameRatingsChart);
  const ctx = document.getElementById("gameRatingsChart").getContext("2d");
  const colorMap = { exceptional:"#3d9b5c", recommended:"#c9a84c", meh:"#5b8fc9", skip:"#c04a4a" };
  gameRatingsChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ratings.map(r => r.title.charAt(0).toUpperCase() + r.title.slice(1)),
      datasets: [{
        data: ratings.map(r => r.percent),
        backgroundColor: ratings.map(r => colorMap[r.title] || "#5a5a7a"),
        borderColor: "#111318", borderWidth: 3, hoverOffset: 8,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display:true, position:"bottom", labels:{color:"#6a6a8a",font:{size:11},boxWidth:12,padding:12} },
        tooltip: { backgroundColor:"#111318", borderColor:"#272a38", borderWidth:1, titleColor:"#c9a84c", bodyColor:"#e8e4dc", padding:10, cornerRadius:8,
          callbacks: { label: ctx => `${ctx.label}: ${ctx.parsed.toFixed(1)}%` }
        }
      },
      cutout: "62%",
    }
  });
}

function renderGameRadarChart(genres) {
  radarChart = destroyChart(radarChart);
  if (!genres || !genres.length) { radarPanel.style.display = "none"; return; }
  radarPanel.style.display = "block";
  const dims = ["action","adventure","rpg","strategy","sports","puzzle"];
  const scores = dims.map(dim => {
    let total = 0, count = 0;
    genres.forEach(g => { const gs = GAME_GENRE_SCORES[g.name]; if(gs){total+=(gs[dim]||0);count++;} });
    return count > 0 ? total / count : 15;
  });
  const ctx = document.getElementById("radarChart").getContext("2d");
  radarChart = new Chart(ctx, {
    type: "radar",
    data: {
      labels: ["Action","Adventure","RPG","Strategy","Sports","Puzzle"],
      datasets: [{ data:scores, backgroundColor:"rgba(201,168,76,0.15)", borderColor:"#c9a84c", borderWidth:2, pointBackgroundColor:"#c9a84c", pointBorderColor:"#13151c", pointRadius:4, pointHoverRadius:6 }]
    },
    options: {
      responsive:true, maintainAspectRatio:false,
      plugins: { legend:{display:false}, tooltip:{backgroundColor:"#111318",borderColor:"#272a38",borderWidth:1,titleColor:"#c9a84c",bodyColor:"#e8e4dc",padding:10,cornerRadius:8,callbacks:{label:ctx=>` ${ctx.parsed.r.toFixed(0)}`}} },
      scales: { r:{min:0,max:100,backgroundColor:"transparent",grid:{color:"#1e2030"},angleLines:{color:"#1e2030"},pointLabels:{color:"#5a5a7a",font:{size:11,family:"'DM Sans'"}},ticks:{display:false}} }
    }
  });
}

/* ─────────────────────────────────────────────────────
   MOBILE SEARCH ROW
───────────────────────────────────────────────────── */
setupSearch(searchInputMobile, mobileSuggestions, true);
attachKeyboardNav(searchInputMobile, mobileSuggestions);
document.addEventListener("click", e => {
  if (!e.target.closest("#mobileSearchRow")) mobileSuggestions.classList.add("hidden");
});

/* ─────────────────────────────────────────────────────
   MODE TOGGLE
───────────────────────────────────────────────────── */
const MOVIE_HINTS = ["Inception","Avengers: Endgame","Parasite","The Dark Knight","Oppenheimer"];
const TV_HINTS    = ["Breaking Bad","Game of Thrones","Stranger Things","The Office","Succession"];
const GAME_HINTS  = ["Astro Bot","Elden Ring","Baldur's Gate 3","Red Dead Redemption 2","The Witcher 3"];

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
  const phMap        = { movie:"Search movies…", tv:"Search TV shows…", game:"Search games…" };
  const phLandingMap = {
    movie:"Try 'Inception', 'Avengers', 'The Dark Knight'…",
    tv:"Try 'Breaking Bad', 'Game of Thrones', 'Succession'…",
    game:"Try 'Astro Bot', 'Elden Ring', 'Baldur's Gate 3'…",
  };
  const titleMap    = { movie:"Discover Deep Movie Analytics", tv:"Discover Deep TV Show Analytics", game:"Discover Deep Game Analytics" };
  const subtitleMap = {
    movie:"Financial performance, cast insights, popularity trends, and more — all in one cinematic dashboard.",
    tv:"Seasons, episodes, networks, cast insights & popularity — all in one cinematic dashboard.",
    game:"Ratings, platforms, playtime, publishers & more — all in one game intelligence dashboard.",
  };
  const iconMap  = { movie:"🎬", tv:"📺", game:"🎮" };
  const hintsMap = { movie:MOVIE_HINTS, tv:TV_HINTS, game:GAME_HINTS };

  [searchInput, searchInputMobile].forEach(el => el.placeholder = phMap[mode]);
  searchInputLanding.placeholder = phLandingMap[mode];
  document.getElementById("landingIcon").textContent     = iconMap[mode];
  document.getElementById("landingTitle").textContent    = titleMap[mode];
  document.getElementById("landingSubtitle").textContent = subtitleMap[mode];

  const hints = hintsMap[mode];
  document.getElementById("landingHints").innerHTML = hints.map(q=>`<span class="hint-chip" data-query="${q}">${q}</span>`).join("");
  attachHintChips();

  [suggestionsList, suggestionsLanding, mobileSuggestions].forEach(s => s.classList.add("hidden"));
  searchInput.value = searchInputLanding.value = searchInputMobile.value = "";
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
   SEARCH
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
    if (window.innerWidth <= 768) searchInputMobile.focus();
    else if (dashboard.classList.contains("hidden")) searchInputLanding.focus();
    else searchInput.focus();
  }
  if (e.key === "Escape") [suggestionsList, suggestionsLanding, mobileSuggestions].forEach(s => s.classList.add("hidden"));
});

async function fetchSuggestions(query, sugList, isMobile = false) {
  try {
    let results = [];
    if (currentMode === "game") {
      const data = await fetch(`${RAWG}/games?key=${RAWG_KEY}&search=${encodeURIComponent(query)}&page_size=8`).then(r=>r.json());
      results = (data.results || []).slice(0,8).map(g => ({ id:g.slug, name:g.name, year:g.released?g.released.slice(0,4):"N/A" }));
    } else {
      const endpoint = currentMode === "tv" ? "search/tv" : "search/movie";
      const data = await fetch(`${BASE}/${endpoint}?api_key=${API_KEY}&query=${encodeURIComponent(query)}`).then(r=>r.json());
      results = (data.results || []).slice(0,8).map(item => ({ id:item.id, name:item.title||item.name||"Unknown", year:(item.release_date||item.first_air_date||"").slice(0,4)||"N/A" }));
    }
    if (!results.length) { sugList.classList.add("hidden"); return; }
    sugList.innerHTML = "";
    results.forEach(item => {
      const li = document.createElement("li");
      li.textContent = `${item.name} (${item.year})`;
      li.dataset.id  = item.id;
      li.addEventListener("click", () => {
        const label = `${item.name} (${item.year})`;
        searchInput.value = searchInputMobile.value = label;
        sugList.classList.add("hidden");
        if (currentMode === "game")    loadGame(item.id);
        else if (currentMode === "tv") loadShow(item.id);
        else                           loadMovie(item.id);
      });
      sugList.appendChild(li);
    });
    sugList.classList.remove("hidden");
  } catch(err) { console.error("Search error:", err); }
}

function attachKeyboardNav(input, sugList) {
  let activeIdx = -1;
  input.addEventListener("keydown", e => {
    const items = sugList.querySelectorAll("li");
    if (!items.length) return;
    if (e.key === "ArrowDown")      activeIdx = (activeIdx + 1) % items.length;
    else if (e.key === "ArrowUp")   activeIdx = (activeIdx - 1 + items.length) % items.length;
    else if (e.key === "Enter" && activeIdx >= 0) { items[activeIdx].click(); activeIdx = -1; return; }
    else if (e.key === "Escape")    { sugList.classList.add("hidden"); activeIdx = -1; return; }
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
      fetch(`${BASE}/movie/${id}?api_key=${API_KEY}`).then(r=>r.json()),
      fetch(`${BASE}/movie/${id}/credits?api_key=${API_KEY}`).then(r=>r.json()),
    ]);
    renderMovieDashboard(details, credits);
    fetchAndRenderAwards(id, "movie");
  } catch(err) { console.error(err); }
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
      fetch(`${BASE}/tv/${id}?api_key=${API_KEY}`).then(r=>r.json()),
      fetch(`${BASE}/tv/${id}/credits?api_key=${API_KEY}`).then(r=>r.json()),
    ]);
    renderShowDashboard(details, credits);
    fetchAndRenderAwards(id, "tv");
  } catch(err) { console.error(err); }
  finally { loader.classList.add("hidden"); }
}

/* ─────────────────────────────────────────────────────
   SHARED SIDEBAR / HERO
───────────────────────────────────────────────────── */
function setupSidebarHero({ posterPath, posterUrl, backdropPath, title, year, tagline, overview, genres, rating, ratingMax=10, runtimeLabel, runtimeValue, status }) {
  if (backdropPath) heroBg.style.backgroundImage = `url('${IMG}/w1280${backdropPath}')`;
  heroTitle.textContent = title || "";
  heroBadges.innerHTML  = genres.slice(0,5).map(g=>`<span class="badge">${g.name}</span>`).join("");
  sidebarPoster.src           = posterPath ? `${IMG}/w500${posterPath}` : (posterUrl || "");
  sidebarPoster.alt           = title || "";
  sidebarTitle.textContent    = title    || "";
  sidebarYear.textContent     = year     || "";
  sidebarTagline.textContent  = tagline  || "";
  sidebarOverview.textContent = overview || "";
  sidebarBadges.innerHTML     = genres.slice(0,4).map(g=>`<span class="badge">${g.name}</span>`).join("");
  sidebarRating.textContent   = rating ? rating.toFixed(1) : "N/A";
  sidebarRuntimeLbl.textContent = runtimeLabel;
  sidebarRuntime.textContent  = runtimeValue;
  sidebarStatus.textContent   = status || "N/A";
  if (rating) {
    sidebarScoreWrap.style.display = "flex";
    scoreCenter.textContent = rating.toFixed(1);
    const circ = 163.4;
    setTimeout(() => {
      scoreRingFill.style.strokeDashoffset = circ - ((rating / ratingMax) * circ);
      scoreRingFill.style.stroke = rating/ratingMax >= 0.7 ? "#3d9b5c" : rating/ratingMax >= 0.5 ? "#c9a84c" : "#c04a4a";
    }, 200);
  } else { sidebarScoreWrap.style.display = "none"; }
}

/* ─────────────────────────────────────────────────────
   RENDER MOVIE DASHBOARD
───────────────────────────────────────────────────── */
function renderMovieDashboard(d, credits) {
  hideGamePanels();
  if (awardsSection) awardsSection.style.display = "none";
  const revenue  = d.revenue  || 0;
  const budget   = d.budget   || 0;
  const profit   = revenue - budget;
  const release  = d.release_date || "N/A";
  const genres   = d.genres   || [];
  const cast     = (credits.cast  || []).slice(0,10);
  const crew     = credits.crew   || [];
  const director = crew.find(p => p.job === "Director") || null;
  const rating   = d.vote_average || 0;

  showStatBand.style.display   = "none";
  seasonsSection.style.display = "none";
  epsPanel.style.display       = "none";
  chartTabs.style.display      = "flex";

  setupSidebarHero({ posterPath:d.poster_path, backdropPath:d.backdrop_path, title:d.title, year:release?release.slice(0,4):"", tagline:d.tagline, overview:d.overview, genres, rating, ratingMax:10, runtimeLabel:"Runtime", runtimeValue:fmtRuntime(d.runtime), status:d.status });

  heroFinQuick.innerHTML = [
    { label:"Box Office", value:fmtMoney(revenue) },
    { label:"Budget",     value:fmtMoney(budget) },
    { label:"Rating",     value:rating ? rating.toFixed(1)+"/10" : "N/A" },
  ].filter(x=>x.value!=="N/A").map(x=>`<div class="fin-quick-item"><div class="fq-label">${x.label}</div><div class="fq-val">${x.value}</div></div>`).join("");

  const roiStr = budget > 0 && revenue > 0 ? `${((profit/budget)*100).toFixed(0)}% ROI` : null;
  statRibbon.innerHTML = [
    { label:"Rating",     value:rating?rating.toFixed(1):"N/A",  sub:`${(d.vote_count||0).toLocaleString()} votes`, cls:"neutral" },
    { label:"Runtime",    value:fmtRuntime(d.runtime),            sub:"", cls:"neutral" },
    { label:"Release",    value:release||"N/A",                   sub:"", cls:"neutral" },
    { label:"Budget",     value:fmtMoney(budget),                 sub:"Production cost", cls:"neutral" },
    { label:"Box Office", value:fmtMoney(revenue),                sub:"Worldwide gross", cls:"" },
    { label:"Profit",     value:profit!==0&&(budget||revenue)?fmtMoney(Math.abs(profit)):"N/A", sub:roiStr||"", cls:profit<0?"loss":"" },
    { label:"Popularity", value:d.popularity?d.popularity.toFixed(0):"N/A", sub:"TMDB score", cls:"neutral" },
  ].map(s=>`<div class="stat-ribbon-item"><div class="stat-rib-label">${s.label}</div><div class="stat-rib-value">${s.value}</div>${s.sub?`<div class="stat-rib-sub ${s.cls}">${s.sub}</div>`:""}</div>`).join("");

  if (budget > 0 && revenue > 0) {
    profitBarWrap.style.display = "block";
    budgetLabel.textContent  = `Budget: ${fmtMoney(budget)}`;
    revenueLabel.textContent = `Revenue: ${fmtMoney(revenue)}`;
    profitRatio.textContent  = `${(revenue/budget).toFixed(2)}× return`;
    profitBarFill.style.background = profit >= 0 ? "linear-gradient(90deg,#3d9b5c,#6ccc94)" : "linear-gradient(90deg,#c04a4a,#e87a7a)";
    setTimeout(() => { profitBarFill.style.width = `${Math.min((revenue/(budget*3))*100,100).toFixed(1)}%`; }, 150);
    profitPills.innerHTML = [
      {label:"Budget",  value:fmtMoney(budget)},
      {label:"Revenue", value:fmtMoney(revenue)},
      {label:profit>=0?"Net Profit":"Net Loss", value:fmtMoney(Math.abs(profit))},
      {label:"Multiple",value:budget>0?`${(revenue/budget).toFixed(2)}×`:"N/A"},
    ].map(p=>`<div class="profit-pill">${p.label}: <strong>${p.value}</strong></div>`).join("");
  } else { profitBarWrap.style.display = "none"; }

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
  hideGamePanels();
  if (awardsSection) awardsSection.style.display = "none";
  const genres   = d.genres || [];
  const rating   = d.vote_average || 0;
  const firstAir = d.first_air_date || "N/A";
  const lastAir  = d.last_air_date  || "";
  const seasons  = (d.seasons||[]).filter(s => s.season_number > 0);
  const networks = d.networks || [];
  const cast     = (credits.cast || []).slice(0,10);
  const creators = d.created_by || [];

  profitBarWrap.style.display = "none"; finPanel.style.display = "none";
  revPanel.style.display = "none"; chartTabs.style.display = "none";

  setupSidebarHero({ posterPath:d.poster_path, backdropPath:d.backdrop_path, title:d.name, year:firstAir?firstAir.slice(0,4):"", tagline:d.tagline, overview:d.overview, genres, rating, ratingMax:10, runtimeLabel:"Ep. Length", runtimeValue:fmtRuntime(d.episode_run_time), status:d.status });

  heroFinQuick.innerHTML = [
    {label:"Seasons",  value:seasons.length?`${seasons.length}`:"N/A"},
    {label:"Episodes", value:d.number_of_episodes?`${d.number_of_episodes}`:"N/A"},
    {label:"Rating",   value:rating?rating.toFixed(1)+"/10":"N/A"},
  ].filter(x=>x.value!=="N/A").map(x=>`<div class="fin-quick-item"><div class="fq-label">${x.label}</div><div class="fq-val">${x.value}</div></div>`).join("");

  const statusText = d.status || "N/A";
  statRibbon.innerHTML = [
    {label:"Rating",    value:rating?rating.toFixed(1):"N/A",       sub:`${(d.vote_count||0).toLocaleString()} votes`,cls:"neutral"},
    {label:"Seasons",   value:d.number_of_seasons||"N/A",           sub:"",cls:"neutral"},
    {label:"Episodes",  value:d.number_of_episodes||"N/A",          sub:"Total episodes",cls:"neutral"},
    {label:"First Air", value:firstAir!=="N/A"?firstAir:"N/A",      sub:"",cls:"neutral"},
    {label:"Last Air",  value:lastAir||"N/A",                        sub:"",cls:"neutral"},
    {label:"Status",    value:statusText,                             sub:"",cls:statusText==="Ended"||statusText==="Canceled"?"loss":"neutral"},
    {label:"Popularity",value:d.popularity?d.popularity.toFixed(0):"N/A",sub:"TMDB score",cls:"neutral"},
  ].map(s=>`<div class="stat-ribbon-item"><div class="stat-rib-label">${s.label}</div><div class="stat-rib-value">${s.value}</div>${s.sub?`<div class="stat-rib-sub ${s.cls}">${s.sub}</div>`:""}</div>`).join("");

  showStatBand.style.display = "grid";
  showStatBand.innerHTML = [
    {lbl:"Type",     val:d.type||"N/A"},
    {lbl:"Networks", val:networks.map(n=>n.name).join(", ")||"N/A"},
    {lbl:"Country",  val:(d.origin_country||[]).join(", ")||"N/A"},
    {lbl:"Language", val:d.original_language?d.original_language.toUpperCase():"N/A"},
  ].map(i=>`<div class="show-stat-card"><div class="lbl">${i.lbl}</div><div class="val" style="font-size:${i.val.length>12?'0.85rem':'1.1rem'}">${i.val}</div></div>`).join("");

  const lead = creators[0] ? {...creators[0], job:"Creator"} : null;
  renderTalent(lead, cast.slice(0,9));

  if (networks.length) {
    prodPanel.style.display = "block"; prodPanelTitle.textContent = "📡 NETWORKS";
    prodList.innerHTML = networks.map((n,i) => {
      const logo = n.logo_path ? `<img class="prod-logo" src="${IMG}/w92${n.logo_path}" alt="${n.name}" loading="lazy" />` : `<div class="prod-no-logo">📡</div>`;
      return `<div class="prod-item" style="animation-delay:${i*0.08}s">${logo}<div class="prod-info"><div class="prod-name">${n.name}</div><div class="prod-country">${n.origin_country||""}</div></div></div>`;
    }).join("");
  } else { prodPanel.style.display = "none"; }

  if (seasons.length) {
    seasonsSection.style.display = "block";
    seasonsGrid.innerHTML = seasons.map((s,i) => {
      const img = s.poster_path ? `<img src="${IMG}/w185${s.poster_path}" alt="${s.name}" loading="lazy" />` : `<div class="season-card-no-img">📺</div>`;
      const yr  = s.air_date ? s.air_date.slice(0,4) : "";
      return `<div class="season-card" style="animation-delay:${i*0.04}s">${img}<div class="season-card-body"><div class="season-card-name">${s.name}</div><div class="season-card-eps">${s.episode_count} episodes${yr?" · "+yr:""}</div></div></div>`;
    }).join("");
  } else { seasonsSection.style.display = "none"; }

  renderMeta(d.production_countries || [], d.spoken_languages || [], null, true, networks);
  renderEpisodesChart(seasons);
  renderPopChart(rating, d.popularity, d.vote_count);
  renderRadarChart(genres);
  dashboard.classList.remove("hidden");
  window.scrollTo({ top:0, behavior:"smooth" });
}

/* ─────────────────────────────────────────────────────
   SHARED RENDER HELPERS
───────────────────────────────────────────────────── */
function renderTalent(lead, cast) {
  const talent = [];
  if (lead) talent.push({ person:lead, role:lead.job||"Director", gold:true });
  cast.forEach((a,i) => talent.push({ person:a, role:a.character||a.job||"Actor", gold:i===0&&!lead }));
  peopleGrid.innerHTML = talent.map(({person,role,gold},i) => {
    const img = person.profile_path
      ? `<img src="${IMG}/w185${person.profile_path}" alt="${person.name}" loading="lazy" />`
      : `<div class="person-no-img">🎭</div>`;
    return `<div class="person-card" style="animation-delay:${i*0.05}s">${img}<div class="person-name">${person.name}</div><div class="person-role ${gold?'gold':''}">${role}</div></div>`;
  }).join("");
}

function renderProdPanel(companies, title) {
  if (companies.length) {
    prodPanel.style.display = "block"; prodPanelTitle.textContent = title;
    prodList.innerHTML = companies.slice(0,6).map((c,i) => {
      const logo = c.logo_path
        ? `<img class="prod-logo" src="${IMG}/w92${c.logo_path}" alt="${c.name}" loading="lazy" />`
        : `<div class="prod-no-logo">🏢</div>`;
      return `<div class="prod-item" style="animation-delay:${i*0.08}s">${logo}<div class="prod-info"><div class="prod-name">${c.name}</div><div class="prod-country">${c.origin_country||""}</div></div></div>`;
    }).join("");
  } else { prodPanel.style.display = "none"; }
}

function renderMeta(countries, langs, collection, isTV, networks) {
  if (countries.length || langs.length || collection || isTV) {
    metaDuo.style.display = "grid";
    document.getElementById("countriesMetaTitle").textContent = "🌍 COUNTRIES OF ORIGIN";
    document.getElementById("languagesMetaTitle").textContent = "🗣️ SPOKEN LANGUAGES";
    countriesList.innerHTML = countries.length
      ? countries.map(c=>`<span class="meta-tag">🌐 ${c.name}</span>`).join("")
      : '<span style="color:var(--muted)">N/A</span>';
    languagesList.innerHTML = langs.length
      ? langs.map(l=>`<span class="meta-tag">💬 ${l.english_name||l.name}</span>`).join("")
      : '<span style="color:var(--muted)">N/A</span>';
    if (isTV) {
      thirdMetaTitle.textContent = "📡 NETWORKS";
      collectionInfo.innerHTML = networks.length
        ? networks.map(n=>`<span class="meta-tag">📡 ${n.name}</span>`).join("")
        : '<span style="color:var(--muted)">N/A</span>';
    } else {
      thirdMetaTitle.textContent = "🏆 COLLECTION";
      collectionInfo.innerHTML = collection
        ? `<span class="meta-tag">🎬 ${collection.name}</span>`
        : '<span style="color:var(--muted)">Not part of a collection</span>';
    }
  } else { metaDuo.style.display = "none"; }
}

/* ─────────────────────────────────────────────────────
   EPISODES CHART
───────────────────────────────────────────────────── */
function renderEpisodesChart(seasons) {
  epsChart = destroyChart(epsChart);
  if (!seasons || !seasons.length) { epsPanel.style.display = "none"; return; }
  epsPanel.style.display = "block";
  const ctx  = document.getElementById("epsChart").getContext("2d");
  const grad = ctx.createLinearGradient(0,0,0,200);
  grad.addColorStop(0,"rgba(201,168,76,0.5)");
  grad.addColorStop(1,"rgba(201,168,76,0.05)");
  epsChart = new Chart(ctx, {
    type:"bar",
    data:{ labels:seasons.map(s=>s.name.replace("Season ","S")), datasets:[{data:seasons.map(s=>s.episode_count),backgroundColor:grad,borderColor:"#c9a84c",borderWidth:1.5,borderRadius:8,borderSkipped:false}] },
    options:{...CHART_DEFAULTS,plugins:{...CHART_DEFAULTS.plugins,tooltip:{...CHART_DEFAULTS.plugins.tooltip,callbacks:{label:ctx=>` ${ctx.parsed.y} episodes`}}},scales:{x:{grid:{display:false},ticks:{color:"#6a6a8a",font:{size:11}},border:{display:false}},y:{grid:{color:"#1a1c22"},ticks:{color:"#3a3a4a",stepSize:5},border:{display:false}}}}
  });
}

/* ─────────────────────────────────────────────────────
   REVENUE CHARTS
───────────────────────────────────────────────────── */
function renderRevenueCharts(revenue, release) {
  cumulativeChart = destroyChart(cumulativeChart);
  periodChart     = destroyChart(periodChart);
  if (!revenue || !release || release === "N/A") { revPanel.style.display = "none"; return; }
  const releaseDate = new Date(release), today = new Date();
  if (releaseDate > today) { revPanel.style.display = "none"; return; }
  const totalDays      = Math.floor((today - releaseDate) / 86400000);
  if (totalDays < 1) { revPanel.style.display = "none"; return; }
  const theatricalDays = Math.min(totalDays, 120), halfLife = 18, numPoints = Math.min(totalDays, 200);
  const datePoints = Array.from({length:numPoints}, (_,i) => new Date(releaseDate.getTime() + (i/(numPoints-1)) * totalDays * 86400000));
  const daysArr    = datePoints.map(d => (d - releaseDate) / 86400000);
  const cumTh      = daysArr.map(d => 1 - Math.exp(-Math.min(d,theatricalDays)/halfLife));
  const maxTh      = cumTh[cumTh.length-1];
  const normTh     = cumTh.map(v => v / maxTh);
  const tail       = daysArr.map(d => d > theatricalDays ? 0.12*(1-Math.exp(-(d-theatricalDays)/60)) : 0);
  let raw          = normTh.map((v,i) => v + tail[i]);
  const maxRaw     = raw[raw.length-1];
  raw              = raw.map(v => v / maxRaw);
  const cumVals    = raw.map(v => (v * revenue) / 1e6);
  const perVals    = cumVals.map((v,i) => Math.max(0, v - (i>0?cumVals[i-1]:0)));
  const labels     = datePoints.map(d => d.toISOString().slice(0,10));
  const timeUnit   = totalDays > 365 ? "year" : totalDays > 90 ? "month" : "week";
  const sharedOpts = {
    ...CHART_DEFAULTS,
    plugins:{...CHART_DEFAULTS.plugins,tooltip:{...CHART_DEFAULTS.plugins.tooltip,callbacks:{label:ctx=>` $${ctx.parsed.y.toFixed(2)}M`}}},
    scales:{
      x:{type:"time",time:{unit:timeUnit,displayFormats:{week:"MMM d",month:"MMM yyyy",year:"yyyy"}},grid:{display:false},ticks:{color:"#3a3a4a",maxRotation:0,maxTicksLimit:7},border:{display:false}},
      y:{grid:{color:"#1a1c22"},ticks:{color:"#3a3a4a",callback:v=>`$${v.toFixed(0)}M`},border:{display:false}}
    }
  };
  const cumCtx = document.getElementById("cumulativeChart").getContext("2d");
  const grad   = cumCtx.createLinearGradient(0,0,0,220);
  grad.addColorStop(0,"rgba(201,168,76,0.22)"); grad.addColorStop(1,"rgba(201,168,76,0.01)");
  cumulativeChart = new Chart(cumCtx,{type:"line",data:{labels,datasets:[{data:cumVals,borderColor:"#c9a84c",borderWidth:2.5,pointRadius:0,pointHoverRadius:5,pointHoverBackgroundColor:"#e8d5a3",fill:true,backgroundColor:grad,tension:0.4}]},options:sharedOpts});
  const perCtx = document.getElementById("periodChart").getContext("2d");
  periodChart = new Chart(perCtx,{type:"bar",data:{labels,datasets:[{data:perVals,backgroundColor:"rgba(201,168,76,0.6)",borderColor:"#c9a84c",borderWidth:0.5,borderRadius:3}]},options:sharedOpts});
  const relStr  = releaseDate.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
  const todayStr = today.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
  chartNote.textContent = `📅 ${relStr} → ${todayStr}  ·  ${totalDays} days since release  ·  Modelled distribution`;
  revPanel.style.display = "block";
  cumulativePanel.classList.remove("hidden"); periodPanel.classList.add("hidden");
}

/* ─────────────────────────────────────────────────────
   FINANCIAL CHART
───────────────────────────────────────────────────── */
function renderFinChart(budget, revenue, profit) {
  finChart = destroyChart(finChart);
  if (!budget || !revenue) { finPanel.style.display = "none"; return; }
  finPanel.style.display = "block";
  const ctx = document.getElementById("finChart").getContext("2d");
  finChart = new Chart(ctx,{type:"bar",data:{labels:["Budget","Box Office",profit>=0?"Profit":"Loss"],datasets:[{data:[budget/1e6,revenue/1e6,Math.abs(profit)/1e6],backgroundColor:["rgba(91,143,201,0.7)","rgba(201,168,76,0.7)",profit>=0?"rgba(61,155,92,0.7)":"rgba(192,74,74,0.7)"],borderColor:["#5b8fc9","#c9a84c",profit>=0?"#3d9b5c":"#c04a4a"],borderWidth:1.5,borderRadius:8,borderSkipped:false}]},options:{...CHART_DEFAULTS,plugins:{...CHART_DEFAULTS.plugins,tooltip:{...CHART_DEFAULTS.plugins.tooltip,callbacks:{label:ctx=>` $${ctx.parsed.y.toFixed(1)}M`}}},scales:{x:{grid:{display:false},ticks:{color:"#6a6a8a",font:{size:12}},border:{display:false}},y:{grid:{color:"#1a1c22"},ticks:{color:"#3a3a4a",callback:v=>`$${v.toFixed(0)}M`},border:{display:false}}}}});
}

/* ─────────────────────────────────────────────────────
   POPULARITY CHART
───────────────────────────────────────────────────── */
function renderPopChart(rating, popularity, voteCount) {
  popChart = destroyChart(popChart);
  if (!rating && !popularity) { popPanel.style.display = "none"; return; }
  popPanel.style.display = "block";
  const ctx    = document.getElementById("popChart").getContext("2d");
  const isGame = currentMode === "game";
  const labels = isGame
    ? ["Game Rating","Popularity","Engagement"]
    : ["Audience Rating","TMDB Popularity","Vote Engagement"];
  const ratingMax = isGame ? 5 : 10;
  popChart = new Chart(ctx,{type:"bar",data:{labels,datasets:[{data:[((rating||0)/ratingMax)*100,Math.min((popularity||0)/(isGame?50000:500)*100,100),Math.min((voteCount||0)/50000*100,100)],backgroundColor:["rgba(201,168,76,0.7)","rgba(122,91,156,0.7)","rgba(91,143,201,0.7)"],borderColor:["#c9a84c","#7a5b9c","#5b8fc9"],borderWidth:1.5,borderRadius:8,borderSkipped:false}]},options:{...CHART_DEFAULTS,indexAxis:"y",plugins:{...CHART_DEFAULTS.plugins,tooltip:{...CHART_DEFAULTS.plugins.tooltip,callbacks:{label:ctx=>{const raw=[rating?`${rating.toFixed(1)}/${ratingMax}`:"N/A",popularity?popularity.toFixed(0):"N/A",voteCount?voteCount.toLocaleString():"N/A"];return ` ${raw[ctx.dataIndex]}`;},}}},scales:{x:{grid:{color:"#1a1c22"},ticks:{color:"#3a3a4a",callback:v=>`${v}%`},border:{display:false},max:100},y:{grid:{display:false},ticks:{color:"#6a6a8a",font:{size:11}},border:{display:false}}}}});
}

/* ─────────────────────────────────────────────────────
   GENRE RADAR (MOVIE / TV)
───────────────────────────────────────────────────── */
const GENRE_SCORES = {
  "Action":{action:95,adventure:60,drama:30,thriller:65,comedy:15,romance:10},"Adventure":{action:55,adventure:95,drama:35,thriller:40,comedy:20,romance:20},"Drama":{action:15,adventure:20,drama:95,thriller:40,comedy:15,romance:50},"Thriller":{action:50,adventure:30,drama:60,thriller:95,comedy:5,romance:15},"Comedy":{action:10,adventure:25,drama:30,thriller:10,comedy:95,romance:40},"Romance":{action:5,adventure:20,drama:65,thriller:15,comedy:35,romance:95},"Horror":{action:30,adventure:10,drama:25,thriller:80,comedy:5,romance:5},"Science Fiction":{action:60,adventure:70,drama:30,thriller:50,comedy:10,romance:15},"Animation":{action:30,adventure:75,drama:20,thriller:5,comedy:70,romance:20},"Crime":{action:40,adventure:20,drama:70,thriller:80,comedy:10,romance:15},"Fantasy":{action:45,adventure:80,drama:35,thriller:20,comedy:25,romance:30},"Mystery":{action:15,adventure:25,drama:55,thriller:85,comedy:5,romance:20},"Family":{action:20,adventure:60,drama:25,thriller:5,comedy:65,romance:15},"History":{action:25,adventure:30,drama:85,thriller:30,comedy:10,romance:30},"War":{action:70,adventure:40,drama:80,thriller:55,comedy:5,romance:20},"Music":{action:5,adventure:15,drama:70,thriller:10,comedy:35,romance:55},"Western":{action:75,adventure:65,drama:60,thriller:50,comedy:10,romance:20},
};

function renderRadarChart(genres) {
  radarChart = destroyChart(radarChart);
  if (!genres || !genres.length) { radarPanel.style.display = "none"; return; }
  radarPanel.style.display = "block";
  const dims   = ["action","adventure","drama","thriller","comedy","romance"];
  const scores = dims.map(dim => {
    let total = 0, count = 0;
    genres.forEach(g => { const gs = GENRE_SCORES[g.name]; if(gs){total+=gs[dim]||0;count++;} });
    return count > 0 ? total/count : 20;
  });
  const ctx = document.getElementById("radarChart").getContext("2d");
  radarChart = new Chart(ctx,{type:"radar",data:{labels:["Action","Adventure","Drama","Thriller","Comedy","Romance"],datasets:[{data:scores,backgroundColor:"rgba(201,168,76,0.15)",borderColor:"#c9a84c",borderWidth:2,pointBackgroundColor:"#c9a84c",pointBorderColor:"#13151c",pointRadius:4,pointHoverRadius:6}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{backgroundColor:"#111318",borderColor:"#272a38",borderWidth:1,titleColor:"#c9a84c",bodyColor:"#e8e4dc",padding:10,cornerRadius:8,callbacks:{label:ctx=>` ${ctx.parsed.r.toFixed(0)}`}}},scales:{r:{min:0,max:100,backgroundColor:"transparent",grid:{color:"#1e2030"},angleLines:{color:"#1e2030"},pointLabels:{color:"#5a5a7a",font:{size:11,family:"'DM Sans'"}},ticks:{display:false}}}}});
}

/* ─────────────────────────────────────────────────────
   TAB SWITCHING
───────────────────────────────────────────────────── */
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    if (btn.dataset.tab === "cumulative") {
      cumulativePanel.classList.remove("hidden"); periodPanel.classList.add("hidden");
    } else {
      periodPanel.classList.remove("hidden"); cumulativePanel.classList.add("hidden");
    }
  });
});
