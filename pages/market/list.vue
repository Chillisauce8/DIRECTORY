<script setup lang="ts">
import {type Market, useMarketsService} from '~/service/cars/markets.service';

const marketsService = useMarketsService();

const marketList = await marketsService.getTopLevelMarketList();

const alphabeticGroupedMarketMap = marketList
  .sort((a, b) => {
    const aName = a.name.toLowerCase();
    const bName = b.name.toLowerCase();

    if ( aName < bName ){
      return -1;
    } else if ( aName > bName ){
      return 1;
    }

    return 0;
  })
  .reduce((res, item) => {
    const suitableKeyRegex = /[a-z]/;
    const firstLetterOfTheName = item.name[0].toLowerCase();
    const letter = suitableKeyRegex.test(firstLetterOfTheName) ?
        item.name[0].toLowerCase() : item.metadata.slugToken[0].toLowerCase();

    if (!res?.[letter]) {
      res[letter] = [];
    }

    const group = res?.[letter];

    group.push(item);

    return res;
  }, {} as Record<string, Partial<Market>[]>);

const groupedMarketList = Object.entries(alphabeticGroupedMarketMap)
  .map(([header, marketList]) => ({header: header.toUpperCase(), marketList}))
    .sort((a, b) => {
      const aName = a.header.toLowerCase();
      const bName = b.header.toLowerCase();

      if ( aName < bName ){
        return -1;
      } else if ( aName > bName ){
        return 1;
      }

      return 0;
    });
</script>

<template>
  <div class="card">
    <h1>Markets</h1>
  </div>
  <div class="card">
    <DataView :value="groupedMarketList" layout="grid">
      <template #header>
        <div class="flex flex-column sm:flex-row sm:align-items-center sm:justify-content-between gap-3">
          <span class="text-xl text-900 font-semibold">Available Markets</span>
        </div>
      </template>
      <template #grid="slotProps">
        <layout-grid>
          <template v-for="group in slotProps.items">
            <MarketListCard :header="group.header" :market-list="group.marketList"></MarketListCard>
          </template>
        </layout-grid>
      </template>
    </DataView>
  </div>
</template>

<style scoped lang="scss">
.layout-grid > * {
  flex: 1;
}
</style>
