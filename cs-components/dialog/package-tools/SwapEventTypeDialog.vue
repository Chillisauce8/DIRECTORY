<script setup lang="ts">
import type {SectionName} from '~/utils/secten-detector-utils';
import {useCsLodash} from '~/service/cs-lodash.factory';
import {useDialogData, useDialogInstance} from '~/service/dialog/core/dialog.composables';


export interface SwapEventTypeDialogData {
  eventType: SectionName;
}


export type SwapEventTypeDialogResult = SectionName;


interface SwapEventTypeDialogVM {
  eventType: SectionName;
  eventTypeOptions: SectionName[];
}


const dialogData = useDialogData<SwapEventTypeDialogData>();
const dialogInstance = useDialogInstance<SwapEventTypeDialogResult>();
const csLodash = useCsLodash();


const vm = reactive<SwapEventTypeDialogVM>({
  eventType: dialogData.eventType,
  eventTypeOptions: [
    'stag',
    'hen',
    'groups',
    'events',
  ],
});


function getSelectItemLabel(item: SectionName): Capitalize<SectionName> {
  return csLodash.capitalize(item);
}


function save(): void {
  dialogInstance.close(vm.eventType);
}
</script>

<template>
  <tool-dialog title="Swap Event Type">
    <form name="swap-event-type" @submit.prevent="save">
      <CSFormField>
        <LazyCSSelect v-model="vm.eventType"
                  :option-list="vm.eventTypeOptions"
                  :label-getter="v => getSelectItemLabel(v)"
                  placeholder="Type">
        </LazyCSSelect>
      </CSFormField>

      <ButtonMain type="submit" >Save</ButtonMain>
    </form>
  </tool-dialog>
</template>

<style scoped lang="scss">

</style>
