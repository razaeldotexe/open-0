import { SlashCommandBuilder } from 'discord.js';
import { OpenZeroEmbed } from '../utils/embed.js';
import { t } from '../utils/i18n.js';

export default {
    data: new SlashCommandBuilder().setName('about').setDescription('Bot information'),
    async execute(context) {
        const guildId = context.guildId;

        const embed = new OpenZeroEmbed(
            {
                title: await t('commands.about.title', {}, guildId),
                description: await t('commands.about.desc', {}, guildId),
            },
            context
        );

        embed.addFields(
            {
                name: await t('commands.about.field_research_title', {}, guildId),
                value: await t('commands.about.field_research_value', {}, guildId),
            },
            {
                name: await t('commands.about.field_dev_title', {}, guildId),
                value: await t('commands.about.field_dev_value', {}, guildId),
            },
            {
                name: await t('commands.about.field_tech_title', {}, guildId),
                value: await t('commands.about.field_tech_value', {}, guildId),
            }
        );

        embed.setFooter({ text: await t('commands.about.footer', {}, guildId) });

        return context.reply({ embeds: [embed] });
    },
};
