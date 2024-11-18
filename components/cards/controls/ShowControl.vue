<template>
    <SelectButton v-model="internalValue" :options="showOptions" aria-labelledby="show" multiple className="show-control" />
</template>

<script setup lang="ts">
import SelectButton from 'primevue/selectbutton';
import { computed } from 'vue';

const props = defineProps<{
    modelValue: string[];
    showOptions: string[];
}>();

const emit = defineEmits<{
    'update:modelValue': [string[]];
}>();

const internalValue = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
});
</script>

<style lang="scss">
.show-control {
}
</style>
