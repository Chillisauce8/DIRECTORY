<script setup lang="ts">
interface DialogErrorProps {
  message?: string;
  link?: string;
  linkText?: string;
}


interface DialogErrorEmits {
  (e: 'link:click'): void;
}


const props = defineProps<DialogErrorProps>();
const emits = defineEmits<DialogErrorEmits>();


function emitLinkClick() {
  if (props?.link) {
    return;
  }

  emits('link:click');
}

function getLinkHref(): string {
  return props?.link ?? 'javascript:void(0)';
}

function needShowElement() {
  return !!props.message || !!props.linkText;
}
</script>

<template>
  <div v-show="needShowElement()" class="text-align_center padding_1_0_0">
    <span class="text-color_red" v-if="props.message">{{ props.message }}</span>
    <br>
    <span class="text-color_aqua">
      <a v-if="props.linkText" :href="getLinkHref()" @click="emitLinkClick()">{{ props.linkText }}</a>
    </span>
  </div>
</template>

<style scoped lang="scss">

</style>