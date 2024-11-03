<template>
    <nuxt-link v-if="link" :to="link" class="card-wrapper" :class="{ searchhide: searchHide }">
        <article :data-search="searchTerms">
            <slot />
        </article>
    </nuxt-link>
    <article v-else class="card-wrapper" :class="{ searchhide: searchHide, selected: selectedInternalValue }" :data-search="searchTerms" @click="handleClick">
        <slot />
    </article>
</template>

<script setup lang="ts">
const props = defineProps({
    mode: {
        type: String as () => 'view' | 'select',
        default: 'view'
    },
    selected: {
        type: Boolean,
        default: false
    },
    link: {
        type: [String, Object] as PropType<string | { path: string }>,
        default: ''
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

const emit = defineEmits<{ (e: 'selected', value: boolean): void }>();
const selectedInternalValue = ref(props.selected);

watch(
    () => props.selected,
    (newVal) => {
        selectedInternalValue.value = newVal;
    },
    { immediate: true }
);

function handleClick(event: MouseEvent) {
    if (props.clickable && props.mode === 'select') {
        onSelect(event);
    }
}

function onSelect(event: MouseEvent) {
    selectedInternalValue.value = !selectedInternalValue.value;
    emit('selected', selectedInternalValue.value);
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
    & header {
        position: relative;
        padding: 5%;
        text-align: center;
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;
        align-items: stretch;
    }
    img {
        transition: all 0.7s ease;
    }
    &.selected img {
        filter: brightness(40%);
    }
    .overlay .tick {
        width: 0%;
        height: 0px;
        position: absolute;
        overflow: hidden;
        top: 5px;
        right: 5px;
        transition: all 0.7s ease;
    }
    &.selected .overlay .tick {
        width: 24px;
        height: 24px;
        background-color: var(--primary-color);
        border-radius: 50%;
        svg {
            stroke: white;
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
