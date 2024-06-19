<script setup>
import { onMounted, ref } from 'vue';

const emit = defineEmits(['close', 'save']);

const props = defineProps({
    selectedTaskId: {
        type: String,
        default: null
    }
});

const task = ref({});
const filteredMembers = ref([]);

onMounted(() => {

});

const onHide = () => {
    emit('close', task.value);
};

const onSave = () => {
    emit('save', task.value);
};

</script>

<template>
    <div class="p-4">
        <div class="grid p-fluid formgrid">
          <DataItem collection="tasklisttest"
                    :function="props.selectedTaskId ? 'update' : 'create'"
                    :id="props.selectedTaskId">
          </DataItem>
          <div class="col-12 flex justify-content-end mt-4">
            <Button class="w-8rem mr-3" outlined icon="pi pi-times" label="Cancel" @click="onHide()"></Button>
            <Button class="w-8rem" icon="pi pi-check" label="Save" @click="onSave()"></Button>
          </div>
        </div>
    </div>
</template>
