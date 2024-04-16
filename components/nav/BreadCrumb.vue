<template>
  <nav class="breadcrumb">
    <nuxt-link to="/">Home</nuxt-link>
    <template v-if="eventId">
      <nuxt-link
          :to="{path: getCurrentEventLink(), query: getCleanQueryParams(true, true)}">
        My Event
      </nuxt-link>
      <nuxt-link v-if="getCurrentLocation() && !isMainEventPage()"
                 :to="{path: getCurrentLocationLink(), query: getCleanQueryParams()}">
        {{getCurrentLocation()}}
      </nuxt-link>
      <nuxt-link v-if="getCurrentCategory()"
                 :to="{path: getCurrentCategoryLink(), query: getCleanQueryParams()}">
        {{getCurrentCategory()}}
      </nuxt-link>
      <nuxt-link v-if="getProductId()"
                 :to="{path: getCurrentProductLink(), query: getCleanQueryParams(true)}">
        {{productName}}
      </nuxt-link>
    </template>
    <template v-else-if="postId">
      <nuxt-link :to="{path: getBlogsLink(), query: getCleanQueryParams()}">Blog</nuxt-link>
      <nuxt-link :to="{path: getPostLink(), query: getCleanQueryParams()}">Post</nuxt-link>
    </template>
    <template v-else-if="aboutId">
      <nuxt-link :to="{path: getAboutLink(), query: getCleanQueryParams()}">About</nuxt-link>
    </template>
    <template v-else>
      <nuxt-link
          :to="{path: getCurrentSectionLink(), query: getCleanQueryParams()}">
        {{getCurrentSectionName()}}
      </nuxt-link>
      <nuxt-link v-if="getCurrentLocation()"
                 :to="{path: getCurrentLocationLink(), query: getCleanQueryParams()}">
        {{getCurrentLocation()}}
      </nuxt-link>
      <nuxt-link v-if="getCurrentCategory()"
                 :to="{path: getCurrentCategoryLink(), query: getCleanQueryParams()}">
        {{getCurrentCategory()}}
      </nuxt-link>
      <nuxt-link v-if="getProductId()"
                 :to="{path: getCurrentProductLink(), query: getCleanQueryParams()}">
        {{productName}}
      </nuxt-link>
    </template>
  </nav>
</template>

<script>
import {useCurrentSection} from "~/services/helpers/current-section.factory";
import {useProductCache} from "~/services/helpers/product/product-cache.factory";
import {useRoutingHelper} from "~/services/helpers/routing-helper.fabric";
import {
  useCurrentProductSelectStrategy
} from "~/services/helpers/package-builder/current-product-select-strategy.factory";
import {useCurrentLocationService} from "~/services/helpers/current-location.service.factory";
import {useLocationService} from "~/services/helpers/location.service.factory";

