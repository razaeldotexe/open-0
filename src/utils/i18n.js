import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Logger from './logger.js';
import { LANGUAGE_MAP } from './languages.js';
import { getGuildConfig, saveGuildConfig } from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOCALES_PATH = path.join(__dirname, '../locales');

const DEFAULT_LANGUAGE = 'en-US';
const locales = {};
const guildLanguageCache = new Map();

/**
 * Load all locale files from src/locales.
 */
function loadLocales() {
    try {
        if (!fs.existsSync(LOCALES_PATH)) {
            fs.mkdirSync(LOCALES_PATH, { recursive: true });
        }
        const files = fs.readdirSync(LOCALES_PATH).filter((f) => f.endsWith('.json'));
        files.forEach((file) => {
            const langCode = file.replace('.json', '');
            const content = fs.readFileSync(path.join(LOCALES_PATH, file), 'utf-8');
            locales[langCode] = JSON.parse(content);
        });
    } catch (error) {
        Logger.error('Failed to load locales:', error);
    }
}

/**
 * Get language for a specific guild from the database or cache.
 * @param {string} guildId
 */
export async function getLanguage(guildId) {
    if (!guildId) return DEFAULT_LANGUAGE;
    if (guildLanguageCache.has(guildId)) return guildLanguageCache.get(guildId);

    const config = await getGuildConfig(guildId);
    const lang = config?.language || DEFAULT_LANGUAGE;
    guildLanguageCache.set(guildId, lang);
    return lang;
}

/**
 * Set language for a specific guild and save to the database.
 * @param {string} guildId
 * @param {string} lang
 */
export async function setLanguage(guildId, lang) {
    if (!guildId) return;
    guildLanguageCache.set(guildId, lang);
    try {
        await saveGuildConfig(guildId, { language: lang });
    } catch (error) {
        Logger.error(`Error saving guild config for ${guildId}:`, error);
    }
}

/**
 * Translate a key based on the current language for a guild.
 * @param {string} key Key in dot notation (e.g., 'commands.ping.reply')
 * @param {Object} params Parameters to replace in the string
 * @param {string} guildId Guild ID for context
 * @returns {string}
 */
export async function t(key, params = {}, guildId = null) {
    const lang = await getLanguage(guildId);
    // lang can be a full name like 'Indonesian' or a code like 'id' or 'en-US'
    const langCode = LANGUAGE_MAP[lang] || lang || DEFAULT_LANGUAGE;
    let text =
        getKey(locales[langCode], key) ||
        getKey(locales['en-US'], key) ||
        getKey(locales['id'], key) ||
        key;

    // Replace params
    Object.keys(params).forEach((p) => {
        text = text.replace(new RegExp(`{${p}}`, 'g'), params[p]);
    });

    return text;
}

function getKey(obj, key) {
    if (!obj) return null;
    return key.split('.').reduce((o, i) => (o ? o[i] : null), obj);
}

// Initial load
loadLocales();
