<template>
  <tool-dialog title="Show/hide product" :fullscreen="false">
    <form name="show-hide-product" @submit.prevent="submit">
      <p class="tool-dialog-text">Adjust to show or hide a product from event guests</p>

      <CSFormField>
        <LazyCSSelect v-model="dataState.hideProduct"
                  :options="dataState.options"
                  label="label">
        </LazyCSSelect>
      </CSFormField>

      <button-main type="submit" >OK</button-main>
    </form>
  </tool-dialog>
</template>

<script lang="ts">
import {inject, reactive} from 'vue';
import {useDialogData, useDialogInstance} from '~/service/dialog/core/dialog.composables';


enum ShowHideSelectLabel {
  show = 'Show',
  hide = 'Hide',
}

interface ShowHideSelectOption {
  label: ShowHideSelectLabel;
  value: boolean;
}


export interface HideProductDialogData {
  hideProduct: boolean;
}


export interface HideProductDialogResult extends HideProductDialogData {}


export interface HideProductDialogDataState {
  options: ShowHideSelectOption[];
  hideProduct: ShowHideSelectOption;
}


export default {
  setup() {
    const dialogData = useDialogData<HideProductDialogData>();
    const dialogInstance = useDialogInstance<HideProductDialogResult>();


    const hideShowOptions = [
      {label: ShowHideSelectLabel.show, value: false},
      {label: ShowHideSelectLabel.hide, value: true},
    ];

    const dataState = reactive<HideProductDialogDataState>({
      options: hideShowOptions,
      hideProduct: hideShowOptions.find(o => o.value === dialogData.hideProduct ?? false),
    });


    function submit(): void {
      dialogInstance.close({hideProduct: dataState.hideProduct.value});
    }


    return {
      dataState,
      submit: () => submit(),
    }
  }
}
</script>

<style lang="scss">
</style>
