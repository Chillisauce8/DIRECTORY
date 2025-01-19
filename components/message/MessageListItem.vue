<script setup lang="ts">
import { FilterMatchMode } from '@primevue/core/api';
import type { Message } from '~/types/message';

// Define props with TypeScript interface
interface Props {
    messages?: Message[];
}

interface Emits {
    (e: 'action', type: string, messages: Message[]): void;
    (e: 'toggleFlag', flag: 'starred' | 'important', message: Message): void;
    (e: 'reply', message: Message): void;
}

const props = withDefaults(defineProps<Props>(), {
    messages: () => []
});

const emit = defineEmits<Emits>();

// Use refs with proper typing
const messageTable = ref<InstanceType<typeof DataTable> | null>(null);
const selectedMessages = ref<Message[]>([]);
const menuRef = ref<InstanceType<typeof Menu> | null>(null);
const rowRefs = ref<Map<string, HTMLElement>>(new Map());

// Composable for router
const router = useRouter();

// Reactive menu items
const menuItems = computed(() => [
    { label: 'Archive', icon: 'pi pi-file', command: () => handleMessageAction('archive', selectedMessages.value) },
    { label: 'Spam', icon: 'pi pi-ban', command: () => handleMessageAction('spam', selectedMessages.value) },
    { label: 'Delete', icon: 'pi pi-trash', command: () => handleMessageAction('trash', selectedMessages.value) }
]);

// Table filter with type
const filterTable = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

/**
 * Registers row ref
 */
function registerRowRef(el: HTMLElement | null, id: string) {
    if (!el) return;
    rowRefs.value.set(id, el);
}

/**
 * Toggles visibility of action buttons in table row
 */
function toggleRowActions(id: string, show: boolean) {
    const row = rowRefs.value.get(id);
    if (!row) return;

    row.classList.toggle('show-action-buttons', show);
    row.classList.toggle('show-date-text', !show);
}

/**
 * Resets boolean flags on message
 * DUMMY: Should be replaced with proper database update
 */
function clearMessageActions(message: Message) {
    const booleanFlags = ['trash', 'spam', 'archived', 'starred', 'important'];
    booleanFlags.forEach((flag) => {
        if (typeof message[flag] === 'boolean') {
            message[flag] = false;
        }
    });
}

/**
 * Handles message actions (archive, spam, trash)
 */
const handleMessageAction = (type: string, messages: Message | Message[]) => {
    const messageArray = Array.isArray(messages) ? messages : [messages];
    messageArray.forEach((msg) => clearMessageActions(msg));
    emit('action', type, messageArray);
    selectedMessages.value = [];
};

/**
 * Handles flag toggles (starred, important)
 * Simplified to just emit the event with current message
 */
const toggleMessageFlag = (flag: 'starred' | 'important', message: Message) => {
    emit('toggleFlag', flag, message);
};

/**
 * Handles reply action
 */
const handleReply = (message: Message) => {
    emit('reply', message);
};

/**
 * Navigates to message detail page
 */
function onNavigateToDetailPage(id: string) {
    router.push({
        name: 'message-detail',
        params: { id: id.toString() }, // Fix: Ensure id is string
        path: `/messages/detail/${id}` // Add explicit path
    });
}

// Rest of the component logic with updated types...
// ...existing code...
</script>

