<template>
    <card-wrapper class="marketing-card" :class="{ 'X-Center': props.svg, 'link': props.link }" :link="props.link">
      <ImageWrapper v-if="props.images" :images="props.images" :random="props.random"
                    :max="props.max" :width="290" :height="145" :loading="props.loading"/>
      <LazySvgIcon v-else-if="props.svg" :svg="props.svg" />
      <card-text-wrapper>
        <h1 v-if="props.title">{{ props.title }}</h1>
        <div v-if="props.copy" class="copy">
          {{ props.copy }}
        </div>
      </card-text-wrapper>
    </card-wrapper>
</template>

<script>
export default {
  props: ['props'],
}
</script>

<style lang="scss">

</style>
