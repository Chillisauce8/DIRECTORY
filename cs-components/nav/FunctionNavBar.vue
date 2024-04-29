<template>
  <div class="function-nav-bar Row Between Y-Center">
    <div class="left"></div>
    <div class="title"></div>
    <CloseButton class="page-preview-product-none page-preview-post-none" @click.native="handlePackageEditorClose" />
  </div>
</template>

<script setup lang="ts">
import { usePackageSaver } from "~/service/helpers/package-builder/package-saver.service.factory";
import { useSavePackageChangesHelperService } from "~/service/helpers/package-builder/save-package-changes-helper.service.factory";
import { useCurrentEvent } from "~/service/helpers/event/current-event.service.factory";
import {
  eventEmitterFilter,
  eventEmitterObsFirstValueFrom,
} from "~/service/models/event-emitter-observable-helpers";
import { CurrentEventInitStates } from "~/service/helpers/event/current-event.service";
import { useEventPackageBuilder } from "~/service/helpers/package-builder/package-builder.service.factory";
import { useProductViewModeStore } from '~/store/productViewMode';
import { useCsLodash } from '~/service/cs-lodash.factory';

const packageSaver = usePackageSaver();
const packageBuilder = useEventPackageBuilder();
const savePackageChangesHelperService = useSavePackageChangesHelperService();
const currentEvent = useCurrentEvent();
const router = useRouter();
const productViewModeStore = useProductViewModeStore();
const csLodash = useCsLodash();

async function handlePackageEditorClose(): Promise<void> {
  const isMyEventArea = unref(router.currentRoute).path.startsWith('/my-events');
  const isSupplierArea = unref(router.currentRoute).path.startsWith('/supplier/');
  const isViewProduct = !!unref(router.currentRoute).query['view-product'];

  if (isViewProduct && !isMyEventArea && !isSupplierArea) {
    const query = csLodash.cloneDeep(unref(router.currentRoute).query);

    delete query['view-product'];
    delete query['view-product-mode'];
    delete query['newItineraryId'];

    productViewModeStore.reset();

    await router.push({path: unref(router.currentRoute).path, query});
    return;
  }

  if (packageSaver.isPackageChanged()) {
    const result =
      await savePackageChangesHelperService.processUnsavedPackage();

    if (result === "cancelled") {
      return;
    }

    if (["no", "saveCancelled", "not saved"].includes(result)) {
      await eventEmitterObsFirstValueFrom(
        currentEvent
          .currentEventInitDone()
          .pipe(
            eventEmitterFilter((value) => value === CurrentEventInitStates.done)
          )
      ).then(() => packageBuilder.loadCurrent());
    }
  }

  let path;

  if (isSupplierArea) {
    const supplierId = unref(router.currentRoute).params['supplierId'] as string;
    path = currentEvent.getCurrentEventSupplierViewPath(supplierId);
  } else {
    path = currentEvent.getCurrentEventPath();
  }

  await router.push(path);
}
</script>

<style lang="scss">
@import "@vueform/toggle/themes/default.css";

.function-view-product {
  .function-nav-bar .title::before {
    content: "View Product";
  }
}
.page-preview-product, .page-preview-post {
  .function-nav-bar .title::before {
    content: "Preview";
  }
  .function-nav-bar {
    display: flex;
    flex-direction: row;
  }
  .function-nav-bar .title {
    display: flex;
    flex-direction: column;
    width: inherit;
    align-items: center;
  }
}
.function-edit-package {
  .function-nav-bar .title::before {
    content: "Package Editor";
  }
}
.function-new-package {
  .function-nav-bar .title::before {
    content: "Add New Package";
  }
}
.function-swap-product {
  .function-nav-bar .title::before {
    content: "Swap Product";
  }
}
.function-nav-bar {
  // background: pink;
  //  color: white;
  display: none;
  width: 100%;
  height: 64px;
  font-family: $ff2;
  text-transform: uppercase;
  @include mobile {
    font-size: 1rem;
    letter-spacing: 0.2rem;
  }
  @include desktop {
    font-size: 1.2rem;
    letter-spacing: 0.5rem;
  }
  & .left {
    width: 64px;
    height: 64px;
  }
}

// Global this style so it can be used in bottom nav
</style>
