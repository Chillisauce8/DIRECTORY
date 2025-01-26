<template>
    <transition name="card-text">
        <header class="card-text-wrapper" v-if="!(modeStore.currentMode === 'edit' && isSelected)">
            <slot />
        </header>
    </transition>
</template>

<script setup>
import { useModeStore } from '~/stores/useModeStore';
import { useSelectedStore } from '~/stores/useSelectedStore';

const props = defineProps({
    selected: { type: Boolean, required: true }
});

const modeStore = useModeStore();
const selectionStore = useSelectedStore();

const isSelected = computed(() => props.selected);

// Add debug watcher for v-if condition
watch(
    () => !(modeStore.currentMode === 'edit' && isSelected.value),
    (newValue) => {
        console.log('CardTextWrapper: visibility changed:', {
            mode: modeStore.currentMode,
            isSelected: isSelected.value,
            visible: newValue
        });
    },
    { immediate: true }
);
</script>

<style lang="scss">
.card-text-wrapper {
    position: relative;
    padding: 5%;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    align-items: stretch;
    overflow: hidden;
    // removed transition property

    &.card-text-enter-active {
        animation: fadein 1s ease-in forwards; // removed 1s delay
    }
}
</style>
