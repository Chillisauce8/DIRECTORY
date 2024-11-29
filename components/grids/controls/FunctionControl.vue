<template>
    <div class="function-control">
        <SelectButton
            v-if="showSelector"
            :modelValue="modelValue"
            @update:modelValue="$emit('update:modelValue', $event)"
            :options="filteredControls"
            optionValue="value"
            optionLabel="label"
            dataKey="value"
            :allowEmpty="false"
            class="function-control"
        >
            <template v-if="display === 'icon'" #option="slotProps">
                <SvgIcon :svg="slotProps.option.icon" :label="slotProps.option.label" labelPosition="hover" />
            </template>
        </SelectButton>
    </div>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue';

type FunctionMode = 'view' | 'select' | 'edit' | 'order';

const functionControls = [
    { label: 'View', icon: 'eye', value: 'view' as FunctionMode },
    { label: 'Select', icon: 'check-circle', value: 'select' as FunctionMode },
    { label: 'Edit', icon: 'edit', value: 'edit' as FunctionMode },
    { label: 'Order', icon: 'move', value: 'order' as FunctionMode }
];

const props = defineProps({
    modelValue: {
        type: String as PropType<FunctionMode>,
        required: true
    },
    display: {
        type: String as PropType<'text' | 'icon'>,
        default: 'text'
    },
    visibleControls: {
        type: Array as PropType<FunctionMode[] | null>,
        default: () => ['view', 'select', 'edit', 'order']
    },
    defaultControl: {
        type: String as PropType<FunctionMode>,
        default: 'view'
    }
});

const emit = defineEmits(['update:modelValue']);

const showSelector = computed(() => Array.isArray(props.visibleControls) && props.visibleControls.length > 1);

const filteredControls = computed(() => {
    if (!Array.isArray(props.visibleControls) || props.visibleControls.length === 0) {
        const defaultFunction = functionControls.find((func) => func.value === props.defaultControl);
        return defaultFunction ? [defaultFunction] : [functionControls[0]];
    }
    return functionControls.filter((func) => props.visibleControls?.includes(func.value));
});
</script>
