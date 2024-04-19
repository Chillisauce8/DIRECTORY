<template>
  <section-wrapper class="cards-container"
                   :class="{togglecards: toggle}"
                   :title="title"
                   :subTitle="subTitle"
                   :id="id"
                   :display="currentDisplayValue"
                   @closeClicked="$emit('closeClicked')">
    <client-only>
      <CardsContainerToggle
        slot="toggle"
        v-if="toggle && currentNeedToggle"
        :id="id"
        :display="currentDisplayValue"
        :classes="classes"
        :to="to"
        :toTitle="toTitle"
        :cardsCount="cardsCount"
        @displayChanged="onDisplayChanged"
      />
    </client-only>
    <slot name="above-cards" />
    <list-wrapper @needToggle="updateNeedToggle"
      :class="[
        {
          closing: classes.gridClose,
          VIEWED: classes.viewed,
          INTERSECTING: classes.intersecting,
        },
        currentDisplayValue,
      ]">
      <slot />
    </list-wrapper>
  </section-wrapper>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: () => "",
    },
    subTitle: {
      type: String,
      default: () => "",
    },
    id: {
      type: String,
      default: () => "",
    },
    display: {
      type: String,
      default: () => null,
    },
    toggle: {
      type: Boolean,
      default: () => true,
    },
    needToggle: {
      type: Boolean,
      default: () => false,
    },
    view: {
      type: String,
      default: () => "",
    },
    to: {
      type: String,
      default: () => "",
    },
    toTitle: {
      type: String,
      default: () => "",
    },
    cardsCount: {
      type: Number,
      default: () => null,
    },
  },
  emits: ['closeClicked'],
  data() {
    return {
      classes: {
        intersecting: this.view || false,
        viewed: this.view || false,
        gridClose: false,
      },
      initialDisplay: this.display,
      currentDisplayValue: this.display || this.calculateDisplayIfEmpty(),
      currentNeedToggle: this.needToggle
    }
  },
  methods: {
    calculateDisplayIfEmpty() {
      if (this.currentNeedToggle) {
        return 'grid';
      }

      return 'slider';
    },

    onDisplayChanged(value) {
      this.currentDisplayValue = value;

      // save it to not have side effects
      this.initialDisplay = value;
    },

    updateNeedToggle(value) {
      if (!value) {
        return;
      }

      this.currentNeedToggle = value;

      if (!this.initialDisplay) {
        this.currentDisplayValue = this.calculateDisplayIfEmpty();
      }
    }
  }
}
</script>

<style lang="scss">
.cards-container.togglecards {
  .section-title {
    color: $CB-1;
  }
  background-image: $GBC-1;
}
</style>
