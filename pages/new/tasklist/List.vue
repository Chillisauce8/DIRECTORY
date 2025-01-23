<script setup>
import { ref } from 'vue';

const emit = defineEmits(['delete:task', 'save:task']);
defineProps({
    title: {
        type: String,
        required: true
    },
    taskList: {
        type: Array,
        required: true
    }
});
const menu = ref(null);
const clickedTask = ref(null);
const menuItems = ref([
    {
        label: 'Edit',
        icon: 'pi pi-pencil',
        command: () => crudControlRef.value?.toggleDialog()
    },
    {
        label: 'Delete',
        icon: 'pi pi-trash',
        command: () => handleDelete()
    }
]);

const crudControlRef = ref(null);

const handleDelete = () => {
    emit('delete:task', clickedTask.value);
};
const parseDate = (timestamp) => {
    return new Date(timestamp).toTimeString().split(':').slice(0, 2).join(':');
};
const toggleMenu = (event, i, task) => {
    clickedTask.value = task;
    menu.value[i].toggle(event);
};

const handleSave = (savedData) => {
    clickedTask.value = null;
    emit('save:task', savedData);
};
</script>

<template>
    <div>
        <div class="text-900 font-semibold text-lg mt-5 mb-3 border-bottom-1 surface-border py-3">
            {{ title }}
        </div>
        <ul class="list-none p-0 m-0">
            <li v-for="(task, i) in taskList" :key="task" class="flex flex-column gap-3 md:flex-row md:align-items-center p-2 border-bottom-1 surface-border">
                <div class="flex align-items-center flex-1">
                    <label class="font-medium whitespace-nowrap text-ellipsis overflow-hidden" style="max-width: 500px">{{ task.name }}</label>
                </div>
                <div class="flex flex-1 gap-4 flex-col sm:flex-row sm:justify-between">
                    <div class="flex items-center">
                        <!--              <span v-if="task.comments" class="flex items-center font-semibold mr-4"><i class="pi pi-comment mr-2"></i>{{ task.comments }}</span>-->
                        <!--              <span v-if="task.attachments" class="flex items-center font-semibold mr-4"><i class="pi pi-paperclip mr-2"></i>{{ task.attachments }}</span>-->
                        <span class="flex items-center font-semibold whitespace-nowrap" v-if="task.start"> <i class="pi pi-clock mr-2"></i>{{ task.start }} </span>
                    </div>
                    <div class="flex items-center sm:justify-end">
                        <div class="mr-4">
                            <AvatarGroup v-if="task.members?.length > 0">
                                <Avatar v-for="member in task.members.slice(0, 4)" :key="member" :image="'/demo/images/avatar/' + member.image" size="large" shape="circle"></Avatar>
                                <Avatar
                                    v-if="task && task.members && task.members.length > 4"
                                    :label="`+${task.members.length - 4}`"
                                    shape="circle"
                                    size="large"
                                    class="bg-blue-500"
                                    :style="{ color: '#212121', border: '2px solid var(--surface-border)' }"
                                ></Avatar>
                            </AvatarGroup>
                        </div>
                        <Button type="button" icon="pi pi-ellipsis-v" class="z-30 ml-auto sm:ml-0" text rounded @click="toggleMenu($event, i, task)"></Button>
                        <Menu ref="menu" popup :model="menuItems" class="w-32"></Menu>
                    </div>
                </div>
            </li>
        </ul>
        <CrudControl ref="crudControlRef" collection="events" function="update" :initialItem="clickedTask"
                     :itemId="clickedTask?._id" noButton @save="handleSave" />
    </div>
</template>
