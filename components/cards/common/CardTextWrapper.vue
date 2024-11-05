<template>
    <header class="card-text-wrapper">
        <slot />
    </header>
</template>

<script setup>
// Set up a reactive variable to control visibility

// You can toggle this variable in your component logic to show/hide the wrapper
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
    transition: all 1s ease-in-out;

    &.show {
        opacity: 1;
        max-height: 300px; // Set to the desired max height of the content
    }

    &.hide {
        opacity: 0;
        max-height: 0;
        overflow: hidden;
        padding: 0;
    }
}
</style>
