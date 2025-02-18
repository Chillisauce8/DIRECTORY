<template>
  <div class="card">
    <h1>Collections Manager</h1>
    
    <div class="description-container">
      <h3>About this tool:</h3>
      <p>View and manage collection definitions stored in the 'collections' collection.</p>
    </div>

    <DataItem collection="collections" function="read" :defaultView="false">
      <template #default="{ items }">
        <div class="collections-grid" v-if="items">
          <div class="actions-container">
            <span class="p-input-icon-left">
              <i class="pi pi-search" />
              <InputText v-model="searchQuery" placeholder="Search collections..." />
            </span>
            <Button v-if="selectedCollections.length > 0"
                    icon="pi pi-download"
                    label="Download Selected Types"
                    @click="downloadSelectedTypes"
                    severity="secondary"
                    text />
          </div>
          <DataTable :value="items" 
                    v-model:selection="selectedCollections"
                    :paginator="true" 
                    :rows="50"
                    dataKey="_id"
                    :rowsPerPageOptions="[10,20,50]"
                    responsiveLayout="scroll"
                    :filters="filters"
                    filterDisplay="menu"
                    :sortField="'name'"
                    :sortOrder="1">
            <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
            <Column field="_id" header="ID" sortable style="width: 20%">
              <template #body="{ data }">
                <div class="text-truncate">{{ data._id }}</div>
              </template>
            </Column>
            <Column field="name" header="Name" sortable style="width: 20%" />
            <Column field="description" header="Description" sortable style="width: 45%">
              <template #body="{ data }">
                <div class="text-wrap">{{ data.description || '-' }}</div>
              </template>
            </Column>
            <Column header="Types" style="width: 15%">
              <template #body="{ data }">
                <Button icon="pi pi-code" severity="secondary" text
                        @click="viewTypeDefinition(data)" />
              </template>
            </Column>
            <Column header="Actions" style="width: 15%">
              <template #body="{ data }">
                <Button icon="pi pi-eye" severity="info" text
                        @click="viewCollectionDetails(data)" />
              </template>
            </Column>
          </DataTable>
        </div>
      </template>
    </DataItem>

    <Dialog v-model:visible="detailsVisible" 
            :header="selectedCollection?.name || 'Collection Details'"
            :modal="true" 
            :style="{ width: '80vw' }">
      <div v-if="selectedCollection" class="collection-details">
        <div class="json-controls">
          <Button :icon="expanded ? 'pi pi-minus' : 'pi pi-plus'" 
                 @click="toggleExpand"
                 :label="expanded ? 'Collapse All' : 'Expand All'"
                 size="small"
                 text />
          <Button icon="pi pi-copy" 
                 @click="copyToClipboard"
                 label="Copy"
                 size="small"
                 text />
        </div>
        <div :class="['json-content', { expanded }]">
          <pre>{{ formattedJson }}</pre>
        </div>
      </div>
    </Dialog>

    <Dialog v-model:visible="typesVisible" 
            :header="selectedCollection?.name + ' Types'"
            :modal="true" 
            :style="{ width: '60vw' }">
      <div v-if="selectedCollection" class="types-details">
        <div class="types-controls">
          <Button icon="pi pi-copy" 
                 @click="copyTypesToClipboard"
                 label="Copy"
                 size="small"
                 text />
          <Button icon="pi pi-download" 
                 @click="saveTypesToFile"
                 label="Save to File"
                 size="small"
                 text />
        </div>
        <div class="types-content">
          <pre><code>{{ typeDefinition }}</code></pre>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'

// Remove direct JSZip import
// const readFileSync, fileURLToPath, etc...

const detailsVisible = ref(false)
const selectedCollection = ref(null)
const expanded = ref(true)

const formattedJson = computed(() => {
  return JSON.stringify(selectedCollection.value, null, expanded.value ? 2 : 0)
})

const toggleExpand = () => {
  expanded.value = !expanded.value
}

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(formattedJson.value)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

const viewCollectionDetails = (collection: any) => {
  selectedCollection.value = collection
  detailsVisible.value = true
}

const searchQuery = ref('')
const filters = ref({
  global: { value: null, matchMode: 'contains' }
})

watch(searchQuery, (newValue) => {
  filters.value = {
    global: { value: newValue, matchMode: 'contains' }
  }
})

const typesVisible = ref(false)
const typeDefinition = ref('')

// Function to check if schema uses joins
const hasJoinTypes = (schema: any): boolean => {
  if (!schema) return false
  
  // Check for join in properties
  const hasJoinInProps = Object.values(schema.properties || {}).some((prop: any) => 
    prop.join || 
    (prop.type === 'array' && prop.items?.join) ||
    (prop.type === 'object' && (prop.join || hasJoinTypes(prop)))
  )
  
  return hasJoinInProps
}

