import { computed } from 'vue';
import type { CardProps } from '@/types/props';

export const useCard = (props: CardProps) => {
    // Common computed property for text wrapper class
    const getCardTextWrapperClass = computed(() => {
        return (props.mode === 'edit' && props.selected) || props.show.length > 0 ? 'show' : 'hide';
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
