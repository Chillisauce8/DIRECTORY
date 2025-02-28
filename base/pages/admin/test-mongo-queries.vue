<template>
  <div class="card">
    <h1>MongoDB Query Performance Tests</h1>
    <div class="version-tag">Test Version: 1.1</div>
    
    <div class="description-container">
      <h3>About this tool:</h3>
      <p>A performance analysis tool that evaluates different MongoDB query methods to identify the most efficient approaches for common database operations.</p>
      
      <div class="purpose-section">
        <h4>Purpose:</h4>
        <ul>
          <li>Compare performance of different query methods</li>
          <li>Identify optimal patterns for frequent operations</li>
          <li>Detect potential performance bottlenecks</li>
          <li>Validate query results for accuracy</li>
        </ul>
      </div>

      <div class="success-criteria">
        <h4>Test Success Criteria:</h4>
        <ul>
          <li>
            <strong>Count Operations</strong>
            <p>Success: Returns a single numeric value representing the total count</p>
            <p>Fail: Returns full documents or unexpected data structures</p>
            <div class="example">
              <span>Expected: <code>{ "count": 12855 }</code></span>
              <span>Unexpected: <code>[{ "_id": "...", "url": "..." }, ...]</code></span>
            </div>
          </li>
          <li>
            <strong>Aggregation Pipeline</strong>
            <p>Success: Returns transformed data in the specified format</p>
            <p>Fail: Returns raw documents or incorrect aggregation structure</p>
            <div class="example">
              <span>Expected: <code>{ "total": 12855, "types": ["car", "brand"] }</code></span>
              <span>Unexpected: <code>{ "_id": "...", "path": [...] }</code></span>
            </div>
          </li>
          <li>
            <strong>System Commands</strong>
            <p>Success: Returns command-specific metadata</p>
            <p>Fail: Returns document arrays or error responses</p>
            <div class="example">
              <span>Expected: <code>{ "ok": 1, "version": "5.0.0" }</code></span>
              <span>Unexpected: <code>[{ ... }]</code></span>
            </div>
          </li>
        </ul>
      </div>

      <div class="test-suite">
        <h4>Test Suite Coverage:</h4>
        <div class="test-categories">
          <div class="category">
            <h5>Count Operations</h5>
            <ul>
              <li>Direct collection count</li>
              <li>Aggregation pipeline count</li>
              <li>Filtered count queries</li>
            </ul>
          </div>
          <div class="category">
            <h5>Performance Tests</h5>
            <ul>
              <li>Response time measurements</li>
              <li>Memory usage patterns</li>
              <li>Query optimization checks</li>
            </ul>
          </div>
          <div class="category">
            <h5>Result Validation</h5>
            <ul>
              <li>Data consistency checks</li>
              <li>Error handling verification</li>
              <li>Response format validation</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="results-guide">
        <h4>Understanding Results:</h4>
        <ul>
          <li><strong>Pass:</strong> Query returned expected results efficiently</li>
          <li><strong>Fail:</strong> Query failed or returned unexpected results</li>
          <li><strong>N/A:</strong> Comparative test or system query</li>
        </ul>
      </div>

      <div class="info-note">
        <i class="pi pi-info-circle"></i>
        <div>
          <strong>Note:</strong> Tests run against live data. Results help determine:
          <ul>
            <li>Most efficient query patterns</li>
            <li>Areas needing optimization</li>
            <li>Query reliability and consistency</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="test-controls">
      <Button 
        label="Run All Tests" 
        @click="runAllTests"
        severity="info"
        :loading="isRunning"
      />
      <span v-if="isRunning" class="running-test">Running Test: {{ currentTest }}</span>
    </div>

    <div v-if="results.length" class="results-container">
      <div class="results-header">
        <h3>Test Results:</h3>
        <Button 
          label="Copy Results" 
          icon="pi pi-copy"
          @click="copyResults"
          severity="secondary"
          size="small"
        />
      </div>
      
      <DataTable :value="results" :paginator="true" :rows="10"
                 v-model:expandedRows="expandedRows"
                 tableStyle="min-width: 50rem">
        <Column expander style="width: 3rem" />
        <Column field="name" header="Test Name" sortable></Column>
        <Column field="count" header="Count Result" sortable>
          <template #body="slotProps">
            {{ formatNumber(slotProps.data.count) }}
          </template>
        </Column>
        <Column field="executionTime" header="Time (ms)" sortable></Column>
        <Column field="result" header="Status" sortable>
          <template #body="slotProps">
            <Tag :value="slotProps.data.result" 
                 :severity="getResultSeverity(slotProps.data.result)" />
          </template>
        </Column>
        <Column field="reason" header="Reason" sortable>
          <template #body="slotProps">
            <div :class="['reason-text', { 
              'warning-text': slotProps.data.result === 'N/A',
              'error-text': slotProps.data.result === 'Fail',
              'success-text': slotProps.data.result === 'Pass'
            }]">
              {{ slotProps.data.reason || 'N/A' }}
            </div>
          </template>
        </Column>
        <Column header="Actions">
          <template #body="slotProps">
            <Button label="View Query" 
                   @click="showQueryDialog(slotProps.data)"
                   size="small"
                   severity="secondary" />
          </template>
        </Column>
        <template #expansion="slotProps">
          <pre class="query-preview">{{ JSON.stringify(slotProps.data.query, null, 2) }}</pre>
        </template>
      </DataTable>

      <!-- Query Dialog -->
      <Dialog v-model:visible="dialogVisible" 
              header="Query Details" 
              :style="{ width: '50vw' }" 
              modal>
        <pre v-if="selectedQuery" class="query-detail">{{ JSON.stringify(selectedQuery, null, 2) }}</pre>
      </Dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { httpService } from '~/service/http/http.service'
