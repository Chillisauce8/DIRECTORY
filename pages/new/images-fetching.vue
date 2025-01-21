<script setup lang="ts">

  import { fileHelperService, FileType } from '~/service/file/file-helper-service';
  import { fileUploaderService } from '~/service/file/file-uploader-service';
  import { useToast } from 'primevue/usetoast';
  import EXIF from '~/service/file/exif';

  const toast = useToast();


  const vm = reactive({
    rawUrls: ''
  });

  async function loadImage(src: string) {
    const img = new Image();
    img.width = 100;
    img.height = 100;
    //img.setAttribute('crossorigin', 'anonymous');
    img.src = src;
    await img.decode();
    return img;
  }

  async function onSave() {
    const thumbnailEl: any = document.getElementById('thumbnail');

    const lines = vm.rawUrls.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      const parts = line.split(';');
      const url = parts[0].trim();

      if (!isValidHttpUrl(url)) {
        continue;
      }

      const type = FileType.Image;
      let extension = fileHelperService.getFileExtension(parts[1] || url);
      let name = parts[1] || url.split('#')[0].split('?')[0].split('/').pop() || 'loaded-image';
      const rating = parts[2] || 0;

      // const originalType = file.type || extension;
      // const medialProperties = fileHelperService.getMediaFileProperties(file);

      const image = await loadImage(url);

      const divEl = document.createElement("div");
      divEl.classList.add('col');
      divEl.appendChild(image);

      thumbnailEl.appendChild(image);
      // const imgEl: any = document.getElementById("img-" + i);

      const w = image.naturalWidth;
      const h = image.naturalHeight;
      const aspectRation = fileHelperService.calculateAspectRatio(w, h);

      const imageInfo = {
        width: w,
        height: h,
        aspectRation
      }

      let fileData: any;
      let contentType: string;

      try {
        const response = await fetch(url);
        fileData = await response.blob();
        contentType = response.headers.get('content-type');
      } catch(ex) {
        toast.add({severity: 'error', summary: 'Error', detail: `${name} Upload Failed`, life: 3000});
        continue;
      }

      if (!fileData) {
        // fileData = fileHelperService.getBlobByImageEl(image);
      }

      let metadata = {
        type: contentType,
      };

      const file = new File([fileData], name, metadata);

      const originalType = file.type || extension;

      const data = await fileHelperService.prepareFileToUploadWithExif(file, {
        name,
        originalType,
        type,
        extension,
        rating,
        size: file.size,
        imageInfo,
      });


      const config: any = {
        url: '/api/files',
        data: data,
        method: 'POST',
        // headers: { [headerName: string]: string; },
        // withCredentials: true,
      }

      const result = await fileUploaderService.upload(config);

      if (result) {
        toast.add({severity: 'info', summary: 'Success', detail: `${name} Uploaded`, life: 3000});
      } else {
        toast.add({severity: 'error', summary: 'Error', detail: `${name} Upload Failed`, life: 3000});
      }
    }

    thumbnailEl.innerHTML = '';
    toast.add({ severity: 'info', summary: 'Process finished', detail: 'Uploading finished', life: 3000 });
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
    <div class="grid" id="thumbnail">
    </div>
    <div class="flex justify-end gap-2">
      <Button class="w-8rem" icon="pi pi-check" label="Save" @click="onSave()"></Button>
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>
