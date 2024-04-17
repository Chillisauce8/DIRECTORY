<template>
  <nav class="breadcrumb">
    <nuxt-link to="/">Home</nuxt-link>
    <nuxt-link to="/">Home</nuxt-link>
    <nuxt-link to="/">Home</nuxt-link>
    <nuxt-link to="/">Home</nuxt-link>
    </nav>
</template>
<script>
</script>
<style lang="scss">
.breadcrumb {
  .router-link-exact-active {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }
  font-size: 10px;
  padding: 10px 10px 10px 5%;
  font-weight: 400;
  font-family: $ff2;
  text-transform: uppercase;
  letter-spacing: 2px;
  & a {
    transition: all ease-in-out 0.5s;
    &:hover {
      color: $C1;
    }
    &:not(:last-child):after {
      content: ' > ';
    }
  }
}
</style>
