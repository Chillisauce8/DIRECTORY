<template>
  <form @submit="submit" class="form-element" :name="dataState.formName">
    <slot></slot>
  </form>
</template>

<script setup lang="ts">
import {reactive} from 'vue';
import {AuthProvider} from '~/service/helpers/auth/auth-form.types';


interface AuthFormProps {
  formName: string;
}


interface AuthFromEmits {
  (e: 'submit'): void;
}

const props = defineProps<AuthFormProps>();
const emits = defineEmits<AuthFromEmits>();


const dataState = reactive({
  formName: props.formName,
});


function submit(event: Event): void {
  event.preventDefault();

  emits('submit');
}
</script>

<style lang="scss">
</style>
