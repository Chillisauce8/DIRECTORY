<script setup lang="ts">

import FieldError from '~/components/schema-forms/FieldError.vue';


interface SchemaControlProps {
  vm: any,
  vuelidateField?: any;
}


// @ts-ignore
const props = defineProps<SchemaControlProps>();

</script>

<template>
  <div class="field-wrapper">
    <label>{{ props.vm.title }}</label>
    <div class="field">
      <div class="input-wrapper">
        <slot></slot>
      </div>
    </div>
  </div>
  <FieldError class="error-message"
              v-if="props.vuelidateField"
              :vuelidate-field="props.vuelidateField">
  </FieldError>
</template>

<style lang="scss">
</style>
