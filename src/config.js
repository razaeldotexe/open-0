import 'dotenv/config';

export const config = {
    geminiApiKey: process.env.GEMINI_API_KEY,
    groqApiKey: process.env.GROQ_API_KEY,
    openrouterApiKey: process.env.OPENROUTER_API_KEY,
    apiUrl: process.env.API_URL,
    appMode: process.env.APP_MODE || 'production',
    mongodbUri: process.env.MONGODB_URI,
    allowedChannels: ['dev', 'debug', 'test'],
    aiModels: {
        gemini: ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemma-4'],
        groq: [
            'llama-3.3-70b-versatile',
            'llama-3.1-8b-instant',
            'mixtral-8x7b-32768',
            'gemma2-9b-it',
        ],
        openrouter: [
            'qwen/qwen-3.6-preview:free',
            'meta-llama/llama-4-maverick:free',
            'meta-llama/llama-4-scout:free',
            'openrouter/hunter-alpha:free',
            'openrouter/healer-alpha:free',
        ],
    },
};
