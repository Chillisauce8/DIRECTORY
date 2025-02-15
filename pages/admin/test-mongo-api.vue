<template>
  <div class="card">
    <h1>MongoDB API Test</h1>
    <div class="version-tag">Test Version: 1.1</div>
    
    <div class="description-container">
      <h3>About this tool:</h3>
      <p>This diagnostic tool analyzes how MongoDB commands are handled by the API layer. It helps identify:</p>
      <ul class="tool-features">
        <li><strong>Command Handling:</strong> How different MongoDB commands are translated and executed</li>
        <li><strong>Response Processing:</strong> How API responses are structured and transformed</li>
        <li><strong>Performance Metrics:</strong> Execution time for different query types</li>
      </ul>

      <div class="usage-section">
        <h4>How to use:</h4>
        <ol>
          <li>Click "Run API Tests" to execute all test queries</li>
          <li>Review results in the table below</li>
          <li>Use "View Query" to see detailed MongoDB commands</li>
          <li>Use "Copy Results" to share diagnostics</li>
        </ol>
      </div>

      <div class="test-types">
        <h4>Test Categories:</h4>
        <ul>
          <li><strong>Document Count:</strong> Tests basic collection counting methods</li>
          <li><strong>Collection Stats:</strong> Retrieves database statistics and metadata</li>
          <li><strong>Sample Document:</strong> Tests document retrieval and field projection</li>
          <li><strong>URL Analysis:</strong> Analyzes URL field distribution using aggregation</li>
        </ul>
      </div>

      <div class="response-validation">
        <h4>Response Validation:</h4>
        <div class="validation-types">
          <div class="validation-category">
            <h5>Command Responses</h5>
            <ul>
              <li>
                <strong>Expected:</strong> 
                <code>{ "ok": 1, ...commandSpecificData }</code>
                <p>Commands should return metadata with "ok" status</p>
              </li>
              <li>
                <strong>Unexpected:</strong>
                <code>[{ ...documents }]</code>
                <p>Commands should not return document arrays</p>
              </li>
            </ul>
          </div>
          
          <div class="validation-category">
            <h5>Aggregation Responses</h5>
            <ul>
              <li>
                <strong>Expected:</strong>
                <code>[{ "total": 100 }]</code>
                <p>Should return transformed data structure</p>
              </li>
              <li>
                <strong>Unexpected:</strong>
                <code>[{ "_id": "...", "url": "..." }]</code>
                <p>Should not return raw documents</p>
              </li>
            </ul>
          </div>
          
          <div class="validation-category">
            <h5>Query Responses</h5>
            <ul>
              <li>
                <strong>Expected:</strong>
                <code>[{ ...requestedFields }]</code>
                <p>Should only include requested fields</p>
              </li>
              <li>
                <strong>Unexpected:</strong>
                <code>[{ ...allDocumentFields }]</code>
                <p>Should not return unrequested fields</p>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div class="warning-note">
        <i class="pi pi-info-circle"></i>
        <span>Results help identify API transformation issues and optimize query patterns.</span>
      </div>
    </div>

    <div class="test-controls">
      <Button 
        label="Run API Tests" 
        @click="runTests"
        severity="info"
        :loading="isRunning"
      />
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
        <Column field="name" header="Test Name" sortable />
        <Column field="status" header="Status" sortable>
          <template #body="slotProps">
            <Tag :value="slotProps.data.status" 
                 :severity="getStatusSeverity(slotProps.data)" />
          </template>
        </Column>
        <Column field="resultSummary.issues" header="Problem" sortable>
          <template #body="slotProps">
            <div v-if="slotProps.data.resultSummary?.issues?.length" class="problem-summary">
              {{ slotProps.data.resultSummary.issues[0] }}
              <span v-if="slotProps.data.resultSummary.issues.length > 1">
                (+{{ slotProps.data.resultSummary.issues.length - 1 }} more)
              </span>
            </div>
            <div v-else class="no-issues">No issues found</div>
          </template>
        </Column>
        <Column field="responseTime" header="Response Time (ms)" sortable />
        <Column field="resultSummary" header="Result Summary">
          <template #body="slotProps">
            <div v-if="slotProps.data.resultSummary">
              <div>Items: {{ slotProps.data.resultSummary.itemCount }}</div>
              <div>Type: {{ slotProps.data.resultSummary.responseType }}</div>
            </div>
          </template>
        </Column>
        <template #expansion="slotProps">
          <div class="p-3">
            <h4>Request:</h4>
            <pre>{{ JSON.stringify(slotProps.data.request, null, 2) }}</pre>
            <TabView>
              <TabPanel header="Response Analysis">
                <div class="response-analysis">
                  <div class="analysis-section expected-response">
                    <h5>Expected Response:</h5>
                    <div class="expected-type">Type: {{ slotProps.data.request.expectedType }}</div>
                    <div class="expected-format">
                      Format:
                      <pre>{{ JSON.stringify(slotProps.data.request.expectedFormat, null, 2) }}</pre>
                    </div>
                  </div>

                  <div class="analysis-section actual-response">
                    <h5>Actual Response:</h5>
                    <div class="actual-type">Type: {{ slotProps.data.resultSummary.responseType }}</div>
                    <div class="actual-data">
                      Sample:
                      <pre>{{ JSON.stringify(slotProps.data.resultSummary.sample, null, 2) }}</pre>
                    </div>
                  </div>

                  <div v-if="slotProps.data.resultSummary.issues.length" class="analysis-section issues">
                    <h5>Issues Found:</h5>
                    <ul>
                      <li v-for="issue in slotProps.data.resultSummary.issues" 
                          :key="issue" 
                          class="issue-item">
                        {{ issue }}
                      </li>
                    </ul>
                  </div>
                </div>
              </TabPanel>
              <TabPanel header="Raw Response">
                <pre>{{ JSON.stringify(slotProps.data.rawResponse, null, 2) }}</pre>
              </TabPanel>
            </TabView>
          </div>
        </template>
      </DataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { httpService } from '~/service/http/http.service'
