<template>
    <div class="show-control">
        <MultiSelect v-model="model" :options="showOptions" display="chip" placeholder="Show Fields" />
    </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';
import { classNameProp } from '@/types/props';

const props = defineProps({
    showOptions: { type: Array as PropType<string[]>, required: true }
});

const model = defineModel<string[]>();
</script>

<style lang="scss">
.show-control {
    .div {
        min-width: 150px;
    }
}
</style>
