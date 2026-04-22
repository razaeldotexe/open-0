import { MongoClient } from 'mongodb';
import { config } from '../config.js';
import Logger from './logger.js';

let client;
let db;

/**
 * Initialize MongoDB connection.
 */
export async function initDatabase() {
    if (!config.mongodbUri) {
        Logger.warn('MONGODB_URI not found in environment. Database features will be disabled.');
        return;
    }

    try {
        client = new MongoClient(config.mongodbUri);
        await client.connect();
        db = client.db();
        Logger.info('[Database] Connected to MongoDB successfully.');

        // Create indexes
        await db
            .collection('tickets')
            .createIndex({ createdAt: 1 }, { expireAfterSeconds: 604800 }); // 1 week
        await db.collection('guilds').createIndex({ guildId: 1 }, { unique: true });
    } catch (error) {
        Logger.error('[Database] Failed to connect to MongoDB:', error);
    }
}

/**
 * Save or update guild configuration.
 */
export async function saveGuildConfig(guildId, configData) {
    if (!db) return;
    try {
        await db
            .collection('guilds')
            .updateOne(
                { guildId },
                { $set: { ...configData, updatedAt: new Date() } },
                { upsert: true }
            );
        Logger.info(`[Database] Guild config saved: ${guildId}`);
    } catch (error) {
        Logger.error('[Database] Error saving guild config:', error);
    }
}

/**
 * Get guild configuration.
 */
export async function getGuildConfig(guildId) {
    if (!db) return null;
    try {
        return await db.collection('guilds').findOne({ guildId });
    } catch (error) {
        Logger.error('[Database] Error fetching guild config:', error);
        return null;
    }
}

/**
 * Save a new ticket to the database.
 */
export async function saveTicket(ticketData) {
    if (!db) return;
    try {
        await db.collection('tickets').insertOne({
            ...ticketData,
            status: 'open',
            createdAt: new Date(),
        });
        Logger.info(`[Database] Ticket saved: ${ticketData.channelId}`);
    } catch (error) {
        Logger.error('[Database] Error saving ticket:', error);
    }
}

/**
 * Mark a ticket as closed.
 */
export async function closeTicket(channelId) {
    if (!db) return;
    try {
        await db
            .collection('tickets')
            .updateOne({ channelId }, { $set: { status: 'closed', closedAt: new Date() } });
        Logger.info(`[Database] Ticket marked as closed: ${channelId}`);
    } catch (error) {
        Logger.error('[Database] Error marking ticket as closed:', error);
    }
}

/**
 * Delete a ticket from the database.
 */
export async function deleteTicket(channelId) {
    if (!db) return;
    try {
        await db.collection('tickets').deleteOne({ channelId });
    } catch (error) {
        Logger.error('[Database] Error deleting ticket record:', error);
    }
}

/**
 * Get all tickets that need cleaning up from Discord (expired or closed).
 */
export async function getTicketsToCleanup() {
    if (!db) return [];
    try {
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return await db
            .collection('tickets')
            .find({
                $or: [{ createdAt: { $lt: oneWeekAgo } }, { status: 'closed' }],
            })
            .toArray();
    } catch (error) {
        Logger.error('[Database] Error fetching cleanup tickets:', error);
        return [];
    }
}

/**
 * Save or update an app monitor.
 */
export async function saveMonitor(monitorData) {
    if (!db) return;
    try {
        await db
            .collection('monitors')
            .updateOne(
                { guildId: monitorData.guildId, source: monitorData.source },
                { $set: { ...monitorData, updatedAt: new Date() } },
                { upsert: true }
            );
        Logger.info(`[Database] Monitor saved: ${monitorData.source} in ${monitorData.guildId}`);
    } catch (error) {
        Logger.error('[Database] Error saving monitor:', error);
    }
}

/**
 * Get all active monitors.
 */
export async function getMonitors() {
    if (!db) return [];
    try {
        return await db.collection('monitors').find({}).toArray();
    } catch (error) {
        Logger.error('[Database] Error fetching monitors:', error);
        return [];
    }
}

/**
 * Delete a specific monitor.
 */
export async function deleteMonitor(guildId, source) {
    if (!db) return;
    try {
        await db.collection('monitors').deleteOne({ guildId, source });
        Logger.info(`[Database] Monitor deleted: ${source} in ${guildId}`);
    } catch (error) {
        Logger.error('[Database] Error deleting monitor:', error);
    }
}

export function getDb() {
    return db;
}
