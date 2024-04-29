<template v-if="vm.eventHomePageTemplate" >
    <CustomerCard :event="props.event" :dataTemplate="vm.eventHomePageTemplate" v-if="isCustomerCardVisible()"/>
    <GroupCard :event="props.event" :dataTemplate="vm.eventHomePageTemplate" v-if="isGroupCardVisible()"/>
    <CustomerContactCard :event="props.event"
                         v-if="currentUser.isSupplierContact() || currentUser.isStaffOrHiddenStaff()"></CustomerContactCard>
    <ManagerCard :event="props.event" v-if="isManagerCardVisible()"/>
</template>

<script lang="ts" setup>
import {useDataTemplateFabricService} from "~/service/helpers/data-templates/data-template-fabric.factory";
import {useEventPermissionsService} from "~/service/helpers/event/event-permissions.service.factory";
import {useCurrentEvent} from "~/service/helpers/event/current-event.service.factory";
import {useDataTemplatesStore} from '~/store/dataTemplates';
import { useCurrentUser } from '~/service/helpers/user-common/current-user.factory';
import {EventEmitterSubscription} from '~/service/models/event-emitter-observable';

interface InfoCardsProps {
  event: any;
  isSupplierArea: boolean;
}


const props = defineProps<InfoCardsProps>();


const dataTemplateFabric = useDataTemplateFabricService();
const eventPermissionsService = useEventPermissionsService();
const currentEvent = useCurrentEvent();
const dataTemplatesStore = useDataTemplatesStore();
const currentUser = useCurrentUser();


const vm = reactive({
  eventHomePageTemplate: undefined,
  isUserCardAllowed: undefined,
  isCustomerCardAllowed: undefined,
  isGroupCardAllowed: undefined,
});


watch(() => props.event, () => initOnNewEvent());


await useAsyncData(async () => {
  await dataTemplatesStore.fetch({templateName: 'eventHomePage'});
});


function initOnNewEvent() {
  extendTemplate();
  readEventHomePermissions();
}

function extendTemplate() {
  const result = eventPermissionsService.getRoles();
  const rolesNames = result.map(item => item.name);

  vm.eventHomePageTemplate.extendContext({
    stage: props.event.getEventStage(),
    statusStage: props.event.getEventStatusStage(),
    roles: rolesNames,
    paymentMethod: props.event.getPaymentMethod()
  });
}

function readEventHomePermissions(): void {
  vm.isGroupCardAllowed = eventPermissionsService.hasPermission(
    'eventHomeFunctions.groupCard', {});
  vm.isCustomerCardAllowed = eventPermissionsService.hasPermission(
    'eventHomeFunctions.userCard', {});
}

function isCustomerCardVisible(): boolean {
  return currentEvent.has() && vm.isCustomerCardAllowed
      && (currentEvent.isGuest() || currentEvent.isOrganiser());
}

function isGroupCardVisible(): boolean {
  return currentEvent.has() && vm.isGroupCardAllowed;
}

function isManagerCardVisible(): boolean {
  return currentEvent.has() && !!currentEvent.getManager();
}

vm.eventHomePageTemplate = dataTemplateFabric.get({name: 'eventHomePage', notUpdateDefaultHeaderTemplate: true});
initOnNewEvent();

let currentUserRolesChangedSubscription: EventEmitterSubscription;

onMounted(() => {
  if (props.isSupplierArea) {
    currentUserRolesChangedSubscription = currentUser.afterCurrentUserRolesChanged()
      .subscribe(async () => {
        readEventHomePermissions();
      });
  }
});

onUnmounted(() => {
  if (currentUserRolesChangedSubscription) {
    currentUserRolesChangedSubscription.unsubscribe();
  }
});

</script>

<style lang="scss"></style>
