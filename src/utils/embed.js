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
     * Adds an AI Summary section as Fields.
     * If the summary exceeds 1024 characters, it splits it into multiple fields.
     * @param {string} summary - The AI-generated summary content.
     */
    setAISummary(summary) {
        if (!summary) return this;

        const cleanSummary = summary.replace(/^TL;DR:\s*/i, '');

        if (cleanSummary.length <= 1024) {
            this.addFields({
                name: 'AI Summary',
                value: cleanSummary,
                inline: false,
            });
        } else {
            // Split into chunks of 1024 characters
            const chunks = cleanSummary.match(/[\s\S]{1,1024}/g) || [];

            // Limit to a reasonable number of chunks to avoid hitting total embed limits
            chunks.slice(0, 5).forEach((chunk, index) => {
                this.addFields({
                    name: index === 0 ? 'AI Summary' : `AI Summary (Continued ${index + 1})`,
                    value: chunk,
                    inline: false,
                });
            });
        }

        return this;
    }
}

export default OpenZeroEmbed;
