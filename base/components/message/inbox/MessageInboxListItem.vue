<script setup lang="ts">
import type { Message } from '~/types/message';
import { FilterMatchMode } from '@primevue/core/api';

interface Props {
    messages?: Message[];
}

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
const loadError = ref<string | null>(null);
const flagOperationsInProgress = ref<Record<string, boolean>>({});

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

// Actions for moving messages between primary folders
const handleMessageAction = async (type: string, messages: Message | Message[]) => {
    const actionId = `action-${Date.now()}`;
    
    try {
        console.log(`[DEBUG-${actionId}] Message Action: ${type}`);
        const messageArray = Array.isArray(messages) ? messages : [messages];
        
        // Fix: Map 'archive' action to 'archived' state for consistency
        const stateValue = type === 'trash' ? 'deleted' : 
                           type === 'archive' ? 'archived' : type;
        
        console.log('Moving messages to folder:', {
            actionId,
            folder: type,
            state: stateValue,
            count: messageArray.length,
            messageIds: messageArray.map(m => m._id),
            timestamp: new Date().toISOString()
        });
        
        // Wait for all updates to complete
        const results = await Promise.all(messageArray.map(msg => 
            store.updateMessageState(msg._id, { state: stateValue as any })
        ));
        
        // Only show toast if all updates were successful
        if (results.every(r => r.success)) {
            selectedMessages.value = [];
            toast.add({
                severity: 'success',
                summary: 'Success',
                detail: `Message${messageArray.length > 1 ? 's' : ''} moved to ${type}`,
                life: 3000
            });
        }
        
        console.log(`[DEBUG-${actionId}] Action complete`, {
            timestamp: new Date().toISOString()
        });
        console.groupEnd();
    } catch (error) {
        console.error(`[DEBUG-${actionId}] Error in action:`, error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error instanceof Error ? error.message : 'Failed to update message',
            life: 3000
        });
        console.groupEnd();
    }
};

// Actions for special folders (starring/flagging)
const toggleMessageFlag = async (flag: 'isStarred' | 'isImportant', message: Message) => {
    const actionId = `flag-${Date.now()}`;
    const operationKey = `${message._id}-${flag}`;
    
    // Prevent duplicate operations on the same message+flag
    if (flagOperationsInProgress.value[operationKey]) {
        console.log(`[DEBUG-${actionId}] Operation already in progress for ${operationKey}`);
        return;
    }
    
    // Mark operation as in progress
    flagOperationsInProgress.value[operationKey] = true;
    
    // Setup optimistic UI update - modify the local message state directly for immediate feedback
    const currentValue = message.messageState?.[flag] || false;
    const newValue = !currentValue;

    // Make a local copy with the updated flag for optimistic UI
    if (message.messageState) {
        message.messageState[flag] = newValue;
    }
    
    try {
        console.group(`[DEBUG-${actionId}] Toggle Flag: ${flag}`);
        console.log('Toggling message flag:', {
            actionId,
            messageId: message._id,
            flag,
            beforeValue: currentValue,
            afterValue: newValue,
            timestamp: new Date().toISOString()
        });
        
        // Wait for store operation to complete
        const result = await store.toggleFlag(message._id, flag);
        
        // Only show toast if operation was successful
        if (result?.success) {
            console.log(`[DEBUG-${actionId}] Showing success toast:`, {
                flag,
                success: result.success,
                finalState: result.state?.[flag],
                timestamp: new Date().toISOString()
            });
            
            toast.add({
                severity: 'success',
                summary: 'Flag Updated',
                detail: `Message ${flag.replace('is', '').toLowerCase()} updated`,
                life: 3000
            });
        } else {
            console.warn(`[DEBUG-${actionId}] Not showing toast - success status:`, result);
            
            // Rollback optimistic UI update on failure
            if (message.messageState) {
                message.messageState[flag] = currentValue;
            }
        }
        
        console.log(`[DEBUG-${actionId}] Flag toggle complete`, {
            timestamp: new Date().toISOString()
        });
        console.groupEnd();
    } catch (error) {
        console.error(`[DEBUG-${actionId}] Error in flag toggle:`, error);
        
        // Rollback optimistic UI update on error
        if (message.messageState) {
            message.messageState[flag] = currentValue;
        }
        
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Could not update message flag',
            life: 3000
        });
        console.groupEnd();
    } finally {
        // Clear operation flag when done
        delete flagOperationsInProgress.value[operationKey];
    }
};

const onNavigateToDetailPage = (message: Message) => {
    emit('show-detail', message);
};

const handleReply = (message: Message) => {
    emit('reply', message);
};

const handleHover = (id: string | null) => {
    hoveredRowId.value = id;
};
</script>

<template>
    <div class="message-list">
        <div v-if="loadError" class="error-message">
            {{ loadError }}
            <Button icon="pi pi-refresh" @click="store.fetchMessages()" />
        </div>

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
    </div>
</template>

<style lang="scss">
.message-types {
    --call-padding: 0.5rem;

    .p-datatable-tbody td {
        vertical-align: middle;
        padding: 0px;
        &.selection-column {
            padding: var(--call-padding);
        }
        .cell-content {
            display: flex;
            align-items: center;
            padding: var(--call-padding);
        }
    }
    .p-datatable-header-cell {
        padding: var(--call-padding);
    }

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
            left: -1rem;
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
            gap: 0.25rem;

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
                max-width: 100%;
            }
        }

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

    .search-field {
        margin-left: auto;
        position: relative;

        @container main (min-width: #{$message-container-md}) {
            left: 120px;
        }
    }
}

.error-message {
    color: var(--red-500);
    text-align: center;
    padding: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
}
</style>
