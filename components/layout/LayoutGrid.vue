<template>
    <section class="layout-grid">
        <slot />
    </section>
</template>

<script></script>

<style lang="scss">
.layout-grid {
    --grid-gap: 20px;
    --grid-background-color: var(--color-light);
    --grid-item-min: 300px;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(var(--grid-item-min), 1fr));
    padding: var(--grid-gap);
    gap: var(--grid-gap);
    grid-auto-flow: dense; // https://www.w3schools.com/cssref/tryit.php?filename=trycss_grid-auto-flow2
    background-color: var(--grid-background-color);

    > * {
        grid-column: span 1;
        grid-row: span 1;
    }
}
</style>
