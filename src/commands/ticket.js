import {
    SlashCommandBuilder,
    PermissionFlagsBits,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} from 'discord.js';
import { OpenZeroEmbed } from '../utils/embed.js';
import { t } from '../utils/i18n.js';

export default {
    data: new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Ticket system setup')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand((subcommand) =>
            subcommand.setName('setup').setDescription('Setup the ticket system in this channel')
        ),
    async execute(interaction) {
        if (!interaction.isChatInputCommand?.()) {
            return interaction.reply('This command only supports slash commands.');
        }

        const guildId = interaction.guildId;
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'setup') {
            const setupTitle = await t('commands.ticket.setup_title', {}, guildId);
            const setupDesc = await t('commands.ticket.setup_desc', {}, guildId);
            const setupBtnLabel = await t('commands.ticket.setup_btn', {}, guildId);

            const embed = new OpenZeroEmbed({
                title: setupTitle,
                description: setupDesc,
            });

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('create_ticket')
                    .setLabel(setupBtnLabel)
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🎫')
            );

            await interaction.reply({
                content: await t('commands.ticket.setup_success', {}, guildId),
                ephemeral: true,
            });

            return interaction.channel.send({ embeds: [embed], components: [row] });
        }
    },
};
