import { computed } from 'vue';
import type { CardProps } from '@/types/props';
import { useDisplayStore } from '~/stores/useDisplayStore';
import { useModeStore } from '~/stores/useModeStore';
import { useShowStore } from '~/stores/useShowStore';

export const useCard = (props: CardProps) => {
    const displayStore = useDisplayStore();
    const modeStore = useModeStore();
    const showStore = useShowStore();

    const getCardTextWrapperClass = computed(() => {
        return (modeStore.currentMode === 'edit' && props.selected) || showStore.currentShow.length > 0 ? 'show' : 'hide';
    });

    // Common handler for edit group submit
    const onEditableGroupSubmit = ($event: any) => {
        return $event;
    };

    // Common handler for selection
    const handleSelection = (value: boolean, emit: any) => {
        emit('update:selected', value);
    };

    return {
        getCardTextWrapperClass,
        onEditableGroupSubmit,
        handleSelection
    };
};
