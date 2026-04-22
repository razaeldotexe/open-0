import { SlashCommandBuilder, PermissionsBitField } from 'discord.js';
import { t } from '../utils/i18n.js';
import Logger from '../utils/logger.js';

export default {
    data: new SlashCommandBuilder()
        .setName('purge')
        .setDescription('Delete a specified number of messages (Default: 99)')
        .addIntegerOption((option) =>
            option
                .setName('amount')
                .setDescription('Number of messages to delete')
                .setMinValue(1)
                .setMaxValue(100)
        ),
    async execute(context, args) {
        const guildId = context.guild?.id;
        const isInteraction = context.isChatInputCommand?.();
        const member = context.member;

        // Permission Check
        if (!member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            const msg = await t('commands.purge.no_perms', {}, guildId);
            return context.reply({ content: msg, ephemeral: true });
        }

        // Parse amount
        let amount;
        if (isInteraction) {
            amount = context.options.getInteger('amount') || 99;
        } else {
            amount = parseInt(args[0]) || 99;
        }

        // Discord limit for bulkDelete is 100.
        // For prefix commands, we delete amount + 1 to include the command message itself.
        const deleteAmount = isInteraction ? Math.min(amount, 100) : Math.min(amount + 1, 100);

        try {
            const deleted = await context.channel.bulkDelete(deleteAmount, true);
            const actualDeleted = isInteraction ? deleted.size : deleted.size - 1;

            const successText = await t(
                'commands.purge.success',
                { amount: actualDeleted },
                guildId
            );

            if (isInteraction) {
                await context.reply({ content: successText, ephemeral: true });
            } else {
                const successMsg = await context.channel.send(successText);
                // Auto-delete the success notification after 3 seconds
                setTimeout(() => successMsg.delete().catch(() => {}), 3000);
            }
        } catch (error) {
            Logger.error('Purge Error:', error);
            const errorMsg = await t('common.error', { error: error.message }, guildId);
            await context.reply({ content: errorMsg, ephemeral: true });
        }
    },
};