import { useToast } from 'primevue/usetoast'

const isRunning = ref(false)
const results = ref([])
const expandedRows = ref([])
const toast = useToast()

const testQueries = [
  {
    name: 'Basic Command Response',
    expectedType: 'command',
    expectedFormat: {
      ok: 1
    },
    request: {
      collection: 'admin',
      h: { 
        $command: { 
          ping: 1
        }
      }
    }
  },
  {
    name: 'Command with Return Value',
    expectedType: 'command',
    expectedFormat: {
      ok: 1,
      n: 'number'
    },
    request: {
      collection: 'markets',
      h: { 
        $command: { 
          count: 'markets'
        }
      }
    }
  },
  {
    name: 'Array Response Format',
    expectedType: 'array',
    expectedFormat: [{
      _id: 'string',
      name: 'string'
    }],
    request: {
      collection: 'markets',
      h: {
        $fields: { _id: 1, name: 1 },
        $limit: 1
      }
    }
  },
  {
    name: 'Aggregation Pipeline Format',
    expectedType: 'array',
    expectedFormat: [{
      _id: 'string',
      total: 'number'
    }],
    request: {
      collection: 'markets',
      h: {
        $aggregate: [
          { 
            $group: { 
              _id: '$_type',
              total: { $sum: 1 } 
            }
          }
        ]
      }
    }
  },
  {
    name: 'Admin Command Format',
    expectedType: 'command',
    expectedFormat: {
      ok: 1,
      databases: 'array'
    },
    request: {
      collection: 'admin',
      h: {
        $command: {
          listDatabases: 1
        }
      }
    }
  }
]

const getStatusSeverity = (result: any) => {
  if (result.error) return 'danger'
  return result.resultSummary?.passed ? 'success' : 'warning'
}

const getResponseType = (response: any): string => {
  // Check for command response format
  if (response?.ok === 1 && typeof response === 'object') {
    return 'command'
  }

  // Check for array response
  if (Array.isArray(response)) {
    return 'array'
  }

  // Check for cursor response
  if (response?.cursor && response?.cursor.firstBatch) {
    return 'cursor'
  }

  // Check for plain object
  if (typeof response === 'object' && response !== null) {
    return 'object'
  }

  return 'unknown'
}

const getCommandSummary = (response: any) => {
  const summary: any = {}
  
  // Extract common command response fields
  if ('n' in response) summary.count = response.n
  if ('count' in response) summary.count = response.count
  if ('ns' in response) summary.namespace = response.ns
  if ('nMatched' in response) summary.matched = response.nMatched
  if ('nModified' in response) summary.modified = response.nModified
  
  return summary
}

