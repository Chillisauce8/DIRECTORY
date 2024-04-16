<script setup lang="ts">
import {useSettingsTemplateService} from '~/services/helpers/data-templates/settings-template.factory';
import {useCurrentSection} from '~/services/helpers/current-section.factory';
import {usePackageCommonSettingsStore} from '~/store/packageCommonSettings';
import {useDialogData, useDialogInstance} from '~/services/dialog/core/dialog.composables';



export interface NumberOfNightsDialogData {
  defaultNumberOfNights?: number;
}


interface NumberOfNightsDialogVM {
  model: number;
  options: number[];
}


const settingsTemplateService = useSettingsTemplateService();
const currentSection = useCurrentSection();
const packageCommonSettingsStore = usePackageCommonSettingsStore();

const dialogInstance = useDialogInstance<number>();
const dialogData = useDialogData<NumberOfNightsDialogData>();

const options = getNightsOptionsList();
const suffix = getSuffix();

const vm = reactive<NumberOfNightsDialogVM>({
  options: options,
  model: dialogData?.defaultNumberOfNights ?? packageCommonSettingsStore.forSection(currentSection.get()).nightsCount,
});


function getSettingsNights() {
  return settingsTemplateService.getSettingsNights(currentSection.get() ?? null);
}


function getNightsOptionsList(): number[] {
  const settingsNights = getSettingsNights();

  if (!settingsNights) {
    return [];
  }

  return settingsNights.possibleCounts;
}


function getSuffix(): string {
  return getSettingsNights().suffix ?? 'Nights';
}

function labelGetter(value: number): string {
  return `${value} ${suffix}`;
}

function confirm(): void {
  dialogInstance.close(vm.model);
}
</script>

<template>
  <TheDialog title="Number of Nights"
             class="dialog-with-form">
    <form name="number-of" @submit.prevent="confirm">
      <p class="dialog-text">Please Select Number of Nights</p>
      <CSFormField>
        <LazyCSSelect v-model="vm.model"
                  placeholder="Number of Nights"
                  :option-list="vm.options"
                  :label-getter="v => labelGetter(v)">
        </LazyCSSelect>
      </CSFormField>

      <ButtonMain type="submit">OK</ButtonMain>
    </form>
  </TheDialog>
</template>

<style lang="scss">

</style>