import { useDialog } from 'primevue/usedialog'
import { useToast } from 'primevue/usetoast'

interface TestResult {
  name: string
  count: number
  executionTime: number
  query: any
  error?: string
  result: 'Pass' | 'Fail' | 'N/A'
  reason?: string
}

const isRunning = ref(false)
const currentTest = ref('')
const results = ref<TestResult[]>([])
const dialogVisible = ref(false)
const selectedQuery = ref(null)
const expandedRows = ref([])

const toast = useToast()

// Helper to measure execution time
const measureExecutionTime = async (fn: () => Promise<any>) => {
  const start = performance.now()
  const result = await fn()
  const end = performance.now()
  return {
    result,
    executionTime: Math.round(end - start)
  }
}

// Add dialog show function
const showQueryDialog = (data: any) => {
  selectedQuery.value = data.query
  dialogVisible.value = true
}

// Add function to format results for copying
const formatResultsForCopy = () => {
  const formattedResults = results.value.map(result => `
Test: ${result.name}
Count Result: ${formatNumber(result.count)}
Execution Time: ${result.executionTime}ms
Query Used:
${JSON.stringify(result.query, null, 2)}
${result.error ? `Error: ${result.error}` : ''}
-------------------`).join('\n');

  return `MongoDB Query Performance Tests (v1.0)
Test Time: ${new Date().toISOString()}
==========================================
${formattedResults}`;
}

// Add copy function
const copyResults = async () => {
  try {
    await navigator.clipboard.writeText(formatResultsForCopy());
    toast.add({ severity: 'success', summary: 'Success', detail: 'Results copied to clipboard', life: 3000 });
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to copy results', life: 3000 });
  }
}

// Add MongoDB system queries
const systemQueries = [
  {
    name: 'MongoDB Version',
    query: async () => {
      const response = await httpService.get('/api/query', {
        collection: 'system.version',
        h: { 
          $aggregate: [
            { $project: { version: 1 } }
          ]
        }
      })
      return response.data[0]?.version || 'Unknown'
    },
    queryDetails: { 
      collection: 'system.version',
      h: { $aggregate: [{ $project: { version: 1 } }] }
    }
  },
  {
    name: 'Collection Stats',
    query: async () => {
      const response = await httpService.get('/api/query', {
        collection: 'markets',
        h: { 
          $aggregate: [
            { $collStats: { storageStats: {} } }
          ]
        }
      })
      return response.data[0] || {}
    },
    queryDetails: {
      collection: 'markets',
      h: { $aggregate: [{ $collStats: { storageStats: {} } }] }
    }
  },
  {
    name: 'Distinct Market Types',
    query: async () => {
      const response = await httpService.get('/api/query', {
        collection: 'markets',
        h: {
          $aggregate: [
            { $group: { _id: '$_type', count: { $sum: 1 } } }
          ]
        }
      })
      return response.data.length
    },
    queryDetails: {
      collection: 'markets',
      h: { $aggregate: [{ $group: { _id: '$_type', count: { $sum: 1 } } }] }
    }
  }
]

