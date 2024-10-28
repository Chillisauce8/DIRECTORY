<script setup lang="ts">
import { onMounted, ref } from 'vue';

const emit = defineEmits(['close', 'save']);

const props = defineProps({
    selectedTaskId: {
        type: String,
        default: null
    }
});

const task = ref({});
let saveData: (data: any) => Promise<void>;

onMounted(() => {

});

function dataChanged(result: {data: any, saveDataFunc: (data: any) => Promise<void>}) {
  task.value = result.data;
  saveData = result.saveDataFunc;
}

const onHide = () => {
    emit('close', task.value);
};

const onSave = async () => {
    await saveData(task.value);
    emit('save', task.value);
};

</script>

<template>
  <div class="flex items-center gap-4 mb-4">
      <DataItem collection="events"
                :function="props.selectedTaskId ? 'update' : 'create'"
                @changed="dataChanged($event)"
                :id="props.selectedTaskId">
      </DataItem>
  </div>
  <div class="flex justify-end gap-2">
      <Button class="w-8rem mr-3" outlined icon="pi pi-times" label="Cancel" @click="onHide()"></Button>
      <Button class="w-8rem" icon="pi pi-check" label="Save" @click="onSave()"></Button>
  </div>
</template>
