<template>
  <div class="card flex justify-center">
    <Breadcrumb :home="home" :model="breadcrumb" />
  </div>
  <div class="card">
    <h1>{{ market.name }}</h1>
    <div>{{ market.classicDescription }}</div>
  </div>
  <div class="card">
    <DataView v-if="marketList.length" :value="marketList" paginator :rows="7" layout="grid" :sortOrder="sortOrder" :sortField="sortField">
      <template #header>
        <div class="flex flex-column sm:flex-row sm:align-items-center sm:justify-content-between gap-3">
          <span class="text-xl text-900 font-semibold">Sub Markets</span>
          <Dropdown v-model="sortKey" :options="sortOptions" optionLabel="label" placeholder="Sort By" class="w-full md:w-15rem" @change="onSortChange($event)" />
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
    <DataView :value="listings" paginator :rows="7" layout="grid" :sortOrder="sortOrder" :sortField="sortField">
      <template #header>
        <div class="flex flex-column sm:flex-row sm:align-items-center sm:justify-content-between gap-3">
          <span class="text-xl text-900 font-semibold">Listings</span>
          <Dropdown v-model="sortKey" :options="sortOptions" optionLabel="label" placeholder="Sort By" class="w-full md:w-15rem" @change="onSortChange($event)" />
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
          />
        </layout-grid>
      </template>
    </DataView>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {type Market, useMarketsService} from '~/service/cars/markets.service';


const marketsService = useMarketsService();
const router = useRouter();
const route = useRoute();


const market = ref<Market>({} as any);
const breadcrumb = ref<any[]>([]);
const marketList = ref<Market[]>([]);


const sortOrder = ref(-1);
const sortOptions = [
  { label: 'Year', value: 'year' },
  { label: 'Name', value: 'name' },
  // { label: 'Nickname', value: 'nickname' }
];

const home = ref({
  icon: 'pi pi-home',
  url: '/market/list'
});


function navigateToSubmarket(submarket: Market): void {
  const url = '/market/' + submarket.path.map(i => i.slug).join('/');

  router.push({path: url, force: true});
}


async function init() {
  const slugParts = route.params?.slug;

  market.value = await marketsService.getMarketBySlugToken(slugParts);

  const breadcrumbParts = market.value.path
      .map((p, index, path) => {
        const label = p.name;

        const url = '/market/' + path.slice(0, index + 1).map(i => i.slug).join('/');

        return {label, url};
      });

  breadcrumb.value = breadcrumbParts;
  marketList.value = await marketsService.getSubMarketList(market.value._doc);
}


onMounted(async () => init());
watch(() => route.params.slug, () => init());

