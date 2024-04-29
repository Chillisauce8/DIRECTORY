<script setup lang="ts">
import {useEventService} from '~/service/helpers/event/event.service.factory';


interface EventManager {
  id: string;
  name: string;
}


interface EventManagerSelectProps {
  modelValue: EventManager;
  eventId: string;
}


interface EventManagerSelectVM {
  eventId: string;
  selectedManager: EventManager;
  possibleManagers: EventManager[];
  managerBeforeChanging: EventManager;
  loading: boolean;
}

interface EventManagerSelectEmits {
  (e: 'update:modelValue', value: EventManager): void;
}


const eventService = useEventService();


const props = defineProps<EventManagerSelectProps>();
const emits = defineEmits<EventManagerSelectEmits>();


const vm = reactive<EventManagerSelectVM>({
  eventId: props?.eventId,
  selectedManager: null,
  possibleManagers: [],
  managerBeforeChanging: null,
  loading: true,
});


async function getPossibleManagersList(eventId: string): Promise<EventManager[]> {
  const staffList = await eventService.getListEventAvailableManagers(eventId);

  const possibleManagers = staffList.map(s => ({id: s._doc, name: s?.name ?? s?.title}));

  if (needAddCurrentManagerToPossibleManagerList(possibleManagers)) {
    addCurrentManagerToManagerList(possibleManagers);
  }

  return sortManagersList(possibleManagers);
}


onMounted(async () => {
  vm.possibleManagers = await getPossibleManagersList(props.eventId);
  vm.selectedManager = findCurrentManagerInPossibleManagerList(vm.possibleManagers);
  vm.managerBeforeChanging = vm.selectedManager;

  vm.loading = false;
});


function needAddCurrentManagerToPossibleManagerList(managerList: EventManager[]): boolean {
  if (!props?.modelValue) {
    return false;
  }

  if (findCurrentManagerInPossibleManagerList(managerList)) {
    return false;
  }

  return true;
}

function sortManagersList(list: EventManager[]): EventManager[] {
  if (!list || !list.length) {
    return;
  }

  return list
    .sort((item1, item2) => {
      let name1 = item1.name.toLowerCase();
      let name2 = item2.name.toLowerCase();

      if (name1 < name2) { return -1; }
      if (name1 > name2) { return 1; }
      return 0;
    });
}

function addCurrentManagerToManagerList(list: EventManager[]): EventManager[] {
  const managerInfo = props?.modelValue;

  if (!managerInfo?.id) {
    return;
  }

  list.push(managerInfo);

  return list;
}

function findCurrentManagerInPossibleManagerList(possibleManagers: EventManager[]): EventManager {
  const currentManager = props?.modelValue;

  if (!currentManager) {
    return null;
  }

  for (const manager of possibleManagers) {
    if (manager.id !== currentManager.id) {
      continue;
    }

    return manager;
  }

  return null;
}

function onManagerChange(manager: EventManager): void {
  emits('update:modelValue', manager);

  vm.selectedManager = manager;
}


function getManagerName(manager: EventManager): string {
  return manager?.name ?? 'None';
}
</script>

<template>
  <LazyCSSelect v-model="vm.selectedManager"
            :option-list="vm.possibleManagers"
            :label-getter="v => v?.name ?? 'None'"
            :model-match-option="(m, v) => m.id === v.id"
            :loading="vm.loading"
            placeholder="Manager"
            @update:modelValue="onManagerChange">
  </LazyCSSelect>
</template>

<style scoped lang="scss">

</style>
