<script setup lang="ts">
import { ref } from 'vue';
import Uppy, { type UppyFile } from '@uppy/core';
import { Dashboard } from '@uppy/vue';

// Import the Uppy CSS
import '@uppy/core/dist/style.css';
import '@uppy/dashboard/dist/style.css';

const uppy = new Uppy({
    restrictions: {
        maxNumberOfFiles: 5,
        allowedFileTypes: ['image/*']
    }
});

const uppyRef = ref(null);

// Example of using Uppy types
uppy.on('file-added', (file: UppyFile) => {
    console.log('Added file:', file.name);
});
</script>

<template>
    <Dashboard
        ref="uppyRef"
        :uppy="uppy"
        :props="{
            width: '100%',
            height: '400px'
        }"
    />
</template>
