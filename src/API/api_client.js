import { config } from '../config.js';
import Logger from '../utils/logger.js';

const API_HEADERS = {
    'Content-Type': 'application/json',
    'User-Agent': 'OpenZero-Bot/1.0 (+https://github.com/your-username/openzero)',
};

/**
 * Handles the fetch response and checks for errors.
 */
async function handleResponse(response, context = '') {
    if (!response.ok) {
        const text = await response.text();
        Logger.error(
            `API Error (${context}): Status ${response.status}. Response: ${text.slice(0, 100)}...`
        );
        throw new Error(`API service returned an error: ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        Logger.error(
            `Expected JSON but got: ${contentType} in ${context}. Content preview: ${text.slice(0, 100)}...`
        );
        throw new Error('API returned non-JSON response. Check your API_URL configuration.');
    }

    return response.json();
}

/**
 * Centralized API Client for calling Delema-style versioned endpoints.
 */
export const APIClient = {
    /**
     * Perform a POST request to the API.
     * @param {string} endpoint The endpoint path (e.g., '/research/arxiv')
     * @param {Object} data The body data to send.
     */
    async post(endpoint, data) {
        const url = `${config.apiUrl}/api/v1${endpoint}`;
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: API_HEADERS,
                body: JSON.stringify(data),
            });
            return await handleResponse(response, `POST ${endpoint}`);
        } catch (error) {
            if (error.cause && error.cause.code === 'ECONNREFUSED') {
                Logger.error(`API is not reachable at ${url}`);
                throw new Error('Could not connect to the backend service.', { cause: error });
            }
            throw error;
        }
    },

    /**
     * Perform a GET request to the API (if needed).
     */
    async get(endpoint) {
        const url = `${config.apiUrl}/api/v1${endpoint}`;
        const response = await fetch(url, {
            headers: API_HEADERS,
        });
        return await handleResponse(response, `GET ${endpoint}`);
    },
};
