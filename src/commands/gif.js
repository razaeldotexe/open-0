import {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType,
} from 'discord.js';
import { APIClient } from '../API/api_client.js';
import Logger from '../utils/logger.js';
import { t } from '../utils/i18n.js';

export default {
    data: new SlashCommandBuilder()
        .setName('gif')
        .setDescription('Search for AI-optimized GIFs or see trending ones')
        .addSubcommand((subcommand) =>
            subcommand
                .setName('search')
                .setDescription('Search for a GIF using AI optimization')
                .addStringOption((option) =>
                    option
                        .setName('query')
                        .setDescription('The GIF you are looking for')
                        .setRequired(true)
                )
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('trending')
                .setDescription('See trending GIFs')
                .addIntegerOption((option) =>
                    option
                        .setName('limit')
                        .setDescription('Number of GIFs to show (max 20)')
                        .setMinValue(1)
                        .setMaxValue(20)
                )
        ),
    async execute(context, args) {
        const guildId = context.guild?.id;
        const isInteraction = context.isChatInputCommand?.();
        const user = isInteraction ? context.user : context.author;

        let subcommand, query, limit;

        if (isInteraction) {
            subcommand = context.options.getSubcommand();
            query = context.options.getString('query');
            limit = context.options.getInteger('limit') || 10;
        } else {
            // Prefix: !gif search <query> OR !gif trending [limit]
            subcommand = args[0]?.toLowerCase();
            if (subcommand === 'search') {
                query = args.slice(1).join(' ');
            } else if (subcommand === 'trending') {
                limit = parseInt(args[1]) || 10;
            } else {
                // Default to search if no subcommand provided but query exists
                if (args.length > 0) {
                    subcommand = 'search';
                    query = args.join(' ');
                } else {
                    const usage = 'Usage: `!gif search <query>` or `!gif trending [limit]`';
                    return context.reply(usage);
                }
            }
        }

        if (subcommand === 'search' && !query) {
            const msg = await t('commands.gif.query_required', {}, guildId);
            return context.reply(msg);
        }

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
            if (subcommand === 'search') {
                const gif = await APIClient.post('/gif/search', { query });

                if (!gif || gif.error) {
                    const noResults = await t('commands.gif.no_results', { query }, guildId);
                    return await editResponse({ content: noResults });
                }

                const embed = new EmbedBuilder()
                    .setColor('#20f0f2')
                    .setTitle(gif.title || 'GIF')
                    .setImage(gif.original_url)
                    .setAuthor({
                        name: await t(
                            'commands.gif.requested_by',
                            { username: user.username },
                            guildId
                        ),
                        iconURL: user.displayAvatarURL({ dynamic: true }),
                    })
                    .setFooter({ text: await t('commands.gif.footer', {}, guildId) })
                    .setTimestamp();

                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setLabel('View on Giphy')
                        .setStyle(ButtonStyle.Link)
                        .setURL(gif.source_link)
                );

                await editResponse({ content: null, embeds: [embed], components: [row] });
            } else if (subcommand === 'trending') {
                const gifs = await APIClient.get(`/gif/trending?limit=${limit}`);

                if (!Array.isArray(gifs) || gifs.length === 0) {
                    const noResults = await t(
                        'commands.gif.no_results',
                        { query: 'trending' },
                        guildId
                    );
                    return await editResponse({ content: noResults });
                }

                let currentIdx = 0;

                const createEmbed = async (idx) => {
                    const gif = gifs[idx];
                    return new EmbedBuilder()
                        .setColor('#20f0f2')
                        .setTitle(gif.title || 'Trending GIF')
                        .setImage(gif.original_url)
                        .setAuthor({
                            name: await t(
                                'commands.gif.requested_by',
                                { username: user.username },
                                guildId
                            ),
                            iconURL: user.displayAvatarURL({ dynamic: true }),
                        })
                        .setFooter({
                            text: await t(
                                'commands.gif.trending_footer',
                                {
                                    current: idx + 1,
                                    total: gifs.length,
                                },
                                guildId
                            ),
                        })
                        .setTimestamp();
                };

                const createButtons = async (idx) => {
                    const gif = gifs[idx];
                    return new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId('prev_gif')
                            .setLabel(await t('commands.gif.prev', {}, guildId))
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(idx === 0),
                        new ButtonBuilder()
                            .setCustomId('next_gif')
                            .setLabel(await t('commands.gif.next', {}, guildId))
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(idx === gifs.length - 1),
                        new ButtonBuilder()
                            .setLabel('View on Giphy')
                            .setStyle(ButtonStyle.Link)
                            .setURL(gif.source_link)
                    );
                };

                const responseMsg = await editResponse({
                    content: null,
                    embeds: [await createEmbed(0)],
                    components: [await createButtons(0)],
                });

                if (gifs.length > 1) {
                    const collector = responseMsg.createMessageComponentCollector({
                        componentType: ComponentType.Button,
                        time: 120000,
                    });

                    collector.on('collect', async (interaction) => {
                        if (interaction.user.id !== user.id) {
                            return interaction.reply({
                                content: await t('common.access_denied', {}, guildId),
                                ephemeral: true,
                            });
                        }

                        if (interaction.customId === 'prev_gif') currentIdx--;
                        else if (interaction.customId === 'next_gif') currentIdx++;

                        await interaction.update({
                            embeds: [await createEmbed(currentIdx)],
                            components: [await createButtons(currentIdx)],
                        });
                    });

                    collector.on('end', async () => {
                        const disabledRow = new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setCustomId('done')
                                .setLabel(await t('commands.gif.finished', {}, guildId))
                                .setStyle(ButtonStyle.Secondary)
                                .setDisabled(true)
                        );
                        await editResponse({ components: [disabledRow] }).catch(() => {});
                    });
                }
            }
        } catch (error) {
            Logger.error('GIF Command Error:', error);
            const errorMsg = await t('commands.gif.api_error', {}, guildId);
            await editResponse({ content: errorMsg });
        }
    },
};
