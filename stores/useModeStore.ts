import { defineStore } from 'pinia';

export type ModeType = 'view' | 'select' | 'edit' | 'order';

// Factory function: each grid gets its own store instance
export const createModeStore = (gridId: string) =>
    defineStore(`mode-${gridId}`, {
        state: () => ({
            selectedMode: 'view' as ModeType
        }),
        actions: {
            initialize(initialMode: ModeType) {
                // Only set if not already set - this maintains persistence
                if (this.selectedMode === 'view') {
                    this.selectedMode = initialMode;
                }
            },
            setMode(mode: ModeType) {
                this.selectedMode = mode;
            }
        },
        getters: {
            isEditMode: (state) => state.selectedMode === 'edit',
            isSelectMode: (state) => state.selectedMode === 'select',
            isViewMode: (state) => state.selectedMode === 'view',
            isOrderMode: (state) => state.selectedMode === 'order',
            currentMode: (state) => state.selectedMode
        }
    });
