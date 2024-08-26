<script setup lang="ts">

import FieldError from '~/components/schema-forms/FieldError.vue';


interface SchemaControlProps {
  vuelidateField?: any;
}


// @ts-ignore
const props = defineProps<SchemaControlProps>();


</script>

<template>
  <FloatLabel>
    <slot></slot>
  </FloatLabel>
  <FieldError class="form-text-error" v-if="props.vuelidateField" :vuelidate-field="props.vuelidateField"></FieldError>
</template>

<style scoped lang="scss">

</style>
