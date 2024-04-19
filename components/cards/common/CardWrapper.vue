<template>
  <nuxt-link v-if="link" :to="link" class="card-wrapper" :class="{searchhide: searchHide}">
    <article @click="onSelect($event)" :data-search="searchTerms">
      <slot />
    </article>
  </nuxt-link>
  <article v-else class="card-wrapper" @click="onSelect($event)" :class="{searchhide: searchHide}"
           :data-search="searchTerms">
    <slot />
    <transition name="selected">
      <div v-if="selectable || selected" class="selected-wrapper" :class="{ selected: selected }">
      <LazySvgIcon svg="tick" /> <div>Selected </div></div>
    </transition>
  </article>
</template>

<script lang="ts">
export default {
  props: {
    selectable: {
      type: Boolean,
      default: () => false,
    },
    link: {
      type: [String, Object],
      default: () => "",
    },
    clickable: {
      type: Boolean,
      default: () => false,
    },
    selected: {
      type: Boolean,
      default: () => false,
    },
    searchHide: {
      type: Boolean,
      default: () => false,
    },
    searchTerms: {
      type: String,
      default: () => "",
    },
  },
  data() {
    return {
      selectedInternalValue: this.selected,
    }
  },
  methods: {
    onSelect(event: Event) {
      this.selectedInternalValue = !this.selectedInternalValue;

      if (this.selectable || this.link || this.clickable) {
        this.$emit('selected', this.selectedInternalValue);
      }
    }
  },
}
</script>

<style lang="scss">
$card-border: 5px;


.card-wrapper {
  cursor: pointer;
  &.Dark{
    color: $CB-2;
  }
  &.Transparent{
    background-color: transparent;
  }
  & header {
    position: relative;
  }
  position: relative; // For smooth Vue transition-group https://www.youtube.com/watch?v=DGI_aKld0Jg
  background-color: $CB;
  padding: $card-border;
  font-size: 12px;
  transition: all 1s ease;
  margin: 0 auto;
  &.searchhide{
    animation: search-hide 3s ease 0.4s forwards;
  }
  & .selected-wrapper{
    display: flex;
    justify-content: space-around;
    align-items:center;
    background-color: $C2;
    color: white;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    font-family: $ff2;
    letter-spacing: 3px;
    border-radius: 3px;
    position: absolute;
    top: -12px;
    right: 0px;
    width: 120px;
    height: 20px;
    transition:all 0.3s ease-in-out;
    & i.icon{
      width: 14px;
      height: 14px;
    }
    & svg path{
      fill: white;
    }
    @include shadow-right();
  }
  & .selected-wrapper:not(.selected){
    background-color: $C2;
    width:0px;
    height:0px;
    overflow:hidden;
  }
  & .selected-wrapper.selected {
    visibility: inherit;
  }
  & .selected-wrapper.selected-enter-active {
    animation: selected-add 0.5s ease-in;
  }
  & .selected-wrapper.selected-leave-active {
    animation: selected-remove 0.5s ease-out;
  }
  &.list,
  &.basket-package,
  &.full-package {
    margin: 0 auto 20px;
    &:last-child {
      margin: 0 auto;
    }
    & header {
      padding: 0 10px;
      & .overlay {
        height: 100%;
      }
    }
  }

  &.card {
    & header {
      position: relative;
      & > .overlay {
        @include overlay();
        padding: 5%;
        text-align: center;
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;
        align-items: stretch;
      }
    }
  }
  &.customer-card,
  &.group-card,
  &.customer-contact-card {
    & .icon {
      margin: 20px auto;
      width: 72px;
      height: 72px;
    }
    & h1 {
      text-align: center;
      font-size: 18px;
    }
    & .information {
      font-size: 14px;
    //  font-weight: bold;
      padding: 20px 10px;
    }
    & li {
      margin-bottom: 6px;
    }
  }
}

@keyframes selected-add {
  0% {
    width: 100px;
  }
  100% {
    width: 200px;
  }
}

@keyframes selected-remove {
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(0);
  }
}
@keyframes search-hide {
  0% {
    position: absolute;
    opacity: 1;
  }
  100%{
    opacity: 0;
    position: absolute;
    transform: translateY(1000vh);
  }
}

</style>
