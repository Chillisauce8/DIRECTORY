<template>
  <div ref="parentDynamicControl" v-show="!props.description.xHideValue"
       class="schema-form-dynamic-control">

    <template v-if="initDone">

      <ReadonlyControl v-if="latestControlType === 'readonly'"
                      :model="vm.model"
                      :description="props.description" :context="vm.context"
                      :noPlaceholder="props.noPlaceholder">
      </ReadonlyControl>

      <DateControl v-else-if="latestControlType === 'date'"
                   :model="vm.model" @modelChange="onModelChange($event)"
                   :description="props.description" :context="vm.context"
                   :noPlaceholder="props.noPlaceholder">
      </DateControl>

      <TimeTwentyFourControl v-else-if="latestControlType === 'time'"
                    :model="vm.model" @modelChange="onModelChange($event)"
                    :description="props.description" :context="vm.context"
                    :noPlaceholder="props.noPlaceholder">
      </TimeTwentyFourControl>

      <TimeTwentyFourControl v-else-if="latestControlType === 'time24'"
                    :model="vm.model" @modelChange="onModelChange($event)"
                    :description="props.description" :context="vm.context"
                    :noPlaceholder="props.noPlaceholder">
      </TimeTwentyFourControl>

      <TextControl v-else-if="latestControlType === 'text'"
                  :model="vm.model" @modelChange="onModelChange($event)"
                  :description="props.description" :context="vm.context"
                  :noPlaceholder="props.noPlaceholder">
      </TextControl>

  <!--    <PathTreeSelectControl v-else-if="latestControlType === 'treePath'"-->
  <!--                          :model="vm.model" @modelChange="onModelChange($event)"-->
  <!--                          :description="props.description" :context="vm.context"-->
  <!--                          :noPlaceholder="props.noPlaceholder">-->
  <!--    </PathTreeSelectControl>-->

      <TextareaControl v-else-if="latestControlType === 'textarea'"
                      :model="vm.model" @modelChange="onModelChange($event)"
                      :description="props.description" :context="vm.context"
                      :noPlaceholder="props.noPlaceholder">
      </TextareaControl>

      <EmailControl v-else-if="latestControlType === 'email'"
                   :model="vm.model" @modelChange="onModelChange($event)"
                   :description="props.description" :context="vm.context"
                   :noPlaceholder="props.noPlaceholder">
      </EmailControl>

      <NumberControl v-else-if="latestControlType === 'number'"
                    :model="vm.model" @modelChange="onModelChange($event)"
                    :description="props.description"
                    :context="vm.context"
                    :noPlaceholder="props.noPlaceholder">
      </NumberControl>

      <UrlControl v-else-if="latestControlType === 'url'"
                 :model="vm.model" @modelChange="onModelChange($event)"
                 :description="props.description" :context="vm.context"
                 :noPlaceholder="props.noPlaceholder">
      </UrlControl>

      <CheckboxControl v-else-if="latestControlType === 'checkbox'"
                      :model="vm.model" @modelChange="onModelChange($event)"
                      :description="props.description" :context="vm.context"
                      :noPlaceholder="props.noPlaceholder">
      </CheckboxControl>

      <SelectControl v-else-if="latestControlType === 'select'"
                    :model="vm.model" @modelChange="onModelChange($event)"
                    :description="props.description" :context="vm.context"
                    :noPlaceholder="props.noPlaceholder">
      </SelectControl>

      <MultiselectControl v-else-if="latestControlType === 'multiselect'"
                         :model="vm.model" @modelChange="onModelChange($event)"
                         :description="props.description" :context="vm.context"
                         :noPlaceholder="props.noPlaceholder">
      </MultiselectControl>

      <ChipsControl v-else-if="latestControlType === 'chips'"
                   :model="vm.model" @modelChange="onModelChange($event)"
                   :description="props.description" :context="vm.context"
                   :noPlaceholder="props.noPlaceholder">
      </ChipsControl>

      <NumberChipsControl v-else-if="latestControlType === 'number-chips'"
                          :model="vm.model" @modelChange="onModelChange($event)"
                          :description="props.description" :context="vm.context"
                          :noPlaceholder="props.noPlaceholder">
      </NumberChipsControl>

      <AutocompleteControl v-else-if="latestControlType === 'autocomplete'"
                          :model="vm.model" @modelChange="onModelChange($event)"
                          :description="props.description" :context="vm.context"
                          :noPlaceholder="props.noPlaceholder">
      </AutocompleteControl>

      <UploadControl v-else-if="latestControlType === 'upload'"
                    :model="vm.model" @modelChange="onModelChange($event)"
                    :description="props.description" :context="vm.context"
                    :noPlaceholder="props.noPlaceholder">
      </UploadControl>

  <!--    <ConditionControl v-else-if="latestControlType === 'condition'"-->
  <!--                     :model="vm.model" @modelChange="onModelChange($event)"-->
  <!--                     :description="props.description"-->
  <!--                     :context="vm.context">-->
  <!--    </ConditionControl>-->

  <!--    <ConditionControl v-else-if="latestControlType === 'filter'"-->
  <!--                     :model="vm.model" @modelChange="onModelChange($event)"-->
  <!--                     :description="props.description"-->
  <!--                     :context="vm.context">-->
  <!--    </ConditionControl>-->

  <!--    <JsonControl v-else-if="latestControlType === 'json'"-->
  <!--                :model="vm.model" @modelChange="onModelChange($event)"-->
  <!--                :description="props.description"-->
  <!--                :context="vm.context">-->
  <!--    </JsonControl>-->

    </template>

  </div>
