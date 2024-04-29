<script setup lang="ts">
import {useEnquiryFormDialogShowService} from '~/service/dialog/enquiry-form-dialog-show.service';
import {useDialogInstance} from '~/service/dialog/core/dialog.composables';


const dialogInstance = useDialogInstance();
const enquiryFormDialogShowService = useEnquiryFormDialogShowService();


async function showEnquiryForm() {
  const result = await enquiryFormDialogShowService.show({mergeRules: {checkStartDateOnly: true}});

  if (result?.cancelled) {
    return;
  }

  dialogInstance.close();
}
</script>

<template>
  <TheDialog title="My Events" subTitle="Click on any of your events to view full details">
    <EventSwitch></EventSwitch>

    <div class="Column Center">
      <ButtonMain @click.native="showEnquiryForm">Add New Event</ButtonMain>
    </div>
  </TheDialog>
</template>

<style scoped lang="scss">

</style>
