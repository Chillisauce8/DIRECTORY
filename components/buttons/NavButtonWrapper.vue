<template>
    <!-- <div class="nav-button-wrapper" :class="{'hide-nav': hideNav, 'show-nav': !hideNav}"></div> -->
  <div class="nav-button-wrapper show-nav">
    <slot />
  </div>
</template>


<script setup lang="ts">

  interface NavButtonWrapperProps {
    hideNavId?: string;
  }

  import {useIntersectedElementsStore} from "~/store/intersectedElements";

  const props = defineProps<NavButtonWrapperProps>();

  let hideNav = ref(false);

  const hideNavId = props.hideNavId;

  if (hideNavId) {
    const intersectedElementsStore = useIntersectedElementsStore();

    intersectedElementsStore.$onAction(({name, args, after}) => {
      after(() => {
        if (args[0] === hideNavId) {
          if (name === 'setIntersected') {
            hideNav.value = true;
            console.log('got setIntersected');
          } else {
            hideNav.value = false;
            console.log('got resetIntersected');
          }
        }
      });
    });
  }

</script>

<style lang="scss">

</style>
