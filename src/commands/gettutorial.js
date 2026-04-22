import {
    SlashCommandBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ComponentType,
} from 'discord.js';
import { fetchAllTutorialsEmbeds, fetchAllTutorialsRaw } from '../API/github_manager.js';
import { findRelevantFileWithAI } from '../API/ai_manager.js';
import { t } from '../utils/i18n.js';
import Logger from '../utils/logger.js';

export default {
    data: new SlashCommandBuilder()
        .setName('gettutorial')
        .setDescription('Get a tutorial by name')
        .addStringOption((option) =>
            option.setName('name').setDescription('The name of the tutorial').setRequired(false)
        ),
    async execute(context, args) {
        const guildId = context.guild?.id;
        const isInteraction = context.isChatInputCommand?.();
        const user = isInteraction ? context.user : context.author;
        const query = isInteraction ? context.options.getString('name') : args.join(' ');

        let loadingMsg;
        if (isInteraction) {
            await context.deferReply();
        } else {
            loadingMsg = await context.reply(await t('common.loading', {}, guildId));
        }

        const editResponse = async (options) => {
            if (isInteraction) return await context.editReply(options);
            if (loadingMsg) return await loadingMsg.edit(options);
            return await context.reply(options);
        };

        try {
            if (query) {
                Logger.info(`AI search query: ${query}`);

                const rawFiles = await fetchAllTutorialsRaw();

                if (!rawFiles || rawFiles.size === 0) {
                    return await editResponse({
                        content: await t('commands.gettutorial.no_tutorials', {}, guildId),
                    });
                }

                try {
                    const matchedFileName = await findRelevantFileWithAI(query, rawFiles);

                    if (matchedFileName) {
                        const allTutorials = await fetchAllTutorialsEmbeds();
                        const embeds = allTutorials.get(matchedFileName);

                        if (embeds) {
                            Logger.info(`Found relevant file: ${matchedFileName}`);
                            return await editResponse({
                                content: await t(
                                    'commands.gettutorial.ai_found',
                                    {
                                        file: matchedFileName,
                                    },
                                    guildId
                                ),
                                embeds,
                            });
                        }
                    }

                    return await editResponse({
                        content: await t('commands.gettutorial.no_relevant', { query }, guildId),
                    });
                } catch (aiError) {
                    if (aiError.message === 'All providers reached their limits.') {
                        return await editResponse({
                            content: await t('commands.gettutorial.ai_limit', {}, guildId),
                        });
                    }
                    throw aiError;
                }
            }

            const allTutorials = await fetchAllTutorialsEmbeds();
            const fileNames = Array.from(allTutorials.keys());

            if (fileNames.length === 0) {
                return await editResponse({
                    content: await t('commands.gettutorial.no_found_repo', {}, guildId),
                });
            }

            if (fileNames.length === 1) {
                const fileName = fileNames[0];
                const embeds = allTutorials.get(fileName);
                return await editResponse({
                    content: await t('commands.gettutorial.showing', { file: fileName }, guildId),
                    embeds,
                });
            }

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('select_tutorial')
                .setPlaceholder(await t('commands.gettutorial.select_placeholder', {}, guildId))
                .addOptions(
                    fileNames.map((name) => ({
                        label: name.replace('.md', ''),
                        value: name,
                    }))
                );

            const row = new ActionRowBuilder().addComponents(selectMenu);

            const responseMsg = await editResponse({
                content: await t('commands.gettutorial.choose_list', {}, guildId),
                components: [row],
            });

            if (!responseMsg) return;

            const collector = responseMsg.createMessageComponentCollector({
                componentType: ComponentType.StringSelect,
                time: 60000,
            });

            collector.on('collect', async (interaction) => {
                if (interaction.user.id !== user.id)
                    return interaction.reply({
                        content: await t('common.access_denied', {}, guildId),
                        ephemeral: true,
                    });
                const selectedFile = interaction.values[0];
                const embeds = allTutorials.get(selectedFile);
                await interaction.update({
                    content: await t(
                        'commands.gettutorial.showing',
                        { file: selectedFile },
                        guildId
                    ),
                    embeds,
                    components: [],
                });
            });
        } catch (error) {
            Logger.error('Tutorial Search Error:', error);
            await editResponse({
                content: await t('common.error', { error: error.message }, guildId),
            });
        }
    },
};
