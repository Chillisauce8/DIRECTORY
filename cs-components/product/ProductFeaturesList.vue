<template>
  <DelayHydration>
    <section-wrapper
      :id="id"
      v-if="!noWrapper"
      class="features-list W1"
      title="Features">
      <ProductFutureListInternal :product="product" :isVenueOnTop="isVenueOnTop">
      </ProductFutureListInternal>
    </section-wrapper>
    <div v-else class="features-list">
      <ProductFutureListInternal :product="product" :isVenueOnTop="isVenueOnTop">
      </ProductFutureListInternal>
    </div>
  </DelayHydration>
</template>

<script>
import { useCsLodash } from "~/services/cs-lodash.factory";
import { useEventPermissionsService } from "~/services/helpers/event/event-permissions.service.factory";

export default {
  props: ['id', 'product', 'noWrapper', 'isVenueOnTop'],
  setup() {
    return {
      csLodash: useCsLodash(),
      eventPermissionsService: useEventPermissionsService(),
    };
  },
}
</script>

<style lang="scss"></style>
