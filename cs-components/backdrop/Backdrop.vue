<script setup lang="ts">
import {useBackdropContentComponent} from '~/service/helpers/backdrop/backdrop.service';

const contentComponent = useBackdropContentComponent();
</script>

<template>
<!--  <transition name="backdrop">-->
    <div class="Backdrop Column Center">
      <component :is="contentComponent?.component" v-bind="contentComponent?.props"></component>
    </div>
<!--  </transition>-->
</template>

<style lang="scss">
.Backdrop {
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 20, 0.8);
  z-index: 10000;
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
}
</style>
