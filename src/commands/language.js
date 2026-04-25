import { SlashCommandBuilder } from 'discord.js';
import { t, setLanguage } from '../utils/i18n.js';
import { SUPPORTED_LANGUAGES } from '../utils/languages.js';
import { detectLanguageWithAI, resolveLanguageNameWithAI } from '../API/ai_manager.js';
import Logger from '../utils/logger.js';

export default {
    data: new SlashCommandBuilder()
        .setName('language')
        .setDescription('Set bot language')
        .addSubcommand((subcommand) =>
            subcommand.setName('list').setDescription('List all supported languages')
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('set')
                .setDescription('Set the bot language for this server')
                .addStringOption((option) =>
                    option.setName('lang').setDescription('The language name').setRequired(true)
                )
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('auto')
                .setDescription('Detect language from text and set it')
                .addStringOption((option) =>
                    option.setName('text').setDescription('The text to detect').setRequired(true)
                )
        ),
    async execute(interaction) {
        if (!interaction.isChatInputCommand?.()) {
            return interaction.reply('This command only supports slash commands.');
        }

        const guildId = interaction.guildId;
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'list') {
            const listTitle = await t('commands.language.list_title', {}, guildId);
            const langList = SUPPORTED_LANGUAGES.join(', ');
            return interaction.reply({ content: `**${listTitle}**\n${langList}`, ephemeral: true });
        }

        if (subcommand === 'set') {
            const langInput = interaction.options.getString('lang');
            const resolvedLang = await resolveLanguageNameWithAI(langInput, SUPPORTED_LANGUAGES);

            if (!resolvedLang) {
                const invalidMsg = await t('commands.language.invalid', {}, guildId);
                return interaction.reply({ content: invalidMsg, ephemeral: true });
            }

            await setLanguage(guildId, resolvedLang);
            const successMsg = await t(
                'commands.language.set_success',
                { lang: resolvedLang },
                guildId
            );
            return interaction.reply(successMsg);
        }

        if (subcommand === 'auto') {
            const text = interaction.options.getString('text');
            await interaction.deferReply({ ephemeral: true });

            try {
                const detectedLang = await detectLanguageWithAI(text, SUPPORTED_LANGUAGES);
                if (detectedLang) {
                    await setLanguage(guildId, detectedLang);
                    const successMsg = await t(
                        'commands.language.auto_success',
                        { lang: detectedLang },
                        guildId
                    );
                    return interaction.editReply(successMsg);
                }
            } catch (error) {
                Logger.error('Language auto-detection failed:', error);
            }

            return interaction.editReply('Failed to detect language.');
        }
    },
};
