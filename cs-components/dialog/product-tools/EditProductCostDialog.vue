<script setup lang="ts">
import {minValue, required} from '@vuelidate/validators';
import {useVuelidate} from '@vuelidate/core';
import type {YesNoValue} from '~/utils/common.types';
import {useDialogData, useDialogInstance} from '~/services/dialog/core/dialog.composables';


type Per = 'Person' | 'Unit' | 'Group';


export interface EditProductCostDialogData {
  costOverride: YesNoValue;
  agency: number;
  per: Per;
  unitType: string;
  maxPeoplePerUnit: number;
}


export interface EditProductCostDialogResult {
  costOverride: YesNoValue;
  agency: number;
  per: Per;
}


export interface EditProductCostDialogVM {
  costOverride: YesNoValue;
  agency: number;
  per: Per;
  unitType: string;
  maxPeoplePerUnit: number;
  costOverrideOptions: YesNoValue[];
  perOptions: Per[];
}


const dialogData = useDialogData<EditProductCostDialogData>();
const dialogInstance = useDialogInstance<EditProductCostDialogResult>();


const vm = reactive<EditProductCostDialogVM>({
  costOverride: dialogData.costOverride,
  agency: dialogData.agency,
  per: dialogData.per,
  unitType: dialogData.unitType,
  maxPeoplePerUnit: dialogData.maxPeoplePerUnit,
  costOverrideOptions: ['Yes', 'No'],
  perOptions: ['Person' , 'Unit' , 'Group'],
});

const validationRules = computed(() => ({
  costOverride: [required],
  agency: [required, minValue(0)],
  per: [required]
}));

const v$ = useVuelidate(validationRules, vm, {$autoDirty: true});

const costOverrideDisabled = computed<boolean>(() => vm.costOverride !== 'Yes');


function save() {
  v$.value.$touch();

  if (v$.value.$invalid) {
    return;
  }

  dialogInstance.close({
    costOverride: vm.costOverride,
    agency: vm.agency,
    per: vm.per,
  });
}
</script>

<template>
<tool-dialog title="Edit Cost">
  <form name="edit-cost" @submit.prevent="save">
    <CSFormField>
      <LazyCSSelect v-model="vm.costOverride"
                :option-list="vm.costOverrideOptions"
                placeholder="Cost Override">
      </LazyCSSelect>
    </CSFormField>

    <CSFormField>
      <CSInput placeholder="Unit Type"
               :disabled="true"
               :model-value="vm.unitType">
      </CSInput>
    </CSFormField>

    <CSFormField>
      <CSInput placeholder="Max People per Unit"
               :disabled="true"
               :model-value="vm.maxPeoplePerUnit">
      </CSInput>

    </CSFormField>

    <CSFormField>
      <CSInput v-model="vm.agency"
               placeholder="Cost"
               novalidate step="0.01"
               :disabled="costOverrideDisabled"
               type="number">
      </CSInput>
    </CSFormField>

    <CSFormField>
      <LazyCSSelect v-model="vm.per"
                :option-list="vm.perOptions"
                :disabled="costOverrideDisabled"
                placeholder="Per">
      </LazyCSSelect>
    </CSFormField>

    <ButtonMain type="submit" >OK</ButtonMain>
  </form>
</tool-dialog>
</template>

<style lang="scss">

</style>