import {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType,
} from 'discord.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';

const execPromise = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
    name: 'nerdfont',
    aliases: ['nf'],
    description: 'Cari atau list font dari Nerd Fonts',
    async execute(message, args) {
        const query = args.join(' ');
        const loadingMsg = await message.reply('Sedang mengambil data dari Nerd Fonts...');

        try {
            const pythonScript = path.join(__dirname, '..', 'API', 'nerdfont_fetcher.py');
            const commandLine = query
                ? `python "${pythonScript}" "${query}"`
                : `python "${pythonScript}"`;

            const { stdout, stderr } = await execPromise(commandLine);

            if (stderr) {
                console.error('Python Error:', stderr);
                return loadingMsg.edit('Terjadi kesalahan teknis saat mengambil data.');
            }

            const data = JSON.parse(stdout);

            if (data.error) {
                return loadingMsg.edit(data.error);
            }

            if (!Array.isArray(data) || data.length === 0) {
                return loadingMsg.edit('Tidak ada font yang ditemukan.');
            }

            let currentPage = 0;
            const totalPages = data.length;

            const createEmbed = (index) => {
                const font = data[index];
                const embed = new EmbedBuilder()
                    .setColor('#20f0f2')
                    .setAuthor({
                        name: `Diminta oleh ${message.author.username}`,
                        iconURL: message.author.displayAvatarURL({ dynamic: true }),
                    })
                    .setTitle(`${font.unpatchedName} Nerd Font`)
                    .setURL(`https://www.nerdfonts.com/font-downloads`)
                    .setThumbnail(
                        'https://www.nerdfonts.com/assets/img/logos/nerd-fonts-logo-white.png'
                    )
                    .setDescription(font.description || 'Tidak ada deskripsi tersedia.')
                    .addFields(
                        { name: 'Folder Name', value: `\`${font.folderName}\``, inline: true },
                        { name: 'Version', value: `\`${font.version}\``, inline: true },
                        { name: 'License', value: font.licenseId || 'Unknown', inline: true },
                        {
                            name: 'Source',
                            value: `[Nerd Fonts Website](https://www.nerdfonts.com/)`,
                            inline: false,
                        }
                    )
                    .setFooter({
                        text: `Halaman ${index + 1} dari ${totalPages} • Nerd Fonts`,
                        iconURL: 'https://www.nerdfonts.com/assets/img/logos/nerd-fonts-logo.png',
                    })
                    .setTimestamp();

                return embed;
            };

            const createButtons = (index) => {
                const font = data[index];

                // Rows
                const row1 = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('prev')
                        .setLabel('Prev')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(index === 0),
                    new ButtonBuilder()
                        .setCustomId('next')
                        .setLabel('Next')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(index === totalPages - 1)
                );

                const row2 = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setLabel('Download (Zip)')
                        .setURL(
                            `https://github.com/ryanoasis/nerd-fonts/releases/latest/download/${font.folderName}.zip`
                        )
                        .setStyle(ButtonStyle.Link),
                    new ButtonBuilder()
                        .setLabel('GitHub Source')
                        .setURL(
                            `https://github.com/ryanoasis/nerd-fonts/tree/master/patched-fonts/${font.folderName}`
                        )
                        .setStyle(ButtonStyle.Link),
                    new ButtonBuilder()
                        .setLabel('All Fonts')
                        .setURL('https://www.nerdfonts.com/font-downloads')
                        .setStyle(ButtonStyle.Link)
                );

                return [row1, row2];
            };

            const options = {
                content: null,
                embeds: [createEmbed(0)],
                components: createButtons(0),
            };
            const response = await loadingMsg.edit(options);

            const collector = response.createMessageComponentCollector({
                componentType: ComponentType.Button,
                time: 300000, // Aktif selama 5 menit
            });

            collector.on('collect', async (interaction) => {
                if (interaction.user.id !== message.author.id) {
                    return interaction.reply({
                        content: 'Anda tidak memiliki akses ke navigasi ini.',
                        ephemeral: true,
                    });
                }

                if (interaction.customId === 'prev') {
                    currentPage = Math.max(0, currentPage - 1);
                } else if (interaction.customId === 'next') {
                    currentPage = Math.min(totalPages - 1, currentPage + 1);
                }

                await interaction.update({
                    embeds: [createEmbed(currentPage)],
                    components: createButtons(currentPage),
                });
            });

            collector.on('end', () => {
                const disabledRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('p')
                        .setLabel('Session Ended')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(true)
                );
                response.edit({ components: [disabledRow] }).catch(() => {});
            });
        } catch (error) {
            console.error('Execution Error:', error);
            loadingMsg.edit('Gagal menghubungi layanan Nerd Fonts.');
        }
    },
};
