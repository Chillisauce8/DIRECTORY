<!--
This is an administrative utility page that updates the 'url' field for all market documents in the database.

Purpose:
- Generates and saves a URL string for each market based on its path.slug values
- Simplifies URL generation by pre-computing the path instead of generating it on each request
- Updates existing market documents with their corresponding URL paths

How it works:
1. Fetches all markets using DataItem component
2. For each market:
   - Concatenates all path.slug values with '/' to create the URL
   - Updates the market document with the new URL field
3. Shows progress during the update process
4. Displays results of successful updates
-->

<template>
  <div class="card">
    <h1>Update Market URLs</h1>
    
    <!-- Tool Description -->
    <div class="description-container">
      <h3>About this tool:</h3>
      <p>This utility creates and updates the URL field for all markets in the database. 
      It generates URLs by combining the path.slug values into a single string, making URL generation more efficient 
      by pre-computing the paths instead of generating them on each request.</p>
      <p>Example: For a market with path slugs ['mercedes-benz', '170', 'type-170'], 
      it will create the URL 'mercedes-benz/170/type-170'</p>
    </div>

    <!-- Analysis Button -->
    <div class="analyze-section">
      <Button 
        label="Analyze Markets Data" 
        @click="analyzeMarkets"
        severity="info"
        :loading="isAnalyzing"
      />
    </div>

    <!-- Summary Statistics -->
    <div class="stats-container" v-if="stats">
      <h3>Collection Summary:</h3>
      <div class="stats-summary">
        <div class="stat-item">
          <label>Total Items in Markets Collection:</label>
          <span class="stats-total">{{ formatNumber(stats.total) }}</span>
        </div>
        <div class="stat-item">
          <label>Total Items with 'url' value:</label>
          <span class="stats-with-url">{{ formatNumber(stats.withUrl) }}</span>
        </div>
        <div class="stat-item">
          <label>Items Needing URL:</label>
          <span class="stats-needing-url">{{ formatNumber(stats.needingUrl) }}</span>
        </div>
      </div>

      <!-- Debug Output - Only show if there's an error -->
      <div v-if="debugInfo?.error" class="debug-info error">
        <h4>Error Information:</h4>
        <pre>{{ debugInfo.error }}</pre>
      </div>
    </div>

    <div class="update-status">
      <div v-if="!isProcessing">
        <div class="button-group">
          <Button 
            label="Update Missing URLs" 
            @click="() => processMarkets(true)" 
            :disabled="!stats?.needingUrl"
            severity="info"
          />
          <Button 
            label="Update All URLs" 
            @click="() => processMarkets(false)"
            :disabled="!stats?.total"
          />
        </div>
      </div>
      <div v-else>
        <ProgressBar :value="progress" />
        <p>Processing: {{ processed }}/{{ total }} ({{ progress.toFixed(1) }}%)</p>
        <Button 
          :label="isPaused ? 'Continue' : 'Pause'" 
          @click="togglePause"
          class="pause-button" 
          severity="secondary"
        />
      </div>
    </div>
    
    <!-- Show process summary only after processing -->
    <div class="summary" v-if="summary.total > 0">
      <h2>Process Summary:</h2>
      <ul>
        <li>Total Processed: {{ summary.total }}</li>
        <li>URLs Added: {{ summary.added }}</li>
        <li>URLs Updated: {{ summary.updated }}</li>
        <li>Errors: {{ summary.errors }}</li>
      </ul>
    </div>
    
    <!-- Hide detailed results by default -->
    <div v-if="showDetailedResults && results.length" class="results">
      <div class="results-header">
        <h2>Updated Markets:</h2>
        <Button 
          label="Hide Details" 
          @click="showDetailedResults = false"
          severity="secondary"
          size="small"
        />
      </div>
      <ul>
        <li v-for="result in results" :key="result._id">
          ID: {{ result._id }} - URL: {{ result.url }}
        </li>
      </ul>
    </div>
    
    <!-- Test Single Market Section -->
    <div class="test-section">
      <h3>Test Single Market</h3>
      <div class="p-inputgroup">
        <InputText v-model="testMarketId" placeholder="Enter market ID" />
        <Button 
          label="Test Update" 
          @click="testSingleMarket"
          severity="secondary"
          :loading="isTestingMarket"
        />
      </div>
      
      <!-- Test Results -->
      <div v-if="testResult" class="test-result">
        <h4>Test Results:</h4>
        <div class="result-item">
          <strong>Before:</strong>
          <pre>{{ JSON.stringify(testResult.before, null, 2) }}</pre>
        </div>
        <div class="result-item">
          <strong>After:</strong>
          <pre>{{ JSON.stringify(testResult.after, null, 2) }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ProgressBar from 'primevue/progressbar'
import { httpService } from '~/service/http/http.service'

const isProcessing = ref(false)
const isPaused = ref(false)
const processed = ref(0)
const total = ref(0)
const progress = ref(0)
const results = ref([])

// Stats and Summary
const stats = ref<{
  total: number;
  withUrl: number;
  needingUrl: number;
} | null>(null)

const summary = ref({
  total: 0,
  added: 0,
  updated: 0,
  errors: 0
})

// Add control for detailed results visibility
const showDetailedResults = ref(false)

// Add debug info ref
const debugInfo = ref<any>(null)
const isAnalyzing = ref(false)

// Add number formatter
const formatNumber = (num: number) => {
  return new Intl.NumberFormat().format(num)
}

// Remove onMounted and replace with analyze function
const analyzeMarkets = async () => {
  isAnalyzing.value = true
  debugInfo.value = null
  
  try {
    console.log('Starting market analysis...')

    // Get total count using length of response array
    const totalResponse = await httpService.get('/api/query', {
      collection: 'markets'
    })
    const totalCount = totalResponse.data.length

    // Get count of items with URLs by filtering response
    const withUrlCount = totalResponse.data.filter((item: any) => 
      item.url && item.url.length > 0
    ).length

    // Store only error information in debug
    debugInfo.value = null

    // Calculate stats
    stats.value = {
      total: totalCount,
      withUrl: withUrlCount,
      needingUrl: totalCount - withUrlCount
    }

    console.log('Final calculated stats:', stats.value)
  } catch (error) {
    console.error('Analysis failed:', error)
    debugInfo.value = {
      error: error.message
    }
  } finally {
    isAnalyzing.value = false
  }
}

// Toggle pause state
const togglePause = () => {
  isPaused.value = !isPaused.value
}

const processMarkets = async (missingOnly: boolean = false) => {
  try {
    isProcessing.value = true
    processed.value = 0
    results.value = []
    summary.value = { total: 0, added: 0, updated: 0, errors: 0 }

    // Fetch markets with required fields
    const query = {
      collection: 'markets',
      h: {
        $fields: {
          _id: 1,
          'path.slug': 1,
          'url': 1
        }
      }
    }

    // Add filter for missing URLs if needed
    if (missingOnly) {
      query.q = {
        url: { $exists: false }
      }
    }

    const response = await httpService.get('/api/query', query)
    const markets = response.data
    total.value = markets.length

    for (const market of markets) {
      // Check if paused
      while (isPaused.value && isProcessing.value) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      // Break loop if processing was stopped
      if (!isProcessing.value) break

      // Create URL from path.slug values
      const url = market.path.map((p: any) => p.slug).join('/')
      
      try {
        // Only update if URL is different
        if (market.url !== url) {
          const updatedMarket = await httpService.update('/api/update/markets', {
            _id: market._id,
            $set: { url: url }  // Using $set to only update the url field
          })
          results.value.push(updatedMarket.data)
          
          // Update summary
          summary.value.total++
          if (!market.url) {
            summary.value.added++
          } else {
            summary.value.updated++
          }
        }
      } catch (error) {
        console.error(`Failed to update market ${market._id}:`, error)
        summary.value.errors++
      }

      processed.value++
      progress.value = (processed.value / total.value) * 100
    }
    
    // Show detailed results when processing completes
    showDetailedResults.value = true
  } finally {
    isProcessing.value = false
    isPaused.value = false
  }
}

const testMarketId = ref('')
const isTestingMarket = ref(false)
const testResult = ref(null)

const testSingleMarket = async () => {
  if (!testMarketId.value) return
  
  isTestingMarket.value = true
  testResult.value = null
  
  try {
    console.log('Fetching market with ID:', testMarketId.value)
    
    // Fetch original market document with all fields
    const originalResponse = await httpService.get('/api/query', {
      collection: 'markets',
      q: { 
        _id: testMarketId.value  // Remove $oid operator
      }
    })
    
    console.log('Query response:', originalResponse)
    
    if (!originalResponse.data || originalResponse.data.length === 0) {
      throw new Error(`Market with ID ${testMarketId.value} not found`)
    }
    
    const market = originalResponse.data[0]
    
    // Store original state
    testResult.value = {
      before: market
    }
    
    // Generate new URL
    const url = market.path.map((p: any) => p.slug).join('/')
    console.log('Generated URL:', url)
    
    // Update market
    const updatedMarket = await httpService.update('/api/update/markets', {
      _id: testMarketId.value,  // Remove $oid operator
      $set: { url: url }
    })
    
    // Fetch the complete updated document
    const afterResponse = await httpService.get('/api/query', {
      collection: 'markets',
      q: { 
        _id: testMarketId.value  // Remove $oid operator
      }
    })
    
    if (!afterResponse.data || afterResponse.data.length === 0) {
      throw new Error('Failed to fetch updated market')
    }
    
    // Store updated state
    testResult.value.after = afterResponse.data[0]
    console.log('Update successful:', testResult.value)
    
  } catch (error) {
    console.error('Test failed:', error)
    testResult.value = { 
      error: error.message,
      details: error.toString()
    }
  } finally {
    isTestingMarket.value = false
  }
}
</script>

<style lang="scss">
.update-status {
  margin: 2rem 0;
}

.results {
  margin-top: 2rem;
  
  ul {
    list-style: none;
    padding: 0;
    
    li {
      margin: 0.5rem 0;
      padding: 0.5rem;
      background: var(--surface-100);
    }
  }
}

.stats-container {
  margin: 1rem 0;
  padding: 1rem;
  background: var(--surface-50);
  border-radius: 6px;
  
  ul {
    list-style: none;
    padding: 0;
  }
}

.summary {
  margin: 1rem 0;
  padding: 1rem;
  background: var(--surface-50);
  border-radius: 6px;
  
  ul {
    list-style: none;
    padding: 0;
  }
}

.pause-button {
  margin-top: 0.5rem;
}

.description-container {
  margin: 1rem 0;
  padding: 1rem;
  background: var(--surface-ground);
  border-radius: 6px;
  border-left: 4px solid var(--primary-color);
  
  h3 {
    margin-top: 0;
    color: var(--primary-color);
  }
  
  p {
    margin: 0.5rem 0;
    line-height: 1.5;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
}

.stats-summary {
  .stat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
    border-bottom: 1px solid var(--surface-200);
    
    &:last-child {
      border-bottom: none;
    }
    
    label {
      font-weight: 600;
      color: var(--text-color-secondary);
    }
    
    span {
      font-size: 1.2em;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
      
      &.stats-needing-url {
        color: var(--primary-color);
      }
    }
  }
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.analyze-section {
  margin: 1rem 0;
}

.debug-info {
  margin-top: 1rem;
  padding: 1rem;
  background: #f5f5f5;
  border-radius: 4px;
  
  pre {
    white-space: pre-wrap;
    word-wrap: break-word;
    font-family: monospace;
    font-size: 0.9em;
  }
}

.debug-info.error {
  margin-top: 1rem;
  padding: 1rem;
  background: var(--red-50);
  border-left: 4px solid var(--red-500);
  border-radius: 4px;
  
  h4 {
    color: var(--red-700);
    margin: 0 0 0.5rem 0;
  }
  
  pre {
    color: var(--red-900);
    margin: 0;
  }
}

.button-group {
  display: flex;
  gap: 1rem;
  justify-content: center;
  
  .p-button {
    min-width: 200px;
  }
}

.test-section {
  margin: 2rem 0;
  padding: 1rem;
  background: var(--surface-50);
  border-radius: 6px;
  
  .p-inputgroup {
    max-width: 500px;
    margin: 1rem 0;
  }
}

.test-result {
  margin-top: 1rem;
  
  .result-item {
    margin: 1rem 0;
    
    pre {
      background: var(--surface-100);
      padding: 1rem;
      border-radius: 4px;
      overflow-x: auto;
    }
  }
}
</style>
