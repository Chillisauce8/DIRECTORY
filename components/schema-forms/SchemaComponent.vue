<script setup lang="ts">

import FieldError from '~/components/schema-forms/FieldError.vue';


interface SchemaComponentProps {
  componentName: string,
  componentProperties: any;
  validator?: any;
  model: any;
}

export interface SchemaComponentEmits {
  (e: 'onModelChange', value: any): void;
}


// @ts-ignore
const props = defineProps<SchemaComponentProps>();
// @ts-ignore
const emits = defineEmits<SchemaComponentEmits>();


function onModelChange(value: any) {
  emits('onModelChange', value);
}

function prepareClasses(): string {
  const result = [];

  if (props.componentProperties.class) {
    result.push(props.componentProperties.class);
  }

  if (props.componentName) {
    result.push(props.componentName);
  } else if (props.componentProperties.type) {
    result.push(props.componentProperties.type);
  }

  return result.join(' ');
}


</script>

<template>
  <div class="field">
    <div class="input-wrapper">
      <component :is="props.componentName"
                 v-model="props.model" @update:modelValue="onModelChange($event)"
                 v-bind="props.componentProperties"
                 :invalid="validator?.$error"
                 :class="[prepareClasses(), props.validator?.$error ? 'p-invalid' : '']">
      </component>
    </div>
    <FieldError class="error-message"
                v-if="props.validator"
                :vuelidate-field="props.validator.vuelidateField">
    </FieldError>
  </div>
</template>

<style lang="scss">
</style>
