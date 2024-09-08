<template>
    <div v-if="initDone" v-show="!props.description.xHideValue"
         :id="props.index == undefined ? props.description.id : null"
         :class="['field-wrapper', prepareClasses()]">
        <label v-if="!props.noPlaceholder">{{ props.description.controlTitle }}</label>

        <ReadonlyControl v-if="controlType === 'readonly'"
                         :model="vm.model"
                         :description="props.description" :context="vm.context"
                         @initDone="onControlInitDone($event)">
        </ReadonlyControl>

        <DateControl v-else-if="controlType === 'date'"
                     :model="vm.model" @modelChange="onModelChange($event)"
                     :description="props.description" :context="vm.context"
                     @initDone="onControlInitDone($event)">
        </DateControl>

        <TimeTwentyFourControl v-else-if="controlType === 'time'"
                               :model="vm.model" @modelChange="onModelChange($event)"
                               :description="props.description" :context="vm.context"
                               @initDone="onControlInitDone($event)">
        </TimeTwentyFourControl>

        <TimeTwentyFourControl v-else-if="controlType === 'time24'"
                               :model="vm.model" @modelChange="onModelChange($event)"
                               :description="props.description" :context="vm.context"
                               @initDone="onControlInitDone($event)">
        </TimeTwentyFourControl>

        <TextControl v-else-if="controlType === 'text'"
                     :model="vm.model" @modelChange="onModelChange($event)"
                     :description="props.description" :context="vm.context"
                     @initDone="onControlInitDone($event)">
        </TextControl>

        <TextareaControl v-else-if="controlType === 'textarea'"
                         :model="vm.model" @modelChange="onModelChange($event)"
                         :description="props.description" :context="vm.context"
                         @initDone="onControlInitDone($event)">
        </TextareaControl>

        <EmailControl v-else-if="controlType === 'email'"
                      :model="vm.model" @modelChange="onModelChange($event)"
                      :description="props.description" :context="vm.context"
                      @initDone="onControlInitDone($event)">
        </EmailControl>

        <NumberControl v-else-if="controlType === 'number'"
                       :model="vm.model" @modelChange="onModelChange($event)"
                       :description="props.description" :context="vm.context"
                       @initDone="onControlInitDone($event)">
        </NumberControl>

        <UrlControl v-else-if="controlType === 'url'"
                    :model="vm.model" @modelChange="onModelChange($event)"
                    :description="props.description" :context="vm.context"
                    @initDone="onControlInitDone($event)">
        </UrlControl>

        <CheckboxControl v-else-if="controlType === 'checkbox'"
                         :model="vm.model" @modelChange="onModelChange($event)"
                         :description="props.description" :context="vm.context"
                         @initDone="onControlInitDone($event)">
        </CheckboxControl>

        <SelectControl v-else-if="controlType === 'select'"
                       :model="vm.model" @modelChange="onModelChange($event)"
                       :description="props.description" :context="vm.context"
                       @initDone="onControlInitDone($event)">
        </SelectControl>

        <MultiselectControl v-else-if="controlType === 'multiselect'"
                            :model="vm.model" @modelChange="onModelChange($event)"
                            :description="props.description" :context="vm.context"
                            @initDone="onControlInitDone($event)">
        </MultiselectControl>

        <ChipsControl v-else-if="controlType === 'chips'"
                      :model="vm.model" @modelChange="onModelChange($event)"
                      :description="props.description" :context="vm.context"
                      @initDone="onControlInitDone($event)">
        </ChipsControl>

        <NumberChipsControl v-else-if="controlType === 'number-chips'"
                            :model="vm.model" @modelChange="onModelChange($event)"
                            :description="props.description" :context="vm.context"
                            @initDone="onControlInitDone($event)">
        </NumberChipsControl>

        <AutocompleteControl v-else-if="controlType === 'autocomplete'"
                             :model="vm.model" @modelChange="onModelChange($event)"
                             :description="props.description" :context="vm.context"
                             @initDone="onControlInitDone($event)">
        </AutocompleteControl>

        <UploadControl v-else-if="controlType === 'upload'"
                       :model="vm.model" @modelChange="onModelChange($event)"
                       :description="props.description" :context="vm.context"
                       @initDone="onControlInitDone($event)">
        </UploadControl>
    </div>
</template>

<script setup lang="ts">
// @ts-ignore
import { getCurrentInstance } from 'vue';
import type { BaseControlProps, BaseControlEmits } from '~/composables/schema-forms/useBaseControl';
import useBaseControl from '~/composables/schema-forms/useBaseControl';
import EmailControl from '~/components/schema-forms/EmailControl.vue';
import TextareaControl from '~/components/schema-forms/TextareaControl.vue';
import TextControl from '~/components/schema-forms/TextControl.vue';
import NumberControl from '~/components/schema-forms/NumberControl.vue';
import UrlControl from '~/components/schema-forms/UrlControl.vue';
import CheckboxControl from '~/components/schema-forms/CheckboxControl.vue';
import ChipsControl from '~/components/schema-forms/ChipsControl.vue';
import SelectControl from '~/components/schema-forms/SelectControl.vue';
import MultiselectControl from '~/components/schema-forms/MultiselectControl.vue';
import NumberChipsControl from '~/components/schema-forms/NumberChipsControl.vue';
import AutocompleteControl from '~/components/schema-forms/AutocompleteControl.vue';
import ReadonlyControl from '~/components/schema-forms/ReadonlyControl.vue';
import DateControl from '~/components/schema-forms/DateControl.vue';
import TimeTwentyFourControl from '~/components/schema-forms/TimeTwentyFourControl.vue';


export interface DynamicControlProps extends BaseControlProps {
  index?: number;
}


// @ts-ignore
const props = defineProps<DynamicControlProps>();
// @ts-ignore
const emits = defineEmits<BaseControlEmits>();


const controlType = ref();
const componentName = ref();


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

function processControlTypeChanges() {
    //
}

function onModelChange($event: any) {
    vm.model = $event;
    emits('modelChange', $event);
}

function onControlInitDone($event: any) {
  componentName.value = $event.componentName;
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

  if (componentName.value) {
    result.push(componentName.value);
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
