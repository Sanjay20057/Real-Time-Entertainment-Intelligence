# 🎬 Real Time Entertainment Intelligence

> A cinematic Movie & TV Show analytics dashboard powered by the TMDB API — featuring box office data, cast insights, popularity trends, financial breakdowns, and more.

![Dashboard Preview](https://img.shields.io/badge/status-live-brightgreen?style=flat-square) ![HTML](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white) ![CSS](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black) ![TMDB](https://img.shields.io/badge/TMDB-01B4E4?style=flat-square&logo=themoviedatabase&logoColor=white)

---

## ✨ Features

- **Dual Mode** — Switch seamlessly between Movies and TV Shows
- **Box Office Analytics** — Budget, worldwide revenue, profit/loss, and ROI with an animated progress bar
- **Revenue Trend Charts** — Cumulative and period-based modelled revenue distribution over time
- **Financial Breakdown** — Visual bar chart comparing budget, box office, and profit
- **Popularity Metrics** — Audience rating, TMDB popularity score, and vote engagement visualised
- **Genre Radar Chart** — Six-axis radar mapping Action, Adventure, Drama, Thriller, Comedy, and Romance
- **Key Talent Grid** — Director/Creator + top cast with profile photos, names, and roles
- **TV-Specific Data** — Seasons browser with episode counts, network info, show type, and episode length
- **Production Companies / Networks** — Logo display with country of origin
- **Countries & Languages** — Origin countries and spoken languages for every title
- **Collection Tracker** — Shows whether a movie belongs to a franchise/collection
- **Audience Score Ring** — Animated SVG ring showing the TMDB vote average
- **Responsive Design** — Fully optimised for desktop, tablet, and mobile
- **Keyboard Shortcuts** — `⌘K` / `Ctrl+K` to focus search anywhere on the page
- **Search Autocomplete** — Live suggestions as you type with keyboard navigation

---

## 📸 Screenshots

| Landing | Movie Dashboard | TV Show |
|---|---|---|
| *Search landing page with hint chips* | *Full analytics dashboard* | *Seasons, networks & episode data* |

---

## 🚀 Getting Started

### Prerequisites

- A free [TMDB API key](https://www.themoviedb.org/settings/api)
- Any static file server (or just open `index.html` directly in a browser)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/entertainment-dashboard.git
   cd entertainment-dashboard
   ```

2. **Add your TMDB API key**

   Open `static/script.js` and replace the placeholder on line 2:
   ```js
   const API_KEY = "your_tmdb_api_key_here";
   ```

3. **Run locally**

   Open `index.html` directly in your browser, or serve it with any static server:
   ```bash
   # Using Python
   python -m http.server 8000

   # Using Node.js (npx)
   npx serve .

   # Using VS Code
   # Install the "Live Server" extension and click "Go Live"
   ```

4. **Open in browser**
   ```
   http://localhost:8000
   ```

---

## 📁 Project Structure

```
entertainment-dashboard/
├── index.html          # Main HTML — layout, inline responsive styles
├── static/
│   ├── style.css       # Global styles, design tokens, component styles
│   └── script.js       # All JS — search, API calls, chart rendering
└── README.md
```

> **Note:** The project is intentionally zero-dependency on the backend — it's a pure static frontend. Chart.js is loaded via CDN.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Markup | HTML5 |
| Styling | CSS3 (custom properties, grid, flexbox, animations) |
| Logic | Vanilla JavaScript (ES2020+) |
| Charts | [Chart.js 4.4](https://www.chartjs.org/) via CDN |
| Date adapter | [chartjs-adapter-date-fns](https://github.com/chartjs/chartjs-adapter-date-fns) via CDN |
| Fonts | [Bebas Neue](https://fonts.google.com/specimen/Bebas+Neue) + [DM Sans](https://fonts.google.com/specimen/DM+Sans) via Google Fonts |
| Data | [TMDB API v3](https://developer.themoviedb.org/docs) |

---

## 🔌 API Usage

This project uses the following [TMDB API](https://developer.themoviedb.org/) endpoints:

| Endpoint | Used For |
|---|---|
| `GET /search/movie` | Movie search autocomplete |
| `GET /search/tv` | TV show search autocomplete |
| `GET /movie/{id}` | Movie details, financials, genres, production |
| `GET /movie/{id}/credits` | Director and cast data |
| `GET /tv/{id}` | Show details, seasons, networks, creators |
| `GET /tv/{id}/credits` | Cast data for TV shows |
| `https://image.tmdb.org/t/p/` | Poster, backdrop, and profile images |

> Revenue trend charts are **modelled/estimated** using a theatrical decay curve — TMDB does not provide weekly box office breakdowns.

---

## 📱 Responsive Behaviour

| Breakpoint | Layout |
|---|---|
| `> 1024px` | Sidebar (320px) + content area, 2-column chart grid |
| `769px – 1024px` | Sidebar (260px) + content area, 2-column chart grid |
| `≤ 768px` | Single column stacked, full-width poster (2:3 ratio), 1-column charts |
| `≤ 480px` | Compact stat ribbon, 3-column cast grid, smaller charts |
| `≤ 360px` | 2-column cast grid, minimised header |

On mobile, a sticky search bar with a "Back to Home" link is pinned below the header, replacing the desktop inline search.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `⌘K` / `Ctrl+K` | Focus search input |
| `↑` / `↓` | Navigate autocomplete suggestions |
| `Enter` | Select highlighted suggestion |
| `Escape` | Close suggestions dropdown |

---

## 🎨 Design Tokens

Key CSS variables defined in `:root`:

```css
--gold:      #c9a84c   /* Primary accent — gold */
--gold-lt:   #e8d5a3   /* Light gold for headings */
--bg:        #07080d   /* Page background */
--surface:   #111318   /* Card/panel background */
--text:      #e8e4dc   /* Primary text */
--muted:     #5c5c6e   /* Secondary / label text */
--green-lt:  #6ccc94   /* Profit / positive indicator */
--red-lt:    #e87a7a   /* Loss / negative indicator */
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repo
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Ideas for Contribution

- [ ] Add trailer embed (YouTube via TMDB video endpoint)
- [ ] Similar movies / recommended shows section
- [ ] Dark/light theme toggle
- [ ] Share / permalink support via URL params
- [ ] PWA support (offline caching, installable)
- [ ] Watchlist with localStorage persistence
- [ ] Comparison mode (two titles side-by-side)

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgements

- Movie and TV data provided by [The Movie Database (TMDB)](https://www.themoviedb.org/)
- Charts powered by [Chart.js](https://www.chartjs.org/)
- Fonts by [Google Fonts](https://fonts.google.com/)

> This product uses the TMDB API but is not endorsed or certified by TMDB.

---

<p align="center">Made with ☕ and way too many movie nights</p>