export default {
  async setup() {
    const productCache = useProductCache();
    const routingHelper = useRoutingHelper();
    const router = useRouter();
    const currentProductSelectStrategy = useCurrentProductSelectStrategy();
    const currentLocation = useCurrentLocationService();
    const locationService = useLocationService();

    const productNameRef = ref(null);

    function getProductId() {
      if (unref(router.currentRoute).path.includes('/go-')) {
        return unref(router.currentRoute).params.id;
      }
    }

    function getProductName() {
      const productId = getProductId();

      const value = productCache.getProductById(productId);

      return value?.getName();
    }

    const productName = computed({
      get: () => {
        productNameRef.value = getProductName();
        return productNameRef.value;
      },
      set: val => {
        productNameRef.value = val;
      }
    });

    const productId = getProductId();

    if (productId) {
      await new Promise(async (resolve) => {

        const productSelectedStrategy = currentProductSelectStrategy?.get();

          if (productSelectedStrategy?.hasCurrentPackageProduct()) {
            const eventPackage = await productSelectedStrategy.getCurrentPackage();
            const packageProduct = await productSelectedStrategy.getCurrentPackageProduct();
            productName.value = packageProduct?.product?.getName();
            resolve();
          } else {
            productCache.onUpdated(() => {
                productName.value = getProductName();
                resolve();
            });
          }
      });
    }

    return {
      currentSection: useCurrentSection(),
      currentLocation,
      productCache,
      router,
      productName,
      productNameRef,
      getProductId,
      getProductName: () => getProductName,
      routingHelper,
      locationService,
    }
  },
  computed: {
    eventId() {
      return unref(this.router.currentRoute).query['eventId'];
    },

    postId() {
      if (unref(this.router.currentRoute).path.includes('/blog/post-')) {
        return unref(this.router.currentRoute).params['id'];
      }
    },

    aboutId() {
      if (unref(this.router.currentRoute).path.includes('/about-')) {
        return unref(this.router.currentRoute).params['id'];
      }
    },

    packageId() {
      return unref(this.router.currentRoute).query['packageId'];
    },

    customerId() {
      return unref(this.router.currentRoute).query['customerId'];
    }
  },
  methods: {
    isMainEventPage() {
      return unref(this.router.currentRoute).path === '/my-events';
    },

    getCurrentSection() {
      return this.currentSection.getSafe();
    },

    getCurrentLocation() {
      return unref(this.router.currentRoute).params.location ||
          this.locationService.prepareLocationNameForUrl(this.currentLocation.getLocationName());
    },

    getCurrentCategory() {
      return unref(this.router.currentRoute).params.category;
    },

    getCurrentSectionLink() {
      const sectionName = this.getCurrentSection();
      return '/' + sectionName;
    },

    getCurrentSectionName() {
      return this.getCurrentSection();
    },

    getCurrentLocationLink() {
      const locationName = this.getCurrentLocation();

      if (!locationName) {
        return null;
      }

      const eventId = unref(this.router.currentRoute).query['eventId'];
      const addPackage = unref(this.router.currentRoute).query['add-package'];

      if (eventId) {
        if (addPackage) {
          return `/my-events/add-package${this.getCurrentSectionLink()}/in-${locationName}`;
        } else {
          return `/my-events/package/add-product${this.getCurrentSectionLink()}/in-${locationName}`;
        }
      }

      return this.getCurrentSectionLink() + '/in-' + locationName;
    },

    getCurrentCategoryLink() {
      const locationName = this.getCurrentLocation();
      const categoryName = this.getCurrentCategory();

      if (!categoryName) {
        return null;
      }

      const eventId = unref(this.router.currentRoute).query['eventId'];
      const addPackage = unref(this.router.currentRoute).query['add-package'];

      if (eventId) {
        if (addPackage) {
          return `/my-events/add-package${this.getCurrentSectionLink()}/in-${locationName}/do-${categoryName}`;
        } else {
          return `/my-events/package/add-product${this.getCurrentSectionLink()}/in-${locationName}/do-${categoryName}`;
        }
      }

      if (locationName) {
        return this.getCurrentSectionLink() + '/in-' + locationName + '/do-' + categoryName;
      } else {
        return this.getCurrentSectionLink() + '/do-' + categoryName;
      }
    },

    getCurrentProductLink() {
      const locationName = this.getCurrentLocation();
      const categoryName = this.getCurrentCategory();
      const productId = this.getProductId();

      if (!productId) {
        return null;
      }

      if (unref(this.router.currentRoute).query['eventId']) {
        if (unref(this.router.currentRoute).query['add-package']) {
          return `/my-events/add-package${this.getCurrentSectionLink()}/in-${locationName}/do-${categoryName}/go-${productId}`;
        } else {
          return `/my-events/package${this.getCurrentSectionLink()}/in-${locationName}/do-${categoryName}/go-${productId}`;
        }
      }

      if (locationName) {
        return this.getCurrentSectionLink() + '/in-' + locationName + '/do-' + categoryName + '/go-' + productId;
      } else {
        return this.getCurrentSectionLink() + '/do-' + categoryName + '/go-' + productId;
      }
    },

    getBlogsLink() {
      const section = this.getCurrentSection();

      if (section && section !== 'any') {
        return `/${section}/blog`;
      }

      return '/blog';
    },

    getPostLink() {
      return this.getBlogsLink() + '/post-' + this.postId;
    },

    getAboutLink() {
      return '/about-' + this.aboutId;
    },

    getCurrentEventLink() {
      return '/my-events';
    },

    getCleanQueryParams(clearItineraryId = true, cleanQuery = false) {
      return this.routingHelper.getCurrentCleanedQueryParams(
          cleanQuery, cleanQuery, cleanQuery || clearItineraryId);
    }
  },
}
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
