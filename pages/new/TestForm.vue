<template>
    <DataItem :function="dataItemFunction" :id="dataId" collection="test_form" title="Test Form Title" :save-button="true"
              subtitle="This is where a subtitle would go which could explain a little bit more about the form below">
    </DataItem>
</template>

<script setup lang="ts">

const route = useRoute();


const dataId: string = route.params.id as string;
const dataItemFunction = ref<string>(dataId ? 'update' : 'create');

</script>
