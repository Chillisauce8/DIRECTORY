<template>
  <div class="package-review-stars">
    <div class="stars-input-text"> Please click a star to rate it</div>

    <StarRating
      :id="vm.id"
      :stars="vm.score"
      :disabled="vm.disabled"
      @click="onStarClick"
    />
  </div>
</template>


<script setup lang="ts">
interface PackageReviewStarsProps {
  productId: string;
  score: number;
  disabled: boolean;
}

interface PackageReviewStarsEmits {
  (e: 'starClick', event: MouseEvent, score: number): void;
}


const props = defineProps<PackageReviewStarsProps>();
const emits = defineEmits<PackageReviewStarsEmits>();

const vm = reactive({
  id: initId(props?.productId),
  score: props?.score,
  disabled: props?.disabled,
});


function initId(productId: string) {
  if (!productId) {
    return undefined;
  }

  return `review-${productId}`;
}

function onStarClick(event: MouseEvent, v: number) {
  emits('starClick', event, v);
}


watch(() => props?.productId, v => vm.id = initId(v));
watch(() => props?.score, v => vm.score = props.score);
watch(() => props?.disabled, v => vm.disabled = props.disabled);
</script>


<style lang="scss">
.package-review-stars {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  .stars-input-text {
    text-transform: uppercase;
    font-weight: 700;
    letter-spacing: 0.1em;
  }
  .stars {
    font-size: 3em;

    &::after {
      color: red;
    }
  }
}
</style>
