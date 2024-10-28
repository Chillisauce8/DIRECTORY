<template>
  <div class="nav-icon">
    <div v-if="alert" class="alert">{{ alert }}</div>
    <nuxt-link v-if="link" :to="link" class="nav-link column Center">
      <SvgIcon :svg="svg" />
      <div class="link-text">{{ title }}</div>
    </nuxt-link>
    <template v-else>
      <template v-if="phone">
        <a :href="'tel:' + phone">
          <div class="column Center">
            <SvgIcon :svg="svg" />
          </div>
          {{ phone }}
        </a>
      </template>
      <template v-else>
        <div class="column Center">
          <SvgIcon :svg="svg" />
        </div>
        <p class="link-text">{{ title }}</p>
      </template>
    </template>
  </div>
</template>

<script>
export default {
  props: ["title", "svg", "link", "alert", "phone"],
};
</script>

<style lang="scss">
.nav-icon {
  position: relative;
  border-bottom: 2px transparent solid;
  height: 100%;
  margin: 0 10px;
  @include mobile {
    margin: 0 5px;
  }
  cursor: pointer;
  text-align: center;
  & .alert {
    width: 18px;
    height: 18px;
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    right: 5px;
    background-color: $C1;
    font-size: 12px;
    color: white;
    font-weight: bold;
    border-radius: 10px;
    line-height: 1;
    //   text-align: center;
    //   line-height: 16px;
  }
  &:hover,
  .active {
    border-bottom-color: $C1;
  }
  &:hover {
    animation: hover-link 1s ease-in-out 0.25s 2 both;
  }
  & .icon {
    margin: 5px 1em;
    width: 32px;
    height: 32px;
  }
  & .link-text {
    white-space: nowrap;
    font-size: 10px;
    text-transform: uppercase;
    @include mobile {
      max-width: 100px;
      overflow: hidden;
    }
  }
}
@keyframes hover-link {
  0% {
  }

  50% {
    color: $C1;
  }

  100% {
  }
}
</style>
