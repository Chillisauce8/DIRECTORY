<template>
  <the-dialog :title="dataState.title"
              :fullscreen="dataState.fullscreen"
              class="dialog-with-form"
              @dialog:closeClick="cancel">
    <form class="form-element" :class="dataState.additionalClass" :name="dataState.formName">
      <slot></slot>
    </form>
  </the-dialog>
</template>

<script setup lang="ts">
import type {DialogProps} from '~/components/dialog/core/TheDialog.vue';
import {reactive, watch} from 'vue';
import {defaultCloseButtonClickHandlerFactory} from '~/service/dialog/core/dialog.helpers';


export interface DialogWithFormProps {
  title?: string;
  fullscreen?: boolean;
  formName?: string;
  additionalClass?: string[] | string;
}


export interface DialogWithFormEmits {
  (e: 'submit'): void;
  (e: 'dialog:closeClick'): void;
}


const props = defineProps<DialogWithFormProps>();
const emits = defineEmits<DialogWithFormEmits>();


const dataState = reactive({
  title: props.title,
  fullscreen: props.fullscreen,
  formName: props.formName,
  additionalClass: props.additionalClass,
});


watch(() => props.title, v => dataState.title = v);
watch(() => props.fullscreen, v => dataState.fullscreen = v);
watch(() => props.formName, v => dataState.formName = v);
watch(() => props.additionalClass, v => dataState.additionalClass = v);


const cancel = defaultCloseButtonClickHandlerFactory();


function submit(event: Event) {
  event.preventDefault();

  emits('submit');
}
</script>

<style lang="scss">
.dialog-text {
  font-size: $fc-font-size;

}
p.dialog-text{
  margin-bottom: 0.5em;
}

.full-width {
  width: 100%;
}


</style>
