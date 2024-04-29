<template>
  <TheDialog :title="dataState.title" :fullscreen="false">
    <div class="form-content">
      <list-button-wrapper>
        <template v-for="tool in dataState.tools">
          <template v-for="button in tool.buttons">
            <ListButton :text="button.longLabel || button.shortLabel" @click="onButtonClick(button)"/>
          </template>
        </template>
      </list-button-wrapper>
    </div>
  </TheDialog>
</template>

<script lang="ts">
import {reactive} from 'vue';
import type {Tool, ToolButton} from '~/service/helpers/package-builder/tool.typings';
import {useDialogData, useDialogInstance} from '~/service/dialog/core/dialog.composables';



export interface ToolsDialogData {
  title: string;
  tools: Tool[];
}


export interface ToolsDialogResult {

}


interface ToolsDataState {
  title: string;
  tools: Tool[];
}


export default {
  setup() {
    const dialogData = useDialogData<ToolsDialogData>();
    const dialogInstance = useDialogInstance<ToolsDialogResult>();


    const dataState = reactive<ToolsDataState>({
      tools: [...dialogData?.tools],
      title: dialogData?.title,
    });


    async function onButtonClick(button: ToolButton): Promise<void> {
      button.onClick();

      dialogInstance.close();
    }


    return {
      dataState,
      onButtonClick: b => onButtonClick(b),
    }
  }
}
</script>

<style lang="scss">
</style>