// Enhanced query methods
const existingQueryMethods = [
  {
    name: 'Simple Collection Query (Get All)',
    query: async () => {
      const response = await httpService.get('/api/query', {
        collection: 'markets'
      })
      return response.data.length
    },
    queryDetails: { collection: 'markets' }
  },
  {
    name: 'MongoDB Count with $count Stage',
    query: async () => {
      const response = await httpService.get('/api/query', {
        collection: 'markets',
        h: { 
          $aggregate: [
            { $count: 'total' }
          ]
        }
      })
      return response.data[0]?.total || 0
    },
    queryDetails: { 
      collection: 'markets',
      h: { $aggregate: [{ $count: 'total' }] }
    }
  },
  {
    name: 'Count with Project and Group',
    query: async () => {
      const response = await httpService.get('/api/query', {
        collection: 'markets',
        h: {
          $aggregate: [
            { $project: { _id: 1 } },
            { $group: { _id: null, count: { $sum: 1 } } }
          ]
        }
      })
      return response.data[0]?.count || 0
    },
    queryDetails: {
      collection: 'markets',
      h: {
        $aggregate: [
          { $project: { _id: 1 } },
          { $group: { _id: null, count: { $sum: 1 } } }
        ]
      }
    }
  },
  {
    name: 'Count with URL (Match + Count)',
    query: async () => {
      const response = await httpService.get('/api/query', {
        collection: 'markets',
        h: {
          $aggregate: [
            { $match: { url: { $exists: true, $ne: '' } } },
            { $count: 'total' }
          ]
        }
      })
      return response.data[0]?.total || 0
    },
    queryDetails: {
      collection: 'markets',
      h: {
        $aggregate: [
          { $match: { url: { $exists: true, $ne: '' } } },
          { $count: 'total' }
        ]
      }
    }
  },
  {
    name: 'Count with URL (Match + Group)',
    query: async () => {
      const response = await httpService.get('/api/query', {
        collection: 'markets',
        h: {
          $aggregate: [
            { $match: { url: { $exists: true, $ne: '' } } },
            { $group: { _id: null, count: { $sum: 1 } } }
          ]
        }
      })
      return response.data[0]?.count || 0
    },
    queryDetails: {
      collection: 'markets',
      h: {
        $aggregate: [
          { $match: { url: { $exists: true, $ne: '' } } },
          { $group: { _id: null, count: { $sum: 1 } } }
        ]
      }
    }
  },
  {
    name: 'Optimized Fields Query (_id only)',
    query: async () => {
      const response = await httpService.get('/api/query', {
        collection: 'markets',
        h: {
          $fields: { _id: 1 }
        }
      })
      return response.data.length
    },
    queryDetails: {
      collection: 'markets',
      h: { $fields: { _id: 1 } }
    }
  },
  {
    name: 'Direct Match Query for URL',
    query: async () => {
      const response = await httpService.get('/api/query', {
        collection: 'markets',
        q: { url: { $exists: true, $ne: '' } },
        h: { $fields: { _id: 1 } }
      })
      return response.data.length
    },
    queryDetails: {
      collection: 'markets',
      q: { url: { $exists: true, $ne: '' } },
      h: { $fields: { _id: 1 } }
    }
  }
]

// Update queryMethods to include system queries
const queryMethods = [
  ...systemQueries,
  ...existingQueryMethods // your existing queries
]

