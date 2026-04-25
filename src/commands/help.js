import { SlashCommandBuilder } from 'discord.js';
import { OpenZeroEmbed } from '../utils/embed.js';
import { t } from '../utils/i18n.js';

export default {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Displays a list of all available commands'),
    async execute(context) {
        const isInteraction = context.isChatInputCommand?.();
        const guildId = context.guildId;
        const client = context.client;

        const embed = new OpenZeroEmbed(
            {
                title: await t('commands.help.title', {}, guildId),
                description: await t('commands.help.desc_text', {}, guildId),
            },
            context
        );

        const commands = client.commands;
        const uniqueCommands = new Set(commands.values());

        for (const command of uniqueCommands) {
            const name = command.data?.name || command.name;
            const description =
                command.data?.description ||
                command.description ||
                (await t('commands.help.no_desc', {}, guildId));

            embed.addFields({
                name: `/${name}`,
                value: description,
                inline: true,
            });
        }

        embed.setFooter({
            text: await t(
                'commands.help.footer',
                { username: isInteraction ? context.user.username : context.author.username },
                guildId
            ),
        });

        return isInteraction
            ? context.reply({ embeds: [embed], ephemeral: true })
            : context.reply({ embeds: [embed] });
    },
};
