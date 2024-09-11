<template>
  <div v-if="initDone" v-show="!props.description.xHideValue"
       :id="props.index == undefined ? props.description.id : null"
       :class="['field-wrapper', prepareClasses()]">
    <label v-if="!props.noPlaceholder">{{ props.description.controlTitle }}</label>

    <component :is="componentInstance"
               :description="props.description" :context="vm.context"
               :model="vm.model" @modelChange="onModelChange($event)"
               @initDone="onControlInitDone($event)">
    </component>
  </div>
</template>


<script setup lang="ts">
// @ts-ignore
import { getCurrentInstance } from 'vue';
import type { BaseControlProps, BaseControlEmits } from '~/composables/schema-forms/useBaseControl';
import useBaseControl from '~/composables/schema-forms/useBaseControl';


const EmailField = resolveComponent('EmailField');
const TextareaField = resolveComponent('TextareaField');
const TextField = resolveComponent('TextField');
const NumberField = resolveComponent('NumberField');
const UrlField = resolveComponent('UrlField');
const CheckboxField = resolveComponent('CheckboxField');
const ChipsField = resolveComponent('ChipsField');
const SelectField = resolveComponent('SelectField');
const MultiselectField = resolveComponent('MultiselectField');
const NumberChipsField = resolveComponent('NumberChipsField');
const AutocompleteField = resolveComponent('AutocompleteField');
const ReadonlyField = resolveComponent('ReadonlyField');
const DateField = resolveComponent('DateField');
const TimeTwentyFourField = resolveComponent('TimeTwentyFourField');
const UploadField = resolveComponent('UploadField');


export interface DynamicControlProps extends BaseControlProps {
  index?: number;
}


// @ts-ignore
const props = defineProps<DynamicControlProps>();
// @ts-ignore
const emits = defineEmits<BaseControlEmits>();


const controlType = ref();
const innerComponentName = ref();


const { vm, sharedFunctions, initDone } = useBaseControl(props, emits);
const doOnMountedBase = sharedFunctions.doOnMounted;

function doOnMounted() {
    controlType.value = calculateControlType();
    sharedFunctions.initField();

    const instance = getCurrentInstance();

    doOnMountedBase(instance);
    initDone.value = true;
}

onMounted(() => {
  doOnMounted();
});

const componentInstance = computed(() => {
  switch(controlType.value) {
    case 'readonly': return ReadonlyField;
    case 'date': return DateField;
    case 'time': return TimeTwentyFourField;
    case 'time24': return TimeTwentyFourField;
    case 'text': return TextField;
    case 'textarea': return TextareaField;
    case 'number': return NumberField;
    case 'email': return EmailField;
    case 'checkbox': return CheckboxField;
    case 'url': return UrlField;
    case 'select': return SelectField;
    case 'multiselect': return MultiselectField;
    case 'chips': return ChipsField;
    case 'number-chips': return NumberChipsField;
    case 'autocomplete': return AutocompleteField;
    case 'upload': return UploadField;

    default: return 'TextField';
  }
});

function processControlTypeChanges() {
    //
}

function onModelChange($event: any) {
    vm.model = $event;
    emits('modelChange', $event);
}

function onControlInitDone($event: any) {
  innerComponentName.value = $event.componentName;
}


function needXProcessTheField(): boolean {
    return true;
}

function processXFeatures() {
    controlType.value = calculateControlType();
    return null;
}

function calculateControlType(): string {
    if (sharedFunctions.isReadonly()) {
        return 'readonly';
    }

    if (props.description.xEnumValues || props.description.xOptionsValues) {
        if (props.description.formType !== 'multiselect' && props.description.formType !== 'autocomplete') {
            return 'select';
        }
    }

    if (props.description.xUpload) {
        return 'upload';
    }

    return props.description.formType;
}

function isValid(): boolean {
    return true;
}

function touch() {
    //
}

function prepareClasses(): string {
  const result = [];

  if (props.description.class) {
    result.push(props.description.class);
  }

  if (innerComponentName.value) {
    result.push(innerComponentName.value);
  } else if (props.description.type) {
    result.push(props.description.type);
  }

  return result.join(' ');
}

sharedFunctions.doOnMounted = doOnMounted;
sharedFunctions.processXFeatures = processXFeatures;
sharedFunctions.needXProcessTheField = needXProcessTheField;
sharedFunctions.processControlTypeChanges = processControlTypeChanges;
sharedFunctions.isValid = isValid;
sharedFunctions.touch = touch;
</script>


<style>
</style>