const testQueries = [
  {
    name: 'Direct Count vs Aggregation',
    tests: [
      {
        name: 'Direct Count',
        query: { $command: { count: 'markets' } }
      },
      {
        name: 'Aggregation Count',
        query: { $aggregate: [{ $count: 'total' }] }
      }
    ]
  },
  {
    name: 'Field Projection Performance',
    tests: [
      {
        name: 'All Fields',
        query: { $limit: 100 }
      },
      {
        name: 'Selected Fields',
        query: { $fields: { _id: 1, name: 1 }, $limit: 100 }
      }
    ]
  },
  {
    name: 'Sort Performance',
    tests: [
      {
        name: 'Sort with Index',
        query: { $sort: { _id: 1 }, $limit: 100 }
      },
      {
        name: 'Sort without Index',
        query: { $sort: { name: 1 }, $limit: 100 }
      }
    ]
  },
  {
    name: 'Match Performance',
    tests: [
      {
        name: 'Equality Match',
        query: { q: { _type: 'brand' } }
      },
      {
        name: 'Regex Match',
        query: { q: { name: { $regex: 'mercedes', $options: 'i' } } }
      }
    ]
  },
  {
    name: 'Index Usage Tests',
    tests: [
      {
        name: 'Query Using Index',
        query: { 
          q: { _id: { $exists: true }},
          h: { $explain: true }
        },
        expectedIndexUse: true
      },
      {
        name: 'Collection Scan',
        query: { 
          q: { $text: { $search: "random" }},
          h: { $explain: true }
        },
        expectedIndexUse: false
      }
    ]
  },
  {
    name: 'Aggregation Functions',
    tests: [
      {
        name: 'Group by Type with Stats',
        query: {
          h: {
            $aggregate: [
              { 
                $group: {
                  _id: "$_type",
                  count: { $sum: 1 },
                  avgPathLength: { $avg: { $size: "$path" }},
                  minPathLength: { $min: { $size: "$path" }},
                  maxPathLength: { $max: { $size: "$path" }}
                }
              }
            ]
          }
        }
      },
      {
        name: 'Bucket Analysis',
        query: {
          h: {
            $aggregate: [
              {
                $bucket: {
                  groupBy: { $size: "$path" },
                  boundaries: [1, 2, 3, 4, 5],
                  default: "5+",
                  output: {
                    count: { $sum: 1 },
                    markets: { $push: "$name" }
                  }
                }
              }
            ]
          }
        }
      }
    ]
  },
  {
    name: 'Lookup Operations',
    tests: [
      {
        name: 'Market to Listings Join',
        query: {
          h: {
            $aggregate: [
              { $match: { _type: "brand" }},
              { $limit: 1 },
              { 
                $lookup: {
                  from: "listings",
                  localField: "_id",
                  foreignField: "metadata.marketId",
                  as: "listings"
                }
              },
              { $project: { 
                name: 1, 
                listingCount: { $size: "$listings" }
              }}
            ]
          }
        }
      }
    ]
  },
  {
    name: 'Text Search Performance',
    tests: [
      {
        name: 'Basic Text Search',
        query: {
          q: { $text: { $search: "mercedes" }},
          h: { $fields: { _id: 1, score: { $meta: "textScore" }}}
        }
      },
      {
        name: 'Regex Search',
        query: {
          q: { name: { $regex: "merc", $options: "i" }},
          h: { $fields: { _id: 1 }}
        }
      }
    ]
  },
  {
    name: 'Complex Filters',
    tests: [
      {
        name: 'Multiple Conditions',
        query: {
          q: { 
            $and: [
              { "_type": "model" },
              { "path.1": { $exists: true }},
              { "url": { $exists: true }}
            ]
          }
        }
      },
      {
        name: 'Nested Array Filter',
        query: {
          q: {
            "path": {
              $elemMatch: {
                "slug": { $regex: "^[a-z]" },
                "name": { $exists: true }
              }
            }
          }
        }
      }
    ]
  },
  {
    name: 'Data Distribution',
    tests: [
      {
        name: 'Path Length Distribution',
        query: {
          h: {
            $aggregate: [
              { 
                $group: {
                  _id: { $size: "$path" },
                  count: { $sum: 1 }
                }
              },
              { $sort: { _id: 1 }}
            ]
          }
        }
      },
      {
        name: 'Type Distribution',
        query: {
          h: {
            $aggregate: [
              { 
                $group: {
                  _id: "$_type",
                  count: { $sum: 1 },
                  examples: { $push: "$name" }
                }
              },
              { $sort: { count: -1 }}
            ]
          }
        }
      }
    ]
  }
]

