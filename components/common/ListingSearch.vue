<template>
  <div class="search-container">
    <DataItem 
      function="read"
      collection="markets"
      :find="{}"
      :fields="{
        'fullName': 1,
        'path.slug': 1,
      }"
      v-slot="{ items }">
      <div class="search-wrapper">
        <AutoComplete
          v-model="selectedMarket"
          :suggestions="filteredMarkets"
          @complete="searchMarkets"
          @item-select="onSelect"
          placeholder="Search markets..."
          class="w-full"
          :delay="300"
          optionLabel="fullName"
        >
          <template #item="slotProps">
            <div class="search-item">
              <span>{{ slotProps.item.fullName }}</span>
            </div>
          </template>
        </AutoComplete>
        <i v-if="selectedMarket" class="pi pi-times" @click="clearSearch" />
        <i v-else class="pi pi-search" />
      </div>

      <div style="display: none">
        {{ processMarkets(items) }}
      </div>
    </DataItem>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const selectedMarket = ref()
const allMarkets = ref([])
const filteredMarkets = ref([])

// Process markets when data is loaded
const processMarkets = (items: any[]) => {
  if (!items) return
  
  allMarkets.value = items.map(market => ({
    fullName: market.fullName,
    urlPath: market.path.map((p: any) => p.slug).join('/')
  }))
}

// Search function
const searchMarkets = (event: { query: string }) => {
  const query = event.query.toLowerCase().replace(/-/g, ' ')
  filteredMarkets.value = allMarkets.value
    .filter(market => 
      market.fullName.toLowerCase().replace(/-/g, ' ').includes(query)
    )
    .sort((a, b) => 
      a.fullName.toLowerCase().localeCompare(b.fullName.toLowerCase())
    )
}

// Handle selection
const onSelect = (event: { value: any }) => {
  const selected = event.value
  if (selected && selected.urlPath) {
    router.push(`/market/${selected.urlPath}`)
  }
}

// Clear search
const clearSearch = () => {
  selectedMarket.value = null
  filteredMarkets.value = []
}
</script>

<style scoped lang="scss">
.search-container {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
}

.search-wrapper {
  position: relative;
  
  :deep(.p-autocomplete) {
    width: 100%;
    
    input {
      width: 100%;
      padding-right: 2rem;
    }
  }
  
  i {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    right: 0.75rem;
    color: var(--text-color-secondary);
    cursor: pointer;
    
    &.pi-times:hover {
      color: var(--text-color-primary);
    }
  }
}

.search-item {
  padding: 0.5rem;
  
  &:hover {
    background-color: var(--surface-100);
  }
}
</style>
