import 'dotenv/config';

export const config = {
    githubRepoUrl: process.env.GITHUB_REPO_URL || 'https://github.com/your-username/openzero-resource',
    githubRepoOwner: process.env.GITHUB_REPO_OWNER || 'your-username',
    githubRepoName: process.env.GITHUB_REPO_NAME || 'openzero-resource',
    githubToken: process.env.GITHUB_TOKEN,
    geminiApiKey: process.env.GEMINI_API_KEY,
    groqApiKey: process.env.GROQ_API_KEY,
    openrouterApiKey: process.env.OPENROUTER_API_KEY,
    apiUrl: process.env.API_URL,
    translationUrl: process.env.TRANSLATION_URL || 'https://crowdin.com/project/openzero',
    appMode: process.env.APP_MODE || 'production',
    mongodbUri: process.env.MONGODB_URI,
    adminId: process.env.ADMIN_ID,
    railwayApiKey: process.env.RAILWAY_API_KEY,
    railwayEnvironmentId: process.env.RAILWAY_ENVIRONMENT_ID,
    railwayBotServiceId: process.env.RAILWAY_BOT_SERVICE_ID,
    railwayApiServiceId: process.env.RAILWAY_API_SERVICE_ID,
    allowedChannels: ['dev', 'debug', 'test'],
    metadata: {
        footerText: 'OpenZero Resource',
        redditCleanupRegex: /submitted to \[r\/.*\]\(https:\/\/www\.reddit\.com\/r\/.*\) by \[u\/.*\]\(https:\/\/www\.reddit\.com\/user\/.*\)/i,
    },
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
