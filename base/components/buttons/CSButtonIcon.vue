<script setup lang="ts">
interface CSButtonIconProps {
  icon?: string;
}


const props = defineProps<CSButtonIconProps>();
</script>

<template>
  <button type="button" class="cs-button-icon">
    <slot>
      <LazySvgIcon :svg="props.icon"></LazySvgIcon>
    </slot>
  </button>
</template>

<style lang="scss">
.cs-button-icon {
  width: 40px;
  height: 40px;
  background-color: $CB-2;
  border-radius: 50%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;

  &.bg-light {
    background-color: $CB-1;
  }

  &.bg-dark {
    background-color: $CB-3;
  }
}
</style>