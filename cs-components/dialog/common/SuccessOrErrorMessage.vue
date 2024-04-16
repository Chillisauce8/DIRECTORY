<template>
  <section class="text-align_center flex column space-between-stretch">
    <LazySvgIcon :svg="_getIconName()" class="inline" :class="[iconClass]"/>

    <div class="padding_1_0 h1">{{ header }}</div>
    <div>{{ message }}</div>

    <template v-if="buttonText">
      <button-main @click.native="onButtonClick()"
                   autofocus>{{ buttonText }}
      </button-main>
    </template>
  </section>
</template>

<script>
export default {
  name: "SuccessOrErrorMessage",
  props: ["header", "message", "iconName", "buttonText", "isSuccessMessage"],
  data() {
    return {
      iconClass: this.isSuccessMessage ? 'text-color_blue' : 'text-color_red',
      defaultSuccessIconName: 'checked-circle',
      defaultFailureIconName: 'alert-circle',
    }
  },
  methods: {
    onButtonClick() {
      this.$emit('click');
    },
    _getIconName() {
      if (this.iconName) {
        return this.iconName;
      }

      return this.isSuccessMessage ? this.defaultSuccessIconName : this.defaultFailureIconName;
    }
  }
};
</script>

<style scoped>

</style>
