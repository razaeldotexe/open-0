# OpenZero Project Context

OpenZero is a modular research assistant Discord bot designed to connect users with Open Data sources. It utilizes a hybrid architecture combining a Node.js-based Discord client and a Python Flask API for specialized data fetching.

## Project Overview

- **Discord Bot (Node.js):** Built with `discord.js v14`. It handles user interactions via a hybrid command system (supporting both Slash Commands and legacy Prefix commands).
- **Backend API (Flask):** A Python service that performs intensive data retrieval from sources like arXiv, Wikipedia, GitHub, and Open Library.
- **AI Integration:** Implements a robust fallback system using Google (Gemini), Groq (Llama/Mixtral), and OpenRouter (various models). Models are centrally configured in `src/config.js`.
- **Localization:** A per-guild i18n system (`src/utils/i18n.js`) backed by MongoDB, supporting 31 languages.

## Architecture

- **`src/index.js`:** Entry point. Initializes the Discord client, handles events, and routes interactions to the appropriate command handler.
- **`src/commands/`:** Modular command handlers. Each file exports a command object with a `data` (SlashCommandBuilder) and an `execute` method that supports both Message and Interaction contexts.
- **`src/deploy-commands.js`:** Utility script to register slash commands with Discord.

...

## Building and Running

### Node.js Bot
- **Deploy Commands:** `npm run deploy` (Must be run before slash commands appear in Discord)
- **Run Bot:** `npm start`
- **Development Mode:** `npm run dev`
...
- **Modular Commands:** When adding a new command, ensure it exports a `data` property and its `execute` method is fully localized using the `await t()` function.
...
### Flask API
- **Setup:** `pip install -r flask_api/requirements.txt`
- **Run API:** `python flask_api/app.py` (Defaults to port 8080)

### Environment Variables (.env)
The bot requires several keys to function correctly:
- `DISCORD_TOKEN`: Discord Bot Token.
- `GITHUB_TOKEN`: GitHub Personal Access Token.
- `GEMINI_API_KEY`: Google AI Key.
- `GROQ_API_KEY`: Groq API Key.
- `OPENROUTER_API_KEY`: OpenRouter API Key.
- `API_URL`: URL of the running Flask API (Defaults to `http://localhost:8080`).

## Development Conventions

- **Modular Commands:** When adding a new command, ensure it is fully localized using the `t()` function from `src/utils/i18n.js`.
- **AI Fallback:** Use the functions in `src/API/ai_manager.js` to leverage the multi-provider AI system.
- **Localization:** 
    - The community manages translations via **Crowdin**.
    - The master template is `src/locales/en-US.json`.
    - Translations are exported to `/src/locales/%locale%.json`.
- **Logging:** Use the colorized `Logger` utility in `src/utils/logger.js` for all console output.
- **File Watching:** Do not add files to the root directory that trigger `nodemon` restarts unless they are added to `nodemon.json`'s ignore list.
