import { defineStore } from 'pinia';

type FunctionMode = 'view' | 'select' | 'edit' | 'order';

export const useModeStore = defineStore('mode', {
    state: () => ({
        mode: 'view' as FunctionMode
    }),

    actions: {
        setMode(newMode: FunctionMode) {
            this.mode = newMode;
        },
        reset() {
            this.mode = 'view';
        }
    },

    getters: {
        isEditMode: (state) => state.mode === 'edit',
        isSelectMode: (state) => state.mode === 'select',
        isViewMode: (state) => state.mode === 'view',
        isOrderMode: (state) => state.mode === 'order',
        currentMode: (state) => state.mode
    }
});
