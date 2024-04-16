
<template>

    <div class="court">

      <div class="court-area top-left" ><Player :number="1" class="L"/></div>
      <div class="court-area top-right"><Player :number="2" class="L"/></div>
      <div class="kitchen top"></div>
      <div class="net"><LazySvgIcon class="red-flag" svg="red-flag"/></div>
      <div class="kitchen bottom"></div>

      <div class="court-area  bottom-left"><Player class="W"/></div>
      <div class="court-area bottom-right"><Player class="W"/></div>
    </div>
  </template>
  
  <script >
export default {
  data() {
    return {
      role: 'Account Manager',
      name: 'Andrea Jameson',
      phone: '',
    }
  },
}
  </script>
  
  <style lang="scss">

  .court{
    .red-flag{
      display: none;
    }
    &.flag{
      .red-flag{
      display: initial;
    }
    }
  //  position: relative;
    margin: 40px;
    border: 2px solid black;
    width: 200px;
    height: 400px;
    background: black;
    display: grid;
    grid-template-rows:2fr 1fr 1% 1fr 2fr;
    grid-template-columns: 1fr 1fr;
    gap: 2px;
    grid-template-areas: 
    "court-area-top-left court-area-top-right"
    "kitchen-top kitchen-top"
    "net net"
    "kitchen-bottom kitchen-bottom"
    "court-area-bottom-left court-area-bottom-right";
  }
  .court-number{
    background-color: white;
    color: black;
  }
  .court-area{
    background-color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    &.top-left{
      grid-area: court-area-top-left;
    }
    &.top-right{
      grid-area: court-area-top-right;
    }
    &.bottom-left{
      grid-area: court-area-bottom-left;
    }
    &.bottom-right{
      grid-area: court-area-bottom-right;
    }
  }
  .kitchen{
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: rgb(233, 233, 233);
    &.top{
      grid-area: kitchen-top;
      &::after{
        counter-increment: court-counter;
        content: "Court: " counter(court-counter);
      }
    }
    &.bottom{
      grid-area: kitchen-bottom;
    }
  }
  .net{
    grid-area: net;
    width: 120%;
    overflow: visible;
    background-color: black;
    position: relative;
    right: 10%;
    display: flex;
    justify-content: right;
    .red-flag.icon{
      width: 40px;
      height: 40px;
      position: relative;
      left: 25px;
      bottom: 45px;

    }
  }
  .player.icon{
    width: 40px;
    height: 40px;
  }


  
  </style>