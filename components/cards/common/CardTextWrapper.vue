<template>
    <transition name="card-text">
        <header class="card-text-wrapper" v-if="!(mode === 'edit' && selected)">
            <slot />
        </header>
    </transition>
</template>

<script setup>
defineProps({
    mode: { type: String, required: true },
    selected: { type: Boolean, required: true }
});
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
