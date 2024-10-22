<script setup lang="ts">
import { ref, onMounted } from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import {eventService} from "~/service/EventService";
import Dialog from 'primevue/dialog';

onMounted(async () => {
  loadEvents();
});

const tags = ref([]);
let clickedEvent = null;
const view = ref('display');
const showDialog = ref(false);
const changedEvent = ref({
    title: '',
    start: '',
    end: '',
    allDay: false,
    location: '',
    borderColor: '',
    textColor: '',
    description: '',
    tag: {
        name: 'Company A',
        color: '#FFB6B6'
    }
});
const options = ref({
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialDate: '2024-06-01',
    height: 720,
    headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    eventClick: (e) => onEventClick(e),
    select: (e) => onDateSelect(e)
});

const events = ref(null);

let dataItemNode = null;


let saveRawFunc: (data: any) => Promise<void>;
let deleteRawFunc: (dataId: string) => Promise<void>;

function onDataItemMounted(result: {hooks: any}) {
  saveRawFunc = result.hooks?.saveRawFunc;
  deleteRawFunc = result.hooks?.deleteRawFunc;
}


function eventChanged({data}) {
  dataItemNode = data;
}

const loadEvents = async () => {
  events.value = await eventService.getEvents();
  options.value = { ...options.value, ...{ events: events.value } };
  events.value.forEach((item) => tags.value.push(item.tag));
}


const onEventClick = (e) => {
    clickedEvent = e.event;

    let plainEvent = e.event.toPlainObject({
        collapseExtendedProps: true,
        collapseColor: true
    });

    view.value = 'display';
    showDialog.value = true;

    changedEvent.value = { ...plainEvent, ...clickedEvent };
    changedEvent.value.start = clickedEvent.start;
    changedEvent.value.end = clickedEvent.end ? clickedEvent.end : clickedEvent.start;
};

const onEditClick = () => {
    view.value = 'edit';
};

const handleSave = () => {
    const isValidDate = changedEvent.value.start && changedEvent.value.end;
    if (!isValidDate) {
        return;
    }

    showDialog.value = false;

    // clickedEvent = {
    //   ...changedEvent.value,
    //   // backgroundColor: changedEvent.value.tag.color,
    //   // borderColor: changedEvent.value.tag.color,
    //   textColor: '#212121'
    // };

    saveEvent();

    clickedEvent = null;
};

const onDateSelect = (e) => {
    view.value = 'new';
    showDialog.value = true;
    changedEvent.value = {
        ...e,
        title: '',
        location: '',
        borderColor: '',
        textColor: '',
        description: '',
        tag: {
            name: 'Company A',
            color: '#FFB6B6'
        }
    };
};

const saveEvent = async () => {
  await saveRawFunc(dataItemNode);
  await loadEvents();
};


</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
              <h5>Calendar</h5>
              <InputText type="text" placeholder="TEST"  />

              <FullCalendar :events="events" :options="options" />

              <Dialog
                  v-model:visible="showDialog"
                  :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
                  :style="{
                      width: '36rem'
                  }"
                  modal
                  closable
                  @onHide="view = ''"
              >
                  <template #header>
                      <span class="text-900 font-semibold text-xl">{{ view === 'display' ? changedEvent.title : view === 'new' ? 'New Event' : 'Edit Event' }}</span>
                  </template>

                  <div v-if="view === 'display'">
                    <DataItem function="read" collection="events" :id="changedEvent._doc" :defaultView="true">
                    </DataItem>
                  </div>
                  <div v-if="view !== 'display'">
                    <DataItem function="create" collection="events"
                              @mounted="onDataItemMounted"
                              @changed="eventChanged"
                              :initialData="{start: changedEvent.start, end: changedEvent.end}">
                    </DataItem>
                  </div>

                  <template #footer>
                      <Button v-if="view === 'display'" label="Edit" icon="pi pi-pencil" @click="onEditClick"></Button>
                      <Button v-if="view === 'new' || view === 'edit'" label="Save" icon="pi pi-check" @click="handleSave()" :disabled="!changedEvent.start || !changedEvent.end"></Button>
                  </template>
              </Dialog>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
:deep(.fc-header-toolbar) {
    .fc-button {
        line-height: 1;
        min-height: 2.07rem;
    }
}
</style>
