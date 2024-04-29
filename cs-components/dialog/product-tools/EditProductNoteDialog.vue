<script setup lang="ts">
import type {ProductNote} from '~/service/models/packageProduct';
import {ProductNoteShowEnum, ProductNoteShowToEnum} from '~/service/models/packageProduct';
import {useEventPackageBuilder} from '~/service/helpers/package-builder/package-builder.service.factory';
import {useCsLodash} from '~/service/cs-lodash.factory';
import {useDialogData, useDialogInstance} from '~/service/dialog/core/dialog.composables';


export interface EditProductNoteDialogData {
  productNoteList: ProductNote[];
}


export interface EditProductNoteDialogResult {
  productNoteList: ProductNote[];
}


interface EditProductNoteDialogVM {
  productNoteList: ProductNote[];
  showToPossibleValues: ProductNoteShowToEnum[];
}


const dialogData = useDialogData<EditProductNoteDialogData>();
const dialogInstance = useDialogInstance<EditProductNoteDialogResult>();
const packageBuilder = useEventPackageBuilder();
const csLodash = useCsLodash();


const vm = reactive<EditProductNoteDialogVM>({
  productNoteList: prepareProductNoteList(dialogData?.productNoteList ?? []),
  showToPossibleValues: [
    ProductNoteShowToEnum.staff,
    ProductNoteShowToEnum.supplier,
    ProductNoteShowToEnum.customer,
  ]
});


function save() {
  dialogInstance.close({productNoteList: vm.productNoteList});
}

function addFirstRow(): void {
  vm.productNoteList = [];
  vm.productNoteList.push(packageBuilder.createProductNoteItem());
}

function addRowAfter(index: number): void {
  vm.productNoteList.splice(index + 1, 0, packageBuilder.createProductNoteItem());
}

function deleteRow(index: number): void {
  vm.productNoteList.splice(index, 1);
}

function moveRowUp(index: number): void {
  vm.productNoteList.splice(index - 1, 0, vm.productNoteList.splice(index, 1)[0]);
}

function moveRowDown(index: number): void {
  vm.productNoteList.splice(index + 1, 0, vm.productNoteList.splice(index, 1)[0]);
}

function copyRow(index: number): void {
  vm.productNoteList.splice(index + 1, 0, _.cloneDeep(vm.productNoteList[index]));
}

function getIsShowToItemRemovableFn(productNote: ProductNote): (item: string) => boolean {
  return ((item: string): boolean => {
    const permanentItems: string[] = [ProductNoteShowToEnum.staff];

    if (productNote.doneBy.userType === 'supplierContact') {
      permanentItems.push(ProductNoteShowToEnum.supplier);
    }

    return permanentItems.indexOf(item) === -1;
  });
}

function prepareProductNoteList(productNoteList: ProductNote[]): ProductNote[] {
  const result = [];

  for (const productNote of productNoteList) {
    result.push(updateProductNoteToNewFormat(productNote));
  }

  return result;
}

function updateProductNoteToNewFormat(productNote: ProductNote): ProductNote {
  const preparedProductNote: ProductNote = csLodash.cloneDeep(productNote);

  if (!preparedProductNote.showTo) {
    preparedProductNote.showTo = prepareShowToFieldFromShowField(productNote);
  }

  if (!preparedProductNote.doneBy) {
    preparedProductNote.doneBy = {userType: 'staff'};
  }

  return preparedProductNote;
}

function prepareShowToFieldFromShowField(productNote: ProductNote): string[] {
  if (productNote.show === ProductNoteShowEnum.everyone) {
    return [ProductNoteShowToEnum.customer, ProductNoteShowToEnum.supplier, ProductNoteShowToEnum.staff];
  }

  if (productNote.show === ProductNoteShowEnum.supplier) {
    return [ProductNoteShowToEnum.supplier, ProductNoteShowToEnum.staff];
  }

  if (productNote.show === ProductNoteShowEnum.customer) {
    return [ProductNoteShowToEnum.customer, ProductNoteShowToEnum.staff];
  }
}
</script>

<template>
  <tool-dialog title="Product Note">
    <form name="product-name" @submit.prevent="save">
      <div class="product-note-list full-width">
        <div v-for="(productNote, index) in vm.productNoteList" class="product-note full-width Row">
          <div class="Column Flex Grow">
            <CSFormField>
              <LazyCSTagSelect v-model="productNote.showTo"
                           placeholder="Show To"
                           :options-list="vm.showToPossibleValues">
              </LazyCSTagSelect>
            </CSFormField>

            <CSFormField>
              <CSInput class="tool-dialog-text" v-model="productNote.note" placeholder="Note"></CSInput>
            </CSFormField>
          </div>

          <div class="Column Center">
            <CSSpeedDialButton>
              <template #speed-dial-target>
                <CSButtonIcon class="bg-dark" icon="setting"></CSButtonIcon>
              </template>

              <template #speed-dial-actions>
                <CSButtonIcon icon="copy" @click="copyRow(index)"></CSButtonIcon>
                <CSButtonIcon icon="chevron-up" @click="moveRowUp(index)" v-if="index !== 0"></CSButtonIcon>
                <CSButtonIcon icon="chevron-down" @click="moveRowDown(index)" v-if="index !== vm.productNoteList.length - 1"></CSButtonIcon>
                <CSButtonIcon icon="add-circle" @click="addRowAfter(index)"></CSButtonIcon>
                <CSButtonIcon icon="remove-circle" @click="deleteRow(index)"></CSButtonIcon>
              </template>
            </CSSpeedDialButton>
          </div>
        </div>

        <div class="product-note empty-list-placeholder Row Flex" v-if="!vm?.productNoteList?.length">
          <p class="tool-dialog-text Row Flex Center">Add new product note</p>
          <CSButtonIcon icon="add-circle" @click="addFirstRow"></CSButtonIcon>
        </div>
      </div>

      <ButtonMain type="submit" >OK</ButtonMain>
    </form>
  </tool-dialog>
</template>

<style lang="scss">
.product-note {
  margin: 10px 0;

  .multiselect {
    margin-bottom: 5px;
  }

  &:nth-child(even) {
    background-color: $CB-1;
  }
}
</style>
