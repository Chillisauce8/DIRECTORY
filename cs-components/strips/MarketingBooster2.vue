<template>
  <section class="marketing-booster-2">
    <div class="W2 Column-Row">
      <div class="title">Featured On:</div>
      
        <div class="icon-list-item" v-for="logo in logos" :key="logo">
          <SvgLogo :svg="logo" class="original-color" />
        </div>

    </div>
  </section>
</template>

<script>
export default {
  data: function () {
    return {
      logos: ['wired', 'lse', 'gq', 'itv', 'bbc', 'the-times', 'daily-mail'],
    }
  },
}
</script>

<style lang="scss">

</style>
