import { defineStore } from 'pinia';

export const useShowStore = defineStore('show', {
    state: () => ({
        currentShow: ['name'] as string[]
    }),
    actions: {
        setShow(show: string | string[]) {
            console.log('Setting show:', show);
            // Ensure we're working with an array
            const newShow = Array.isArray(show) ? show : [show];
            this.currentShow = [...newShow];
        },
        toggleField(field: string) {
            console.log('Toggling field:', field);
            if (this.currentShow.includes(field)) {
                this.currentShow = this.currentShow.filter((f) => f !== field);
            } else {
                this.currentShow = [...this.currentShow, field];
            }
        }
    }
});
