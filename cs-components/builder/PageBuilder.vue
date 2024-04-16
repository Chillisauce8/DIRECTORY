<template>
  <section class="page-builder">
    <template v-for="(content, index) in contents" :key="index">
      <component
        :is="content.component"
        :props="content.props"
        :class="content.classes"
      >
        <template v-if="content.slot">
          <template v-if="content.slot.count">
            <template v-for="n in content.slot.count" :key="n">
              <component
                :is="content.slot.component"
                :props="content.slot.props"
                :class="content.slot.classes"
              />
            </template>
          </template>
          <template v-else>
            <template v-for="(item, slotIndex) in content.slot" :key="slotIndex">
              <component
                :is="item.component"
                :props="item.props"
                :class="item.classes"
              />
            </template>
          </template>
        </template>
      </component>
    </template>
  </section>
</template>

<script>
export default {
  props: ['contents', 'page'],
  data() {
    return {
      classes: {
        intersecting: false,
        gridClose: false,
      },
    }
  },
}
</script>

<style lang="scss">
.page-builder {
  // background-color: $CB-1;
}
</style>
