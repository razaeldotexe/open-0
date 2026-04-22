import { SlashCommandBuilder } from 'discord.js';
import { config } from '../config.js';
import { t } from '../utils/i18n.js';
import Logger from '../utils/logger.js';

export default {
    data: new SlashCommandBuilder()
        .setName('restart')
        .setDescription('Restart the Bot and API (Admin only)'),
    async execute(context) {
        const guildId = context.guild?.id;
        const isInteraction = context.isChatInputCommand?.();
        const user = isInteraction ? context.user : context.author;

        // Logging attempt
        Logger.info(`Restart command triggered by user: ${user.tag} (${user.id})`);

        // Restriction: Only for specific Admin ID
        if (user.id !== config.adminId) {
            Logger.warn(
                `Access denied for user: ${user.tag} (${user.id}). Required: ${config.adminId}`
            );
            return context.reply({
                content: await t('common.access_denied', {}, guildId),
                ephemeral: true,
            });
        }

        Logger.info(`Admin access granted for ${user.tag}. Starting restart sequence...`);

        if (isInteraction) {
            await context.deferReply({ ephemeral: true });
        } else {
            await context.reply(await t('commands.restart.starting', {}, guildId));
        }

        const editResponse = async (msg) => {
            if (isInteraction) return await context.editReply({ content: msg });
            return await context.channel.send(msg);
        };

        const hasRailwayConfig =
            config.railwayApiKey &&
            config.railwayEnvironmentId &&
            (config.railwayApiServiceId || config.railwayBotServiceId);

        if (hasRailwayConfig) {
            // Restart API Service if configured
            if (config.railwayApiServiceId) {
                try {
                    Logger.info('Restarting API via Railway API...');
                    await restartRailwayService(
                        config.railwayApiServiceId,
                        config.railwayEnvironmentId
                    );
                    await editResponse(await t('commands.restart.api_success', {}, guildId));
                } catch (error) {
                    Logger.error('Failed to restart API:', error);
                    await editResponse(
                        await t('commands.restart.api_failed', { error: error.message }, guildId)
                    );
                }
            }

            // Restart Bot Service
            if (config.railwayBotServiceId) {
                try {
                    Logger.info('Restarting Bot via Railway API...');
                    await editResponse(await t('commands.restart.bot_success', {}, guildId));
                    // Delay slightly to ensure message is sent
                    setTimeout(async () => {
                        await restartRailwayService(
                            config.railwayBotServiceId,
                            config.railwayEnvironmentId
                        );
                    }, 2000);
                } catch (error) {
                    Logger.error('Failed to restart Bot via API:', error);
                    await editResponse(
                        await t('commands.restart.api_failed', { error: error.message }, guildId)
                    );
                    // Fallback to process.exit()
                    setTimeout(() => process.exit(1), 2000);
                }
            } else {
                // If Bot Service ID not provided, but API key exists, just exit
                await editResponse(await t('commands.restart.bot_success', {}, guildId));
                setTimeout(() => process.exit(1), 2000);
            }
        } else {
            // No Railway API configured, fallback to process.exit()
            await editResponse(await t('commands.restart.railway_not_configured', {}, guildId));
            setTimeout(() => process.exit(1), 2000);
        }
    },
};

/**
 * Restarts a Railway service using the Public API (v2)
 * @param {string} serviceId
 * @param {string} environmentId
 */
async function restartRailwayService(serviceId, environmentId) {
    const query = `
        mutation serviceInstanceRedeploy($serviceId: String!, $environmentId: String!) {
            serviceInstanceRedeploy(serviceId: $serviceId, environmentId: $environmentId)
        }
    `;

    const response = await fetch('https://backboard.railway.app/graphql/v2', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${config.railwayApiKey}`,
        },
        body: JSON.stringify({
            query,
            variables: { serviceId, environmentId },
        }),
    });

    const result = await response.json();

    if (result.errors) {
        throw new Error(result.errors[0].message);
    }

    return result.data.serviceInstanceRedeploy;
}
