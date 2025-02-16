<template>
  <div class="search-container">
    <DataItem 
      function="read"
      collection="markets"
      :find="{}"
      :fields="{
        '_id': 1,
        'name': 1,
        'url': 1
      }"
      v-slot="{ items, loading }">
      <AutoComplete
        v-model="selected"
        :suggestions="suggestions"
        @complete="search"
        @item-select="onSelect"
        :loading="loading"
        placeholder="Search markets..."
        class="w-full"
        optionLabel="fullName"
      >
        <template #item="slotProps">
          <div class="search-item">
            <span>{{ slotProps.item.fullName }}</span>
          </div>
        </template>
      </AutoComplete>
      <template v-if="processItems(items)" />
    </DataItem>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

interface Market {
  fullName: string
  url: string
}

const router = useRouter()
const selected = ref<Market | null>(null)
const suggestions = ref<Market[]>([])
const markets = ref<Market[]>([]) // Initialize with empty array

function processItems(items: any[] | undefined) {
  if (!items?.length) return false
  console.log('Raw item example:', JSON.stringify(items[0], null, 2)) // Debug full item structure
  
  try {
    markets.value = items.map(item => {
      // Assuming the field is actually called 'name' instead of 'fullName'
      return {
        fullName: item.name || 'Unknown Market',  // Changed from item.fullName to item.name
        url: item.url || ''
      }
    }).filter(item => item.url) // Only filter on URL presence
    
    console.log('First processed market:', markets.value[0])
  } catch (error) {
    console.error('Error processing items:', error)
    markets.value = []
  }
  return false
}

function search(event: { query: string }) {
  console.log('Search triggered with:', event.query) // Debug search query
  console.log('Available markets:', markets.value.length) // Debug available markets
  
  if (!markets.value?.length || !event.query) {
    suggestions.value = []
    return
  }

  const query = event.query.toLowerCase().trim()
  suggestions.value = markets.value.filter(market => {
    const match = market.fullName.toLowerCase().includes(query)
    console.log(`Checking "${market.fullName}" against "${query}": ${match}`) // Debug matching
    return match
  })

  console.log('Found suggestions:', suggestions.value.length) // Debug results count
}

function onSelect(event: { value: Market }) {
  router.push(`/market/${event.value.url}`)
}

function clearSearch() {
  selected.value = null
  suggestions.value = []
}
</script>

<style lang="scss">
.search-container {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  .data-item {
    width: 400px;
    .p-autocomplete input {
      width: 100%;
    }
  }


.search-item {
  padding: 0.5rem;
}
}
</style>
