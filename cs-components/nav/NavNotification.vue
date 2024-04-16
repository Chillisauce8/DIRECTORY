<template>
  <section class="nav-notification X-Center">
    <slot />
  </section>
</template>

<script>
export default {}
</script>

<style lang="scss">
.nav-notification {

  background-color: $C2;
  color: white;
  text-transform: uppercase;
  font-weight: 600;
  font-size: 14px;
  letter-spacing: 5px;
  padding: 5px;
  text-align: center;
  padding: 0 5%;
  @include mobile{
    font-size: 11px;
    letter-spacing: 2px;
  }
}
</style>
