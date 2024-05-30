<template>
  <div :ref="el => {selfRef = el; parentObjectFieldRef = el;}"
       class="schema-form-object-field">
    <div v-if="sharedFunctions?.shouldBeConstructed(props.description.header)"
       v-show="!props.description.xHideValue">

      <div class="field_wrap row start-baseline gap-horizontal_15"
           v-for="(line, lineIndex) in vm.lines"
           v-show="!isAllLineHidden(line)">

        <p class="label" v-if="props.description.header.title"
           :style="{opacity: shouldShowTitle(lineIndex)? 1 : 0}">
          <span>
            {{ sharedFunctions.getTitle() }}

            <i class="icon icon-question-mark padding_-5" v-if="sharedFunctions.getDescriptionText()"
               v-tooltip.bottom="sharedFunctions.getDescriptionText()"></i>
          </span>
        </p>

        <div class="row flex gap-horizontal_15 wrap">

          <template v-for="item in line">
            <div class="flex DDDD" :style="{width: item.description.xFlex + '%'}"
                 v-if="shouldItemBeConstructed(item)"
                 v-tooltip.bottom="item.description.description">

              <DynamicControl
                v-if="item.formDirective === 'valueField'"
                :description="item.description"
                :model="vm.model[item.description.name]"
                @modelChange="onModelChange(item.description.name, $event)"
                :context="vm.context">
              </DynamicControl>

              <DynamicField
                class="inner-dynamic-field"
                v-if="item.formDirective !== 'valueField'"
                :description="item"
                :model="vm.model"
                @modelChange="onModelChange(undefined, $event)"
                :context="vm.context">
              </DynamicField>

            </div>
          </template>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, getCurrentInstance } from 'vue';
import type { BaseFieldEmits, BaseFieldProps } from '~/composables/schema-forms/useBaseField';
import useBaseField from '~/composables/schema-forms/useBaseField';
import { isObject } from '~/service/utils';
// @ts-ignore
import { extend } from 'vue-extend-reactive';
import DynamicControl from '~/components/schema-forms/DynamicControl.vue';
import DynamicField from '~/components/schema-forms/DynamicField.vue';


// @ts-ignore
const props = defineProps<BaseFieldProps>();
// @ts-ignore
const emits = defineEmits<BaseFieldEmits>();

const selfRef = ref(null);

let {vm, sharedFunctions} = useBaseField(props, emits);

const initFieldBase = sharedFunctions.initField;

vm = extend(vm, {
  lines: [],
});

sharedFunctions.initField = initField;


function initField(): void {
  initFieldBase();

  if (!vm.model || (!isObject(vm.model) || Array.isArray(vm.model))) {
    vm.model = {};
  }

  vm.lines = [[]];

  if (vm.model === undefined || vm.model === null) {
    if (props.description.header.required) {
      sharedFunctions.createModel();
    } else if (!props.description.header.xClose || props.description.header.xClose.default === false) {
      sharedFunctions.createModel();
    }
  }

  if (vm.model && !Object.keys(vm.model).length) {
    if (props.description.header.xClose && props.description.header.xClose.default === true) {
      sharedFunctions.deleteModel();
    }
  }

  props.description.content.forEach((item: any) => {
    const description = item.description;

    let lineNumber = 0;
    if (description.xLine || description.rawData.line) {
      lineNumber = (description.xLine || description.rawData.line) - 1; // x-line uses lines starts form 1
      while (lineNumber >= vm.lines.length) {
        vm.lines.push([]);
      }
    }

    vm.lines[lineNumber].push(item);
  });
}


onMounted(() => {
  const instance = getCurrentInstance();

  const parentObjectField = sharedFunctions.getParentByName(instance, 'ObjectField');
  const parentDynamicControl = sharedFunctions.getParentByName(instance, 'DynamicControl');
  const parentGroupField = sharedFunctions.getParentByName(instance, 'FormGroup');
  const schemaForm = sharedFunctions.getParentByName(instance, 'SchemaForm');

  const refs = {
    self: selfRef,
    form: {
      formName: schemaForm?.props.formName,
      needCorrectExistingValues: true,
    },
    parentObjectField: parentObjectField?.refs.selfRef,
    parentGroupField: parentGroupField?.refs.selfRef,
    parentDynamicControl: parentDynamicControl?.refs.selfRef,
  };

  sharedFunctions.setRefs(refs);

  sharedFunctions.doOnMounted();
});


onDeactivated(() => {
  sharedFunctions.onDeactivated();
});

function isAllLineHidden(line: Array<any>): boolean {
  return line.every((elem: any) => {
    return elem.description.xHideValue || elem.description.xRemoveValue ||
      !sharedFunctions.shouldBeConstructed(elem.description, undefined, null, false);
  });
}

function shouldShowTitle(lineIndex: number): boolean {
  const firstDisplayedLineIndex = vm.lines.findIndex((line: any) => !isAllLineHidden(line));
  return firstDisplayedLineIndex === lineIndex;
}

function onModelChange(descriptionName: string, $event: any) {
  if (descriptionName) {
    const modelClone = {...vm.model};
    modelClone[descriptionName] = $event;
    vm.model = modelClone;
  } else {
    vm.model = $event;
  }
}

function shouldItemBeConstructed(item: any): boolean {
  const result = sharedFunctions.shouldBeConstructed(item.description, null,
    item.shouldItemBeConstructedPrevValue || null);

  if (item.shouldItemBeConstructedPrevValue === false && result) {
   //
  }

  item.shouldItemBeConstructedPrevValue = result;
  return result;
}

</script>

<style scoped>

</style>
