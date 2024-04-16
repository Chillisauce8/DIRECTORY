
<template>

      <div class="player"><SvgIcon class="player-icon" svg="pickleball-player"/><div class="result">{{ number }}</div></div>

  </template>
  
  <script >
export default {
  props: ['number'],
  data() {
    return {
    }
  },
}
  </script>
  
  <style lang="scss">
  .player{
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
   &.L{
        color: red;
 .result::after{
    content: "";
 }
    }
    &.W{
        color: green;
 .result::after{
    content: "";
 }
    }

  
  .icon{
    width: 40px;
    height: 40px;
  }

  .result{
    font-size: 20px;
    font-weight: 700;
  }
  }
  
  </style>