<template>
    <DataTable
        ref="messageTable"
        class="message-types"
        :value="messages"
        v-model:selection="selectedMessages"
        v-model:filters="filterTable"
        :rows="20"
        paginator
        :rowsPerPageOptions="[10, 20, 30]"
        dataKey="id"
        rowHover
        :globalFilterFields="['from', 'to', 'title', 'message']"
    >
        <Column class="selection-column" selectionMode="multiple" />

        <Column class="menu-column">
            <template #header>
                <div class="menu-header">
                    <Button v-if="selectedMessages.length > 0" type="button" icon="pi pi-ellipsis-v" class="menu-button ml-4" text plain rounded @click="menuRef.toggle($event)" />
                    <Menu ref="menuRef" popup :model="menuItems" class="menu-functions w-32" />
                </div>
            </template>
        </Column>

        <Column class="star-column">
            <template #body="{ data }">
                <div v-if="!data.trash && !data.spam" class="cell-content">
                    <span class="cursor-pointer" @click.stop="toggleMessageFlag('starred', data)">
                        <i class="pi pi-fw text-xl" :class="{ 'pi-star-fill': data.starred, 'pi-star': !data.starred }" />
                    </span>
                </div>
            </template>
        </Column>

        <Column class="important-column">
            <template #body="{ data }">
                <div v-if="!data.trash && !data.spam" class="cell-content">
                    <span class="cursor-pointer" @click.stop="toggleMessageFlag('important', data)">
                        <i class="pi pi-fw text-xl" :class="{ 'pi-bookmark-fill': data.important, 'pi-bookmark': !data.important }" />
                    </span>
                </div>
            </template>
        </Column>

        <Column class="avatar-column">
            <template #body="{ data }">
                <div class="cell-content">
                    <Avatar v-if="!data.image" icon="pi pi-user" shape="circle" />
                    <Avatar v-else @click="onNavigateToDetailPage(data.id)" :id="data.id" :image="`/demo/images/avatar/${data.image ? data.image : '.png'}`" class="cursor-pointer" />
                </div>
            </template>
        </Column>

        <Column class="sender-column">
            <template #body="{ data }">
                <div class="cell-content">
                    <div class="mail-info">
                        {{ data.from || data.to }}
                    </div>
                </div>
            </template>
        </Column>

        <Column class="title-column">
            <template #header>
                <IconField class="search-field">
                    <InputIcon class="pi pi-search" />
                    <InputText type="text" placeholder="Search" class="search-input" v-model="filterTable.global.value" />
                </IconField>
            </template>
            <template #body="{ data }">
                <div class="cell-content cursor-pointer" @click="onNavigateToDetailPage(data.id)" :ref="(el) => registerRowRef(el, data.id)" @mouseenter="toggleRowActions(data.id, true)" @mouseleave="toggleRowActions(data.id, false)">
                    <div class="title-wrapper">
                        <div class="mail-info-mobile">{{ data.from || data.to }}</div>
                        <div class="mail-title">{{ data.title }}</div>
                    </div>
                </div>
            </template>
        </Column>

        <Column field="date" class="date-column">
            <template #body="{ data }">
                <div class="cell-content show-date-text" :ref="(el) => registerRowRef(el, data.id)" @mouseenter="toggleRowActions(data.id, true)" @mouseleave="toggleRowActions(data.id, false)">
                    <div class="date-wrapper">
                        <span class="date-text">
                            {{ data.date }}
                        </span>
                        <div class="action-buttons">
                            <Button @click="handleReply(data)" type="button" icon="pi pi-reply" class="action-button" v-tooltip.top="'Reply'" />
                            <Button @click="handleMessageAction('archive', data)" type="button" icon="pi pi-inbox" class="action-button" v-tooltip.top="'Archive'" />
                            <Button @click="handleMessageAction('trash', data)" type="button" icon="pi pi-trash" class="action-button" severity="danger" v-tooltip.top="'Trash'" />
                        </div>
                    </div>
                </div>
            </template>
        </Column>
    </DataTable>
</template>

<style lang="scss">
.message-types {
    --call-padding: 0.5rem;

    // Helper Classes
    .p-datatable-tbody td {
        vertical-align: middle;
        padding: 0px; //Overide default padding
        &.selection-column {
            padding: var(--call-padding);
        }
        .cell-content {
            display: flex;
            align-items: center;
            //         height: 100%;
            padding: var(--call-padding);
        }
    }
    .p-datatable-header-cell {
        padding: var(--call-padding);
    }
    // Menu Column has odd css to overcome td widths in the grid - could be better!

    .star-column {
        @media (max-width: $md) {
            display: none;
        }
    }
    .important-column {
        @media (max-width: $md) {
            display: none;
        }
    }

    .menu-column {
        width: 0;
        padding: 0;
        position: relative;

        .menu-header {
            position: absolute;
            top: 10%;
            left: -1rem; // Accounts for selection column width
        }
    }
    .sender-column {
        @media (max-width: $lg) {
            display: none;
        }

        .mail-info {
            width: 100%;
        }
    }

    .title-column {
        .title-wrapper {
            display: flex;
            flex-direction: column;
            width: 100%;

            .mail-info-mobile {
                font-weight: 600;
                color: var(--surface-900);
                @media (min-width: $lg) {
                    display: none;
                }
            }

            .mail-title {
                font-weight: 500;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                max-width: 30rem;
            }
        }
    }
    .date-column {
        width: 120px;
        @media (max-width: $lg) {
            display: none;
        }

        .cell-content {
            display: flex;
            justify-content: flex-end;
            font-weight: 600;
            white-space: nowrap;

            &.show-action-buttons {
                .action-buttons {
                    display: flex;
                }
                .date-text {
                    display: none;
                }
            }

            &.show-date-text {
                .action-buttons {
                    display: none;
                }
                .date-text {
                    display: flex;
                }
            }

            .action-buttons {
                gap: 0.5rem;
                justify-content: flex-end;

                .action-button {
                    height: 2rem;
                    width: 2rem;
                }
            }
        }
    }

    // Search and Menu Components
    .search-field {
        margin-left: auto;
        position: relative;
        left: 100px;
    }
}
</style>
