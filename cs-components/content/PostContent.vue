<template>
    <div class="POST post-content">
      <PostContentItem v-for="contentItem in content" :item="contentItem" />
    </div>
</template>

<script>
export default {
  name: "PostContent",
  props: ["content"]
}
</script>

<style lang="scss">
.post-content{
  padding: 2em 0;
}

</style>
