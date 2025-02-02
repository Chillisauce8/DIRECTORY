/**
 * Store for managing which fields are shown in cards
 * Used by ShowControl component and card components to control field visibility
 * Not to be confused with useDisplayStore which controls card layout/size
 */
import { defineStore } from 'pinia';

export const useShowStore = defineStore('show', {
    state: () => ({
        currentShow: ['name'] as string[]
    }),

    actions: {
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
