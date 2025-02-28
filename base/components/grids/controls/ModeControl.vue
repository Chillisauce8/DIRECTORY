<template>
    <div class="mode-control">
        <SelectButton v-if="showSelector" :modelValue="selectedMode" @update:modelValue="updateMode" :options="filteredControls" optionValue="value" optionLabel="label" dataKey="value" :allowEmpty="false" class="mode-control">
            <template v-if="props.display === 'icon'" #option="slotProps">
                <SvgIcon :svg="slotProps.option.icon" :label="slotProps.option.label" labelPosition="hover" />
            </template>
        </SelectButton>
    </div>
</template>

<script setup lang="ts">
import { computed, type PropType, inject, onMounted } from 'vue';
import { createModeStore, type ModeType } from '~/stores/useModeStore';

const props = defineProps({
    display: {
        type: String as PropType<'text' | 'icon'>,
        default: 'text'
    },
    visibleControls: {
        type: Array as PropType<ModeType[] | null>,
        default: () => ['view', 'select', 'edit', 'order']
    },
    defaultControl: {
        type: String as PropType<ModeType>,
        default: 'view'
    },
    gridId: {
        type: String,
        required: true
    }
});

// Try to inject the grid-specific mode store provided by GridContainer
const injectedModeStore = inject('modeStore');

// Use the injected store or fall back to a grid-specific store instance
const modeStore = injectedModeStore || createModeStore(props.gridId)();

const selectedMode = computed(() => modeStore.currentMode);

const modeControls = [
    // Renamed from functionControls
    { label: 'View', icon: 'eye', value: 'view' as ModeType },
    { label: 'Select', icon: 'check-circle', value: 'select' as ModeType },
    { label: 'Edit', icon: 'edit', value: 'edit' as ModeType },
    { label: 'Order', icon: 'move', value: 'order' as ModeType }
];

const emit = defineEmits(['update:modelValue']);

const showSelector = computed(() => Array.isArray(props.visibleControls) && props.visibleControls.length > 1);

const filteredControls = computed(() => {
    if (!Array.isArray(props.visibleControls) || props.visibleControls.length === 0) {
        const defaultMode = modeControls.find((mode) => mode.value === props.defaultControl);
        return defaultMode ? [defaultMode] : [modeControls[0]];
    }
    return modeControls.filter((mode) => props.visibleControls?.includes(mode.value));
});

function updateMode(newMode: ModeType) {
    modeStore.setMode(newMode);
    emit('update:modelValue', newMode);
}

onMounted(() => {
    // Use initialize instead of setMode
    if (props.defaultControl) {
        modeStore.initialize(props.defaultControl);
    }
});
</script>
