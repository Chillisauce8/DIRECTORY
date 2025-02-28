<template>
    <div class="card">
        <Breadcrumb :model="breadcrumbs" />
        
        <div class="flex gap-3">
            <!-- Navigation Sidebar -->
            <div class="w-3 surface-section p-3 border-round">
                <Tree :value="navigation" selectionMode="single"
                      v-model:selectedKeys="selectedSection"
                      @nodeSelect="handleNavigation" class="doc-nav" />
            </div>
            
            <!-- Content Area -->
            <div class="flex-1 surface-section p-4 border-round">
                <div v-if="loading" class="flex justify-content-center">
                    <ProgressSpinner />
                </div>
                <div v-else>
                    <div class="flex align-items-center justify-content-between mb-4">
                        <h1 class="m-0">{{ currentSection?.title }}</h1>
                        <div class="flex gap-2">
                            <Button icon="pi pi-github" 
                                  tooltip="View on GitHub" 
                                  rounded text />
                            <Button icon="pi pi-copy" 
                                  tooltip="Copy Link" 
                                  rounded text 
                                  @click="copyLink" />
                        </div>
                    </div>
                    
                    <!-- Documentation Content -->
                    <div class="documentation-content">
                        <template v-if="currentSection?.type === 'interface'">
                            <DataTable :value="currentSection.properties" 
                                     stripedRows class="mb-4">
                                <Column field="name" header="Property" />
                                <Column field="type" header="Type" />
                                <Column field="required" header="Required">
                                    <template #body="{ data }">
                                        <Tag :severity="data.required ? 'danger' : 'info'"
                                             :value="data.required ? 'Required' : 'Optional'" />
                                    </template>
                                </Column>
                                <Column field="description" header="Description" />
                            </DataTable>
                        </template>
                        
                        <div v-html="parsedContent" class="documentation-text"></div>
                    </div>

                    <!-- Related Links -->
                    <div v-if="currentSection?.related?.length" class="mt-4 p-3 surface-ground border-round">
                        <h3>Related Documentation</h3>
                        <div class="flex gap-2 flex-wrap">
                            <Button v-for="link in currentSection.related" 
                                  :key="link.to"
                                  :label="link.label"
                                  :to="link.to"
                                  link />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

const route = useRoute()
const router = useRouter()
const { getNavigationForSection, loadDocumentation } = useDocumentation()

const loading = ref(true)
const content = ref('')
const selectedSection = ref<string[]>([])

const section = computed(() => route.params.section as string)
const navigation = computed(() => getNavigationForSection(section.value))

const breadcrumbs = computed(() => [
    { label: 'Documentation', to: '/docs' },
    { label: section.value.charAt(0).toUpperCase() + section.value.slice(1), to: `/docs/${section.value}` }
])

const parsedContent = computed(() => {
    if (!content.value) return ''
    const rawHtml = marked(content.value)
    return DOMPurify.sanitize(rawHtml, {
        ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'ul', 'ol', 
                      'li', 'code', 'pre', 'strong', 'em', 'blockquote', 'table',
                      'thead', 'tbody', 'tr', 'th', 'td'],
        ALLOWED_ATTR: ['href', 'target', 'rel', 'class']
    })
})

const loadContent = async () => {
    loading.value = true
    try {
        const doc = await loadDocumentation(section.value)
        if (doc) {
            content.value = doc
        }
    } catch (error) {
        console.error('Error loading documentation:', error)
    } finally {
        loading.value = false
    }
}

const handleNavigation = (node: any) => {
    const element = document.getElementById(node.key)
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
    }
}

const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    // Add toast notification here if you want
}

watch(() => route.params.section, loadContent, { immediate: true })
</script>

<style lang="scss">
.documentation-content {
    .documentation-text {
        line-height: 1.6;
        
        h1, h2, h3 {
            margin-top: 2rem;
            margin-bottom: 1rem;
            scroll-margin-top: 2rem; // For smooth scrolling to anchors
        }
        
        code {
            background: var(--surface-200);
            padding: 0.2rem 0.4rem;
            border-radius: 4px;
            font-family: monospace;
        }
        
        pre {
            background: var(--surface-100);
            padding: 1rem;
            border-radius: 6px;
            overflow-x: auto;
            
            code {
                background: transparent;
                padding: 0;
            }
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin: 1rem 0;
            
            th, td {
                border: 1px solid var(--surface-300);
                padding: 0.5rem;
            }
            
            th {
                background: var(--surface-100);
            }
        }
    }
}

.doc-nav {
    :deep(.p-tree) {
        border: none;
        padding: 0;
        
        .p-tree-container {
            .p-treenode {
                padding: 0.5rem 0;
            }
        }
    }
}
</style>
