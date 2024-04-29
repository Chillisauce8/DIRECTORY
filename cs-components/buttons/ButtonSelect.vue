<template>
  <button-content-wrapper ref="buttonContentWrapper" :class="{disabled: disabled}">
    <template #main>
      <button
        class="button-wrapper"
        :tabindex="tabindex"
        @click.stop="open = !open"
        :disabled="disabled"
        :class="{ hidden: !open, open: open }"
      >
        <div class="text">
          {{ getOptionViewValue(selected) }}
        </div>
        <LazySvgIcon svg="chevron-down" class="button-icon" />
      </button>
    </template>
    <template #expandable>
      <div class="option-wrapper" :class="{ hidden: !open, open: open }">
        <div
          class="option"
          v-for="(option, i) of options"
          :class="{ selected: option === selected }"
          :key="i"
          @click.stop="onOptionSelect($event, option)"
        >
          {{ getOptionViewValue(option) }}
        </div>
      </div>
    </template>
  </button-content-wrapper>
</template>

<script>
import {getDocumentSafe} from '~/service/helpers/browser/browser.helpers';

export default {
  props: {
    options: {
      type: Array,
      required: false,
    },
    optionSuffix: {
      type: String,
      required: false,
      default: '',
    },
    labelGetter: {
      type: Function,
      required: false,
      default: null,
    },
    value: {
      type: [String, Number],
      required: false,
      default: null,
    },
    tabindex: {
      type: Number,
      required: false,
      default: 0,
    },
    disabled: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  data() {
    return {
      open: false,
      selected: undefined,
      documentClickUnsubscribe: null,
    };
  },
  created() {
    this.initSelected();
    this.documentClickUnsubscribe = this.subscribeOnDocumentClick();
  },
  unmounted() {
    if (this.documentClickUnsubscribe) {
      this.documentClickUnsubscribe();

      this.documentClickUnsubscribe = null;
    }
  },
  watch: {
    value() {
      this.initSelected();
    }
  },
  methods: {
    initSelected() {
      this.selected = (this.value !== undefined && this.value !== null)
          ? this.value : this.options?.length > 0
          ? this.options[0]
          : null;
    },

    getOptionViewValue(option) {
      if (this.labelGetter) {
        return this.labelGetter(option);
      }

      let space = '';

      if (this.optionSuffix?.length > 0 && !this.optionSuffix.startsWith(' ')) {
        space = ' ';
      }

      return option + space + (this.optionSuffix || '');
    },

    onOptionSelect(event, option) {
      this.selected = option;
      this.open = false;
      this.$emit('update:value', option);
    },

    closeOnBlurIfNeeded(event) {
      if (this.open === false) {
        return;
      }

      const buttonContentWrapper = this.$refs.buttonContentWrapper?.$el;

      if (!buttonContentWrapper) {
        return;
      }

      if (buttonContentWrapper.contains(event.target)) {
        return;
      }

      this.open = false;
    },

    subscribeOnDocumentClick() {
      const document = getDocumentSafe();

      if (!document) {
        return;
      }

      const listener = event => this.closeOnBlurIfNeeded(event);

      document.addEventListener('click', listener);

      return () => document.removeEventListener('click', listener);
    }
  },
};
</script>

<style lang="scss">
</style>
