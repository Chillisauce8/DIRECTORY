<!-- components/IconDisplay.vue -->
<template>
    <div class="icon-display">
        <div v-for="icon in icons" :key="icon" class="icon-item">
            <div class="icon-preview">
                <!-- Display each icon by fetching from /icons directory -->
                <img :src="`/icons/${icon}.svg`" :alt="icon" />
            </div>
            <p class="icon-name">{{ icon }}</p>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const icons = ref([]);

const fetchIcons = async () => {
    try {
        const response = await fetch('/api/icons');
        if (!response.ok) throw new Error('Failed to fetch icons');
        icons.value = await response.json();
    } catch (error) {
        console.error('Error fetching icons:', error);
    }
};

onMounted(fetchIcons);
</script>

<style scoped>
.icon-display {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 16px;
    padding: 16px;
}

.icon-item {
    text-align: center;
}

.icon-preview {
    width: 50px;
    height: 50px;
    margin: 0 auto;
}

.icon-preview img {
    width: 100%;
    height: 100%;
}

.icon-name {
    margin-top: 8px;
    font-size: 0.9rem;
    color: #333;
}
</style>
