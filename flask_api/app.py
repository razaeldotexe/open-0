from flask import Flask, request, jsonify, render_template_string
import sys
import os
import logging

# Setup Logging
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] [%(levelname)s] %(message)s',
    datefmt='%Y-%m-%dT%H:%M:%S'
)
logger = logging.getLogger(__name__)

# Menambahkan path fetchers ke sistem agar bisa diimport
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'fetchers')))

import arxiv_fetcher
import wiki_fetcher
import nerdfont_fetcher
import github_fetcher

app = Flask(__name__)

# Landing Page Template
INDEX_HTML = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OpenZero API | Dashboard</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body { background-color: #0f172a; color: #e2e8f0; font-family: 'Inter', sans-serif; }
        .hero { padding: 60px 0; background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-bottom: 1px solid #334155; }
        .card { background-color: #1e293b; border: 1px solid #334155; color: #f8fafc; transition: transform 0.2s; }
        .card:hover { transform: translateY(-5px); border-color: #38bdf8; }
        .badge-get { background-color: #10b981; }
        .badge-post { background-color: #3b82f6; }
        code { color: #38bdf8; background: #0f172a; padding: 2px 6px; border-radius: 4px; }
        .footer { padding: 40px 0; color: #94a3b8; font-size: 0.9rem; }
    </style>
</head>
<body>
    <div class="hero text-center">
        <div class="container">
            <h1 class="display-4 fw-bold text-info">OpenZero API</h1>
            <p class="lead text-secondary">Modular Research and Development Assistant API Service</p>
            <div class="mt-4">
                <span class="badge rounded-pill bg-success px-3 py-2">System Operational</span>
            </div>
        </div>
    </div>

    <div class="container my-5">
        <h2 class="mb-4">Available Endpoints</h2>
        <div class="row g-4">
            <!-- ArXiv -->
            <div class="col-md-6">
                <div class="card h-100 p-4">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h4 class="mb-0">arXiv Search</h4>
                        <span class="badge badge-get">GET</span>
                    </div>
                    <p class="text-secondary">Search for scientific papers in physics, mathematics, and CS.</p>
                    <code>/arxiv?q={query}</code>
                </div>
            </div>
            <!-- Wikipedia -->
            <div class="col-md-6">
                <div class="card h-100 p-4">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h4 class="mb-0">Wikipedia</h4>
                        <span class="badge badge-get">GET</span>
                    </div>
                    <p class="text-secondary">Get summaries and URLs from Wikipedia articles.</p>
                    <code>/wikipedia?q={query}&lang={id|en}</code>
                </div>
            </div>
            <!-- NerdFont -->
            <div class="col-md-6">
                <div class="card h-100 p-4">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h4 class="mb-0">Nerd Fonts</h4>
                        <span class="badge badge-get">GET</span>
                    </div>
                    <p class="text-secondary">Search and retrieve download links for developer fonts.</p>
                    <code>/nerdfont?q={query}</code>
                </div>
            </div>
            <!-- Github Scan -->
            <div class="col-md-6">
                <div class="card h-100 p-4">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h4 class="mb-0">GitHub Scanner</h4>
                        <span class="badge badge-post">POST</span>
                    </div>
                    <p class="text-secondary">Recursively scan repository contents for Markdown files.</p>
                    <code>/github/scan</code>
                </div>
            </div>
        </div>
    </div>

    <footer class="footer text-center">
        <div class="container">
            <p>&copy; 2026 OpenZero Project. Built with Flask & Gunicorn.</p>
        </div>
    </footer>
</body>
</html>
"""

@app.route('/')
def index():
    return render_template_string(INDEX_HTML)

@app.route('/arxiv', methods=['GET'])
def get_arxiv():
    query = request.args.get('q')
    if not query:
        return jsonify({"error": "Query required"}), 400
    return jsonify(arxiv_fetcher.fetch_arxiv(query))

@app.route('/wikipedia', methods=['GET'])
def get_wikipedia():
    query = request.args.get('q')
    lang = request.args.get('lang', 'id')
    if not query:
        return jsonify({"error": "Query required"}), 400
    return jsonify(wiki_fetcher.fetch_wikipedia_data(query, lang))

@app.route('/nerdfont', methods=['GET'])
def get_nerdfont():
    query = request.args.get('q')
    if not query:
        return jsonify({"error": "Query required"}), 400
    return jsonify(nerdfont_fetcher.fetch_fonts(query))

@app.route('/github/scan', methods=['POST'])
def scan_github():
    data = request.json
    owner = data.get('owner')
    repo = data.get('repo')
    token = data.get('token')
    path = data.get('path', '')
    
    if not owner or not repo:
        return jsonify({"error": "Owner and repo required"}), 400
    
    logger.info(f"Scanning Github: {owner}/{repo} path='{path}'")
    result = github_fetcher.scan_recursive(owner, repo, token, path)
    
    if isinstance(result, dict) and "error" in result:
        status_code = 403 if "403" in result["error"] else 500
        logger.error(f"Scan Error: {result['error']}")
        return jsonify(result), status_code
        
    return jsonify(result)

@app.route('/github/content', methods=['POST'])
def get_github_content():
    data = request.json
    owner = data.get('owner')
    repo = data.get('repo')
    token = data.get('token')
    path = data.get('path')
    
    if not owner or not repo or not path:
        return jsonify({"error": "Owner, repo, and path required"}), 400
        
    logger.info(f"Fetching Content: {owner}/{repo} file='{path}'")
    url = f"https://api.github.com/repos/{owner}/{repo}/contents/{path}"
    file_info = github_fetcher.github_api_request(url, token)
    
    if isinstance(file_info, dict) and "error" in file_info:
        status_code = 403 if "403" in file_info["error"] else 500
        logger.error(f"Content Request Error: {file_info['error']}")
        return jsonify(file_info), status_code

    if isinstance(file_info, dict) and "download_url" in file_info:
        content = github_fetcher.fetch_file_content(file_info['download_url'], token)
        if isinstance(content, dict) and "error" in content:
            return jsonify(content), 500
        return jsonify({"name": path.split('/')[-1], "content": content})
    else:
        return jsonify({"error": f"File '{path}' not found or metadata missing."}), 404

@app.errorhandler(Exception)
def handle_exception(e):
    logger.error(f"Unhandled Exception: {str(e)}")
    return jsonify({"error": "Internal Server Error", "message": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    # Menggunakan host 0.0.0.0 agar bisa diakses secara publik di Railway
    app.run(host='0.0.0.0', port=port)
