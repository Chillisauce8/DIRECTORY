<template>
  <button
    :id="id"
    :disabled="disabled"
    :data-processing="processing ? '' : null"
    class="button-main"
    :type="buttonType"
  >
    <div class="button-inner">
      <div v-if="icon" class="button-icon">
        <LazySvgIcon :svg="icon" class="inline" />
      </div>
      <div v-if="processing && processingText" class="button-text">{{processingText}}</div>
      <div v-else-if="processing && !processingText" class="button-text">Processing...</div>
      <div v-else class="button-text"><slot />{{ text }}
      </div>
    </div>
  </button>
</template>

<script>
export default {
  props: ["id", "type", "form", "disabled", "text", "icon", "processing", "processingText"],
  data() {
    return {
      buttonType: this.type ?? "button",
    };
  },
};
</script>

<style lang="scss">
body.page-location{
  button.button-main.test-wide{
    width: clamp(120px, 260px, 80vw);
  }
}
button.button-main {
  --color: white;
  --background-color: #{$C1};

  color: var(--color);
  background-color: var(--background-color);
  border-radius: 3px;
  text-transform: uppercase;
  font-family: $ff2;
  width: clamp(120px, 260px, 45vw);
  padding: 0 5px;
  height: 48px;
  cursor: pointer;
  margin: 0 auto;
  @include mobile{
    font-size: 13px;
    letter-spacing: 2px;
    font-weight: 600;
  }  @include desktop{
    font-size: 14px;
    letter-spacing: 2px;
    font-weight: 700;
  }
 
  &.edit-content{
    color: inherit;
    font-size: inherit;
    text-transform: inherit;
    font-weight: inherit;
    letter-spacing:inherit;
  }
  &._2nd {
    --background-color: #{$CB-3};
  }
  &._3rd {
    --color: #{$C2};
    --background-color: white;
    text-transform: none;
    transition: all 1s ease-in-out;
    &:hover{
      background-color: $CB-1;
    }
  }
  &.black{
    --background-color: #{$CB-8};
  }
  &.transparent{
   // --background-color:transparent;
  }
  &.border{
   // border: 2px solid var(--color);
   --background-color: #{$CB-8};
    border: 2px solid $CB-8;
  }
  &.beautiful-green{
    background-image: linear-gradient(to bottom right, #48b1bf, #06beb6);
}
  &.outline{
    border: 2px solid var(--background-color);
    background-color: var(--color);
    color: var(--background-color);
  }
  & .button-inner {
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 100%;
    & .button-text {
      width: 100%;
    }
    & .icon {
      width: 2em;
      height: 2em;
      margin: 0 5px;
      & svg path {
        stroke-width: 1.5px;
      }
    }
  }
  &.button-compact {
    // Used for the basket
    width: clamp(120px, 45%, 250px);
    @include mobile() {
      height: 40px;
      font-size: 12px;
      letter-spacing: 0px;
    }
  }
  &[data-processing]{
    cursor: progress;
   // background-image: linear-gradient(to right,  var(--background-color),white, var(--background-color));
    background-image: linear-gradient(to right,  var(--background-color),white);
    background-size: 200%;
      animation: processing 2s linear infinite;
  }
    &[disabled]{
       font-size: 12px;
    cursor: not-allowed;
    --background-color: #{$CB-3};
    border: 2px solid var(--background-color);
    background-color: var(--color);
    background-color:$CB-05;
    border-color: $CB-1;
    color: var(--background-color);
    & .disabled-text{
      font-size: 10px;
      text-transform: uppercase;
      color: $CB-6;
    }
   
  }
  &:hover:not([disabled]){
    animation: hover-over 2s linear infinite;
  }

 
}
@keyframes processing {
  0% {
    background-position: 100%;
  }
  50%{
    background-position: -100%;
  }
  100% {
    background-position: 100%;
  }
}
@keyframes hover-over {
  0% {
    scale: 100%;
  }
  50% {
    scale: 102%;
    box-shadow: 2px 2px grey;
  }
  100% {
    scale: 100%;
  }
}


</style>
