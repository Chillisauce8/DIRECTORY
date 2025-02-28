<script setup lang="ts">
import type { Message } from '~/types/message';
import { FilterMatchMode } from '@primevue/core/api';

interface Props {
    messages?: Message[];
}

// Props and emits
const props = withDefaults(defineProps<Props>(), {
    messages: () => []
});

const emit = defineEmits<{
    action: [type: string, messages: Message[]];
    toggleFlag: [flag: 'starred' | 'important', message: Message];
    reply: [message: Message];
    'show-detail': [message: Message];
}>();

// Composables
const store = useMessage();
const toast = useToast();

// Reactive state
const messageTable = ref<InstanceType<typeof DataTable> | null>(null);
const selectedMessages = ref<Message[]>([]);
const menuRef = ref<InstanceType<typeof Menu> | null>(null);
const hoveredRowId = ref<string | null>(null);
const filterTable = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

// Menu items
const menuItems = computed(() => [
    { 
        label: 'Archive', 
        icon: 'pi pi-file', 
        command: () => handleMessageAction('archive', selectedMessages.value) 
    },
    { 
        label: 'Delete', 
        icon: 'pi pi-trash', 
        command: () => handleMessageAction('trash', selectedMessages.value) 
    }
]);

// Actions
const handleMessageAction = async (type: string, messages: Message | Message[]) => {
    const messageArray = Array.isArray(messages) ? messages : [messages];
    await Promise.all(messageArray.map(msg => 
        store.updateMessageState(msg._id, { state: type as any })
    ));
    selectedMessages.value = [];
};

const toggleMessageFlag = async (flag: 'isStarred' | 'isImportant', message: Message) => {
    try {
        await store.toggleFlag(message._id, flag);
        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: `Message ${flag.replace('is', '').toLowerCase()} updated`,
            life: 3000
        });
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Could not update message flag',
            life: 3000
        });
    }
};

const onNavigateToDetailPage = (message: Message) => {
    emit('show-detail', message);
};

const handleReply = (message: Message) => {
    emit('reply', message);
};

// ...existing template...
</script>

<template>
    <div v-if="!messages?.length" class="p-4 text-center text-gray-500">
        No messages found in this folder
    </div>
    
    <DataTable
        v-else
        ref="messageTable"
        class="message-types"
        :value="messages"
        v-model:selection="selectedMessages"
        v-model:filters="filterTable"
        :rows="20"
        paginator
        :rowsPerPageOptions="[10, 20, 30]"
        dataKey="_id"
        rowHover
        :globalFilterFields="['from', 'to', 'subject', 'content']"
        @row-mouseenter="(e) => handleHover(e.data._id)"
        @row-mouseleave="() => handleHover(null)"
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
                <div class="cell-content">
                    <span class="cursor-pointer" @click.stop="toggleMessageFlag('isStarred', data)">
                        <i class="pi pi-fw text-xl" :class="{ 
                            'pi-star-fill': data.messageState?.isStarred, 
                            'pi-star': !data.messageState?.isStarred 
                        }" />
                    </span>
                </div>
            </template>
        </Column>

        <Column class="important-column">
            <template #body="{ data }">
                <div class="cell-content">
                    <span class="cursor-pointer" @click.stop="toggleMessageFlag('isImportant', data)">
                        <i class="pi pi-fw text-xl" :class="{ 
                            'pi-bookmark-fill': data.messageState?.isImportant, 
                            'pi-bookmark': !data.messageState?.isImportant 
                        }" />
                    </span>
                </div>
            </template>
        </Column>

        <Column class="avatar-column">
            <template #body="{ data }">
                <div class="cell-content">
                    <Avatar v-if="!data.image" icon="pi pi-user" shape="circle" />
                    <Avatar v-else @click="onNavigateToDetailPage(data)" :id="data.id" :image="`/demo/images/avatar/${data.image ? data.image : '.png'}`" class="cursor-pointer" />
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
                <div class="cell-content cursor-pointer" 
                    @click="onNavigateToDetailPage(data)">
                    <div class="title-wrapper">
                        <div class="title-top">
                            <div class="mail-info-mobile">{{ data.from || data.to }}</div>
                            <div class="date-text-mobile">
                                {{ data.created?.date || 'No date' }}
                            </div>
                        </div>
                        <div class="mail-title">{{ data.subject }}</div>
                    </div>
                </div>
            </template>
        </Column>

        <Column field="date" class="date-column">
            <template #body="{ data }">
                <div class="cell-content">
                    <div class="date-wrapper">
                        <div class="date-text">
                            {{ data.created?.date || 'No date' }}
                        </div>
                        <div class="action-buttons">
                            <Button @click.stop="handleReply(data)" type="button" icon="pi pi-reply" class="action-button" v-tooltip.top="'Reply'" />
                            <Button @click.stop="handleMessageAction('archive', data)" type="button" icon="pi pi-inbox" class="action-button" v-tooltip.top="'Archive'" />
                            <Button @click.stop="handleMessageAction('trash', data)" type="button" icon="pi pi-trash" class="action-button" severity="danger" v-tooltip.top="'Trash'" />
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
        @container main (max-width: #{$message-container-md}) {
            display: none;
        }
    }
    .important-column {
        @container main (max-width:  #{$message-container-md}) {
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
        @container main (max-width: #{$message-container-lg}) {
            display: none;
        }

        .mail-info {
            width: 100%;
        }
    }

    .title-column {
        min-width: 0;
        flex: 1;

        .cell-content {
            min-width: 0;
            width: 100%;
            display: flex;
            align-items: center;
            padding: var(--call-padding);
        }

        .title-wrapper {
            display: flex;
            flex-direction: column;
            min-width: 0;
            width: 100%;
            gap: 0.25rem; // Adds small spacing between title and top info

            .title-top {
                display: flex;
                justify-content: space-between;
                min-width: 0;
                width: 100%;

                .date-text-mobile {
                    @container main (min-width: #{$message-container-md}) {
                        display: none;
                    }
                }

                .mail-info-mobile {
                    font-weight: 600;
                    color: var(--surface-900);
                    @container main (min-width: #{$message-container-lg}) {
                        display: none;
                    }
                }
            }

            .mail-title {
                width: 100%;
                font-weight: 500;
                //    white-space: nowrap;
                //    overflow: hidden;
                //    text-overflow: ellipsis;
                max-width: 100%;
                //  padding-right: 1rem; // Gives some space at the end of truncated text
            }
        }

        // Handle search field in header
        .search-field {
            margin-left: auto;
            position: relative;

            @container main (min-width: #{$message-container-md}) {
                left: 120px;
            }
        }
    }
    .date-column {
        width: 120px;
        @container main (max-width: #{$message-container-md}) {
            display: none;
        }

        .cell-content {
            display: flex;
            justify-content: flex-end;
            font-weight: 600;
            white-space: nowrap;

            .date-wrapper {
                position: relative;
                width: 100%;
            }

            .date-text {
                display: flex;
                justify-content: flex-end;
            }

            .action-buttons {
                display: none;
             
      
                gap: 0.5rem;
                justify-content: flex-end;
                
                .action-button {
                    height: 2rem;
                    width: 2rem;
                }
            }
        }
    }

    // Add hover effect at the row level
    .p-datatable-tbody {
        tr:hover {
            .date-column {
                .cell-content {
                    .date-text {
                        display: none;
                    }
                    .action-buttons {
                        display: flex;
                    }
                }
            }
        }
    }

    // Search and Menu Components
    .search-field {
        margin-left: auto;
        position: relative;

        @container main (min-width: #{$message-container-md}) {
            left: 120px;
        }
    }
}
</style>
