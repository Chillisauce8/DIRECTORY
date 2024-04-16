<template v-for="(content, index) in contents">
  <div></div>
  <!--  <component
    v-if="content.component"
    :is="content.component"
    :class="content.classes"
    :props="content.props"
    :key="index"
  >
  <template v-if="content.component.slot">
     <component

    :is="content.component"
    :class="content.classes"
    :props="content.props"
    :key="index"
  >
    </template>
  </component>
  -->
</template>

<script>
export default {
  props: ['contents'],
}
</script>

<style lang="scss"></style>
