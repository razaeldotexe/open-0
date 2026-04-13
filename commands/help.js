import { EmbedBuilder } from 'discord.js';

export default {
    name: 'help',
    aliases: ['?'],
    description: 'Menampilkan daftar semua perintah yang tersedia',
    async execute(message, args) {
        const { commands } = message.client;
        
        // Menggunakan Set untuk memastikan perintah unik (karena alias merujuk ke objek yang sama)
        const uniqueCommands = Array.from(new Set(commands.values()));

        const embed = new EmbedBuilder()
            .setColor('#20f0f2') // Warna Hijau
            .setTitle('Panduan Perintah Bot')
            .setDescription('Gunakan prefix `!` sebelum mengetik perintah.\nBerikut adalah daftar fitur yang tersedia:')
            .setThumbnail(message.client.user.displayAvatarURL())
            .setFooter({ 
                text: `Diminta oleh ${message.author.username}`, 
                iconURL: message.author.displayAvatarURL({ dynamic: true }) 
            })
            .setTimestamp();

        uniqueCommands.forEach(command => {
            const name = command.name;
            const aliases = command.aliases ? ` (Alias: ${command.aliases.map(a => `!${a}`).join(', ')})` : '';
            const description = command.description || 'Tidak ada deskripsi.';
            
            // Logika sederhana untuk menentukan contoh penggunaan
            let usage = `!${name}`;
            if (name === 'nerdfont') usage += ' [query/kosong]';
            else if (name === 'ping' || name === 'help') usage += '';
            else usage += ' [kata kunci]';

            embed.addFields({ 
                name: `!${name}${aliases}`, 
                value: `${description}\nContoh: \`${usage}\``, 
                inline: false 
            });
        });

        return message.reply({ embeds: [embed] });
    },
};
