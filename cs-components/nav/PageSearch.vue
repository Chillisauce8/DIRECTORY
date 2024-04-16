<template>
  <client-only>
    <CardsContainer
      id="search"
      display="grid"
      closeButton="true"
      class="page-search Dark"
      :class="{ closed: !searchOpen, open: searchOpen }"
      @closeClicked="$emit('update:searchOpen', false)"
    >
      <template #above-cards>
        <div class="search-container">
          <div class="search-field-wrapper">
            <input
              type="text"
              name="fname"
              placeholder="Search"
              class="search-field"
              @input="onSearchStringUpdate"
            />
          </div>
        </div>
        <div class="items-number">
          <span class="number">{{ filteredPageCardList?.length ?? 0 }}</span>
          Matching Items
        </div>
      </template>

      <template v-if="searchOpen">
        <template v-for="card in pageCardList">
          <template v-if="card.type === 'product'">
            <ProductCard
              class="card"
              display="card"
              :product="card.content.productList[0]"
              :product-data="card.content.productGridModel"
              :section="getCurrentSection()"
              :link="getProductPath(card.content.productList[0])"
              :search-terms="getCardSearchTerms(card)"
              :search-hide="getCardSearchHide(card)"
              @quickAddButtonClick="onQuickAddButtonClick(card.content, $event)"
            >
            </ProductCard>
          </template>

          <template v-if="card.type === 'post'">
            <PostCard
              :link="getPostLink(card.content)"
              :imageId="card?.content?.feature?.image?.[0]?.image?.id"
              :title="card?.content?.feature?.title"
              :search-terms="getCardSearchTerms(card)"
              :search-hide="getCardSearchHide(card)"
            >
            </PostCard>
          </template>

          <template v-if="card.type === 'location'">
            <LocationCard
              class="card"
              :country="card.content?.country?.name ? card.content.country.name : card.content.country"
              :name="card.content.name"
              :url="card.content.url"
              :images="card.content.imageList"
              :section="getCurrentSection()"
              :search-terms="getCardSearchTerms(card)"
              :search-hide="getCardSearchHide(card)"
            >
            </LocationCard>
          </template>

          <template v-if="card.type === 'category'">
            <CategoryCard
              class="card"
              :name="card.content.name"
              :url="card.content.url"
              :images="card.content.imageList"
              :section="getCurrentSection()"
              :search-terms="getCardSearchTerms(card)"
              :search-hide="getCardSearchHide(card)"
            >
            </CategoryCard>
          </template>
        </template>
      </template>
    </CardsContainer>
  </client-only>
</template>

<script lang="ts">
import type { Product } from "~/services/models/product";
import type { PropType } from "vue";
import { useProductUrlGetterService } from "~/services/helpers/product-url-getter.service.factory";
import { useCurrentSection } from "~/services/helpers/current-section.factory";
import { useCurrentUser } from "~/services/helpers/user-common/current-user.factory";
import type { IProductGroup } from "~/services/helpers/product/product-groups-helper.service";
import { useQuickAddProductService } from "~/services/helpers/package-builder/quick-add-product.factory";

interface PageSearchProductCardContent extends IProductGroup<Product> {
  //
}

interface PageSearchPostCardContent {
  _doc: string;
  title: string;
  feature: {
    title: string;
    text: string;
    image: {
      image: { id: string };
      section: string;
    }[];
  };
  categories: 1;
}

interface PageSearchLocationCardContent {
  country: string | {name: string};
  name: string;
  url: string;
  imageList: any[];
}

interface PageSearchCategoryCardContent {
  name: string;
  url: string;
  imageList: any[];
}

interface PageSearchCardInfo<
  Type extends "product" | "post" | "category" | "location",
  Content extends unknown
> {
  type: Type;
  content: Content;
}

type PageSearchProductCard = PageSearchCardInfo<
  "product",
  PageSearchProductCardContent
>;
type PageSearchProductPost = PageSearchCardInfo<
  "post",
  PageSearchPostCardContent
>;
type PageSearchProductLocation = PageSearchCardInfo<
  "location",
  PageSearchLocationCardContent
>;
type PageSearchProductCategory = PageSearchCardInfo<
  "category",
  PageSearchCategoryCardContent
