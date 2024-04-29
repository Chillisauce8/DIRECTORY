<script lang="ts">
import {useDialogData, useDialogInstance} from '~/service/dialog/core/dialog.composables';
import {useCurrentSection} from '~/service/helpers/current-section.factory';
export type ContactDialogData  = void;
export type ContactDialogResult = void;

export default {
  name: 'ContactDialog',
  setup() {
    const dialogData = useDialogData<ContactDialogData>();
    const dialogInstance = useDialogInstance<ContactDialogResult>();
    const currentSection = useCurrentSection();

    return {
      dialogData,
      dialogInstance,
      currentSection,
    };
  },
  data() {
    return {
      phoneNumbers: ['0729228288282'],
      sectionStoredInData: this.currentSection.get(),
      longSectionNameStoredInData: this.currentSection.getLongName(),
    };
  },
  methods: {
    exampleMethod() {
      return `example of access to long name of section ${ this.currentSection.get() }`;
      // return `example of access to long name of section ${ this.longSectionNameStoredInData }`;
    }
  }
}
</script>

<template>
  <TheDialog title="Contact"
             class="contact-dialog">


  <!--  <p>Example of the section: {{ sectionStoredInData }}</p>
    <p>Example of the long section name: {{ longSectionNameStoredInData }}</p> -->
    <div>{{ currentSection.getTeamName() }}</div>
    <div>Call Us: {{ currentSection.getPhone() }}</div>
    <div>Email Us: {{ currentSection.getEmail() }}</div>

  </TheDialog>
</template>

<style lang="scss">
.contact-dialog{

}
</style>
