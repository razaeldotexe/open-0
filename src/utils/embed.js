import { EmbedBuilder } from 'discord.js';

/**
 * Brand color palette based on CSS variables.
 */
export const COLORS = {
    DARK: '#020617',
    NAVY: '#0a1a3a',
    BLUE: '#1e40ff',
    CYAN: '#38bdf8',
    LIGHT: '#a5f3fc',
};

/**
 * Standardized OpenZero Embed wrapper.
 * Extends EmbedBuilder to provide consistent branding and defaults.
 */
export class OpenZeroEmbed extends EmbedBuilder {
    /**
     * @param {import('discord.js').EmbedData} [data] - Initial embed data.
     */
    constructor(data = {}) {
        super(data);

        // Set default brand color if not provided
        if (!this.data.color) {
            this.setColor(COLORS.CYAN);
        }

        // Clear default footer and timestamp for the new standard layout
        this.data.footer = null;
        this.data.timestamp = null;
    }

    /**
     * Sets the standardized layout from the requested format.
     * @param {import('discord.js').User} user - The user who requested the command.
     * @param {string} commandName - The name of the command (e.g., '/arxiv').
     * @param {string} featureName - The title of the feature/result.
     */
    setStandardLayout(user, commandName, featureName) {
        this.setAuthor({
            name: `${user.username} Request: ${commandName} `,
            iconURL: user.displayAvatarURL(),
        });
        this.setTitle(`${featureName} `);
        return this;
    }

    /**
     * Adds an AI Summary section as a Field (strictly matching requested code).
     * @param {string} summary - The AI-generated summary content.
     */
    setAISummary(summary) {
        if (!summary) return this;

        const cleanSummary = summary.replace(/^TL;DR:\s*/i, '');

        this.addFields({
            name: 'AI Summary',
            value: `${cleanSummary} `,
            inline: false,
        });

        return this;
    }
}

export default OpenZeroEmbed;
