<template>
  <SuccessOrErrorMessage :isSuccessMessage="isSuccessMessage"
                         :iconName="iconName" :header="header"
                         :message="message" :buttonText="buttonLabel"
                          @click="onButtonClick()">
  </SuccessOrErrorMessage>
</template>

<script lang="ts">
import { useDataTemplateFabricService } from "~/service/helpers/data-templates/data-template-fabric.factory";

export default {
  name: "payment-result",
  props: ["isSuccessMessage", "message"],
  setup() {
    return {
      dataTemplateFabric: useDataTemplateFabricService(),
    }
  },
  data() {
    return {
      title: undefined,
      iconName: undefined,
      header: undefined,
      buttonLabel: undefined
    };
  },
  beforeMount() {
    this._getTemplateData();
  },
  methods: {
    onButtonClick() {
      this.$emit('click');
    },
    _getTemplateFieldName(): string {
      return this.isSuccessMessage ? 'successPage' : 'failurePage';
    },

    _getTemplateData() {
      let field = this._getTemplateFieldName();

      const dataTemplate = this.dataTemplateFabric.get({name: 'paymentPage'})
      this.title = dataTemplate.getValue(`${field}.title`);
      this.iconName = dataTemplate.getValue(`${field}.iconName`);
      this.header = dataTemplate.getValue(`${field}.header`);
      this.buttonLabel = dataTemplate.getValue(`${field}.buttonLabel`);
      this.inProgress = false;
    },
  }
};
</script>

<style scoped>

</style>
