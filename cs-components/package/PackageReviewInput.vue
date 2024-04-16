<template>
  <reveal-content :open="vm.open" class="package-review-input">
    <textarea
      type="text-area"
      placeholder="Thanks for the stars - Could you add some thoughts?"
      rows="5"
      v-model="vm.comment"
      :disabled="vm.disabled"
    >
    </textarea>

    <ButtonMain
      text="Save Review"
      :disabled="vm.disabled"
      @click="onSaveClick"
    />
  </reveal-content>
</template>


<script setup lang="ts">
interface PackageReviewInputProps {
  open: boolean;
  comment: string;
  disabled: boolean;
}

interface PackageReviewInputEmits {
  (e: 'click', comment: string): void;
}


const props = defineProps<PackageReviewInputProps>();
const emits = defineEmits<PackageReviewInputEmits>();

const vm = reactive({
  open: props?.open,
  comment: props?.comment,
  disabled: props?.disabled,
});


function onSaveClick() {
  if (vm.disabled) {
    return;
  }

  emits('click', vm.comment);
}


watch(() => props?.open, v => vm.open = v);
watch(() => props?.comment, v => vm.comment = v);
watch(() => props?.disabled, v => vm.disabled = v);
</script>


<style lang="scss">
.package-review-input{
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  textarea{
    padding: 0.3em;
    display: flex;
    justify-content: flex-end;
    border: 1px solid $CB-3;
    width: 90%;
    font-size: 1.5em;
//    height: 200px;
    margin: 5%;
  }
}
</style>
