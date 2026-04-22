import { SlashCommandBuilder, PermissionsBitField } from 'discord.js';
import { t } from '../utils/i18n.js';

export default {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bans a member from the server')
        .addUserOption((option) =>
            option.setName('target').setDescription('The member to ban').setRequired(true)
        )
        .addStringOption((option) =>
            option.setName('reason').setDescription('The reason for banning')
        ),
    async execute(context, args) {
        const guildId = context.guild?.id;
        const isInteraction = context.isChatInputCommand?.();

        if (!context.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return context.reply({
                content: await t('commands.ban.no_perms', {}, guildId),
                ephemeral: true,
            });
        }

        let target;
        let reason;

        if (isInteraction) {
            target = context.options.getMember('target');
            reason =
                context.options.getString('reason') ||
                (await t('commands.ban.no_reason', {}, guildId));
        } else {
            if (args.length === 0)
                return context.reply(await t('commands.ban.mention', {}, guildId));
            const userId = args[0].replace(/[<@!>]/g, '');
            target =
                context.guild.members.cache.get(userId) ||
                (await context.guild.members.fetch(userId).catch(() => null));
            reason = args.slice(1).join(' ') || (await t('commands.ban.no_reason', {}, guildId));
        }

        if (!target) {
            return context.reply({
                content: await t('commands.ban.mention', {}, guildId),
                ephemeral: true,
            });
        }
        if (!target.bannable) {
            return context.reply({
                content: await t('commands.ban.unable', {}, guildId),
                ephemeral: true,
            });
        }

        await target.ban({ reason });

        return context.reply(
            await t('commands.ban.success', { tag: target.user.tag, reason }, guildId)
        );
    },
};
