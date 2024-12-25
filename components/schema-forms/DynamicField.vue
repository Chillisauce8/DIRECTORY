<template>
    <div class="field" v-if="initDone && props.noWrapper" v-show="!props.description.xHideValue">
        <component :is="componentInstance" :description="props.description" :context="vm.context"
                   :model="vm.model" @modelChange="onModelChange($event)"
                   @initDone="onDynamicComponentInitDone($event)">
        </component>
        <slot></slot>
    </div>

    <div v-else-if="initDone && !props.noWrapper" class="field-wrapper" :class="prepareClasses"
         v-show="!props.description.xHideValue" :id="props.index == undefined ? props.description.id : null">
        <template v-if="props.formLabelType === 'float-label'">
            <FloatLabel class="float-label" :variant="props.floatLabelVariant">
                <label>{{ sharedFunctions.getTitle() }}</label>
                <div class="field">
                    <component :is="componentInstance" :description="props.description" :context="vm.context"
                               :model="vm.model" @modelChange="onModelChange($event)"
                               @initDone="onDynamicComponentInitDone($event)">
                    </component>
                    <slot></slot>
                </div>
            </FloatLabel>
        </template>
        <template v-else>
            <span :class="props.formLabelType">
                <label>{{ sharedFunctions.getTitle() }}</label>
                <div class="field">
                    <component :is="componentInstance" :description="props.description" :context="vm.context"
                               :model="vm.model" @modelChange="onModelChange($event)"
                               @initDone="onDynamicComponentInitDone($event)">
                    </component>
                    <slot></slot>
                </div>
            </span>
        </template>
    </div>
</template>

<script setup lang="ts">
import { getCurrentInstance } from 'vue';
import type { BaseControlProps, BaseControlEmits } from '~/composables/schema-forms/useBaseControl';
import useBaseControl from '~/composables/schema-forms/useBaseControl';
import type { FormLabelType, FloatLabelVariant } from '~/types/schema-forms';

const TextField = resolveComponent('TextField');
const NumberField = resolveComponent('NumberField');
const CheckboxField = resolveComponent('CheckboxField');
const ChipsField = resolveComponent('ChipsField');
const DropdownField = resolveComponent('DropdownField');
const MultiselectField = resolveComponent('MultiselectField');
const AutocompleteField = resolveComponent('AutoCompleteField');
const ReadonlyField = resolveComponent('ReadonlyField');
const CalendarField = resolveComponent('CalendarField');


export interface DynamicControlProps extends BaseControlProps {
    index?: number;
    noWrapper?: boolean;
    formLabelType?: FormLabelType;
    floatLabelVariant?: FloatLabelVariant;
}

// @ts-ignore
const props = defineProps<DynamicControlProps>();
// @ts-ignore
const emits = defineEmits<BaseControlEmits>();

const componentName = ref();
const innerComponentName = ref();

const { vm, sharedFunctions, initDone } = useBaseControl(props, emits);
const doOnMountedBase = sharedFunctions.doOnMounted;

function doOnMounted() {
    componentName.value = calculateComponentName();

    const instance = getCurrentInstance();

    doOnMountedBase(instance);
    initDone.value = true;
}

onMounted(() => {
    doOnMounted();
});

function initField() {}

const componentInstance = computed(() => {
    switch (componentName.value) {
        case 'Readonly':
            return ReadonlyField;
        case 'AutoComplete':
            return AutocompleteField;
        case 'InputText':
            return TextField;
        case 'Textarea':
            return TextField;
        case 'InputNumber':
            return NumberField;
        case 'DatePicker':
            return CalendarField;
        case 'ToggleSwitch':
            return CheckboxField;
        case 'Checkbox':
            return CheckboxField;
        case 'Chips':
            return ChipsField;
        case 'Select':
            return DropdownField;
        case 'MultiSelect':
            return MultiselectField;

        default:
            return TextField;
    }
});

const prepareClasses = computed(() => {
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
});

function processControlTypeChanges() {
  componentName.value = calculateComponentName();
}

function onModelChange($event: any) {
    vm.model = $event;
    emits('modelChange', $event);
}

function onDynamicComponentInitDone($event: any) {
    innerComponentName.value = $event.componentName;
    emits('initDone', $event);
}

function needXProcessTheField(): boolean {
    return true;
}

function processXFeatures() {
    componentName.value = calculateComponentName();
    return null;
}

function calculateComponentName(): string {
    if (sharedFunctions.isReadonly()) {
        return 'Readonly';
    }

    if (props.description.xEnumValues || props.description.xOptionsValues) {
        if (props.description.component !== 'MultiSelect' && props.description.component !== 'Autocomplete' &&
          componentName.value !== 'MultiSelect' && componentName.value !== 'Autocomplete') {
            return 'Select';
        }
    }

    if (props.description.component) {
      return props.description.component;
    }

    // if (props.description.enum?.length) {
    //   return 'Select';
    // }
}

function isValid(): boolean {
    return true;
}

function touch() {
    //
}

sharedFunctions.doOnMounted = doOnMounted;
sharedFunctions.initField = initField;
sharedFunctions.processXFeatures = processXFeatures;
sharedFunctions.needXProcessTheField = needXProcessTheField;
sharedFunctions.processControlTypeChanges = processControlTypeChanges;
sharedFunctions.isValid = isValid;
sharedFunctions.touch = touch;
</script>

<style></style>
