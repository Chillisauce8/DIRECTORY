<script setup>
import { computed, onBeforeUnmount, onMounted } from 'vue';
import AppBreadCrumb from './AppBreadcrumb.vue';
import AppConfig from './AppConfig.vue';
import AppProfileSidebar from './AppProfileSidebar.vue';
import AppSidebar from './AppSidebar.vue';
import AppTopbar from './AppTopbar.vue';

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
        'layout-overlay': layoutConfig.menuMode === 'overlay',
        'layout-static': layoutConfig.menuMode === 'static',
        'layout-slim': layoutConfig.menuMode === 'slim',
        'layout-slim-plus': layoutConfig.menuMode === 'slim-plus',
        'layout-horizontal': layoutConfig.menuMode === 'horizontal',
        'layout-reveal': layoutConfig.menuMode === 'reveal',
        'layout-drawer': layoutConfig.menuMode === 'drawer',
        'layout-static-inactive': layoutState.staticMenuDesktopInactive && layoutConfig.menuMode === 'static',
        'layout-overlay-active': layoutState.overlayMenuActive,
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
            <TopNav />
            <!--       <AppTopbar /> -->
            <!--  <AppBreadCrumb class="content-breadcrumb"></AppBreadCrumb> -->
            <main class="layout-content">
                <NuxtPage></NuxtPage>
            </main>
        </div>

        <AppProfileSidebar />
        <AppConfig />

        <Toast></Toast>
        <div class="layout-mask"></div>
    </div>
</template>
