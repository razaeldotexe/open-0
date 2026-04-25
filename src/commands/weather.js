import { SlashCommandBuilder } from 'discord.js';
import { APIClient } from '../API/api_client.js';
import { OpenZeroEmbed } from '../utils/embed.js';
import { t } from '../utils/i18n.js';
import Logger from '../utils/logger.js';

export default {
    data: new SlashCommandBuilder()
        .setName('weather')
        .setDescription('Check the weather for a city or coordinates')
        .addStringOption((option) =>
            option.setName('city').setDescription('The city name').setRequired(false)
        )
        .addNumberOption((option) =>
            option.setName('lat').setDescription('Latitude').setRequired(false)
        )
        .addNumberOption((option) =>
            option.setName('lon').setDescription('Longitude').setRequired(false)
        ),
    async execute(context, args) {
        const isInteraction = context.isChatInputCommand?.();
        const guildId = context.guildId;

        let city, lat, lon;

        if (isInteraction) {
            city = context.options.getString('city');
            lat = context.options.getNumber('lat');
            lon = context.options.getNumber('lon');
        } else {
            if (args.length > 0) {
                city = args.join(' ');
            }
        }

        if (!city && (lat === undefined || lon === undefined)) {
            const msg = await t('commands.weather.usage_hint', {}, guildId);
            return isInteraction
                ? context.reply({ content: msg, ephemeral: true })
                : context.reply(msg);
        }

        if (isInteraction) await context.deferReply();

        try {
            const endpoint = city
                ? `/weather?city=${encodeURIComponent(city)}`
                : `/weather?lat=${lat}&lon=${lon}`;
            const data = await APIClient.get(endpoint);

            const embed = new OpenZeroEmbed(
                {
                    title: await t(
                        'commands.weather.current_title',
                        { location: data.location.name },
                        guildId
                    ),
                    description: data.current.condition,
                },
                context
            );

            embed.addFields(
                {
                    name: await t('commands.weather.temp_label', {}, guildId),
                    value: `${data.current.temperature}°C`,
                    inline: true,
                },
                {
                    name: await t('commands.weather.humidity', {}, guildId),
                    value: `${data.current.humidity}%`,
                    inline: true,
                },
                {
                    name: await t('commands.weather.wind', {}, guildId),
                    value: `${data.current.wind_speed} km/h`,
                    inline: true,
                }
            );

            if (data.daily && data.daily.length > 0) {
                const forecast = data.daily
                    .slice(0, 3)
                    .map((d) => `**${d.date}**: ${d.condition} (${d.min_temp}° - ${d.max_temp}°C)`)
                    .join('\n');
                embed.addFields({
                    name: await t('commands.weather.daily_forecast', {}, guildId),
                    value: forecast,
                });
            }

            return isInteraction
                ? context.editReply({ embeds: [embed] })
                : context.reply({ embeds: [embed] });
        } catch (error) {
            Logger.error('Weather command error:', error);
            const errorMsg = await t(
                'commands.weather.api_error',
                { error: error.message },
                guildId
            );
            return isInteraction
                ? context.editReply({ content: errorMsg })
                : context.reply(errorMsg);
        }
    },
};
