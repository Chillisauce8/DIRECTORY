<template>
    <div class="top-nav" ref="topNav">
        <div class="left">
            <Hamburger button class="topbar-menubutton p-trigger" @click="onMenuToggle" />
        </div>
        <div class="centre">
            <SvgLogo />
        </div>
        <div class="right">
            <SvgIcon svg="cog" class="icon-test" button @click="onConfigSidebarToggle" />

            <SvgIcon svg="driver" class="icon-test" button @click="showProfileSidebar" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useScroll } from '@vueuse/core';

const { onMenuToggle, onProfileSidebarToggle, onConfigSidebarToggle } = useLayout();
const topNav = ref<HTMLElement | null>(null);
const { y } = useScroll(window);

function showProfileSidebar() {
    onProfileSidebarToggle();
}

watch(y, (newY) => {
    if (!topNav.value) return;

    if (newY > 0) {
        topNav.value.style.backdropFilter = 'blur(10px)';
        topNav.value.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    } else {
        topNav.value.style.backdropFilter = 'none';
        topNav.value.style.backgroundColor = 'transparent';
    }
});
</script>

<style lang="scss">
.top-nav {
    z-index: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 64px;
    position: sticky;
    top: 0px;
    color: white;

    .right,
    .center,
    .left {
        display: flex;
        align-items: center;
    }
    .svg-logo {
        width: 200px;
    }

    .icon-test {
        width: 36px;
        height: 36px;
    }

    transition: backdrop-filter 0.3s, background-color 0.3s;

    @supports (animation-timeline: scroll()) {
        animation: fill-background linear;
        animation-timeline: scroll();
    }
}

@supports (animation-timeline: scroll()) {
    @keyframes fill-background {
        0% {
            backdrop-filter: none;
            background-color: transparent;
        }
        3% {
            backdrop-filter: blur(10px);
            background-color: rgba(0, 0, 0, 0.8);
        }
        100% {
            backdrop-filter: blur(10px);
            background-color: rgba(0, 0, 0, 0.8);
        }
    }
}
</style>
