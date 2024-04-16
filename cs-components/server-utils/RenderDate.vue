<template>
  <pre id="server-render-date" style="display:none">{{renderDate}}</pre>
</template>

<script setup>

import {useRenderDateStore} from "~/store/renderDate";

const renderDateStore = useRenderDateStore();

const renderDate = renderDateStore.date;

</script>

<style scoped>

</style>