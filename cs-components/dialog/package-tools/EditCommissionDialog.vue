<script setup lang="ts">
import {vTextMask} from '~/utils/directives/text-mask';
import {helpers, maxValue, minValue} from '@vuelidate/validators';
import {useVuelidate} from '@vuelidate/core';
import {useDialogData, useDialogInstance} from '~/service/dialog/core/dialog.composables';
import {useStaffService} from '~/service/helpers/staff-common/staff.factory';
import {useGlobalElementsTemplateService} from '~/service/helpers/data-templates/global-elements-template.factory';


interface CommissionItem {
  id: string;
  name: string;
  percent: number;
}


interface ManagerItem {
  id: string;
  name: string;
}


export type EditCommissionDialogData = CommissionItem[];


export type EditCommissionDialogResult = CommissionItem[];


interface EditCommissionDialogVM {
  selectedManager: ManagerItem;
  possibleManagers: ManagerItem[];
  commissionList: CommissionItem[];
  errorMessage: string;
}


const dialogData = useDialogData<EditCommissionDialogData>();
const dialogInstance = useDialogInstance<EditCommissionDialogResult>();
const staffService = useStaffService();
const globalElementsTemplateService = useGlobalElementsTemplateService();


const vm = reactive<EditCommissionDialogVM>({
  selectedManager: null,
  possibleManagers: [],
  commissionList: dialogData,
  errorMessage: '',
});

const validationRules = computed(() => ({
  commissionList: {
    $each: helpers.forEach({
      percent: [minValue(0), maxValue(100)]
    }),
  }
}));

const v$ = useVuelidate(validationRules, vm, {$autoDirty: true});


function init() {
  getPossibleManagers();
}

function save() {
  v$.value.$touch();

  if (v$.value.$invalid) {
    return;
  }

  const positiveCommission = vm.commissionList
    .map(c => ({...c, percent: c.percent = typeof c.percent === 'string' ? parseInt(c.percent, 10) : c.percent}))
    .filter(c => isFinite(c.percent) && c.percent !== null)

  const sum = positiveCommission
    .reduce((sum, p) => {
      sum += toRaw(p).percent;

      return sum;
    }, 0);

  if (sum > 100) {
    vm.errorMessage = globalElementsTemplateService.getMessageFromDictionaryVariables('editCommissionSumError');
    return;
  }

  dialogInstance.close(positiveCommission);
}

function addStaff() {
  if (!vm.selectedManager) {
    return;
  }

  vm.commissionList.push({
    id: vm.selectedManager.id,
    name: vm.selectedManager.name,
    percent: null
  });

  nextTick(() => {
    vm.possibleManagers = filterPossibleManagers(vm.possibleManagers);

    nextTick(() => vm.selectedManager = undefined);
  });
}

function onCommissionChange() {
  vm.errorMessage = '';
}

async function getPossibleManagers(): Promise<ManagerItem[]> {
  const managers = await staffService.getManagers();

  vm.possibleManagers = managers
    .map(m => ({id: m._doc, name: m?.general?.name ?? m?.title}))
    .sort((item1: any, item2: any) => {
      let name1 = item1.name.toLowerCase();
      let name2 = item2.name.toLowerCase();

      if (name1 < name2) {return -1;}
      if (name1 > name2) {return 1;}
      return 0;
    });

  vm.possibleManagers = filterPossibleManagers(vm.possibleManagers);
}

function filterPossibleManagers(possibleManagers: ManagerItem[]): ManagerItem[] {
  return possibleManagers.filter(m => vm.commissionList.find(c => c.id === m.id) === undefined);
}

onMounted(async () => {
  await getPossibleManagers();
});
</script>

<template>
  <tool-dialog title="Edit Commission">
    <form name="edit-commission" @submit.prevent="save">
      <div class="full-width">
        <CSFormField>
          <LazyCSSelect v-model="vm.selectedManager"
                    placeholder="Manager"
                    :option-list="vm.possibleManagers"
                    :label-getter="v => v?.name ?? ''">
          </LazyCSSelect>
        </CSFormField>

        <ButtonMain :disabled="!vm.selectedManager" @click.native="addStaff">Add</ButtonMain>
      </div>

      <template v-for="(commission, index) in vm.commissionList">
        <span class="full-width text-align_center"> {{commission.name }}</span>

        <CSFormField>
          <CSInput v-model="commission.percent"
                   v-text-mask="{mask: [/\d/, /\d/, /\d/], guide: false}"
                   placeholder="Percent (%)"
                   @update:modelValue="onCommissionChange">
          </CSInput>

          <template #suffix>
            <CSErrorEachItem class="cs-form-text-error"
                             :vuelidate-collection-field="v$.commissionList"
                             :item-index="index"
                             item-field-name="percent">
            </CSErrorEachItem>
          </template>
        </CSFormField>
      </template>

      <span class="text-align_center full-width cs-form-text-error">{{ vm.errorMessage }}</span>

      <ButtonMain type="submit" >Save</ButtonMain>
    </form>
  </tool-dialog>
</template>

<style lang="scss">
</style>

