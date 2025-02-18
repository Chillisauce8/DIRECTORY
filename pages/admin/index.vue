<template>
  <div class="card">
    <h1>Admin Tools</h1>
    
    <div class="description-container">
      <h3>Available Administrative Tools:</h3>
      <p>Collection of utilities and tools for managing the application.</p>
    </div>

    <div class="tools-grid">
      <div v-for="(tool, index) in adminTools" :key="index" class="tool-card">
        <div class="tool-content">
          <h3>{{ tool.name }}</h3>
          <p>{{ tool.description }}</p>
          <NuxtLink :to="tool.path" class="p-button">
            Open Tool
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const adminTools = [
  {
    name: 'Market URL Manager',
    description: 'Generate and update URL fields for market entries based on their path structure.',
    path: '/admin/update-market-urls'
  },
  {
    name: 'MongoDB Query Tests',
    description: 'Test and compare different MongoDB query methods for performance optimization.',
    path: '/admin/test-mongo-queries'
  },
  {
    name: 'MongoDB API Analysis',
    description: 'Analyze raw MongoDB API requests and responses to debug query issues.',
    path: '/admin/test-mongo-api'
  },
  {
    name: 'Collections Manager',
    description: 'View and manage collection definitions from the database.',
    path: '/admin/manage-collections'
  }
]
</script>

<style scoped lang="scss">
.description-container {
  margin: 1rem 0;
  padding: 1rem;
  background: var(--surface-ground);
  border-radius: 6px;
  border-left: 4px solid var(--primary-color);
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  margin-top: 2rem;
}

.tool-card {
  background: var(--surface-50);
  border-radius: 6px;
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  .tool-content {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    height: 100%;
    
    h3 {
      margin: 0;
      color: var(--primary-color);
    }
    
    p {
      flex: 1;
      margin: 1rem 0;
      color: var(--text-color-secondary);
    }
    
    .p-button {
      align-self: flex-start;
      text-decoration: none;
    }
  }
}
</style>
