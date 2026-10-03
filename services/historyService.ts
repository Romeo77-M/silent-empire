import type { EnhancedTitanSchema } from '../types';

const HISTORY_KEY = 'silent_empire_analysis_history';

const migrateSummary = (summary: any): EnhancedTitanSchema | null => {
    if (!summary || typeof summary !== 'object' || !summary.meta || !summary.perspectives) return null;

    const perspectives = ['analyst', 'simple', 'human'];
    for (const name of perspectives) {
        const body = summary.perspectives[name];
        if (!body || typeof body !== 'object') return null;

        // Backward compatibility for summaries created before the educational schema rename.
        if (!body.what_this_means && body.recommendation) {
            body.what_this_means = body.recommendation;
        }
        delete body.recommendation;
        // Older summaries may contain an AI-generated confidence score. It is intentionally not displayed or retained.
        if (body.what_this_means && typeof body.what_this_means === 'object') {
            delete body.what_this_means.confidence_level;
        }
    }

    return summary as EnhancedTitanSchema;
};

export const normalizeSummary = (summary: unknown): EnhancedTitanSchema | null => {
    try {
        return migrateSummary(structuredClone(summary));
    } catch {
        return null;
    }
};

/**
 * Loads summaries from localStorage.
 * @returns {EnhancedTitanSchema[]} The array of saved summaries, or an empty array.
 */
export const loadSummaries = (): EnhancedTitanSchema[] => {
    try {
        const storedHistory = localStorage.getItem(HISTORY_KEY);
        if (storedHistory) {
            // Basic validation to ensure it's an array
            const parsed = JSON.parse(storedHistory);
            if (!Array.isArray(parsed)) return [];
            return parsed.map(normalizeSummary).filter((item): item is EnhancedTitanSchema => item !== null);
        }
    } catch (error) {
        console.error("Failed to load or parse analysis history from localStorage:", error);
        // In case of error (e.g., corrupted data), clear it to start fresh
        localStorage.removeItem(HISTORY_KEY);
    }
    return [];
};

/**
 * Saves summaries to localStorage.
 * @param {EnhancedTitanSchema[]} summaries - The array of summaries to save.
 */
export const saveSummaries = (summaries: EnhancedTitanSchema[]): void => {
    try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(summaries));
    } catch (error) {
        console.error("Failed to save analysis history to localStorage:", error);
    }
};
