<template>
    <!-- Dynamic root element with classes and click event -->
    <component
        :is="mode === 'view' ? 'a' : 'article'"
        :href="mode === 'view' ? fullSizeSrc : undefined"
        :data-fancybox="mode === 'view' ? gallery : undefined"
        class="card-wrapper"
        :class="computedClasses"
        :id="id"
        :data-search="searchTerms"
        @click="toggleSelected($event)"
    >
        <slot />
        <div v-if="mode" class="mode-icons">
            <SvgIcon :svg="modeIcon" :class="mode" />
        </div>
    </component>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

/* Define component props */
const props = defineProps({
    id: { type: String, required: true },
    mode: { type: String, default: '' },
    clickable: { type: Boolean, default: true },
    searchTerms: { type: String, default: '' },
    selected: { type: Boolean, required: true },
    imageId: { type: String, default: '' },
    gallery: { type: String, default: 'gallery' },
    show: { type: Array, default: () => [] }
});

/* Emit for two-way binding */
const emit = defineEmits(['update:selected']);
const fullSizeSrc = computed(() => `https://media.chillisauce.com/image/upload/c_fill,q_auto,f_auto/${props.imageId}`);

/* Local selected state */
const isSelected = ref(props.selected);

/* Watch for external changes to selected prop */
watch(
    () => props.selected,
    (newVal) => {
        isSelected.value = newVal;
    }
);

/* Toggle selected state on click */
const toggleSelected = ($event) => {
    if (props.clickable && !$event.defaultPrevented) {
        isSelected.value = !isSelected.value;
        emit('update:selected', isSelected.value); // Emit updated value
    }
};

const modeIcon = computed(() => {
    const baseIcons: Record<string, string> = {
        select: 'check-circle',
        edit: 'edit',
        view: 'eye',
        order: 'move'
    };

    // If selected and in edit mode, always show check-circle
    if (props.selected && props.mode === 'edit') {
        return 'check-circle';
    }

    // Otherwise use the base icon
    return props.mode ? baseIcons[props.mode] : '';
});

/* Computed classes */
const computedClasses = computed(() => ({
    selected: isSelected.value,
    [props.mode]: props.mode,
    ...Object.fromEntries(props.show.map((item) => [item, true]))
}));
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
            position: absolute;
            top: 0px;
            right: 0px;
            display: flex;
            width: 100%;
            height: 100%;
            justify-content: flex-end;
            padding: 5px;
            opacity: 0;
            transition: all 1s ease;
            .icon {
                border-radius: 50%;
                width: 24px;
                height: 24px;
            }
        }
        &:hover {
            img {
                filter: brightness(80%);
            }
            .mode-icons {
                opacity: 1;
                .icon {
                    svg {
                        stroke: var(--primary-color);
                    }
                }
            }
        }
    }
    &.select.selected,
    &.edit.selected {
        img {
            filter: brightness(40%);
        }
        .mode-icons {
            opacity: 1;
            .icon {
                background-color: var(--primary-color);
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
