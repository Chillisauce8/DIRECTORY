<template>
  <div
    ref="starsEl"
    class="stars"
    :style="styles"
    :id="vm.id"
    @mousemove="onMouseMove"
    @mouseleave="onMouseLeave"
    @click="onMouseClick"
  >
  </div>
</template>

<script setup lang="ts">
interface StarRatingProps {
  stars: number;
  starsCount?: number;
  id?: string;
  disabled?: boolean;
}

interface StarRatingEmits {
  (e: 'click', event: MouseEvent, score: number): void;
}


const props = defineProps<StarRatingProps>();
const emits = defineEmits<StarRatingEmits>();

const vm = reactive({
  stars: props?.stars,
  starsCount: props?.starsCount || 5,
  selectedStar: 0,
  id: props?.id,
  disabled: props?.disabled,
  isMouseOver: false,
});

const starsEl = ref(null);


function onMouseMove(e: MouseEvent) {
  if (!vm.id || vm.disabled) {
    return;
  }

  vm.isMouseOver = true;

  const x = e.offsetX;
  vm.selectedStar = x > 0 ? Math.ceil(x / starWidth.value) : 0;
}

function onMouseLeave() {
  if (!vm.id || vm.disabled) {
    return;
  }

  vm.isMouseOver = false;
  vm.selectedStar = 0;
}

function onMouseClick(e: MouseEvent) {
  if (!vm.id || vm.disabled) {
    return;
  }

  e.stopPropagation();
  e.preventDefault();

  emits('click', e, vm.selectedStar);
}


const styles = computed(() => {
  return {
    "--rating": (vm.id ? (vm.isMouseOver ? vm.selectedStar : vm.stars) || 0 : vm.stars) || 0,
  };
});

const starWidth = computed(() => {
  if (!vm.id) {
    return 0;
  }

  const fullWidth = starsEl.value?.offsetWidth;

  if (!fullWidth) {
    return 0;
  }

  return fullWidth / vm.starsCount;
});


watch(() => props?.stars, v => vm.stars = v);
watch(() => props?.disabled, v => vm.disabled = v);
</script>
<style lang="scss">


.stars {
  --percent: calc(var(--rating) / 5 * 100%);
  position: relative;
  display: inline-block;
  font-family: Times; // make sure ★ appears correctly
  &::before {
    font-family: Times;
    content: "☆☆☆☆☆";
  }
  &::after {
    font-family: Times;
    content: "★★★★★";
    position: absolute;
    top: 0px;
    right: 0px;
    bottom: 0px;
    left: 0px;
    width: var(--percent);
    height: 100%;
    overflow: hidden;
  }
}
</style>
