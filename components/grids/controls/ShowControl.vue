<template>
    <div class="show-control">
        <MultiSelect v-model="selectedFields" :options="allFields" display="chip" placeholder="Show Fields" @change="handleShowChange" />
    </div>
</template>

<script setup lang="ts">
import { computed, type PropType, onMounted } from 'vue';
import { useShowStore } from '~/stores/useShowStore';

const props = defineProps({
    modelValue: {
        type: Array as PropType<[string, boolean][]>,
        required: true
    }
});

const emit = defineEmits<{
    'update:modelValue': [value: [string, boolean][]];
}>();

const showStore = useShowStore();

const selectedFields = computed(() => {
    const fields = props.modelValue.filter(([_, isSelected]) => isSelected).map(([field]) => field);
    console.debug('ShowControl selectedFields:', fields);
    return fields;
});

const allFields = computed(() => props.modelValue.map(([field]) => field));

onMounted(() => {
    const initialSelected = props.modelValue.filter(([_, isSelected]) => isSelected).map(([field]) => field);
    console.debug('ShowControl initializing with:', initialSelected);
    showStore.setShow(initialSelected);
});

const handleShowChange = (event: any) => {
    const selectedValues = Array.isArray(event.value) ? event.value : [event.value];
    const newConfig = props.modelValue.map(([field]) => {
        const isSelected = selectedValues.includes(field);
        return [field, isSelected] as [string, boolean];
    });

    showStore.setShow(selectedValues);
    emit('update:modelValue', newConfig);
};
</script>
