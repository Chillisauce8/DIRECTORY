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
