/**
 * DEMO: Utility functions for mail operations
 * These should be replaced with server-side operations in production
 */
export const useMailUtils = () => {
    // Should use database-generated IDs
    const generateId = () => Math.random().toString(36).substring(2, 7);

    // Should use server timestamps
    const generateDate = () =>
        new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

    return {
        generateId,
        generateDate
    };
};
