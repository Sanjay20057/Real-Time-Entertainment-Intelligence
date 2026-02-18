from flask import Flask, send_from_directory
import os

app = Flask(__name__)

# ── ROUTES ─────────────────────────────────────────────

# Landing page
@app.route("/")
def landing():
    return send_from_directory(".", "landing.html")


# Main dashboard page
@app.route("/app")
def dashboard():
    return send_from_directory(".", "index.html")


# Serve CSS
@app.route("/style.css")
def serve_css():
    return send_from_directory(".", "style.css")


# Serve JS
@app.route("/script.js")
def serve_js():
    return send_from_directory(".", "script.js")


# Serve other static files if needed (images, etc.)
@app.route("/<path:filename>")
def serve_files(filename):
    return send_from_directory(".", filename)


# ── RUN SERVER ─────────────────────────────────────────

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
