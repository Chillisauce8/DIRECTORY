<template>
  <nav class="side-nav open">
    <div class="side-nav-slider">
      <SideNavButton icon="submarine">Garage</SideNavButton>
      <SideNavButton icon="compass">History Files</SideNavButton>
      <SideNavButton icon="beer">Tasks</SideNavButton>
      <SideNavButton icon="squid">Messages</SideNavButton>
      <SideNavButton icon="email">Profile</SideNavButton>
    </div>
  </nav>
</template>

<script>
export default {};
</script>

<style lang="scss">
.side-nav {
  background-color: var(--bg-color-3);
  .side-nav-slider {
    position: sticky;
    top: 64px;
  }
  &.open {
    width: 300px;
  }
  .toggle-color {
    color: var(--text-main-color);
  }
}
</style>
