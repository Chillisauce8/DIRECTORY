<template>
  <div ref="selfRef" class="schema-form-array-of-values-field">
    <div v-if="sharedFunctions?.shouldBeConstructed(props.description)" v-show="!props.description.xHideValue">
      <div class="field_wrap row start-baseline gap-horizontal_15"
           v-for="(line, index) in props.model" :key="index">

        <p class="label flex-none" v-if="props.description.title && index === 0">
          {{ sharedFunctions.getTitle() }}

          <i class="pi pi-question padding_-5" v-if="sharedFunctions.getDescriptionText()"
             v-tooltip.bottom="sharedFunctions.getDescriptionText()"></i>
        </p>

        <p class="label flex-none" v-if="props.description.title && index !== 0"></p>

        <div class="flex" v-if="sharedFunctions.shouldItemBeConstructed(vm.rowDescriptions[index], index)">
          <schema-form-dynamic-control
            :description="vm.rowDescriptions[index]"
            :model="props.model[index]"
            :context="sharedFunctions.createInnerFieldContext(props.description.name, index)"
            :noPlaceholder="true">
          </schema-form-dynamic-control>
        </div>

        <SpeedDial :model="createSpeedDialItems(index)" v-if="!sharedFunctions.isReadonly()"
                   direction="left" :style="{ top: 'calc(50% - 2rem)', right: 0 }" />
      </div>

      <div class="empty row start-center" v-if="!props.model.length">
        <p class="label flex">
          {{ sharedFunctions.getTitle() }}

          <i class="pi pi-question padding_-5" v-if="sharedFunctions.getDescriptionText()"
             v-tooltip.bottom="sharedFunctions.getDescriptionText()"></i>
        </p>

        <button aria-label="Add First Row"
                v-if="!sharedFunctions.isReadonly() && sharedFunctions.canAddMore()"
                @click="sharedFunctions.addFirstRow()">
          <i class="pi pi-plus"></i>
        </button>
      </div>

      <div v-if="!sharedFunctions.isValidMaxItems()" class="text-color_red field_wrap">
        Max items value is {{ props.description.xMaxItemsValue}}
      </div>

      <div v-if="!sharedFunctions.isValidMinItems()" class="text-color_red field_wrap">
        Min items value is {{ props.description.xMinItemsValue}}
      </div>

      <div v-if="!sharedFunctions.ifValidUniqueItems()" class="text-color_red field_wrap">
        Items are not unique
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import useBaseArrayFieldControl from '~/composables/schema-forms/useBaseArrayFieldControl';
import type { BaseFieldEmits, BaseFieldProps } from '~/composables/schema-forms/useBaseField';

// @ts-ignore
const props = defineProps<BaseFieldProps>();
// @ts-ignore
const emits = defineEmits<BaseFieldEmits>();

const formRef = ref(null);
const selfRef = ref(null);
const parentObjectFieldRef = ref(null);
const parentGroupFieldRef = ref(null);
const parentDynamicControlRef = ref(null);

let vm: any, sharedFunctions: any;


onMounted(() => {
  const refs = {
    self: selfRef,
    form: {
      formName: formRef.value?.name,
      needCorrectExistingValues: true,
    },
    parentObjectField: parentObjectFieldRef,
    parentGroupField: parentGroupFieldRef,
    parentDynamicControl: parentDynamicControlRef,
  };

  const baseFieldExport = useBaseArrayFieldControl(props, emits, refs);

  vm = baseFieldExport.vm;
  sharedFunctions = baseFieldExport.sharedFunctions;

  sharedFunctions._createModelRow = _createModelRow;

  sharedFunctions.doOnMounted();
});


onDeactivated(() => {
  sharedFunctions.onDeactivated();
});

function createSpeedDialItems(index: number) {
  return [{
    icon: 'pi-plus',
    command: () => sharedFunctions.addRowAfter(index),
    visible: () => sharedFunctions.canAddMore(),
  }, {
    icon: 'pi-times',
    command: () => sharedFunctions.deleteRow(index),
    visible: () => sharedFunctions.canRemoveMore(),
  }, {
    icon: 'pi-chevron-up',
    command: () => sharedFunctions.moveRowUp(index),
  }, {
    icon: 'pi-chevron-down',
    command: () => sharedFunctions.moveRowDown(index),
  }];
}

function _createModelRow() {
  return null;
}


</script>

<style>

</style>