const analyzeResponse = (response: any, test: any) => {
  const summary = {
    itemCount: 0,
    responseType: 'Unknown',
    sample: null,
    notes: [],
    issues: [],
    passed: false
  }

  try {
    const actualType = getResponseType(response)
    summary.responseType = actualType

    // Validate response type
    if (actualType !== test.expectedType) {
      summary.issues.push(`❌ Wrong response type: got ${actualType}, expected ${test.expectedType}`)
      summary.notes.push(`MongoDB ${test.request.h.$command ? 'commands' : 'aggregations'} should return ${test.expectedType} responses`)
      return summary
    }

    // Command response validation
    if (test.expectedType === 'command') {
      if (!response?.ok) {
        summary.issues.push('❌ Missing ok:1 status')
      }
      
      Object.entries(test.expectedFormat).forEach(([key, expectedType]) => {
        if (!(key in response)) {
          summary.issues.push(`❌ Missing field: ${key}`)
        } else {
          const actualType = typeof response[key]
          const expectedTypeStr = expectedType.toString()
          if (actualType !== expectedTypeStr) {
            summary.issues.push(`❌ Field ${key} should be ${expectedTypeStr}, got ${actualType}`)
          }
        }
      })
      
      summary.sample = {
        ok: response.ok,
        ...getCommandSummary(response)
      }
      summary.itemCount = response.n || 0
    }

    // Array response validation
    if (test.expectedType === 'array') {
      if (test.expectedLength && response.length !== test.expectedLength) {
        summary.issues.push(`❌ Expected ${test.expectedLength} items, got ${response.length}`)
      }
      
      if (response.length > 0 && test.expectedFormat) {
        const expectedFields = Object.keys(test.expectedFormat[0])
        const actualFields = Object.keys(response[0])
        const missingFields = expectedFields.filter(f => !actualFields.includes(f))
        if (missingFields.length > 0) {
          summary.issues.push(`❌ Missing fields: ${missingFields.join(', ')}`)
        }
      }
      
      summary.sample = response.slice(0, 1)
      summary.itemCount = response.length
    }

    // Set pass/fail status
    summary.passed = summary.issues.length === 0

    // Add explanation notes
    if (summary.passed) {
      summary.notes.push('✓ Response matches expected format')
    } else {
      summary.notes.push('⚠️ Response format mismatch - API is not handling MongoDB commands correctly')
    }

  } catch (error) {
    summary.issues.push(`Analysis error: ${error.message}`)
  }

  return summary
}

const validateArrayFormat = (item: any, format: any, summary: any) => {
  Object.entries(format).forEach(([key, type]) => {
    if (!(key in item)) {
      summary.issues.push(`❌ Array items missing field: ${key}`)
    } else if (type === Number && typeof item[key] !== 'number') {
      summary.issues.push(`❌ Field ${key} should be a number`)
    }
  })
}

// Update formatResultsForCopy to include issues
const formatResultsForCopy = () => {
  return `MongoDB API Tests (v1.1)
Test Time: ${new Date().toISOString()}
Environment: ${window.location.hostname}
===========================================
${results.value.map(result => `
Test: ${result.name}
Status: ${result.status}
Time: ${result.responseTime}ms
Command: ${JSON.stringify(result.request.h)}
Response Type: ${result.resultSummary.responseType}
${result.resultSummary.issues.length ? `Issues:\n${result.resultSummary.issues.map(i => `- ${i}`).join('\n')}` : 'No Issues Found'}
Notes:
${result.resultSummary.notes.map(n => `- ${n}`).join('\n')}
-------------------`).join('\n')}`
}

const copyResults = async () => {
  try {
    await navigator.clipboard.writeText(formatResultsForCopy())
    toast.add({ severity: 'success', summary: 'Success', detail: 'Results copied to clipboard', life: 3000 })
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to copy results', life: 3000 })
  }
}

const runTests = async () => {
  isRunning.value = true
  results.value = []
  
  try {
    for (const test of testQueries) {
      const startTime = performance.now()
      try {
        const response = await httpService.get('/api/query', test.request)
        const endTime = performance.now()
        
        const summary = analyzeResponse(response.data, test)
        
        results.value.push({
          name: test.name,
          request: test.request,
          rawResponse: response.data,
          status: summary.passed ? 'Success' : 'Warning',
          responseTime: Math.round(endTime - startTime),
          resultSummary: summary
        })
      } catch (error) {
        results.value.push({
          name: test.name,
          request: test.request,
          rawResponse: error,
          status: 'Error',
          responseTime: 0,
          resultSummary: { error: error.message }
        })
      }
    }
  } finally {
    isRunning.value = false
  }
}
</script>

<style scoped lang="scss">
.test-result {
  margin: 1rem 0;
  padding: 1rem;
  background: var(--surface-50);
  border-radius: 6px;
  
  .details {
    h5 {
      color: var(--primary-color);
      margin: 1rem 0 0.5rem;
    }
    
    pre {
      background: var(--surface-100);
      padding: 0.5rem;
      border-radius: 4px;
      font-size: 0.9em;
    }
  }
}