>;

type PageSearchCard =
  | PageSearchProductCard
  | PageSearchProductPost
  | PageSearchProductLocation
  | PageSearchProductCategory;

export default {
  props: {
    searchOpen: Boolean,
    pageCardList: Object as PropType<PageSearchCard[]>,
  },
  emits: ["update:searchOpen"],
  setup() {
    return {
      currentUser: useCurrentUser(),
      currentSection: useCurrentSection(),
      productUrlGetterService: useProductUrlGetterService(),
      quickAddProductService: useQuickAddProductService(),
    };
  },
  data() {
    return {
      searchString: "",
      filteredPageCardList: this?.pageCardList ?? [],
    };
  },
  methods: {
    getCurrentSection() {
      return this.currentSection.get();
    },
    getProductPath(product: Product) {
      return this.productUrlGetterService.getProductPath(product);
    },
    getPostLink(post: PageSearchPostCardContent) {
      return `/${this.getCurrentSection()}/post-${post._doc}`;
    },
    onSearchStringUpdate(event: InputEvent): void {
      this.searchString = (event.target as HTMLInputElement).value;

      this.filteredPageCardList = this.getFilteredCards();
    },
    getFilteredCards() {
      if (!this.searchString) {
        return this.pageCardList;
      }

      return this.pageCardList.filter((c) => {
        const searchTerms = this.getCardSearchTerms(c);

        return (
          searchTerms
            .toLowerCase()
            .indexOf(this.searchString.trim().toLowerCase()) !== -1
        );
      });
    },
    getCardSearchTerms(card: PageSearchCard) {
      if (card.type === "product") {
        return this.getProductSearchTerms(card.content.productList[0]);
      } else if (card.type === "post") {
        return card?.content?.feature?.title;
      } else if (card.type === "location") {
        return card?.content?.name;
      } else if (card.type === "category") {
        return card?.content?.name;
      }

      return null;
    },
    getCardSearchHide(card: PageSearchCard): boolean {
      return this.filteredPageCardList.indexOf(card) === -1;
    },
    getProductSearchTerms(product: Product): string {
      if (!product) {
        return null;
      }

      const searchTermsParts = [product.getName()];

      if (this.currentUser.isStaffOrHiddenStaff()) {
        const supplierName = product?.getSupplier()?.name ?? "";
        const venueNameList =
          product?.getVenues().map((v) => v.getMainVenue()?.getName() ?? "") ??
          [];

        searchTermsParts.push(supplierName, venueNameList.join(" "));
      }

      return searchTermsParts.filter((i) => !!i).join(" ");
    },
    onQuickAddButtonClick(group: IProductGroup<Product>, event: MouseEvent) {
      event.preventDefault();
      event.stopPropagation();


      this.quickAddProductService.add(group?.productList?.[0]);
    },
  },
};
</script>

<style lang="scss">
.page-search {
  transition: all 1s ease-in-out;
  &.open {
    height: unset;
    overflow: visible;
  }
  &.closed {
    height: 0px;
    overflow: hidden;
  }
  .items-number {
    text-align: center;
    font-weight: 600;
    font-family: $ff2;
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 5px;
    color: $CB-1;
  }

  .search-container {
    //color:white;
    font-size: 32px;
    display: flex;
    flex-direction: row;
    justify-content: center;

    .search-field-wrapper {

      margin: 50px 0;
      position: relative;
      width: clamp(300px, 50%, 500px);
      @include mobile {
        margin: 24px 0;
      }
      @include desktop {
        margin: 50px 0;
      }
      .search-field {
        @include mobile {
          height: 40px;
          font-size: 20px;
        }

        @include desktop {
          height: 60px;
          font-size: 32px;
        }

        color: $CB-1;

        width: 100%;

        display: flex;
        align-items: center;
        border-radius: 3px;
        border: 1px solid white;
        padding: 0.25em 1em;
        @include frosted-glass-dark();
        transition: all 1s ease-in-out;
        &:hover {
          @include frosted-glass-darker();
        }
      }
      .search-icon {
        color: white;
        display: none;
        position: absolute;
        right: 0;
        top: 0;
        width: 50px;
        height: 50px;
      }
    }
  }
}
</style>
