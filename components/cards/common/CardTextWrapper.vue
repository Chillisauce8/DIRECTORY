<template>
    <transition name="card-text">
        <header class="card-text-wrapper">
            <div class="card-details">
                <slot />
            </div>
        </header>
    </transition>
</template>

<script setup></script>

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

    .card-details {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding: 0.5rem;

        // Common text styles
        .name {
            font-family: var(--primary-font-family);
            font-size: 15px;
            font-weight: 100;
            margin: 5px 0;
        }

        .categories {
            font-family: var(--primary-font-family);
            font-size: 12px;
            font-weight: 500;
            text-transform: uppercase;
        }

        // Secondary text styles
        .description,
        .vehicles,
        .start {
            font-size: 0.875rem;
            line-height: 1.25rem;
            color: var(--text-color-secondary);
        }
    }
}
</style>
