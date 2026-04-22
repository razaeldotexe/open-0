import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import Logger from './utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
for (const file of commandFiles) {
    const filePath = pathToFileURL(path.join(commandsPath, file)).href;
    const { default: command } = await import(filePath);
    if (command && command.data) {
        commands.push(command.data.toJSON());
    } else {
        Logger.warn(`[Deploy] The command at ${file} is missing a required "data" property.`);
    }
}

// Construct and prepare an instance of the REST module
const { DISCORD_TOKEN, CLIENT_ID, GUILD_ID } = process.env;

if (!DISCORD_TOKEN || !CLIENT_ID) {
    Logger.error(
        '[Deploy] Missing required environment variables (DISCORD_TOKEN or CLIENT_ID). Please check your Railway environment variables or .env file.'
    );
    process.exit(1);
}

const rest = new REST().setToken(DISCORD_TOKEN);

// and deploy your commands!
(async () => {
    try {
        Logger.info(`Started refreshing ${commands.length} application (/) commands.`);

        // The put method is used to fully refresh all commands in the guild with the current set
        // If GUILD_ID is not provided in .env, it will deploy globally
        const data = GUILD_ID
            ? await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
                  body: commands,
              })
            : await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });

        const scope = GUILD_ID ? `guild (${GUILD_ID})` : 'global';
        Logger.info(
            `Successfully reloaded ${data.length} application (/) commands [Scope: ${scope}].`
        );
    } catch (error) {
        // And of course, make sure you catch and log any errors!
        Logger.error('[Deploy] Error deploying commands:', error);
    }
})();
