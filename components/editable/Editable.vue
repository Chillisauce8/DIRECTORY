<script setup lang="ts">

import { type Ref, ref } from 'vue';
import { getValueFromObject, setObjectPropertyByString } from '~/service/utils';
import { SchemaFormsBuildHelper } from '~/service/schema-forms/schemaFormsBuildHelper.factory';

const self = getCurrentInstance();
const parentProps = self?.parent?.props;

export interface EditableProps {
  field: string;
  schemaFormsBuildHelper?: SchemaFormsBuildHelper;
}

const generateFieldDescription: Function = inject('generateFieldDescription') as Function;
const processAfterFieldGeneration: Function = inject('processAfterFieldGeneration') as Function;
const setDataProperty: Function = inject('setDataProperty') as Function;
const getDataProperty: Function = inject('getDataProperty') as Function;
const possibleToRenderComponent = inject('possibleToRenderComponent') as Ref<boolean>;

const props = defineProps<EditableProps>();

let editableValue = getValueFromObject(parentProps?.data, props.field);

const context = {};
let fieldDescription;
let componentInstance: Ref<any> = ref(null);


const TextField = resolveComponent('TextField');
const NumberField = resolveComponent('NumberField');
const CheckboxField = resolveComponent('CheckboxField');
const ChipsField = resolveComponent('ChipsField');
const DropdownField = resolveComponent('DropdownField');
const MultiselectField = resolveComponent('MultiselectField');
const AutocompleteField = resolveComponent('AutoCompleteField');
const ReadonlyField = resolveComponent('ReadonlyField');
const CalendarField = resolveComponent('CalendarField');


function getFieldComponentByName(componentName: string) {
  switch(componentName) {
    case 'Readonly': return ReadonlyField;
    case 'AutoComplete': return AutocompleteField;
    case 'InputText': return TextField;
    case 'Textarea': return TextField;
    case 'InputNumber': return NumberField;
    case 'DatePicker': return CalendarField;
    case 'ToggleSwitch': return CheckboxField;
    case 'Checkbox': return CheckboxField;
    case 'InputChips': return ChipsField;
    case 'Select': return DropdownField;
    case 'MultiSelect': return MultiselectField;

    default: return TextField;
  }
}


watch(() => props?.field, async (value: any) => {
  editableValue = getDataProperty(value);
});


async function loadComponent() {
  if (generateFieldDescription) {
    fieldDescription = await generateFieldDescription(props.field);
    processAfterFieldGeneration();
  }
}

watch(() => parentProps?.edit, async (value: any) => {
  if (parentProps?.edit) {
    await loadComponent();
  } else {
    fieldDescription = null;
    componentInstance.value = null;
  }
}, { immediate: true });


watch(() => possibleToRenderComponent.value, (value: any) => {
  if (value) {
    componentInstance.value = getFieldComponentByName(fieldDescription.component);
  }
}, {immediate: true});

function onModelChange($event: any) {
  setDataProperty(props.field, $event);
}

</script>

<template>
  <slot v-if="!parentProps?.edit"></slot>
  <template v-if="componentInstance">
    <component :is="componentInstance"
               :description="fieldDescription" :context="context"
               :model="editableValue" @modelChange="onModelChange($event)">
    </component>
  </template>
</template>

<style scoped lang="scss">

</style>
