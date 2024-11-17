<template>
    <card-list
        :showGalleryControls="true"
        :functionControlDisplay="'icon'"
        :visibleFunctionControls="['view', 'select', 'edit', 'order']"
        :defaultFunctionControl="'view'"
        :showCategoryControl="true"
        :showShowControl="true"
        :showSearchControl="true"
        :defaultCardSize="'Big Cards'"
        :searchFields="[
            { field: 'name', label: 'Name' },
            { field: 'description', label: 'Description' },
            { field: 'categories', label: 'Categories' }
        ]"
    >
        <template #card="{ listing, mode, selected, show }">
            <TestCard :imageId="listing.images[0].id" :name="listing.name" :mode="mode" :loveable="listing.loveable" :selected="selected" :show="show" :categories="listing.categories" />
        </template>
    </card-list>
</template>

<script setup lang="ts"></script>