</template>


<script setup lang="ts">

import type { BaseControlProps } from '~/composables/schema-forms/useBaseControl';
import type { BaseFieldEmits } from '~/composables/schema-forms/useBaseField';
import useBaseControl from '~/composables/schema-forms/useBaseControl';
// @ts-ignore
import { extend } from 'vue-extend-reactive';
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
// @ts-ignore
import { getCurrentInstance } from 'vue';

// @ts-ignore
const props = defineProps<BaseControlProps>();
// @ts-ignore
const emits = defineEmits<BaseFieldEmits>();


const selfRef = ref(null);


const latestControlType = ref();

const {vm, sharedFunctions, initDone} = useBaseControl(props, emits);

function doOnMounted() {
  latestControlType.value = calculateControlType();
  sharedFunctions.initField();
  initDone.value = true;
}


onMounted(() => {
  const instance = getCurrentInstance();

  const parentObjectField = sharedFunctions.getParentByName(instance, 'ObjectField');
  const parentDynamicControl = sharedFunctions.getParentByName(instance, 'DynamicControl');
  const parentGroupField = sharedFunctions.getParentByName(instance, 'FormGroup');
  const schemaForm = sharedFunctions.getParentByName(instance, 'SchemaForm');

  const refs = {
    self: instance,
    form: {
      formName: schemaForm?.props.formName,
      needCorrectExistingValues: true,
    },
    parentObjectField: parentObjectField,
    parentGroupField: parentGroupField,
    parentDynamicControl: parentDynamicControl,
  };

  sharedFunctions.setRefs(refs);

  doOnMounted();
});

function processControlTypeChanges() {
  //
}

function onModelChange($event: any) {
  vm.model = $event;
  emits('modelChange', $event);
}

function needXProcessTheField(): boolean {
  return true;
}

function processXFeatures() {
  latestControlType.value = calculateControlType();
  return null;
}

function calculateControlType(): string {
  if (sharedFunctions.isReadonly()) {
    return 'readonly';
  }

  if (props.description.xEnumValues || props.description.xOptionsValues) {
    if (props.description.formType !== 'multiselect' &&
      props.description.formType !== 'autocomplete') {
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


sharedFunctions.processXFeatures = processXFeatures;
sharedFunctions.needXProcessTheField = needXProcessTheField;
sharedFunctions.processControlTypeChanges = processControlTypeChanges;
sharedFunctions.isValid = isValid;
sharedFunctions.touch = touch;


</script>

<style scoped>

</style>
