<script setup lang="ts">

import { fileHelperService, FileType } from '~/service/file/file-helper-service';

  const vm = reactive({
    rawUrls: ''
  });

  async function onSave() {
    const lines = vm.rawUrls.split('\n');

    for (const url of lines) {
      if (!isValidHttpUrl(url)) {
        continue;
      }

      const type = FileType.Image;
      const extension = fileHelperService.getFileExtension(url);
      const originalType = file.type || extension;

      const medialProperties = fileHelperService.getMediaFileProperties(file);

      let response = await fetch(url);
      let data = await response.blob();
      let metadata = {
        type: "image/png",
      };

      const file = new File([data], "app-logo.png", metadata);
    }
  }

  function isValidHttpUrl(urlStr: string) {
    let url;

    try {
      url = new URL(urlStr);
    } catch (_) {
      return false;
    }

    return url.protocol === "http:" || url.protocol === "https:";
  }

</script>

<template>
  <div class="card">
    <div class="flex items-center gap-4 mb-4">
      <label for="urls" class="text-900 font-semibold">Input urls</label>
      <Textarea id="urls" type="text" :rows="5" :cols="20" fluid v-model="vm.rawUrls" autoResize></Textarea>
    </div>
    <div class="flex justify-end gap-2">
      <Button class="w-8rem" icon="pi pi-check" label="Save" @click="onSave()"></Button>
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>
