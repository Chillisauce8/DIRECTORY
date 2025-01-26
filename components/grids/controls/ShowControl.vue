<template>
    <div class="show-control">
        <MultiSelect v-model="showStore.currentShow" :options="showOptions" display="chip" placeholder="Show Fields" @change="handleShowChange" />
    </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';
import { useShowStore } from '~/stores/useShowStore';

const props = defineProps({
    showOptions: {
        type: Array as PropType<string[]>,
        required: true
    }
});

const showStore = useShowStore();

console.log('ShowControl mounted, options:', props.showOptions);
console.log('Initial showStore.currentShow:', showStore.currentShow);

const handleShowChange = (event: any) => {
    console.log('ShowControl change event:', event);
    // Ensure we're working with an array
    const value = Array.isArray(event.value) ? event.value : Array.isArray(event) ? event : event.value ? [event.value] : ['name'];

    showStore.setShow(value);
    console.log('After setShow, currentShow:', showStore.currentShow);
};

// Watch for store changes
watch(
    () => showStore.currentShow,
    (newValue) => {
        console.log('showStore.currentShow changed:', newValue);
    },
    { deep: true }
);
</script>

<style lang="scss">
.show-control {
    .div {
        min-width: 150px;
    }
}
</style>
