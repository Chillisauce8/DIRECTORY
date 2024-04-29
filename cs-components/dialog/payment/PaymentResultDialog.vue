<template>
  <the-dialog :title="dialogConfig.title" :fullscreen="dialogConfig.fullscreen">
    <payment-result :isSuccessMessage="dataState.result === 'success'"
                    :message="dataState.message"
                    v-if="!dataState.inProgress"
                    @click="onButtonClick()">
    </payment-result>
  </the-dialog>
</template>

<script setup lang="ts">

import { reactive } from "vue";
import { useGlobalElementsTemplateService } from "~/service/helpers/data-templates/global-elements-template.factory";
import { useDataTemplateFabricService } from "~/service/helpers/data-templates/data-template-fabric.factory";
import { useCurrentEvent } from "~/service/helpers/event/current-event.service.factory";
import { DataTemplate } from "~/service/models/dataTemplate";
import { useDataTemplatesStore } from "~/store/dataTemplates";
import { eventEmitterFilter, eventEmitterObsFirstValueFrom } from "~/service/models/event-emitter-observable-helpers";
import {useDialogConfig, useDialogData, useDialogInstance} from '~/service/dialog/core/dialog.composables';
import { CurrentEventInitStates } from '~/service/helpers/event/current-event.service';
import { useEventPackageBuilder } from '~/service/helpers/package-builder/package-builder.service.factory';
import { useCustomerEvents } from '~/service/helpers/event/customer-events.service.factory';


export interface PaymentResultDialogData {
  result: 'success' | 'failure'
  type: 'payment' | 'cardChanged'
}

export interface PaymentResultDialogResult {

}
const dialogData = useDialogData<PaymentResultDialogData>();
const dialogInstance = useDialogInstance<PaymentResultDialogResult>();
const dialogConfig = useDialogConfig<PaymentResultDialogData>();

const globalElementsTemplateService = useGlobalElementsTemplateService();
const dataTemplateFabric = useDataTemplateFabricService();
const currentEvent = useCurrentEvent();
const customerEvents = useCustomerEvents();
const dataTemplatesStore = useDataTemplatesStore();
const packageBuilder = useEventPackageBuilder();


const dataState = reactive({
  ...dialogData,
  message: '',
  inProgress: true
});

function _initMessage() {
  switch (dialogData.result) {
    case 'success':
      _getSuccessMessage();
      break;
    case 'failure':
      _getFailureMessage();
      break;
    default:
      break;
  }
}

function _getSuccessMessage() {
  currentEvent.reload();
  customerEvents.reload();

  eventEmitterObsFirstValueFrom(currentEvent.currentEventInitDone()
    .pipe(eventEmitterFilter(value => value !== CurrentEventInitStates.no &&
        value !== CurrentEventInitStates.started)))
    .then(() => {
      if (currentEvent.has()) {
        packageBuilder.loadCurrent()
        _getSuccessMessageFromTemplate();
      }
    });
}

function _getSuccessMessageFromTemplate() {
  const paymentFilter = (item: any) => {
    return !item.conditions || (item.conditions.hasOwnProperty('role') &&
      ((currentEvent.isOrganiser() && item.conditions.role === 'Organiser') ||
        (!currentEvent.isOrganiser() && item.conditions.role === 'Guest')));
  };

  const cardUpdateFilter = (item: any) => {
    return !item.conditions || (item.conditions.hasOwnProperty('cardUpdate') &&
      item.conditions.cardUpdate === 'Yes');
  };

  const dataTemplate: DataTemplate = dataTemplateFabric.get({name: 'paymentPage'});

  const filteredMessaging: Array<any> = dataTemplate.getArray('successPage.messaging')
    .filter(dialogData.type === 'payment' ? paymentFilter : cardUpdateFilter);

  dataState.message = filteredMessaging.length ? filteredMessaging[0].message : '';
  dataState.inProgress = false;
}

function _getFailureMessage() {
  if (dialogData.type === 'payment') {
    const dataTemplate: DataTemplate = dataTemplateFabric.get({name: 'paymentPage'});
    dataState.message = dataTemplate.getValue('cardDetailsPage.defaultFailureMessage');
    dataState.inProgress = false;
  } else {
    dataState.message = globalElementsTemplateService.getMessageFromDictionaryVariables(
      'commonCardUpdateError');
    dataState.inProgress = false;
  }
}


useAsyncData(async () => {
  await dataTemplatesStore.fetch({templateName: 'paymentPage'});
  _initMessage();
});


function onButtonClick() {
  dialogInstance.close();
}

</script>

<style scoped>

</style>
