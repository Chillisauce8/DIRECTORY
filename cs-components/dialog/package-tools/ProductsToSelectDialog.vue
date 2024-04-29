<script setup lang="ts">
import {PackageProduct} from '~/service/models/packageProduct';
import {useDialogData, useDialogInstance} from '~/service/dialog/core/dialog.composables';
import type {IProductAddon} from '~/service/models/productAddon';
import type {IProductOption} from '~/service/models/productOption';
import {useDateHelper} from '~/service/helpers/date-helper.factory';


export interface ProductsToSelectDialogData {
  packageProducts: PackageProduct[];
  showConfirmationStatus?: boolean;
}


export type ProductsToSelectDialogResult = PackageProduct;


interface ProductsToSelectDialogVM extends ProductsToSelectDialogData {}

const dateHelper = useDateHelper();
const dialogData = useDialogData<ProductsToSelectDialogData>();
const dialogInstance = useDialogInstance<ProductsToSelectDialogResult>();


const vm = reactive<ProductsToSelectDialogVM>({
  packageProducts: dialogData.packageProducts,
  showConfirmationStatus: dialogData.showConfirmationStatus ?? false,
});


function selectPackageProduct(packageProduct: PackageProduct) {
  dialogInstance.close(packageProduct);
}

function getAddOnsAndOptionsString(packageProduct: PackageProduct): string {
  const names = packageProduct.product.getAddons().map((item: IProductAddon) => item.product.getName());
  const optionsNames = packageProduct.product.getOptions().map((item: IProductOption) => item.product.getName());
  return names.concat(optionsNames).join(' + ');
}

function showProductConfirmationStatusIfNeeded(packageProduct: PackageProduct): string {
  if (!vm.showConfirmationStatus) {
    return '';
  }

  if (packageProduct.needConfirmation()) {
    return '';
  }

  return packageProduct.stage;
}
</script>

<template>
  <TheDialog title="Select product" class="dialog-with-form">
    <template v-for="packageProduct in vm.packageProducts">
      <a href="javascript:void(0)" class="Row padding_1_0" @click="selectPackageProduct(packageProduct)">

        <div class="image-wrap">
          <ImageWrapper class="padding_0_1"
                        :max="1"
                        :width="64"
                        :height="64"
                        :cloudinary-id="packageProduct.product.getMainImageId()"/>
        </div>
        <div class="Column">
          <p class="dialog-text">{{ packageProduct.product.getOriginalName() }}</p>
          <p class="dialog-text">
            <span>
              {{ dateHelper.viewDateFormat(packageProduct.date) }}
            </span>

            <span v-if="packageProduct.startTime">
              {{ ' ' + dateHelper.viewTimeFormat(packageProduct.startTime) }}
            </span>
          </p>

          <p class="dialog-text" v-if="vm.showConfirmationStatus">
            {{showProductConfirmationStatusIfNeeded(packageProduct)}}
          </p>
        </div>
      </a>
    </template>
  </TheDialog>
</template>

<style lang="scss">
.image-wrap {
  figure {
    width: 64px;
    height: 64px;

    img {
      border-radius: 50%;
    }
  }
}
</style>