.response-summary {
  .summary-item {
    margin-bottom: 1rem;
    
    label {
      font-weight: 600;
      color: var(--text-color-secondary);
      display: block;
      margin-bottom: 0.5rem;
    }
    
    pre {
      background: var(--surface-100);
      padding: 0.5rem;
      border-radius: 4px;
      margin: 0;
    }

    .notes {
      margin-top: 0.5rem;
      font-style: italic;
      color: var(--text-color-secondary);
      
      ul {
        list-style: none;
        padding: 0;
        margin: 0;
        
        li {
          margin: 0.25rem 0;
          padding: 0.25rem 0;
          border-bottom: 1px solid var(--surface-200);
          
          &:last-child {
            border-bottom: none;
          }
        }
      }
    }

    &.issues {
      color: var(--red-600);
      background: var(--red-50);
      padding: 0.5rem;
      border-radius: 4px;
      
      li {
        border-color: var(--red-100);
      }
    }
  }
}

:deep(.p-tabview-panels) {
  max-height: 500px;
  overflow: auto;
}

// Add styles for performance warnings
.warning {
  color: var(--yellow-700);
  background: var(--yellow-50);
  border-left: 3px solid var(--yellow-500);
  padding: 0.5rem;
  margin: 0.5rem 0;
}

.results-container {
  .command-result {
    color: var(--primary-color);
    font-family: monospace;
  }
}

.response-structure {
  font-family: monospace;
  color: var(--primary-600);
  background: var(--surface-0);
  padding: 0.5rem;
  border-left: 3px solid var(--primary-500);
  margin: 0.5rem 0;
}

.description-container {
  .tool-features {
    margin: 1rem 0;
    padding-left: 1.5rem;
    
    li {
      margin: 0.5rem 0;
      line-height: 1.4;
    }
  }

  .usage-section, .test-types {
    margin: 1.5rem 0;
    
    h4 {
      color: var(--primary-color);
      margin-bottom: 0.5rem;
    }
    
    ol, ul {
      margin: 0.5rem 0;
      padding-left: 1.5rem;
      
      li {
        margin: 0.5rem 0;
        line-height: 1.4;
      }
    }
  }

  .warning-note {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 1rem;
    padding: 0.75rem;
    background: var(--yellow-50);
    border-radius: 4px;
    
    i {
      color: var(--yellow-600);
    }
    
    span {
      color: var(--yellow-900);
      font-size: 0.9em;
    }
  }
}

.response-validation {
  margin: 1.5rem 0;
  padding: 1rem;
  background: var(--surface-50);
  border-radius: 6px;

  h4 {
    color: var(--primary-color);
    margin-bottom: 1rem;
  }

  .validation-types {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
    
    .validation-category {
      h5 {
        color: var(--primary-900);
        margin: 0 0 0.75rem 0;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid var(--surface-200);
      }
      
      ul {
        list-style: none;
        padding: 0;
        margin: 0;
        
        li {
          margin-bottom: 1rem;
          
          strong {
            display: block;
            margin-bottom: 0.25rem;
          }
          
          code {
            display: block;
            background: var(--surface-0);
            padding: 0.5rem;
            margin: 0.25rem 0;
            border-radius: 4px;
            font-family: monospace;
            font-size: 0.9em;
          }
          
          p {
            margin: 0.25rem 0 0 0;
            font-size: 0.9em;
            color: var(--text-color-secondary);
          }
        }
      }
    }
  }
}

.problem-summary {
  font-size: 0.9em;
  color: var(--red-700);
  
  span {
    color: var(--text-color-secondary);
    font-size: 0.8em;
    margin-left: 0.5rem;
  }
}

.no-issues {
  color: var(--green-600);
  font-size: 0.9em;
}

.response-analysis {
  .analysis-section {
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: var(--surface-50);
    border-radius: 6px;
    
    h5 {
      margin: 0 0 1rem 0;
      color: var(--primary-900);
      border-bottom: 1px solid var(--surface-200);
      padding-bottom: 0.5rem;
    }
    
    pre {
      background: var(--surface-100);
      padding: 0.5rem;
      border-radius: 4px;
      margin: 0.5rem 0;
    }
    
    &.issues {
      background: var(--red-50);
      
      .issue-item {
        color: var(--red-700);
        margin: 0.5rem 0;
        padding-left: 1.5rem;
        position: relative;
        
        &:before {
          content: "❌";
          position: absolute;
          left: 0;
        }
      }
    }
  }

  .expected-response {
    border-left: 3px solid var(--primary-500);
  }

  .actual-response {
    border-left: 3px solid var(--orange-500);
  }
}
</style>
