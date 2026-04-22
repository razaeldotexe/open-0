import { SlashCommandBuilder, PermissionsBitField } from 'discord.js';
import { t } from '../utils/i18n.js';
import Logger from '../utils/logger.js';

export default {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Deletes a specified number of messages')
        .addIntegerOption((option) =>
            option
                .setName('amount')
                .setDescription('Number of messages to delete')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100)
        ),
    async execute(context, args) {
        const guildId = context.guild?.id;
        const isInteraction = context.isChatInputCommand?.();

        if (!context.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            const msg = await t('commands.clear.no_perms', {}, guildId);
            return context.reply({ content: msg, ephemeral: true });
        }

        let amount;
        if (isInteraction) {
            amount = context.options.getInteger('amount');
        } else {
            amount = parseInt(args[0]);
        }

        if (isNaN(amount) || amount < 1 || amount > 100) {
            const msg = await t('commands.clear.invalid', {}, guildId);
            return context.reply({ content: msg, ephemeral: true });
        }

        // For prefix commands, we delete amount + 1. For slash, just amount.
        const deleteAmount = isInteraction ? amount : amount + 1;

        try {
            await context.channel.bulkDelete(deleteAmount, true);
            const successMsg = await t('commands.clear.success', { amount }, guildId);

            if (isInteraction) {
                return await context.reply({ content: successMsg, ephemeral: true });
            } else {
                const msg = await context.channel.send(successMsg);
                setTimeout(() => msg.delete().catch(() => {}), 3000);
            }
        } catch (error) {
            Logger.error('Clear Error:', error);
            return context.reply({
                content: await t('common.error', { error: error.message }, guildId),
                ephemeral: true,
            });
        }
    },
};
