/**
 * Store for managing which fields are shown in cards
 * Used by ShowControl component and card components to control field visibility
 * Not to be confused with useDisplayStore which controls card layout/size
 */
import { defineStore } from 'pinia';

// Factory function: each grid gets its own store instance
export const createShowStore = (gridId: string) =>
    defineStore(`show-${gridId}`, {
        state: () => ({
            currentShow: [] as string[] // Remove default ['name']
        }),

        actions: {
            initialize(initialOptions: string[]) {
                if (this.currentShow.length === 0 && initialOptions.length > 0) {
                    this.currentShow = [...initialOptions];
                }
            },
            setShow(show: string | string[]) {
                const newShow = Array.isArray(show) ? show : [show];
                this.currentShow = [...newShow];
            },

            toggleField(field: string) {
                if (this.currentShow.includes(field)) {
                    this.currentShow = this.currentShow.filter((f) => f !== field);
                } else {
                    this.currentShow = [...this.currentShow, field];
                }
            }
        }
    });
