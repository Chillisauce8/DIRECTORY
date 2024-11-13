<script setup>
import AppBreadcrumb from './AppBreadcrumb.vue';
import { useCurrentUser } from '~/service/user-common/current-user.factory';

const { onMenuToggle, onProfileSidebarToggle, onConfigSidebarToggle } = useLayout();
const currentUser = useCurrentUser();

function showProfileSidebar() {
    onProfileSidebarToggle();
}
</script>

<template>
    <div class="layout-topbar">
        <div class="topbar-start">
            <Button type="button" class="topbar-menubutton p-trigger" @click="onMenuToggle">
                <i class="pi pi-bars"></i>
            </Button>

            <AppBreadcrumb class="topbar-breadcrumb"></AppBreadcrumb>
        </div>

        <div class="topbar-end">
            <ul class="topbar-menu">
                <li class="topbar-search">
                    <IconField>
                        <InputIcon class="pi pi-search" />
                        <InputText type="text" placeholder="Search" class="w-48 sm:w-full" />
                    </IconField>
                </li>
                <li class="ml-4">
                    <Button icon="pi pi-cog" text rounded severity="secondary" @click="onConfigSidebarToggle"></Button>
                </li>
                <li class="topbar-profile" v-if="currentUser.isLoggedIn()">
                    <Button type="button" class="topbar-sidebarbutton" @click="showProfileSidebar">
                        <img src="/demo/images/avatar/avatar.png" alt="Profile" />
                    </Button>
                </li>
            </ul>
        </div>
    </div>
</template>

<style lang="scss" scoped></style>
