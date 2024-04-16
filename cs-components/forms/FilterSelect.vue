<template>
  <div class="filter-select Row Y-Center">
    <div>
      <slot />
    </div>
    <LazySvgIcon svg="chevron-down" />
  </div>
</template>

<script>
export default {}
</script>

<style lang="scss">
.filter-select {
  cursor: pointer;
  font-size: 12px;
  text-transform: uppercase;
  padding: 5px 10px;
  background-color: $CB-1;
  border-radius: 3px;
  font-family: $ff2;
  text-transform: uppercase;
  transition: background-color 1s;
  white-space: nowrap;
  letter-spacing: 2px;
  & > .icon {
    margin-left: 20px;
  }
  &:hover{
    background-color: $CB-2;
   // color: white;
  }
  @media (max-width: 1400px) {
    display: none;
  }
}
</style>
