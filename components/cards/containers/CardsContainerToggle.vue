<template>
    <div v-if="to" class="cards-container-toggle">
      <NuxtLink :to="to"> {{ toTitle }} ></NuxtLink>
    </div>
    <nuxt-link v-else :to="{ hash: '#' + id, query: currentQuery}" >
      <div
        class="cards-container-toggle"
        :class="currentDisplayValue"
        v-on:click="swapDisplay">
        <template v-if="cardsCount && currentDisplayValue === 'slider'"> {{cardsCount}} Items > </template>
        <template v-else-if="currentDisplayValue === 'slider'"> > </template>
      </div>
    </nuxt-link>
</template>

<script>
export default {
  props: ['classes', 'id', 'display', 'to', 'toTitle', 'cardsCount'],
  setup() {
    return {
      router: useRouter(),
    }
  },
  data() {
    return {
      currentDisplayValue: this.display
    };
  },
  computed: {
    currentQuery() {
      return unref(this.router.currentRoute).query;
    },
  },
  methods: {
    swapDisplay: function () {
      if (this.currentDisplayValue === 'grid') {
        const element = document.getElementById(this.id);

        setTimeout(() => {
          this.classes.gridClose = false;
          this.currentDisplayValue = 'slider';
          this.$emit('displayChanged', this.currentDisplayValue);
        }, 1000)

        setTimeout(() => {
          element.scrollIntoView(true);
        }, 1100);

        this.classes.gridClose = true;
      } else {
        this.currentDisplayValue = 'grid';
        this.$emit('displayChanged', this.currentDisplayValue);
      }

      this.classes.viewed = true;
    },
  },
}
</script>

<style scoped lang="scss" >
a {
  color: $C2;
  :hover,:visited,:active {
    color: $C2;
  }
}
.cards-container-toggle {
  text-align: center;
  margin: 0 auto;
  z-index: 10;
  cursor: pointer;
  font-size: 16px;
  font-family: $ff2;
  letter-spacing: 0.2em;
  font-weight: 800;
  text-transform: uppercase;
  color: $C2;
  :hover,:visited,:active {
    color: $C2;
  }
  &.grid {
    position: sticky;
    top: 100px;
    &::before {
     // @include shadow-soft();
      animation: view-all 1s ease-in-out 0s forwards;
      content: 'Close X';
    }
  }
  &.slider::before {
    //       animation: view-all 1s ease-in-out 0s backwards;
    content: 'View All ';
    color: $C2;
  }
}

@keyframes view-all {
  0% {
    background-color: transparent;
    content: 'View All >';
    color: $C2;
  }
  25% {
    color: transparent;
  }
  50% {
    //  color: transparent;
    content: 'Close X';
    background-color: transparent;
  }
  75% {
    background-color: transparent;
  }
  100% {
    content: 'Close X';
    background-color: $CB-8;
    margin: 0 auto;
    padding: 0 10px;
    border-radius: 3px;
    color: $C2;
  }
}
</style>