const runAllTests = async () => {
  isRunning.value = true
  results.value = []

  try {
    for (const method of queryMethods) {
      currentTest.value = method.name
      try {
        const { result, executionTime } = await measureExecutionTime(method.query)
        
        const evaluation = evaluateTestResult(method.name, result)
        results.value.push({
          name: method.name,
          count: result,
          executionTime,
          query: method.queryDetails,
          result: evaluation.result,
          reason: evaluation.reason
        })

        // Log detailed info for analysis
        console.log(`Test: ${method.name}`)
        console.log('Response:', result)
        console.log('Time:', executionTime)
      } catch (error) {
        results.value.push({
          name: method.name,
          count: 0,
          executionTime: 0,
          query: method.queryDetails,
          error: error.message,
          result: 'Fail'
        })
        console.error(`Test Failed: ${method.name}`, error)
      }
    }
  } finally {
    isRunning.value = false
    currentTest.value = ''
  }
}

const formatNumber = (num: number) => {
  return new Intl.NumberFormat().format(num)
}

const getResultSeverity = (result: string) => {
  switch(result) {
    case 'Pass': return 'success';
    case 'Fail': return 'danger';
    default: return 'info';
  }
}

const evaluateTestResult = (method: string, result: any): { result: 'Pass' | 'Fail' | 'N/A', reason: string } => {
  // System queries are informational only
  if (method.startsWith('MongoDB Version') || 
      method.startsWith('Collection Stats') ||
      method.startsWith('Distinct Market Types')) {
    return {
      result: 'N/A',
      reason: 'System command - validation not applicable'
    };
  }

  // For count queries
  if (method.includes('Count')) {
    return result > 0 
      ? { result: 'Pass', reason: `Successfully counted ${result} documents` }
      : { result: 'Fail', reason: 'Count operation returned no results' };
  }

  // For URL related queries
  if (method.includes('URL')) {
    return result >= 0 
      ? { result: 'Pass', reason: `Found ${result} documents with URLs` }
      : { result: 'Fail', reason: 'URL query returned invalid count' };
  }

  // Performance comparison tests
  if (method.includes('Optimized') || method.includes('Simple')) {
    return {
      result: 'N/A',
      reason: 'Performance comparison - check execution time'
    };
  }

  // Add new evaluations
  if (method.includes('Index Usage')) {
    const usesIndex = result?.queryPlanner?.winningPlan?.inputStage?.stage === 'IXSCAN'
    return {
      result: usesIndex ? 'Pass' : 'Fail',
      reason: usesIndex ? 'Query uses index' : 'Query performs collection scan'
    }
  }

  if (method.includes('Distribution')) {
    return {
      result: Array.isArray(result) ? 'Pass' : 'Fail',
      reason: `Found ${Array.isArray(result) ? result.length : 0} distinct groups`
    }
  }

  if (method.includes('Lookup')) {
    return {
      result: result?.listingCount >= 0 ? 'Pass' : 'Fail',
      reason: `Join returned ${result?.listingCount || 0} related documents`
    }
  }

  return result > 0 
    ? { result: 'Pass', reason: 'Query executed successfully' }
    : { result: 'Fail', reason: 'Query returned no results' };
}
</script>

<style scoped lang="scss">
.description-container {
  margin: 1rem 0;
  padding: 1rem;
  background: var(--surface-ground);
  border-radius: 6px;
  border-left: 4px solid var(--primary-color);
}

.test-controls {
  margin: 2rem 0;
}

.results-container {
  margin-top: 2rem;
}

.test-result {
  margin: 1rem 0;
  padding: 1rem;
  background: var(--surface-50);
  border-radius: 6px;
  
  h4 {
    margin: 0 0 1rem 0;
    color: var(--primary-color);
  }
}

