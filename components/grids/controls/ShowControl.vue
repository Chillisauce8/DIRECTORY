<template>
    <MultiSelect v-model="model" :options="showOptions" :class="['show-control', className]" display="chip" placeholder="Show Fields" />
</template>

<script setup lang="ts">
import type { PropType } from 'vue';
import { classNameProp } from '@/types/props';


const props = defineProps({
    showOptions: { type: Array as PropType<string[]>, required: true },
    className: classNameProp
});


const model = defineModel<string[]>();
</script>

<style lang="scss">
.show-control {
    min-width: 150px;
}
</style>
