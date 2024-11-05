<template>
    <nuxt-link v-if="link" :to="link" class="card-wrapper" :class="{ searchhide: searchHide }">
        <article :data-search="searchTerms">
            <slot />
        </article>
    </nuxt-link>
    <article v-else class="card-wrapper" :class="{ searchhide: searchHide, selected: selectedInternalValue, editable: isEditable }" :data-search="searchTerms" @click="handleClick">
        <slot />
    </article>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue';

const { mode, selected, link, clickable, searchHide, searchTerms } = defineProps({
    mode: {
        type: String as () => 'view' | 'select' | 'edit',
        default: 'view'
    },
    selected: {
        type: Boolean,
        default: false
    },
    link: {
        type: String as () => string | null,
        default: null
    },
    clickable: {
        type: Boolean,
        default: true
    },
    searchHide: {
        type: Boolean,
        default: false
    },
    searchTerms: {
        type: String,
        default: ''
    }
});

const emit = defineEmits<{ (e: 'selected', value: boolean): void; (e: 'editable', value: boolean): void }>();
const selectedInternalValue = ref(selected);
const isEditable = ref(false);

function handleClick(event: MouseEvent) {
    if (clickable) {
        if (mode === 'select') {
            onSelect();
        } else if (mode === 'edit') {
            toggleEditable();
        }
    }
}

function onSelect() {
    selectedInternalValue.value = !selectedInternalValue.value;
    emit('selected', selectedInternalValue.value);
}

function toggleEditable() {
    isEditable.value = !isEditable.value;
    emit('editable', isEditable.value);
}
</script>

<style lang="scss">
.card-wrapper {
    position: relative; // For smooth Vue transition-group https://www.youtube.com/watch?v=DGI_aKld0Jg
    background: var(--surface-card);
    border: var(--card-border);
    font-size: 12px;
    transition: all 1s ease;
    border-radius: var(--corner-outer);
    box-shadow: var(--box-shadow);
    cursor: pointer;
    img {
        transition: all 0.7s ease;
    }
    &.select,
    &.view,
    &.edit {
        .mode-icons {
            display: flex;
            width: 100%;
            height: 100%;
            justify-content: flex-end;
            padding: 5px;
            opacity: 0;
            transition: all 1s ease;
            .icon {
                width: 24px;
                height: 24px;
            }
        }
        :hover {
            img {
                filter: brightness(80%);
            }
            .mode-icons {
                opacity: 0.8;
            }
        }
    }
    &.select.selected {
        img {
            filter: brightness(40%);
        }
        .mode-icons {
            opacity: 1;
            .icon {
                background-color: var(--primary-color);
                border-radius: 50%;
                svg {
                    stroke: white;
                }
            }
        }
    }

    & .swp-picture,
    .swp-picture picture,
    .swp-picture img {
        border-top-left-radius: var(--corner-outer);
        border-top-right-radius: var(--corner-outer);
    }
    &.searchhide {
        animation: search-hide 3s ease 0.4s forwards;
    }
}

@keyframes search-hide {
    0% {
        position: absolute;
        opacity: 1;
    }
    100% {
        opacity: 0;
        position: absolute;
        transform: translateY(1000vh);
    }
}
</style>
