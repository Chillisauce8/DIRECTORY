<template>
    <div class="room">
    <div class="courts">
        <div class="letter loser">L</div>
    <div class="court flag"> 
     <div class="court-area top-left" ><Player :number="1" class="W"/></div>
     <div class="court-area top-right"><Player :number="2" class="W"/></div>
     <div class="kitchen top"></div>
     <div class="net"><SvgIcon class="red-flag" svg="red-flag"/></div>
     <div class="kitchen bottom"></div>
     <div class="court-area  bottom-left"><Player :number="3"  class="L"/></div>
     <div class="court-area bottom-right"><Player :number="4"  class="L"/></div>
   </div>
   <div class="court flag"> 
     <div class="court-area top-left" ><Player :number="5" class="W"/></div>
     <div class="court-area top-right"><Player :number="6" class="W"/></div>
     <div class="kitchen top"></div>
     <div class="net"><SvgIcon class="red-flag" svg="red-flag"/></div>
     <div class="kitchen bottom"></div>
     <div class="court-area  bottom-left"><Player :number="7"  class="L"/></div>
     <div class="court-area bottom-right"><Player :number="8"  class="L"/></div>
   </div>
   <div class="court flag"> 
     <div class="court-area top-left" ><Player :number="9" class="L"/></div>
     <div class="court-area top-right"><Player :number="10" class="L"/></div>
     <div class="kitchen top"></div>
     <div class="net"><SvgIcon class="red-flag" svg="red-flag"/></div>
     <div class="kitchen bottom"></div>
     <div class="court-area  bottom-left"><Player  :number="11" class="W"/></div>
     <div class="court-area bottom-right"><Player  :number="12" class="W"/></div>
   </div>
   <div class="court flag"> 
     <div class="court-area top-left" ><Player :number="13" class="W"/></div>
     <div class="court-area top-right"><Player :number="14" class="W"/></div>
     <div class="kitchen top"></div>
     <div class="net"><SvgIcon class="red-flag" svg="red-flag"/></div>
     <div class="kitchen bottom"></div>
     <div class="court-area  bottom-left"><Player :number="15"  class="L"/></div>
     <div class="court-area bottom-right"><Player :number="16"  class="L"/></div>
   </div>

        <div class="letter winner">W</div>
       
    </div>
</div>
  </template>
  
  <script>
  export default {};
  </script>
  
  <style lang="scss">
  .room{
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 50px;
    border: 1px solid black;
  .courts{
    counter-reset: court-counter;
    display: flex;
    align-items: center;
    .letter{
        font-weight: 700;
        font-size: 70px;
    
        &.winner{
            color: green;
            margin-left: 50px;
        }
        &.loser{
            color: red;
            margin-right: 50px;
        }
    
    }
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

  
  }
}
  
  
  </style>