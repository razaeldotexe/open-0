import { SlashCommandBuilder } from 'discord.js';
import OpenZeroEmbed from '../utils/embed.js';
import { t } from '../utils/i18n.js';

export default {
    data: new SlashCommandBuilder().setName('ping').setDescription('Check bot responsiveness'),
    async execute(context) {
        const guildId = context.guild?.id;
        const wsPing = context.client.ws.ping;
        const apiPing = Date.now() - context.createdTimestamp;

        const embed = new OpenZeroEmbed({}, context)
            .setTitle('🏓 Pong!')
            .addFields(
                { name: 'WebSocket Latency', value: `${wsPing}ms`, inline: true },
                { name: 'API Latency', value: `${apiPing}ms`, inline: true }
            );

        await context.reply({ embeds: [embed] });
    },
};
