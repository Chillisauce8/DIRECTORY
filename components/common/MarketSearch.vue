<template>
  <div class="search-container">
    <DataItem 
      function="read"
      collection="markets"
      :find="{}"
      :fields="{
        '_id': 1,
        'fullName': 1,
        'url': 1
      }"
      v-slot="{ items, loading }">
      <div class="search-wrapper">
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
              <span v-if="highlightResults" v-html="highlightMatch(slotProps.item.fullName, searchQuery)"></span>
              <span v-else>{{ slotProps.item.fullName }}</span>
            </div>
          </template>
        </AutoComplete>
        <i v-if="selected" class="pi pi-times" @click="clearSearch" />
        <i v-else class="pi pi-search" />
      </div>
      <template v-if="processItems(items)" />
    </DataItem>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, toRaw } from 'vue'
import { useRouter } from 'vue-router'

interface Market {
  fullName: string
  url: string
}

interface Props {
  highlightResults?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  highlightResults: false // CURRENTLY DOESNT WORK
})

const router = useRouter()
const selected = ref<Market | null>(null)
const suggestions = ref<Market[]>([])
const markets = ref<Market[]>([]) // Initialize with empty array
const event = ref<{ query: string } | null>(null) // Add query ref to store current search term
const currentQuery = ref(''); // Add currentQuery ref to store the actual search term
const searchQuery = ref(''); // Add searchQuery ref to store the actual search term for highlighting

// Cache the normalized market names to avoid recomputing
const normalizedMarketNames = ref(new Map<string, string>());

// Optimize processItems to do normalization once
function processItems(items: any[] | undefined) {
  if (!items?.length) return false
  
  try {
    // Clear the cache when processing new items
    normalizedMarketNames.value.clear();
    
    markets.value = items.reduce((acc: Market[], item) => {
      if (item.url) {
        const fullName = item.fullName || 'Unknown Market';
        // Cache the normalized name
        normalizedMarketNames.value.set(fullName, normalizeString(fullName));
        acc.push({ fullName, url: item.url });
      }
      return acc;
    }, []);
  } catch (error) {
    console.error('Error processing items:', error);
    markets.value = [];
    normalizedMarketNames.value.clear();
  }
  return false;
}

// Add helper function for string normalization
function normalizeString(str: string): string {
  return str.toLowerCase().replace(/-/g, ' ').trim();
}

// Optimize getSearchScore to use cached normalized names
function getSearchScore(fullName: string, normalizedQuery: string): number {
  const normalizedName = normalizedMarketNames.value.get(fullName) || normalizeString(fullName);
  
  if (normalizedName.startsWith(normalizedQuery)) return 3;
  
  // Cache word splits for performance
  const words = normalizedName.split(' ');
  if (words.some(word => word.startsWith(normalizedQuery))) return 2;
  
  if (normalizedName.includes(normalizedQuery)) return 1;
  
  return 0;
}

// Update highlight function to handle word boundaries
function highlightMatch(text: string, query: string): string {
  if (!query) return text;
  
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape regex special characters
  const regex = new RegExp(`(${escapedQuery})`, 'gi');
  return text.replace(regex, '<strong>$1</strong>');
}

// Optimize search function
function search(ev: { query: string }) {
  if (!markets.value?.length || !ev.query) {
    suggestions.value = [];
    return;
  }

  const normalizedQuery = normalizeString(ev.query);
  
  // Use array filter + sort instead of map + filter + sort
  suggestions.value = markets.value
    .filter(market => getSearchScore(market.fullName, normalizedQuery) > 0)
    .sort((a, b) => 
      getSearchScore(b.fullName, normalizedQuery) - 
      getSearchScore(a.fullName, normalizedQuery)
    );
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
    strong {
      font-weight: 700;
      color: var(--primary-color);
    }
  }

  .search-wrapper {
    position: relative;
    width: 100%;

    .p-autocomplete {
      width: 100%;
      
      input {
        width: 100%;
        padding-right: 2rem; // Make room for the icon
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
        color: var(--text-color); // Darker on hover
      }
    }
  }
}
</style>
