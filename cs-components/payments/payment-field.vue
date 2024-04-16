<template>
  <template v-if="showField()">
    <div data-private class="field">
      <template v-if="!config.multiSelect">
        <CSFormField>
          <LazyCSSelect v-model="modelValue"
                    :option-list="config.selectOptions"
                    :placeholder="config.label"
                    label="title"
                    :disabled="disabled || config.disableField"
                    @update:modelValue="onModelUpdated($event)">
          </LazyCSSelect>
        </CSFormField>
      </template>

      <template v-if="config.multiSelect">
        <CSFormField>
          <LazyCSTagSelect v-model="modelValue"
                    :options-list="config.selectOptions"
                    :placeholder="config.label"
                    label="title"
                    :disabled="disabled || config.disableField"
                    @update:modelValue="onModelUpdated($event)">
          </LazyCSTagSelect>
        </CSFormField>
      </template>
    </div>
  </template>
</template>

<script lang="ts">

export interface IPaymentFieldConfig {
  showField: boolean;
  disableField: boolean;
  label: string;
  selectOptions: Array<IPaymentFieldSelectOption>;
  disabledOptions?: Array<string>;
  selectedOption?: string;
  selectedOptions?: Array<any>;
  multiSelect?: boolean;
}

interface IPaymentFieldSelectOption {
  title: string;
  value: string;
}

export default {
  name: "payment-field",
  props: ["config", "disabled"],

  data() {
    let modelValue;

    if (this.config.multiSelect) {
      if (this.config.selectedOptions) {
        modelValue = this.config.selectOptions.filter(item =>
          this.config.selectedOptions.map(item => item.value).includes(item.value))
          .map(item => item.value);
      } else {
        modelValue = [];
      }
    } else if (this.config.selectedOption) {
      modelValue = this.config.selectOptions.find(item => item.value === this.config.selectedOption);
    }

    return {
      modelValue,
    }
  },

  methods: {
    onModelUpdated(value) {
      this.$emit('change', value);
    },

    showField(): boolean {
      return this.config && (this.config.hasOwnProperty('showField') ? this.config.showField : true);
    },

    isOptionDisabled(value: string): boolean {
      if (!this.config.disabledOptions || !this.config.disabledOptions.length) {
        return false;
      }

      return this.config.disabledOptions.indexOf(value) !== -1;
    },
  }
};
</script>

<style lang="scss" scoped>

  .field {
    min-width: 150px;
    padding-top: 40px;
  }

</style>