const listings = ref([
  {
    _id: '66aa30548c33c087a26ecaa0',
    content: {
      name: '1960 Austin-Healey 3000 MK I',
      imageURLs: ['https://images.classic.com/vehicles/4be7889f07239079a989a179ae8960073b022efe.jpg?w=1200&h=676&fit=crop'],
      description: null,
      videoURLs: []
    },
    spec: {
      odometer: 690,
      odometerUnit: 'km',
      altOdometer: 429,
      altOdometerUnit: 'mi',
      odometerTMU: true,
      make: 'Austin-Healey',
      model: '3000',
      generation: 'Mk I',
      variant: 'BT7',
      engine: '2.9L I6',
      year: 1960,
      vin: '-',
      engineNumber: null,
      registrationNumber: null,
      transmission: 'Manual',
      stearingSide: 'Left',
      exterior: 'Yellow',
      interior: 'Black',
      bodyStyle: 'Convertible',
      doors: '2 Doors'
    },
    sale: {
      saleType: 'Auction',
      sellerType: 'Dealer',
      dealer: {
        name: 'Catawiki',
        website: 'https://www.catawiki.com'
      },
      saleStatus: 'For Sale',
      currency: null,
      price: null,
      priceType: null,
      auctionEnd: '2024-08-04',
      listingCreated: null,
      country: 'Netherlands',
      address: null,
      listingSource: 'https://www.catawiki.com/en/l/86702743-austin-healey-3000-mk1-bt7-1960',
      listingDomain: 'https://www.catawiki.com'
    },
    dataSource: {
      url: 'https://www.classic.com/veh/1960-austin-healey-3000-mk-i-nXgle14/',
      domain: 'https://www.classic.com',
      fetchTime: '2024-07-29T12:31:51Z',
      html: null
    },
    metadata: {
      slug: '1960-austin-healey-3000-mk-i-nXgle14',
      marketSlugToken: 'austin-healey@3000@mk-i@bt7-mk-i',
      marketSlugPath: ['austin-healey', '3000', 'mk-i', 'bt7-mk-i'],
      marketSlugPathReverse: ['bt7-mk-i', 'mk-i', '3000', 'austin-healey'],
      marketId: '669a4825b66b93c061797850',
      modificationHistory: ['2024-07-26']
    },
    _doc: '66aa30548c33c087a26eca9e',
    created: {
      userType: 'auto',
      isSwp: false,
      date: '2024-07-31T16:38:44+04:00',
      isTest: false,
      environment: 'development'
    },
    _type: 'listings',
    lastUpdated: {
      userType: 'auto',
      isSwp: false,
      date: '2024-07-31T16:38:44+04:00',
      isTest: false,
      environment: 'development'
    },
    _hash: -1162961929
  },
  {
    _id: '66aa313d8c33c087a26ed0e5',
    content: {
      name: '1960 Austin-Healey Bugeye Sprite',
      imageURLs: ['https://images.classic.com/vehicles/da5ecc95a0fb31523ada0a9a1de1be7ed1ae2c97.jpg?w=1200&h=676&fit=crop'],
      description: null,
      videoURLs: []
    },
    spec: {
      odometerTMU: true,
      make: 'Austin-Healey',
      model: 'Sprite',
      generation: 'Mark I',
      variant: '-',
      engine: 'Swap',
      year: 1960,
      vin: '-',
      engineNumber: null,
      registrationNumber: null,
      transmission: 'Manual',
      stearingSide: 'Left',
      exterior: 'White',
      interior: 'Gray',
      bodyStyle: 'Convertible',
      doors: '2 Doors'
    },
    sale: {
      saleType: 'Auction',
      sellerType: 'Dealer',
      dealer: {
        name: 'Hemmings',
        website: 'https://www.hemmings.com'
      },
      saleStatus: 'For Sale',
      currency: null,
      price: null,
      priceType: null,
      auctionEnd: '2024-08-02',
      listingCreated: null,
      country: 'United States',
      address: 'Asheville, North Carolina',
      listingSource: 'https://www.hemmings.com/auction/1960-austin-healey-bugeye-asheville-nc-760805',
      listingDomain: 'https://www.hemmings.com'
    },
    dataSource: {
      url: 'https://www.classic.com/veh/1960-austin-healey-bugeye-sprite-pJNEBkp/',
      domain: 'https://www.classic.com',
      fetchTime: '2024-07-29T12:28:24Z',
      html: null
    },
    metadata: {
      slug: '1960-austin-healey-bugeye-sprite-pJNEBkp',
      marketSlugToken: 'austin-healey@sprite@race-cars',
      marketSlugPath: ['austin-healey', 'sprite', 'race-cars'],
      marketSlugPathReverse: ['race-cars', 'sprite', 'austin-healey'],
      marketId: '669a481fb66b93c06179782c',
      modificationHistory: ['2024-07-28']
    },
    _doc: '66aa313d8c33c087a26ed0e3',
    created: {
      userType: 'auto',
      isSwp: false,
      date: '2024-07-31T16:42:37+04:00',
      isTest: false,
      environment: 'development'
    },
    _type: 'listings',
    lastUpdated: {
      userType: 'auto',
      isSwp: false,
      date: '2024-07-31T16:42:37+04:00',
      isTest: false,
      environment: 'development'
    },
    _hash: 1321647394
  },
  {
    _id: '66abc9ae7041acb7204a6d22',
    content: {
      name: '1965 Austin-Healey 3000 Mark III BJ8 Convertible',
      imageURLs: ['https://images.classic.com/vehicles/9917f50508a2a54db259f0a56574f639e7af768b.jpg?w=1200&h=676&fit=crop'],
      description: null,
      videoURLs: []
    },
    spec: {
      odometerTMU: true,
      make: 'Austin-Healey',
      model: '3000',
      generation: 'Mk III',
      variant: 'BJ8',
      engine: '2.9L I6',
      year: 1965,
      vin: 'HBJ8L25720',
      engineNumber: null,
      registrationNumber: null,
      transmission: '-',
      stearingSide: null,
      exterior: '-',
      interior: '-',
      bodyStyle: '-',
      doors: '-'
    },
    sale: {
      saleType: 'Classified',
      sellerType: 'Dealer',
      dealer: {
        name: 'Barrett-Jackson',
        website: 'https://www.barrett-jackson.com'
      },
      saleStatus: 'Sold',
      currency: 'BMD',
      price: 45100,
      priceType: 'Sold',
      auctionEnd: null,
      listingCreated: null,
      country: 'United States',
      address: 'Scottsdale, AZ',
      listingSource: 'https://www.barrett-jackson.com/Events/Event/Details/1965-AUSTIN-HEALEY-3000-MARK-III-BJ8-CONVERTIBLE-213487',
      listingDomain: 'https://www.barrett-jackson.com'
    },
    dataSource: {
      url: 'https://www.classic.com/veh/1965-austin-healey-3000-mark-iii-bj8-convertible-h-v4oXGan/',
      domain: 'https://www.classic.com',
      html: null
    },
    metadata: {
      slug: '1965-austin-healey-3000-mark-iii-bj8-convertible-hbj8l25720-v4oXGan',
      marketSlugToken: 'austin-healey@3000@bj8',
      marketSlugPath: ['austin-healey', '3000', 'bj8'],
      marketSlugPathReverse: ['bj8', '3000', 'austin-healey'],
      marketId: '669a4821b66b93c061797838',
      modificationHistory: []
    },
    _doc: '66abc9ae7041acb7204a6d20',
    created: {
      userType: 'auto',
      isSwp: false,
      date: '2024-08-01T21:45:18+04:00',
      isTest: false,
      environment: 'development'
    },
    _type: 'listings',
    lastUpdated: {
      userType: 'auto',
      isSwp: false,
      date: '2024-08-01T21:45:18+04:00',
      isTest: false,
      environment: 'development'
    },
    _hash: -897852706
  },
  {
    _id: '66abcb4bb89674a5a26f28c8',
    content: {
      name: '1964 Austin-Healey Sprite MK II',
      imageURLs: ['https://images.classic.com/vehicles/c59a7ae4251c4088cf0971ce7f7aa41d188f5875.jpg?w=1200&h=676&fit=crop'],
      description: null,
      videoURLs: []
    },
    spec: {
      odometerTMU: true,
      make: 'Austin-Healey',
      model: 'Sprite',
      generation: 'Mark II',
      variant: '-',
      engine: '1.1L I4 (A-Series)',
      year: 1964,
      vin: 'HAN7L38006',
      engineNumber: null,
      registrationNumber: null,
      transmission: 'Manual',
      stearingSide: null,
      exterior: 'Blue',
      interior: 'Blue',
      bodyStyle: 'Convertible',
      doors: '2 Doors'
    },
    sale: {
      saleType: 'Classified',
      sellerType: 'Dealer',
      dealer: {
        name: 'Bring a Trailer',
        website: 'https://bringatrailer.com'
      },
      saleStatus: 'Sold',
      currency: 'BMD',
      price: 8100,
      priceType: 'Sold',
      auctionEnd: null,
      listingCreated: null,
      country: 'United States',
      address: 'Topeka, KS',
      listingSource: 'https://bringatrailer.com/listing/1964-austin-healey-sprite-mk-ii/',
      listingDomain: 'https://bringatrailer.com'
    },
    dataSource: {
      url: 'https://www.classic.com/veh/1964-austin-healey-sprite-mk-ii-han7l38006-V4Mzkxn/',
      domain: 'https://www.classic.com',
      html: null
    },
    metadata: {
      slug: '1964-austin-healey-sprite-mk-ii-han7l38006-V4Mzkxn',
      marketSlugToken: 'austin-healey@sprite@mk-ii',
      marketSlugPath: ['austin-healey', 'sprite', 'mk-ii'],
      marketSlugPathReverse: ['mk-ii', 'sprite', 'austin-healey'],
      marketId: '669a481eb66b93c061797826',
      modificationHistory: []
    },
    _doc: '66abcb4bb89674a5a26f28c6',
    created: {
      userType: 'auto',
      isSwp: false,
      date: '2024-08-01T21:52:11+04:00',
      isTest: false,
      environment: 'development'
    },
    _type: 'listings',
    lastUpdated: {
      userType: 'auto',
      isSwp: false,
      date: '2024-08-01T21:52:11+04:00',
      isTest: false,
      environment: 'development'
    },
    _hash: 171559390
  },
  {
    _id: '66aca51be5767fd572ffe50c',
    content: {
      name: '1956 Austin-Healey 100 M',
      imageURLs: ['https://images.classic.com/vehicles/1009cf22011c690f8261aa70c0e61afdc67e4c6a.jpg?w=1200&h=676&fit=crop'],
      description: null,
      videoURLs: []
    },
    spec: {
      odometerTMU: true,
      make: 'Austin-Healey',
      model: '100',
      generation: 'BN2',
      variant: '100M',
      engine: '2.7L I4',
      year: 1956,
      vin: 'BN2-L/232183',
      engineNumber: null,
      registrationNumber: null,
      transmission: 'Manual',
      stearingSide: 'Left',
      exterior: 'Black',
      interior: 'Red/Burgundy',
      bodyStyle: 'Convertible',
      doors: '2 Doors'
    },
    sale: {
      saleType: 'Classified',
      sellerType: 'Dealer',
      dealer: {
        name: 'Gooding & Company',
        website: 'https://www.goodingco.com'
      },
      saleStatus: 'Sold',
      currency: 'BMD',
      price: 137500,
      priceType: 'Sold',
      auctionEnd: null,
      listingCreated: null,
      country: 'United States',
      address: 'Scottsdale, AZ',
      listingSource: 'https://www.goodingco.com/vehicle/1956-austin-healey-100-m-2/',
      listingDomain: 'https://www.goodingco.com'
    },
    dataSource: {
      url: 'https://www.classic.com/veh/1956-austin-healey-100-m-bn2l232183-v4ooeJ4/',
      domain: 'https://www.classic.com',
      html: null
    },
    metadata: {
      slug: '1956-austin-healey-100-m-bn2l232183-v4ooeJ4',
      marketSlugToken: 'austin-healey@100@bn2@100m',
      marketSlugPath: ['austin-healey', '100', 'bn2', '100m'],
      marketSlugPathReverse: ['100m', 'bn2', '100', 'austin-healey'],
      marketId: '669a4824b66b93c06179784a',
      modificationHistory: []
    },
    _doc: '66aca51be5767fd572ffe50a',
    created: {
      userType: 'auto',
      isSwp: false,
      date: '2024-08-02T09:21:31Z',
      isTest: false,
      environment: 'development'
    },
    _type: 'listings',
    lastUpdated: {
      userType: 'auto',
      isSwp: false,
      date: '2024-08-02T09:21:31Z',
      isTest: false,
      environment: 'development'
    },
    _hash: 1139702882
  }
]);

const sortField = ref(null);
const sortKey = ref(null);

const onSortChange = (event) => {
  const value = event.value.value;
  const sortValue = event.value;

  if (value.indexOf('!') === 0) {
    sortOrder.value = 1;
    sortField.value = value.substring(1, value.length);
    sortKey.value = sortValue;
  } else {
    sortOrder.value = -1;
    sortField.value = value;
    sortKey.value = sortValue;
  }
};
</script>
