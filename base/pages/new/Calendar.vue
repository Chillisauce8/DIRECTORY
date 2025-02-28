<script setup lang="ts">
import { ref, onMounted } from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { eventService } from '~/service/EventService';

onMounted(async () => {
    loadEvents();
});

const tags = ref([]);
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
const crudControlRef = ref(null);
const selectedEvent = ref(null);

const loadEvents = async () => {
    events.value = await eventService.getEvents();
    options.value = { ...options.value, ...{ events: events.value } };
    events.value.forEach((item) => tags.value.push(item.tag));
};

const onEventClick = (e) => {
    selectedEvent.value = e.event.toPlainObject({
        collapseExtendedProps: true,
        collapseColor: true
    });
    crudControlRef.value?.toggleDialog();
};

const onDateSelect = (e) => {
    selectedEvent.value = {
        start: e.start,
        end: e.end,
        allDay: e.allDay
    };
    crudControlRef.value?.toggleDialog();
};

const handleSave = async () => {
    await loadEvents();
    selectedEvent.value = null;
};
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <!--    <h5>Calendar</h5> -->

                <FullCalendar :events="events" :options="options" />

                <CrudControl ref="crudControlRef" collection="events" :function="selectedEvent?._id ?
                  'update' : 'create'" :initialItem="selectedEvent" :itemId="selectedEvent?._id"
                             noButton @save="handleSave" />
            </div>
        </div>
    </div>
</template>

<style lang="scss">
/*
:deep(.fc-header-toolbar) {
    .fc-button {
        line-height: 1;
        min-height: 2.07rem;
    }
}
*/
</style>
