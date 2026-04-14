import json
import sys
import urllib.request
import urllib.error
import base64

def github_api_request(url, token=None):
    headers = {
        'User-Agent': 'MyDiscordBot/1.0',
        'Accept': 'application/vnd.github.v3+json'
    }
    if token:
        headers['Authorization'] = f'token {token}'
    
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode('utf-8'))
    except urllib.error.URLError as e:
        return {"error": str(e)}

def list_markdown_files(owner, repo, token=None, path=""):
    url = f"https://api.github.com/repos/{owner}/{repo}/contents/{path}"
    contents = github_api_request(url, token)
    
    if isinstance(contents, dict) and "error" in contents:
        return contents
        
    if not isinstance(contents, list):
        return {"error": "Path bukan merupakan direktori atau file tidak ditemukan."}

    md_files = [f for f in contents if f['name'].endswith('.md')]
    return md_files

def fetch_file_content(download_url, token=None):
    headers = {'User-Agent': 'MyDiscordBot/1.0'}
    if token:
        headers['Authorization'] = f'token {token}'
        
    req = urllib.request.Request(download_url, headers=headers)
    try:
        with urllib.request.urlopen(req) as response:
            return response.read().decode('utf-8')
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print(json.dumps({"error": "Penggunaan: python github_fetcher.py <owner> <repo> <token> [path] [is_file]"}))
        sys.exit(1)

    owner = sys.argv[1]
    repo = sys.argv[2]
    token = sys.argv[3]
    path = sys.argv[4] if len(sys.argv) > 4 else ""
    is_file = sys.argv[5] == "true" if len(sys.argv) > 5 else False

    if is_file:
        # Fetch spesifik file
        url = f"https://api.github.com/repos/{owner}/{repo}/contents/{path}"
        file_info = github_api_request(url, token)
        if isinstance(file_info, dict) and "download_url" in file_info:
            content = fetch_file_content(file_info['download_url'], token)
            print(json.dumps({"name": path.split('/')[-1], "content": content}))
        else:
            print(json.dumps({"error": f"File '{path}' tidak ditemukan."}))
    else:
        # List semua file .md di path
        files = list_markdown_files(owner, repo, token, path)
        print(json.dumps(files))
