<template>
  <div class="button-wrapper">
   <slot /> 
  
</div>
</template>

<script>
export default {
  props: ['id', 'type', 'form', 'disabled', "text", "icon"],
  data() {
    return {

    };
  },
};
</script>

<style lang="scss">
.button-wrapper{
  width: 100%;
    margin: 0 auto;
    display: flex;
    justify-content: center;
    & button{ 
      width: clamp(100px, 45%, 250px);
      margin: 0 2%;
    }
}

</style>
