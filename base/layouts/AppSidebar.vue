<script setup>
import AppMenu from './AppMenu.vue';

const { layoutState, onSidebarToggle, onAnchorToggle } = useLayout();

let timeout = null;

function onMouseEnter() {
    if (!layoutState.anchored) {
        if (timeout) {
            clearTimeout(timeout);
            timeout = null;
        }
        onSidebarToggle(true);
    }
}

function onMouseLeave() {
    if (!layoutState.anchored) {
        if (!timeout) {
            timeout = setTimeout(() => onSidebarToggle(false), 300);
        }
    }
}
</script>

<template>
    <div class="layout-sidebar" @mouseenter="onMouseEnter" @mouseleave="onMouseLeave">
        <div class="sidebar-header">
            <button class="layout-sidebar-anchor z-20 mb-2" type="button" @click="onAnchorToggle"></button>
        </div>
        <div class="layout-menu-container">
            <AppMenu />
        </div>
    </div>
</template>

<style lang="scss" scoped></style>
