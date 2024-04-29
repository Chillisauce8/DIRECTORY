<template>
  <component :is="toRaw(props.component)"></component>
</template>

<script setup lang="ts">
import {provide} from 'vue';
import {DialogInstance, DialogInstanceInjToken} from '~/service/dialog/core/dialog-instance';
import {DialogConfigInjToken, DialogDataInjToken} from '~/service/dialog/core/dialog.typings';
import type {CoreDialogConfig, DialogConfig} from '~/service/dialog/core/dialog.typings';


interface DialogComponentRendererProps {
  component: any;
  config: DialogConfig;
  dialogInstance: DialogInstance;
}


const props = defineProps<DialogComponentRendererProps>();


provideDeps();


function provideDeps(): void {
  provide(DialogInstanceInjToken, props.dialogInstance);
  provide(DialogConfigInjToken, props.config);
  provide(DialogDataInjToken, (props.config as CoreDialogConfig<any>)?.data ?? null);
}


onBeforeUpdate(() => provideDeps());
</script>

<style>

</style>
