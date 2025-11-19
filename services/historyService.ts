import type { EnhancedTitanSchema } from '../types';

const HISTORY_KEY = 'silent_empire_analysis_history';

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
            return Array.isArray(parsed) ? parsed : [];
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
