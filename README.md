# OpenZero

<p align="center">
  <img src="./assets/openzero_full.png" width="600" alt="OpenZero Logo">
</p>

OpenZero is a modular Discord bot designed as a research and development assistant. It connects users directly to various Open Data sources through a separate Flask-based API.

## Core Features

- **AI-Powered Tutorial Search (`!tutorial`)**: Scan the entire repository recursively and use AI (Gemini, Groq, or OpenRouter) to find the most relevant tutorial based on your query.
- **arXiv Search (`!arxiv`)**: Search for scientific papers in physics, mathematics, computer science, and more.
- **Wikipedia (`!wikipedia`)**: Get article summaries directly in Discord.
- **Open Library (`!openlibrary`)**: Access a catalog of millions of digital books.
- **Nerd Fonts (`!nerdfont`)**: Search and download developer fonts.

## Technology Stack

- **Bot:** Node.js v18+ & Discord.js v14 (ES Modules)
- **API:** Flask (Python) - Hosted separately.
- **AI Integration:** Gemini, Groq (Llama 3.1), and OpenRouter.

## Installation

1. Clone the repository.
2. Create a `.env` file based on `.env.example`.
3. Fill in the required tokens:
   - `DISCORD_TOKEN`
   - `GITHUB_TOKEN`
   - `GEMINI_API_KEY`
   - `GROQ_API_KEY`
   - `OPENROUTER_API_KEY`
   - `API_URL` (URL of your deployed Flask API)
4. Install dependencies:
   ```bash
   npm install
   ```

## Project Structure

- `src/index.js`: Main entry point for the bot.
- `src/commands/`: Discord command logic.
- `src/API/`: API managers that communicate with the Flask service.
- `src/utils/`: Utility functions and logging system.
- `flask_api/`: (Optional) The Flask API project source if kept in the same mono-repo.

## Deployment

### Bot (Railway)
The bot is deployed using GitHub Actions. Ensure you have `RAILWAY_TOKEN` and `RAILWAY_SERVICE_ID` in your GitHub Secrets.

### API (Railway)
The Flask API in the `flask_api/` folder should be deployed as its own service on Railway.
