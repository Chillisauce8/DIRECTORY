<template>
    <component
        :is="mode === 'view' ? 'a' : 'article'"
        v-if="isWrapperVisible"
        :href="mode === 'view' ? fullSizeSrc : null"
        :data-fancybox="mode === 'view' ? gallery : null"
        class="card-wrapper media-card"
        :class="{ selected: selected, [mode]: true }"
        :id="id"
        :data-search="searchTerms"
        @click="handleConditionalClick"
    >
        <slot />
        <!--   <TestCard :imageId="imageId" :name="name" :mode="mode" :loveable="loveable" :selected="selected" :show="show" />
-->
    </component>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { defineProps, defineEmits, defineModel, type PropType } from 'vue';

const props = defineProps({
    id: { type: String, required: true },
    mode: { type: String as () => 'view' | 'select' | 'edit' | 'order', default: 'view' },
    clickable: { type: Boolean, default: true },
    searchTerms: { type: String, default: '' },
    selected: { type: Boolean, default: false },
    imageId: { type: String, required: true },
    name: { type: String, default: '' },
    categories: { type: Array as PropType<{ id: number; name: string }[]>, default: () => [] },
    gallery: { type: String, default: 'gallery' },
    loveable: { type: Boolean, default: false },
    show: { type: Array as PropType<string[]>, default: () => [] }
});

const emit = defineEmits(['update:selected']);
const selected = defineModel('selected', { type: Boolean, default: false });

function handleClick() {
    if (props.clickable) {
        emit('update:selected', !props.selected);
    }
}

// Conditional click handler to apply prevent/stop only when mode is not 'view'
function handleConditionalClick(event: Event) {
    if (props.mode !== 'view') {
        event.preventDefault();
        event.stopPropagation();
        handleClick();
    }
}

const fullSizeSrc = computed(() => `https://media.chillisauce.com/image/upload/c_fill,q_auto,f_auto/${props.imageId}`);
const isWrapperVisible = computed(() => props.mode === 'view' || props.clickable);
</script>

<style lang="scss">
.media-card {
    picture {
        @include aspect-ratio(3, 2);
    }
    &.edit.selected {
        .card-details {
            display: none;
        }
    }
    .card-details {
        &:not(.categories) .categories,
        &:not(.name) .name {
            display: none;
        }
        .name {
            font-family: $ff2;
            font-size: 15px;
            font-weight: 100;
            margin: 5px 0;
        }
        .categories {
            font-family: $ff2;
            font-size: 12px;
            font-weight: 500;
            text-transform: uppercase;
        }
    }
    .form {
        width: 100%;
        display: flex;
        flex-direction: column;
        > *:not(:last-child) {
            margin-bottom: 10px;
        }
        .p-inputtext {
            font-size: 12px;
        }
    }
}
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
    &.order {
        cursor: move;
    }
    &.select,
    &.view,
    &.edit,
    &.order {
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
    &:has(.card-text-wrapper.hide) {
        .swp-picture img {
            border-radius: var(--corner-outer);
        }
    }
    & .swp-picture img {
        border-top-left-radius: var(--corner-outer);
        border-top-right-radius: var(--corner-outer);
    }
}
</style>
