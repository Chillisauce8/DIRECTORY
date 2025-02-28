<template>
  <div>
    <div class="card flex justify-center">
      <Breadcrumb :home="home" :model="breadcrumb" />
    </div>
    <div class="card">
      <h1>{{ market.name }}</h1>
      <div>{{ market.classicDescription }}</div>
    </div>
    <div class="card">
      <DataView v-if="marketList.length" :value="marketList" paginator :rows="9" layout="grid" :sortOrder="submarketSortOrder" :sortField="submarketSortField">
        <template #header>
          <div class="flex flex-column sm:flex-row sm:align-items-center sm:justify-content-between gap-3">
            <span class="text-xl text-900 font-semibold">Sub Markets</span>
            <Select v-model="submarketSortKey" :options="submarketSortOptions" optionLabel="label" placeholder="Sort By" class="w-full md:w-15rem" @change="onSortChange($event)" />
          </div>
        </template>
        <template #grid="slotProps">
          <layout-grid>
            <ModelCard v-for="(item, index) in slotProps.items"
                       :key="index"
                       :name="item.name"
                       :make="item.make"
                       :years="item.years"
                       :images="item.images"
                       @click="navigateToSubmarket(item)"/>
          </layout-grid>
        </template>
      </DataView>
      <!--
      <DataView v-if="listingList.length" :value="listingList" paginator :rows="7" layout="grid" :sortOrder="listingSortOrder" :sortField="listingSortField">
        <template #header>
          <div class="flex flex-column sm:flex-row sm:align-items-center sm:justify-content-between gap-3">
            <span class="text-xl text-900 font-semibold">Listings</span>
            <Select v-model="listingSortKey" :options="listingSortOptions" optionLabel="label" placeholder="Sort By" class="w-full md:w-15rem" @change="onSortChange($event)" />
          </div>
        </template>
        <template #grid="slotProps">
          <layout-grid>
            <ListingCard
              v-for="(item, index) in slotProps.items"
              :key="index"
              :name="item.content.name"
              :make="item.spec.make"
              :images="item.content.imageURLs"
              :saleType="item.sale.saleType"
              :price="item.sale.price"
              :engine="item.spec.engine"
              :odometer="item.spec.odometer"
              :transmission="item.spec.transmission"
              :stearingSide="item.spec.stearingSide"
              :grid-id="gridId"
            />
          </layout-grid>
        </template>
      </DataView>
    -->
      <ListingGrid :listings="listingList" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {type Market, useMarketsService} from '~/service/cars/markets.service';
import type {PartialListingNode} from '~/service/cars/listings.service';
import {useListingsService}from '~/service/cars/listings.service';


const marketsService = useMarketsService();
const router = useRouter();
const route = useRoute();
const listingsService = useListingsService();


const submarketSortOrder = ref(1);
const submarketSortOptions = [
  { label: 'Name', value: 'name' },
  { label: 'Year', value: i => i.years?.[0] ?? null },
];


const listingSortOrder = ref(1);
const listingSortOptions = [
  { label: 'Name', value: 'content.name' },
];


const market = ref<Market>({} as any);
const breadcrumb = ref<any[]>([]);
const marketList = ref<Market[]>([]);
const listingList = ref<PartialListingNode[]>([]);
const submarketSortField = ref(submarketSortOptions?.[0]?.value ?? null);
const submarketSortKey = ref(submarketSortOptions?.[0]);
const listingSortField  = ref(listingSortOptions[0]?.value ?? null);
const listingSortKey  = ref(listingSortOptions[0]);

const home = ref({
  icon: 'pi pi-home',
  url: '/market'
});

const gridId = 'listingGrid';

function navigateToSubmarket(submarket: Market): void {
  const url = '/market/' + submarket.path.map(i => i.slug).join('/');

  router.push({path: url, force: true});
}


async function init() {
  const slugParts = router.currentRoute.value?.params?.slug;

  if (!slugParts) {
    return;
  }

  market.value = await marketsService.getMarketBySlugToken(slugParts);

  const breadcrumbParts = market.value.path
    .map((p, index, path) => {
      const label = p.name;

      const url = '/market/' + path.slice(0, index + 1).map(i => i.slug).join('/');

      return {label, url};
    });

  const marketSlugList = market.value.path.map(i => i.slug);

  breadcrumb.value = breadcrumbParts;
  marketList.value = await marketsService.getSubMarketList(market.value._id);
  listingList.value = await listingsService.getListingListForMarket(marketSlugList);
}

function onSortChange(event) {
  const value = event.value.value;
  const sortValue = event.value;

  if (typeof value === 'function') {
    submarketSortOrder.value = 1;
    submarketSortField.value = value;
    submarketSortKey.value = sortValue;
  } else if (value.indexOf('!') === 0) {
    submarketSortOrder.value = 1;
    submarketSortField.value = value.substring(1, value.length);
    submarketSortKey.value = sortValue;
  } else {
    submarketSortOrder.value = -1;
    submarketSortField.value = value;
    submarketSortKey.value = sortValue;
  }
}

init();
watch(() => route.params.slug, () => init());
</script>
