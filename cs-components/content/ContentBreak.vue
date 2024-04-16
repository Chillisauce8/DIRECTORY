<template>
    <section class="Copy content-break CB-05">
        <div class="W1">
          <h2 class="title">{{ title }}</h2>
          <Markdown class="text" v-if="text" :data="text" :isCustomSanitizing="true"></Markdown>
        </div>
      </section>
</template>

<script setup lang="ts">

interface ContentBreakProps {
  title: string;
  text?: string;
}

const {title, text} = defineProps<ContentBreakProps>();

</script>

<style lang="scss">
.content-break{
    padding: 2em 0;
    margin: 2em 0;
    & .title{
        text-align: center;
    }
    & .text{
        font-size: 1em;
    }
}
</style>
