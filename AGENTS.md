# Agent Context: openzero

## Project Type

Discord Bot (Modular Command Handler)

## Framework & Language

- Discord.js v14
- Node.js (ES Modules)
- Python (API fetcher helpers in `/API`)

## Architecture

- Single entry point: `index.js`
- Commands are auto-loaded from `commands/` folder
- Each command exports: `{ name, description, execute(message, args) }`
- Environment variables: `DISCORD_TOKEN` via dotenv

## Commands

- `npm start` - Run bot
- `npm run dev` - Run with nodemon
- `npm run deploy` - Register Discord slash commands
- `npm run build` - Build bot (includes command registration)
- `npm test` - Run tests
- `npm run lint` / `npm run format` - Code quality

## Notes

- Prefix: `!`
- Intents required: Guilds, GuildMessages, MessageContent
- Bot activity text: ".help | All endpoints have been collected."
