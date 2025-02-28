<template>
  <span class="swirl-text">
 <slot/>
 </span>
 
</template>

<script>
export default {
  props: ['text'],
}
</script>

<style lang="scss">
.swirl-text
{
  text-transform: uppercase;
  background-image: linear-gradient(to right, #F15F79, #B24592, #F15F79);
  background-size: auto auto;
  background-clip: border-box;
  background-size: 200% auto;
  background-clip: text;
  text-fill-color: transparent;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: textclip 2s linear infinite;
  display: inline-block;

}

@keyframes textclip {
  to {
    background-position: -200% center;
  }
}
</style>