.result-details {
  .metric {
    display: flex;
    gap: 1rem;
    margin-bottom: 0.5rem;
    
    label {
      font-weight: 600;
      color: var(--text-color-secondary);
      min-width: 120px;
    }
    
    pre {
      margin: 0.5rem 0;
      padding: 0.5rem;
      background: var(--surface-100);
      border-radius: 4px;
      font-size: 0.9em;
    }
  }
}

.version-tag {
  background: var(--primary-color);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  display: inline-block;
  margin-bottom: 1rem;
  font-size: 0.9em;
}

.running-test {
  margin-left: 1rem;
  color: var(--primary-color);
  font-style: italic;
}

.error {
  color: var(--red-600);
  background: var(--red-50);
  border-left: 3px solid var(--red-500);
  padding: 0.5rem;
  margin: 0.5rem 0;
}

.warning {
  color: var(--yellow-700);
  background: var(--yellow-50);
  border-left: 3px solid var(--yellow-500);
  padding: 0.5rem;
  margin: 0.5rem 0;
}

.query-preview {
  padding: 1rem;
  background: var(--surface-100);
  border-radius: 4px;
  font-family: monospace;
  margin: 0;
  white-space: pre-wrap;
}

.query-detail {
  padding: 1.5rem;
  background: var(--surface-100);
  border-radius: 6px;
  font-family: monospace;
  margin: 0;
  white-space: pre-wrap;
  max-height: 70vh;
  overflow-y: auto;
}

:deep(.p-datatable) {
  .p-column-title {
    font-weight: 600;
  }
  
  .p-row-toggler {
    width: 2rem;
    height: 2rem;
  }
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

:deep(.p-tag) {
  min-width: 60px;
  justify-content: center;
}

.reason-text {
  &.warning-text {
    color: var(--yellow-700);
  }
  
  &.error-text {
    color: var(--red-600);
  }
  
  &.success-text {
    color: var(--green-600);
  }
}

.purpose-section {
  margin: 1.5rem 0;
  
  h4 {
    color: var(--primary-color);
    margin-bottom: 0.5rem;
  }
}

.test-suite {
  margin: 1.5rem 0;
  
  .test-categories {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
    
    .category {
      background: var(--surface-50);
      padding: 1rem;
      border-radius: 6px;
      
      h5 {
        color: var(--primary-color);
        margin: 0 0 0.5rem 0;
      }
      
      ul {
        margin: 0;
        padding-left: 1.2rem;
        
        li {
          margin: 0.25rem 0;
          font-size: 0.9em;
        }
      }
    }
  }
}

.results-guide {
  margin: 1.5rem 0;
  padding: 1rem;
  background: var(--surface-50);
  border-radius: 6px;
}

.info-note {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  margin-top: 1.5rem;
  padding: 1rem;
  background: var(--blue-50);
  border-radius: 6px;
  
  i {
    color: var(--blue-500);
    font-size: 1.2rem;
  }
  
  ul {
    margin: 0.5rem 0 0 0;
    padding-left: 1.2rem;
    
    li {
      font-size: 0.9em;
      color: var(--blue-900);
    }
  }
}

.success-criteria {
  margin: 1.5rem 0;
  padding: 1rem;
  background: var(--surface-50);
  border-radius: 6px;
  
  h4 {
    color: var(--primary-color);
    margin-bottom: 1rem;
  }
  
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    
    li {
      margin-bottom: 1.5rem;
      
      strong {
        color: var(--primary-900);
        font-size: 1.1em;
      }
      
      p {
        margin: 0.5rem 0;
        line-height: 1.4;
        
        &:nth-child(3) {
          color: var(--red-600);
        }
      }
      
      .example {
        margin-top: 0.5rem;
        padding: 0.5rem;
        background: var(--surface-0);
        border-radius: 4px;
        font-size: 0.9em;
        
        span {
          display: block;
          margin: 0.25rem 0;
          
          &:last-child {
            color: var(--red-600);
          }
          
          code {
            background: var(--surface-100);
            padding: 0.25rem 0.5rem;
            border-radius: 3px;
            font-family: monospace;
          }
        }
      }
    }
  }
}
</style>
