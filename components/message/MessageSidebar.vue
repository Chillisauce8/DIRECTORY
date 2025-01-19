<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

defineProps({
    items: {
        type: Array,
        default: () => []
    }
});

function navigate(item) {
    const targetRoute = item.routerLink || '/new/message/compose';
    router.push(targetRoute);
}
</script>

<template>
    <div class="message-sidebar">
        <Button @click="navigate" label="Compose New" class="compose-btn" outlined></Button>
        <div class="sidebar-content">
            <ul class="nav-list">
                <li v-for="item in items" :key="item.id" class="nav-item" :class="{ active: router.currentRoute.value.path === item.routerLink }" @click="navigate(item)">
                    <i :class="[item.icon, 'nav-icon', { active: router.currentRoute.value.path === item.routerLink }]"></i>
                    <span class="nav-label" :class="{ active: router.currentRoute.value.path === item.routerLink }">{{ item.label }}</span>
                    <span v-if="item.badge" class="nav-badge">{{ item.badge }}</span>
                </li>
            </ul>
        </div>
    </div>
</template>

<style lang="scss">
.message-sidebar {
    .compose-btn {
        margin-bottom: 2rem;
        width: 100%;
    }

    .sidebar-content {
        overflow: auto;
    }

    .nav-list {
        display: flex;
        flex-direction: row;
        gap: 0.25rem;
        list-style: none;
        margin: 0;
        padding: 0;
        overflow: auto;

        @media (min-width: $lg) {
            flex-direction: column;
            gap: 0.5rem;
        }
    }

    .nav-item {
        cursor: pointer;
        user-select: none;
        padding: 1rem;
        border-radius: 0.25rem;
        display: flex;
        align-items: center;
        justify-content: center;
        flex: auto;
        transition: background-color 150ms ease;

        @media (min-width: $lg) {
            justify-content: flex-start;
            flex: 1;
        }

        &:hover:not(.active) {
            background-color: var(--surface-hover);
        }

        &.active {
            background-color: var(--primary-color);
        }
    }

    .nav-icon {
        color: var(--surface-600);
        font-size: 1.125rem;
        transition: color 150ms ease;

        @media (min-width: $lg) {
            margin-right: 1rem;
        }

        &.active {
            color: var(--primary-50);
        }
    }

    .nav-label {
        color: var(--surface-900);
        font-weight: 500;
        display: none;

        @media (min-width: $lg) {
            display: inline;
        }

        &.active {
            color: var(--primary-50);
        }
    }

    .nav-badge {
        margin-left: auto;
        font-size: 0.875rem;
        font-weight: 600;
        background-color: var(--primary-50);
        color: var(--primary-900);
        padding: 0.25rem 0.5rem;
        border-radius: 2rem;
        width: 23px;
        height: 23px;
        text-align: center;
        display: none;

        @media (min-width: $lg) {
            display: inline;
        }
    }
}
</style>
