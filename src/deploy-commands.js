import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import Logger from './utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { DISCORD_TOKEN, CLIENT_ID, GUILD_ID } = process.env;

if (!DISCORD_TOKEN || !CLIENT_ID) {
    Logger.error('[Deploy] Missing required environment variables (DISCORD_TOKEN or CLIENT_ID).');
    process.exit(1);
}

const commands = [];
const commandsPath = path.join(__dirname, 'commands');

if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = pathToFileURL(path.join(commandsPath, file)).href;
        const { default: command } = await import(filePath);
        if (command && command.data) {
            commands.push(command.data.toJSON());
        }
    }
}

const rest = new REST().setToken(DISCORD_TOKEN);

(async () => {
    try {
        Logger.info(`Started refreshing ${commands.length} application (/) commands.`);

        if (GUILD_ID) {
            const data = await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
                body: commands,
            });
            Logger.info(
                `Successfully reloaded ${data.length} application (/) commands for guild ${GUILD_ID}.`
            );
        } else {
            const data = await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
            Logger.info(`Successfully reloaded ${data.length} global application (/) commands.`);
        }
    } catch (error) {
        Logger.error('[Deploy] Error reloading commands:', error);
    }
})();
