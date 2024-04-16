<script setup lang="ts">
interface SuccessErrorMessageProps {
  header?: string;
  message?: string;
  buttonText?: string;
  isSuccessMessage?: boolean;
}


interface SuccessErrorMessageEmits {
  (e: 'button:click'): void;
}


const props = defineProps<SuccessErrorMessageProps>();
const emits = defineEmits<SuccessErrorMessageEmits>();


const icon = computed(() => props?.isSuccessMessage ? 'check-circle' : 'alert');

const iconClass = computed(() => props?.isSuccessMessage ? 'text-color_aqua' : 'text-color_red');
</script>

<template>
  <section class="text-align_center Flex Column Center">
    <LazySvgIcon class="success-error-message-icon" :svg="icon" :class="iconClass"></LazySvgIcon>

    <div class="padding_1_0">{{ props.header }}</div>
    <div class="dialog-text">{{ props.message }}</div>

    <template v-if="props.buttonText">
      <ButtonMain  @click="emits('button:click')">{{ props.buttonText }}</ButtonMain>
    </template>
  </section>
</template>

<style lang="scss">
.success-error-message {
  &-icon {
    font-size: 2rem;

  }
}
</style>