const jsonSchemaToTS = (collection: any, isNested: boolean = false): string => {
  if (!collection?.properties) return 'any'
  
  // Only add imports if they're needed and we're at the root level
  const needsJoinImport = hasJoinTypes(collection)
  const imports = !isNested ? 
    `import type { _Node } from '../_Node';\n${needsJoinImport ? "import type { _Join } from '../_Join';\n" : ''}\n` : '';
  
  const properties = Object.entries(collection.properties).map(([key, value]: [string, any]) => {
    let type = 'any'
    
    switch (value.type) {
      case 'string':
        type = 'string'
        if (value.enum) {
          type = value.enum.map((v: string) => `'${v}'`).join(' | ')
        }
        break
      case 'number':
        type = 'number'
        break
      case 'boolean':
        type = 'boolean'
        break
      case 'array':
        if (value.items?.type === 'object') {
          if (value.items.properties) {
            // Filter out properties that conflict with _Join if using join
            const itemProperties = Object.entries(value.items.properties).map(([propKey, propValue]: [string, any]) => {
              // Skip id property if using _Join as it's already included
              if (value.items.join && propKey === 'id') return null;
              
              const propType = propValue.type === 'string' ? 'string' : 'any'
              const isRequired = propValue.required === true ? '' : '?'
              const comment = propValue.description ? ` // ${propValue.description}` : ''
              return `    ${propKey}${isRequired}: ${propType};${comment}`
            })
            .filter(Boolean) // Remove null entries
            .join('\n')
            
            // Only use _Join if specified in the schema
            type = value.items.join 
              ? `Array<_Join & {\n${itemProperties}\n  }>`
              : `Array<{\n${itemProperties}\n  }>`
          } else {
            type = value.items.join ? 'Array<_Join>' : 'Array<Record<string, any>>'
          }
        } else if (value.items?.type === 'string') {
          type = 'string[]'
        } else if (value.items?.type === 'number') {
          type = 'number[]'
        } else if (value.items?.type === 'boolean') {
          type = 'boolean[]'
        } else {
          type = 'any[]'
        }
        break
      case 'object':
        if (value.properties) {
          const nestedProperties = jsonSchemaToTS(value, true)
          // Only use _Join if it's specified in the schema
          const extendsJoin = value.join ? ' & _Join' : ''
          type = `{${extendsJoin}\n${nestedProperties}\n  }`
        } else {
          type = value.join ? '_Join' : 'Record<string, any>'
        }
        break
    }
    
    const isRequiredInArray = Array.isArray(collection.required) && collection.required.includes(key)
    const isRequiredInProperty = value.required === true
    const isRequired = isRequiredInArray || isRequiredInProperty
    
    const comment = value.description ? ` // ${value.description}` : ''
    return `  ${key}${isRequired ? '' : '?'}: ${type};${comment}`
  }).join('\n')

  if (isNested) {
    return properties
  }

  return imports + `export interface ${collection.name} extends _Node {\n${properties}\n}`
}

const viewTypeDefinition = (collection: any) => {
  selectedCollection.value = collection
  typeDefinition.value = jsonSchemaToTS(collection)
  typesVisible.value = true
}

const copyTypesToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(typeDefinition.value)
  } catch (err) {
    console.error('Failed to copy types:', err)
  }
}

const saveTypesToFile = async () => {
  if (!selectedCollection.value) return
  
  try {
    const content = typeDefinition.value
    const filename = `${selectedCollection.value.name}.ts`
    
    // Browser-only file download
    const blob = new Blob([content], { type: 'text/typescript' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (err) {
    console.error('Failed to save types:', err)
  }
}

const selectedCollections = ref([])

const downloadSelectedTypes = async () => {
  if (!selectedCollections.value.length) return
  
  try {
    if (window.showDirectoryPicker) {
      // Modern browser - let user pick directory
      const dirHandle = await window.showDirectoryPicker()
      
      for (const collection of selectedCollections.value) {
        const typescript = jsonSchemaToTS(collection)
        const filename = `${collection.name}.ts`
        
        const fileHandle = await dirHandle.getFileHandle(filename, { create: true })
        const writable = await fileHandle.createWritable()
        await writable.write(typescript)
        await writable.close()
      }
      
      alert(`Successfully saved ${selectedCollections.value.length} type definition${selectedCollections.value.length > 1 ? 's' : ''}`)
    } else {
      // Fallback for older browsers - download files directly
      selectedCollections.value.forEach(collection => {
        const typescript = jsonSchemaToTS(collection)
        const blob = new Blob([typescript], { type: 'text/typescript' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${collection.name}.ts`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      })
    }
  } catch (err) {
    if (err.name === 'AbortError') return // User cancelled directory selection
    console.error('Failed to save types:', err)
    alert('Failed to save type definitions. Check console for details.')
  }
}
</script>

<style lang="scss" scoped>
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
}

.collections-grid {
  margin-top: 1rem;
}

.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.text-wrap {
  white-space: normal;
  word-wrap: break-word;
  line-height: 1.4;
  max-height: 4.2em; // Shows up to 3 lines
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.collection-details {
  padding: 1rem;
  background: var(--surface-ground);

  .json-controls {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
    justify-content: flex-end;
  }

  .json-content {
    background: var(--surface-ground);
    padding: 1rem;
    border-radius: 6px;
    overflow: auto;
    max-height: 70vh;

    pre {
      margin: 0;
      white-space: pre-wrap;
      font-family: monospace;
      font-size: 0.9rem;
      line-height: 1.5;
    }

    &:not(.expanded) pre {
      white-space: pre;
      overflow-x: auto;
    }
  }
}

.json-view {
  white-space: pre-wrap;
  font-family: monospace;
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0;
}

.json-editor-dialog {
  :deep(.p-dialog-content) {
    padding: 0;
    display: flex;
    flex-direction: column;
    height: calc(80vh - 70px); // Adjust for header height
  }
}

.search-container {
  margin-bottom: 1rem;
}

.types-details {
  padding: 1rem;
  background: var(--surface-ground);

  .types-controls {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
    justify-content: flex-end;
  }

  .types-content {
    background: var(--surface-ground);
    padding: 1rem;
    border-radius: 6px;
    overflow: auto;
    max-height: 70vh;

    pre {
      margin: 0;
      white-space: pre-wrap;
      font-family: monospace;
      font-size: 0.9rem;
      line-height: 1.5;
    }
  }
}

.actions-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  gap: 1rem;
}
</style>
