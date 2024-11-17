<template>
    <nuxt-link v-if="link" :to="link" class="card-wrapper" :class="mode" :id="id">
        <article :data-search="searchTerms">
            <slot />
        </article>
    </nuxt-link>
    <article v-else class="card-wrapper" :class="{ selected: selected, [mode]: true }" :id="id" :data-search="searchTerms" @click="handleClick">
        <slot />
    </article>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
    id: { type: String, required: true },
    mode: { type: String as () => 'view' | 'select' | 'edit' | 'order', default: 'view' },
    link: { type: String as () => string | null, default: null },
    clickable: { type: Boolean, default: true },
    searchTerms: { type: String, default: '' },
    selected: { type: Boolean, default: false }
});

const emit = defineEmits(['update:selected']);

function handleClick() {
    if (props.clickable && (props.mode === 'select' || props.mode === 'edit')) {
        emit('update:selected', !props.selected);
    }
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
