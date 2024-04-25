<template>
  <TopBarWrapper>
    <div class="top-bar Row Evenly">
      <div class="Row Y-Center">
        <NavIcon title="Locations" svg="map-pin" />
        <NavIcon
          class="activities-nav-button"
          title="Activities"
          svg="activity"
        />
      </div>

      <div class="Column Center">
        <div class="Y-Center">
          <nuxt-link aria-label="home" to="/">
            <TheLogo :width="260" class="show-600" />
            <TheMark :width="45" class="hide-600" />
          </nuxt-link>
        </div>
      </div>

      <div class="Row Y-Center">
        <NavIcon title="Login" svg="person" /> <UToggle v-model="selected" />
      </div>
    </div>
  </TopBarWrapper>
</template>

<script setup lang="ts">
const selected = ref(false);
</script>

<style lang="scss">
.top-bar {
  width: 100%;
}
</style>
