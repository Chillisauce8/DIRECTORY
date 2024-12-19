<template>
  <div id="fileUpload">
    <h1>Test!</h1>

    <Dashboard
      :uppy="uppy"
      :props="{
        metaFields: [
          { id: 'name', name: 'Name', placeholder: 'File name' },
          { id: 'description', name: 'Description', placeholder: 'File description' },
          {
            id: 'rating',
            name: 'Rating',
            render({ value, onChange, required, form }, h) {
              return h('select', {
                id: 'uppy-Dashboard-FileCard-input-rating',
                class: 'uppy-u-reset uppy-c-textInput uppy-Dashboard-FileCard-input',
                required,
                form,
                onChange: (ev) => {
                  return onChange(ev.target.value);
                }
              },
                h('option', {value: 0}, 0),
                h('option', {value: 1}, 1),
                h('option', {value: 2}, 2),
                h('option', {value: 3}, 3),
                h('option', {value: 4}, 4),
                h('option', {value: 5}, 5),
              );
            },
          },
        ],
      }"
    />

    <h2>Drag Drop Area</h2>
    <DragDrop
      :uppy="uppy"
      :props="{
        locale: {
          strings: {
            chooseFile: 'Boop a file',
            orDragDrop: 'or yoink it here',
          },
        },
      }"
    />

    <h2>Progress Bar</h2>
    <ProgressBar
      :uppy="uppy"
      :props="{
        hideAfterFinish: false,
      }"
    />
  </div>
</template>

<script setup lang="ts">
import { Dashboard, DragDrop, ProgressBar } from '@uppy/vue'
import Uppy from '@uppy/core'
import Webcam from '@uppy/webcam'
import { computed } from 'vue';
import XHRUpload from '@uppy/xhr-upload';
import { fileHelperService, FileType } from '~/service/file/file-helper-service';
import exifr from 'exifr';
import EXIF from '~/service/file/exif';

// const { VITE_TUS_ENDPOINT: TUS_ENDPOINT } = import.meta.env

const uppy = computed(() => new Uppy({
  id: 'uppy', autoProceed: false, debug: true,
  onBeforeFileAdded: (currentFile, files) => {
    extendMetadata(currentFile);
    return currentFile;
  },
})
.use(XHRUpload, {
  endpoint: '/api/files',
  limit: 6,
  // bundle: true,
})
.use(Webcam)
);


function extendMetadata(fileObject) {
  const file = fileObject.data;

  const type = fileHelperService.getFileType(file);
  const extension = fileHelperService.getFileExtension(file.name);
  const originalType = file.type || extension;

  const medialProperties = fileHelperService.getMediaFileProperties(file);

  let imageInfo: any = {};

  if (type === FileType.Image) {
    if (medialProperties.aspectRatio) {
      imageInfo = {
        width: medialProperties.width,
        height: medialProperties.height,
        aspectRatio: medialProperties.aspectRatio,
      }
    }
  }

  const exif = new EXIF();
  exif.getData(file, function () {
    const metadata = exif.getAllTags(this);

    if (!imageInfo.width) {
      imageInfo = {
        width: metadata.PixelXDimension,
        height: metadata.PixelYDimension,
        aspectRatio: fileHelperService.calculateAspectRatio(metadata.PixelXDimension, metadata.PixelYDimension),
      }
    }

    const additionalMeta = {
      originalType,
      type,
      extension,
      size: file.size,
      imageInfo,
      data: metadata,
    };

    uppy.value.setFileMeta(fileObject.id, {additionalMeta: JSON.stringify(additionalMeta)});
  });

}


</script>


<style scoped lang="scss">
</style>
