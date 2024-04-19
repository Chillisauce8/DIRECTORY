<template>
  <div>
    <ul class="product-card-includes">
      <template v-for="(include, key) in includes" :key="key">
        <li>
          {{ include }}
        </li>
      </template>
    </ul>
  </div>
</template>

<script>
export default {
  props: ['title', 'includes'],
}
</script>

<style lang="scss"></style>
