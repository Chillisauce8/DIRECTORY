<template>
    <div class="layout-container">
        <nav class="top-nav-container">
            <TopNav />
        </nav>
        <nav class="left-nav-container"></nav>
        <main class="page-content-container"></main>
        <nav class="right-nav-container">
            <AppConfig />
        </nav>
        <footer class="footer-container"></footer>
    </div>
</template>

<script lang="ts" setup>
import AppConfig from './AppConfig.vue';
import TopNav from './TopNav.vue';
import { useLayout } from '~/composables/useLayout'; // Make sure this path is correct

const { layoutConfig, layoutState } = useLayout();
</script>

<style lang="scss">
.layout-container {
    display: grid;
    grid-template-areas:
        'top    top    top'
        'left   main   right'
        'footer footer footer';
    grid-template-columns: 250px 1fr 250px;
    grid-template-rows: 60px 1fr 60px;
    min-height: 100vh;
    gap: 8px;

    .top-nav-container {
        grid-area: top;
        background-color: #f5f5f5;
    }

    .left-nav-container {
        grid-area: left;
        background-color: #f5f5f5;
    }

    .page-content-container {
        grid-area: main;
        background-color: #ffffff;
    }

    .right-nav-container {
        grid-area: right;
        background-color: #f5f5f5;
    }

    .footer-container {
        grid-area: footer;
        background-color: #f5f5f5;
    }
}
</style>
