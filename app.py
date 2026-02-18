from flask import Flask, send_from_directory, redirect, request
import os

app = Flask(__name__)

# ── ROUTES ─────────────────────────────────────────────────────

@app.route("/")
def landing():
    """Serve the landing page."""
    return send_from_directory(".", "landing.html")


@app.route("/app")
def dashboard():
    """Serve the main CineInsights dashboard app."""
    return send_from_directory(".", "index.html")


@app.route("/static/<path:filename>")
def static_files(filename):
    """Serve static assets (CSS, JS)."""
    return send_from_directory(".", filename)


# Allow style.css and script.js to be served from root too
@app.route("/style.css")
def css():
    return send_from_directory(".", "style.css")


@app.route("/script.js")
def js():
    return send_from_directory(".", "script.js")


# ── RUN ────────────────────────────────────────────────────────

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_DEBUG", "true").lower() == "true"
    print(f"\n🎬  CineInsights running at http://localhost:{port}")
    print(f"    Landing  → http://localhost:{port}/")
    print(f"    App      → http://localhost:{port}/app\n")
    app.run(debug=debug, port=port)