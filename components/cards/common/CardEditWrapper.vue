<template>
    <transition name="card-edit">
        <div class="card-edit-wrapper" v-if="showWrapper">
            <CrudControl :collection="collection" function="update" :dialogEdit="false" :itemId="dataItem._doc"
                         :initialItem="dataItem" noButton preventDefault @save="onSave" />
        </div>
    </transition>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';

const props = defineProps({
    mode: { type: String, required: true },
    selected: { type: Boolean, required: true },
    collection: { type: String, required: true },
    dataItem: { type: Object, required: true }
});

const emit = defineEmits(['save']);
const showWrapper = ref(props.mode === 'edit' && props.selected);

watch(
    () => props.mode === 'edit' && props.selected,
    (newValue) => {
        showWrapper.value = newValue;
    }
);

function onSave(event: any) {
    emit('save', event);
}
</script>

<style lang="scss">
.card-edit-wrapper {
    padding: 1rem;
    &.card-edit-enter-active {
        animation: fadein 1s ease-in forwards, update-height 1s ease-in forwards;
    }
    &.card-edit-leave-active {
        animation: fadeout 0.5s ease-in forwards, collapse-height 1s ease-in forwards;
    }
}
</style>
