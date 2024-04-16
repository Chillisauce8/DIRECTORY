<template>
    <div class="dialog-main-link Row Center">
    <NuxtLink :to="to" class="link">
   <slot/>
  </NuxtLink>
  <LazySvgIcon svg="arrow-left" class="rotate-180"/>
</div>
</template>

<script>
export default {
  props: ['to', 'section'],
}
</script>

<style lang="scss">
.dialog-main-link {
  text-align: center;
  font-size: 0.8em;
  font-family: $ff2;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: $C2;
  padding: 0 0 0.8em;

  & .link{
    margin: 0 10px;
  }
  & svg path{

  }
  & a{
    padding: 5px 10px;
    transition: all 1s;
  }
  &:hover{
    & a{
    border-radius: 3px;
    background-color: $CB-05;
    }
    & svg{
      animation: move-arrow 1s infinite;
      position: relative;
      & path{
        animation: move-arrow 1s infinite;
      }
  }

  }
}
@keyframes move-arrow {
  0% {right: 0px;
    fill: $C2;
    colour: $C1;
  }
  50% {right: 5px;
  }
  100% {right: 0px;
    fill: $C2;
    colour: $C1;
  }
}
</style>
