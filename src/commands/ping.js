import { SlashCommandBuilder } from 'discord.js';
import { t } from '../utils/i18n.js';

export default {
    data: new SlashCommandBuilder().setName('ping').setDescription('Check bot responsiveness'),
    async execute(context) {
        const guildId = context.guildId;
        const reply = await t('commands.ping.reply', {}, guildId);
        return context.reply(reply);
    },
};
