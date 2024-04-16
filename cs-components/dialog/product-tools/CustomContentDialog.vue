<template>
  <tool-dialog title="Custom Content" :fullscreen="true" class="custom-content-frame">
    <iframe class="Column Flex" name="custom-content-iframe" ref="iframe"
            :src="getFrameSrc()">
    </iframe>
  </tool-dialog>
</template>

<script setup lang="ts">

import { useDialogData, useDialogInstance } from '~/services/dialog/core/dialog.composables';

export interface CustomContentDialogData {
  eventId?: string,
  packageId?: string,
  productId?: string,
  isCustomData?: boolean,
}


export type CustomContentDialogResult = void;


const dialogData = useDialogData<CustomContentDialogData>();
const dialogInstance = useDialogInstance<CustomContentDialogResult>();

const appConfig = useAppConfig();

let iframe = ref(null);


function getFrameSrc(): string {
  const spaHost = window.location.origin;

  if (dialogData.isCustomData) {
    const src = `${spaHost}/admin/edit-product-content?isCustomData=true`;

    if (dialogData.eventId) {
      return src + `&eventId=${dialogData.eventId}`;
    }

    return src;
  }

  return `${spaHost}/admin/edit-product-content?eventId=${dialogData.eventId}&packageId=${dialogData.packageId}&productId=${dialogData.productId}`;
}

function setHtmlOverflowY(value: string) {
  const elements = document.getElementsByTagName('html');

  if (elements?.length > 0) {
    elements[0].style.overflowY = value;
  }
}


onMounted(() => {
  setHtmlOverflowY('hidden');

  iframe.value.onload = async () => {
    try {
      const frameLocation = iframe.value.contentWindow?.location?.href;

      if (frameLocation && frameLocation.includes('saved=true')) {
        await dialogInstance?.close();
      }
    } catch {
      // catch cross-origin error when trying to read iframe location
    }
  };
});

onUnmounted(() => {
  setHtmlOverflowY('auto');
});


</script>

<style lang="scss">

.custom-content-frame {
  .content {
    height: 100%;
    display: flex;
    flex-direction: column;
    flex: 1;
    padding: 0 !important;
  }
}

.the-dialog {
  &.fullscreen {
    @include desktop {
      width: 100%;
      height: 100%;
    }
  }
}

</style>
