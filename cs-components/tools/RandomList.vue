<template>
  <ul>
    <template v-for="item in items" :key="item">
      <li>
        <RandomText :min="3" :max="7" inline="true" />
      </li>
    </template>
  </ul>
</template>

<script>
export default {
  props: ["min", "max"],
  computed: {
    items: function () {
      let number = Math.floor(Math.random() * (this.max - this.min + 1)) + this.min;
      let items = [...Array(number)];
      return items;
    },
  },
};
</script>

<style lang="scss"></style>
