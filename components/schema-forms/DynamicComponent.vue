<template>
    <div class="input-wrapper">
      <component :is="props.componentName"
                 v-model="props.model" @update:modelValue="onModelChange($event)"
                 v-bind="props.componentProperties"
                 :invalid="validator?.$error"
                 :class="[props.validator?.$error ? 'p-invalid' : '']">
      </component>
    </div>
    <FieldError class="error-message"
                v-if="props.validator"
                :vuelidate-field="props.validator.vuelidateField">
    </FieldError>
</template>


<script setup lang="ts">

import FieldError from '~/components/schema-forms/fields/FieldError.vue';


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

</script>


<style lang="scss">
</style>
