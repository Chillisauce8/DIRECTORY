<template>
    <section class="layout-grid">
        <slot />
    </section>
</template>

<script></script>

<style lang="scss">
.layout-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 2rem;
    padding: 2rem;
    > * {
        flex-grow: 1;
        max-width: 500px;
        min-width: 300px;
    }
}
</style>
