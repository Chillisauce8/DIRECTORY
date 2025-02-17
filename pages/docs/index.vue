<template>
    <div class="card">
        <Breadcrumb :model="breadcrumbs" />
        
        <div class="flex gap-3 my-4">
            <div v-for="section in sections" :key="section.to" class="flex-1">
                <Card class="h-full">
                    <template #header>
                        <div class="flex align-items-center gap-2">
                            <i :class="section.icon + ' text-xl'"></i>
                            <h2 class="text-xl m-0">{{ section.title }}</h2>
                        </div>
                    </template>
                    <template #content>
                        <p>{{ section.description }}</p>
                    </template>
                    <template #footer>
                        <div class="flex justify-content-end">
                            <Button :label="section.buttonText" icon="pi pi-arrow-right" 
                                  :to="section.to" outlined />
                        </div>
                    </template>
                </Card>
            </div>
        </div>

        <div class="mt-4">
            <TabView>
                <TabPanel header="Quick Actions">
                    <div class="grid">
                        <div v-for="action in quickActions" :key="action.label" 
                             class="col-12 md:col-6 lg:col-4">
                            <div class="flex align-items-center gap-2 p-3 border-round cursor-pointer hover:surface-100"
                                 @click="navigateTo(action.to)">
                                <i :class="action.icon + ' text-xl'"></i>
                                <div>
                                    <h3 class="m-0 text-lg">{{ action.label }}</h3>
                                    <p class="m-0 text-sm text-500">{{ action.description }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabPanel>
                <TabPanel header="Recent Updates">
                    <Timeline :value="recentUpdates" class="w-full">
                        <template #content="slotProps">
                            <div class="flex align-items-center gap-2">
                                <Tag :value="slotProps.item.type" :severity="slotProps.item.severity" />
                                <small class="text-500">{{ slotProps.item.date }}</small>
                            </div>
                            <p class="m-0 line-height-3">{{ slotProps.item.description }}</p>
                        </template>
                    </Timeline>
                </TabPanel>
            </TabView>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const breadcrumbs = ref([
    { label: 'Documentation', to: '/docs' }
]);

const sections = ref([
    {
        title: 'Authentication',
        description: 'Learn about the authentication system, user management, and security features.',
        icon: 'pi pi-shield',
        to: '/docs/auth',
        buttonText: 'Explore Auth'
    },
    {
        title: 'Database',
        description: 'Understand the database structure, collections, and relationships.',
        icon: 'pi pi-database',
        to: '/docs/database',
        buttonText: 'View Schema'
    },
    {
        title: 'Architecture',
        description: 'Explore the application architecture, patterns, and best practices.',
        icon: 'pi pi-sitemap',
        to: '/docs/architecture',
        buttonText: 'Learn More'
    }
]);

const quickActions = ref([
    {
        label: 'Add New Collection',
        description: 'Learn how to add and index new collections',
        icon: 'pi pi-plus-circle',
        to: '/docs/database#adding-collections'
    },
    {
        label: 'Security Guide',
        description: 'Best practices for security',
        icon: 'pi pi-shield',
        to: '/docs/auth#security-considerations'
    },
    {
        label: 'API Integration',
        description: 'How to work with the API',
        icon: 'pi pi-code',
        to: '/docs/architecture#api-routes'
    }
]);

const recentUpdates = ref([
    {
        type: 'Update',
        severity: 'info',
        date: '2024-01-21',
        description: 'Updated authentication documentation with 2FA setup guide'
    },
    {
        type: 'New',
        severity: 'success',
        date: '2024-01-20',
        description: 'Added database schema visualization'
    },
    {
        type: 'Fix',
        severity: 'warning',
        date: '2024-01-19',
        description: 'Corrected API endpoint documentation'
    }
]);

const navigateTo = (path: string) => {
    router.push(path);
};
</script>

<style lang="scss">
.documentation-content {
    line-height: 1.6;
    
    h1, h2, h3 {
        margin-top: 2rem;
        margin-bottom: 1rem;
    }
    
    code {
        background: var(--surface-200);
        padding: 0.2rem 0.4rem;
        border-radius: 4px;
    }
    
    pre {
        background: var(--surface-100);
        padding: 1rem;
        border-radius: 6px;
        overflow-x: auto;
    }
}
</style>
