<template>
    <div class="top-nav">
        <div class="left">
            <SvgIcon svg="classic-car" button class="topbar-menubutton p-trigger" @click="onMenuToggle" />
        </div>
        <div class="centre">
            <SvgLogo />
        </div>
        <div class="right">
            <SvgIcon svg="cog" button @click="onConfigSidebarToggle" />

            <SvgIcon svg="driver" button @click="showProfileSidebar" />
        </div>
    </div>
</template>

<script lang="ts" setup>
const { onMenuToggle, onProfileSidebarToggle, onConfigSidebarToggle } = useLayout();

function showProfileSidebar() {
    onProfileSidebarToggle();
}
</script>

<style lang="scss">
.top-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;

    height: 48px;
    position: sticky;
    top: 0px;

    .right,
    .center,
    .left {
        display: flex;
        align-items: center;
    }
    .svg-logo {
        width: 200px;
    }
    .svg-icon {
        width: 24px;
        height: 24px;
    }
}
</style>
