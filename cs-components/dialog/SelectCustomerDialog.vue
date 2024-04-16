<template>
<TheDialog class="dialog-with-form" :title="dataState.title" :form-name="dataState.formName">
  <form class="user-form" name="select-customer-form" @submit.prevent="addCustomer">
    <CSFormField>
      <select-customer v-model="dataState.selectedCustomer"
                       @update:modelValue="onCustomerSelect"></select-customer>
    </CSFormField>
    <FormButtonWrapper>
      <ButtonMain class="_2nd"
                  type="button"
                  v-if="dataState.showClearButton"
                  @click.native="clearCustomer">Clear customer</ButtonMain>
      <ButtonMain type="submit">Add new customer</ButtonMain>
    </FormButtonWrapper>
  </form>
</TheDialog>
</template>

<script lang="ts">
import {reactive} from 'vue';
import {useCurrentCustomer} from '~/services/helpers/user-common/current-customer-service.factory';
import { useCustomerEvents } from "~/services/helpers/event/customer-events.service.factory";
import { useCurrentEvent } from "~/services/helpers/event/current-event.service.factory";
import {useDialogData, useDialogInstance} from '~/services/dialog/core/dialog.composables';
import {useCustomerEventsStore} from '~/store/customerEvents';
import {useSignUpCustomerDialogShowService} from '~/services/dialog/auth/sign-up-customer-dialog-show.service';


export interface SelectCustomerDialogData {
  goToCustomerHome?: boolean;
  reloadEvents?: boolean;
}


export default {
  setup() {
    const currentCustomer = useCurrentCustomer();
    const signUpCustomerDialogShowService = useSignUpCustomerDialogShowService();

    const customerEvents = useCustomerEvents();
    const customerEventsStore = useCustomerEventsStore();
    const currentEvent = useCurrentEvent();
    const router = useRouter();

    const dialogInstance = useDialogInstance<void>();
    const dialogData = useDialogData<SelectCustomerDialogData>();


    const dataState = reactive({
      title: 'Select customer',
      formName: 'select-customer',
      showClearButton: currentCustomer.has(),
      goToCustomerHome: dialogData?.goToCustomerHome ?? true,
      reloadEvents: dialogData?.reloadEvents ?? true,
      selectedCustomer: currentCustomer.getRawData(),
    });


    async function onCustomerSelect(customer: {_doc: string, userId: string}) {
      await currentCustomer.load(customer._doc);

      if (!currentEvent.isOrganiser() && !currentEvent.isGuest()) {
        currentEvent.clear();
      }

      if (dataState.reloadEvents) {
        await customerEvents.reload();
      }

      if (currentEvent.isOrganiser() || currentEvent.isGuest()) {
        dialogInstance.close();
      }

      if (dataState.goToCustomerHome) {
        const eventId = customerEventsStore?.events?.[0]?._doc ?? null;

        router.push({path: '/my-events', query: {eventId, customerId: customer._doc}});
      }

      dialogInstance.close();
    }

    function clearCustomer() {
      currentCustomer.clear();

      dataState.showClearButton = false;
    }

    async function addCustomer() {
      const result = await signUpCustomerDialogShowService.show({});

      if (result.cancelled) {
        return dialogInstance.cancel();
      }

      await currentCustomer.load((result.data as any)._doc);

      dialogInstance.close();
    }


    function onEventLinkClicked() {
      dialogInstance.close();
    }

    return {
      dataState,
      onCustomerSelect: c => onCustomerSelect(c),
      clearCustomer: () => clearCustomer(),
      addCustomer: () => addCustomer(),
      onEventLinkClicked: () => onEventLinkClicked(),
    }
  }
}
</script>

<style lang="scss">
</style>
