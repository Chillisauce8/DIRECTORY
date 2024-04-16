<template>
  <nav class="top-nav-wrapper">
    <TopBarWrapper>
      <MainTopNav class="function-edit-package-none function-view-product-none page-preview-product-none function-new-package-none function-swap-product-none page-preview-post-none"/>
      <client-only>
        <FunctionNavBar class="function-edit-package-show-flex function-view-product-show-flex page-preview-product-show-flex function-new-package-show-flex function-swap-product-show-flex page-preview-post-show-flex"/>
        <StaffNavBar class="user-staff-show-flex page-preview-product-none page-preview-post-none"/>
      </client-only>
    </TopBarWrapper>
    <nav-notification class="user-staff-none"> The UK's Largest Events Company </nav-notification>
    <client-only>
      <ViewedCustomerNav class="user-staff-show-flex"/>
    </client-only>
    <BreadCrumb class="function-swap-product-none function-view-product-none page-preview-product-none page-preview-post-none"/>
  </nav>
</template>

<script>
export default {
  setup() {

  },
  data: () => ({
    showDrawer: false,
  }),
  computed: {
    position() {
      return this.showDrawer || "right";
    },
  },
};
</script>

<style lang="scss">
.top-nav-wrapper {
  padding-top: 64px;

}
</style>
