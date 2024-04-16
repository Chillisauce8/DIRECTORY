<template>
  <the-dialog
    class="categories-dialog"
    :title="getTitle()"
    :fullscreen="true">
    <DialogMainLink class="page-location-none" :to=" '/' + this.getCurrentSection() + '/activities'">Browse Activities By Category</DialogMainLink> 
    <dialog-grid>
      <template v-for="category in categories" :key="category._doc">
        <DialogGridItem :link="getLink(category)"
                        :title="category.name"
                        :subtitle="getSubtitle(category)"
                        :src=getImageUrl(category) />
      </template>
    </dialog-grid>
  </the-dialog>
</template>

<script lang="ts">
import {useSelectMediaHelper} from "~/services/helpers/select-media-helper.factory";
import {useHttpService} from '~/services/helpers/api-common/http-service.factory';
import {useDialogData} from '~/services/dialog/core/dialog.composables';
import { useCurrentSection } from '~/services/helpers/current-section.factory';
import { useCurrentUser } from '~/services/helpers/user-common/current-user.factory';
import { useCsLodash } from '~/services/cs-lodash.factory';
import { useRoutingHelper } from '~/services/helpers/routing-helper.fabric';


export interface CategoriesDialogData {
  section: string;
  location?: string;
  title?: string;
}


export default {
  setup() {
    return {
      httpService: useHttpService(),
      dialogData: useDialogData<CategoriesDialogData>(),
      selectMediaHelper: useSelectMediaHelper(),
      currentUser: useCurrentUser(),
      currentSection: useCurrentSection(),
      csLodash: useCsLodash(),
      routingHelper: useRoutingHelper(),
      router: useRouter(),
    }
  },
  data() {
    return {
      categories: [],
    }
  },
  mounted() {
    this.fetchCategories();
  },
  methods: {
    fetchCategories() {
      let url = '/api/category/forActivities';

      if (this.currentUser.isStaffOrHiddenStaff()) {
        url += '/forStaff';
      }

      this.httpService
          .get(url, {
            section: this.currentSection.get(),
          })
          .then(response => {
            let data = response?.data;

            if (data) {
              if (this.getCurrentLocation()) {
                const locationName = this.csLodash.capitalize(this.getCurrentLocation()).replace('-', ' ');

                data = data.filter(item => {
                  return item.locations?.find(locationItem => locationItem.name === locationName);
                });
              }

              this.categories = data.sort((a, b) => {
                if (a.name > b.name) {
                  return 1;
                }

                return -1;
              });
            }
          })
          .catch(error => {
            console.log(error);
          });
    },

    getCurrentSection() {
      return this.dialogData.section || 'stag';
    },

    getCurrentLocation() {
      return this.dialogData.location;
    },

    getTitle() {
      return this.dialogData.title || 'All Categories';
    },

    getCleanQueryParams() {
      return this.routingHelper.getCurrentCleanedQueryParams(false, false);
    },

    getLink(category) {
      const originalName = category.url;

      if (!originalName) {
        return '';
      }

      const location = this.getCurrentLocation();

      const path = unref(this.router.currentRoute).path;

      if (path.startsWith('/my-events/add-package')) {
        return {
          path: `/my-events/add-package/${this.getCurrentSection()}${location ? '/in-' + location : ''}/do-` + originalName.split(' '),
          query: this.getCleanQueryParams(),
        };
      } else {
        return {
          path: `/${this.getCurrentSection()}${location ? '/in-' + location : ''}/do-` + originalName.split(' '),
          query: this.getCleanQueryParams(),
        };
      }
    },

    getSubtitle(category) {
      const categoryCategories = category.categories;

      if (!categoryCategories) {
        return '';
      }

      const section = this.currentSection.get();

      const categoryCategoriesArrayForSection = categoryCategories.filter((item) => {
        return !!(!item.section || !item.section.length || item.section.includes(section));
      });

      const result = [];

      for (const categoriesItem of categoryCategoriesArrayForSection) {
        const internalCategoriesArray = categoriesItem?.category;

        if (!internalCategoriesArray) {
          continue;
        }

        for (const internalCategory of internalCategoriesArray) {
          result.push(internalCategory.name || internalCategory.title);
        }
      }

      if (!result.length) {
        return '';
      }

      return result.join(', ');
    },

    getImage(category) {
      if (category === undefined) {
        return;
      }

      const section = this.getCurrentSection();
      const selectedImage = this.selectMediaHelper.getOneImageBySection(
        category.imageList, section);

      if (selectedImage !== undefined && selectedImage.image !== undefined) {
        return selectedImage.image;
      }
    },

    getImageUrl(category) {
      const image = this.getImage(category);

      if (!image) {
        return '';
      }

      return `https://media.chillisauce.com/image/upload/w_100,dpr_1,f_auto,c_fill,q_auto/${image.id}.jpg`;
    }
  }
}
</script>

<style lang="scss"></style>
