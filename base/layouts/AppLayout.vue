<script setup>
import { computed, onBeforeUnmount, onMounted } from 'vue';
import AppConfig from './AppConfig.vue';
import AppProfileSidebar from './AppProfileSidebar.vue';
import AppSidebar from './AppSidebar.vue';

const { layoutConfig, layoutState, watchSidebarActive, unbindOutsideClickListener } = useLayout();

onMounted(() => {
    watchSidebarActive();
});

onBeforeUnmount(() => {
    unbindOutsideClickListener();
});

const containerClass = computed(() => {
    return {
        'layout-light': !layoutConfig.darkTheme,
        'layout-dark': layoutConfig.darkTheme,
        'layout-colorscheme-menu': layoutConfig.menuTheme === 'colorScheme',
        'layout-primarycolor-menu': layoutConfig.menuTheme === 'primaryColor',
        'layout-transparent-menu': layoutConfig.menuTheme === 'transparent',
        'layout-main': true, // Always use main layout
        'layout-mobile-active': layoutState.staticMenuMobileActive,
        'layout-sidebar-active': layoutState.sidebarActive,
        'layout-sidebar-anchored': layoutState.anchored
    };
});
</script>

<template>
    <div :class="['layout-container', { ...containerClass }]">
        <AppSidebar />

        <div class="layout-content-wrapper">
            <AuthStatusBar /> 
            <TopNav />
            <main class="layout-content">
                <NuxtPage></NuxtPage>
            </main>
        </div>

        <AppProfileSidebar />
        <AppConfig />

        <div class="layout-mask"></div>
    </div>
</template>
