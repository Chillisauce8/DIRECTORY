<script setup lang="ts">
import {useCurrentEvent} from '~/services/helpers/event/current-event.service.factory';
import {minValue, required} from '@vuelidate/validators';
import {useVuelidate} from '@vuelidate/core';
import CSFormField from '~/components/forms/CSFormField.vue';
import {useDialogInstance} from '~/services/dialog/core/dialog.composables';
import {vAutofocus} from '~/utils/directives/autofocus';

export type EditDiscountMarginDialogData = never;


export type EditDiscountMarginDialogResult = number;


export interface EditDiscountMarginDialogVM {
  discountMargin: number;
}


const dialogInstance = useDialogInstance<EditDiscountMarginDialogResult>();
const currentEvent = useCurrentEvent();


const vm = reactive<EditDiscountMarginDialogVM>({
  discountMargin: currentEvent.getEvent().getDiscountMargin(),
});

const validationRules = computed(() => ({
  discountMargin: [required, minValue(0)],
}));

const v$ = useVuelidate(validationRules, vm, {$autoDirty: true});


function save() {
  v$.value.$touch();

  if (v$.value.$invalid) {
    return;
  }
  dialogInstance.close(parseInt(vm?.discountMargin as any, 10));
}
</script>

<template>
  <tool-dialog title="Discount Margin">
    <form v-if="vm" name="discount-margin" @submit.prevent="save">
      <CSFormField>
        <CSInput v-model="vm.discountMargin"
                 type="number"
                 min="0"
                 placeholder="Discount Margin"
                 v-autofocus>
        </CSInput>

        <template #suffix>
          <CSError class="cs-form-text-error" :vuelidateField="v$.discountMargin"></CSError>
        </template>
      </CSFormField>

      <ButtonMain type="submit">Save</ButtonMain>
    </form>
  </tool-dialog>
</template>

<style lang="scss">

</style>
