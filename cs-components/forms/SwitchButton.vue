<template>
  <div class="switch-button">
    <label>
      <input type="checkbox" data-categories="Cars" class="grid-filters" />
      Cars
    </label>
  </div>
</template>

<script>
export default {}
</script>

<style lang="scss">
.switch-button {
  & label {
    cursor: pointer;
  }
  & input {
    cursor: pointer;
    position: relative;
    width: 35px;
    height: 20px;
    font-size: 20px;
    transform: translate(
      0px,
      2px
    ); // Solves some vertical alignement issue with the text and the switch
    &::before {
      content: '';
      display: inline-block;
      width: 35px;
      height: 20px;
      background-color: $CB-1;
      border-radius: 20px;
      transition: all 0.3s;
    }
    &::after {
      content: '';
      position: absolute;
      display: inline-block;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background-color: white;
      top: 1px;
      left: 1px;
      transition: all 0.3s;
    }
    &:checked::before {
      background-color: $C1;
    }
    &:checked::after {
      left: 15px;
    }
  }
}
</style>
