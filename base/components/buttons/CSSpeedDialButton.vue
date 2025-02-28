<script setup lang="ts">
enum CSSpeedDialButtonDirection {
  left = 'left',
  right = 'right',
  top = 'top',
  bottom = 'bottom',
}


enum CSSpeedDialButtonTrigger {
  click = 'click',
  mouseenter = 'mouseenter',
}


type CSSpeedDialButtonDirectionItems = CSSpeedDialButtonDirection.left |
    CSSpeedDialButtonDirection.right |
    CSSpeedDialButtonDirection.top |
    CSSpeedDialButtonDirection.bottom;


type CSSpeedDialButtonTriggerItems = CSSpeedDialButtonTrigger.click | CSSpeedDialButtonTrigger.mouseenter;



interface CSSpeedDialButtonProps {
  trigger?: CSSpeedDialButtonTriggerItems;
  direction?: CSSpeedDialButtonDirectionItems;
}


interface CSSpeedDialButtonVM extends CSSpeedDialButtonProps {
  opened?: boolean;
}


const props = defineProps<CSSpeedDialButtonProps>();

const vm = reactive<CSSpeedDialButtonVM>({
  trigger: props?.trigger ?? CSSpeedDialButtonTrigger.mouseenter,
  direction: props?.direction ?? CSSpeedDialButtonDirection.left,
});

const targetContainer = ref<Element>();

const directionClassName = computed(() => {
  const directionName = isHorizontalDirection() ? 'horizontal' : 'vertical';

  return `direction-${directionName}`;
});

const needShowTriggerLast = computed(() => !isHorizontalDirection());

const actionsContainerStyles = computed(() => {
  if (!targetContainer?.value) {
    return 0;
  }

  const el = targetContainer.value;

  const {width, height} = el.getBoundingClientRect();

  if (vm.direction === CSSpeedDialButtonDirection.left) {
    return {right: width + 'px'};
  } else if (vm.direction === CSSpeedDialButtonDirection.right) {
    return {left: width + 'px'};
  } else if (vm.direction === CSSpeedDialButtonDirection.top) {
    return {bottom: height + 'px'};
  } else if (vm.direction === CSSpeedDialButtonDirection.bottom) {
    return {top: height + 'px'};
  }
});

const opened = computed(() => vm.opened === true);


function isHorizontalDirection(): boolean {
  return [CSSpeedDialButtonDirection.left, CSSpeedDialButtonDirection.right].indexOf(vm.direction as any) !== -1;
}


function open(): void {
  vm.opened = true;
}

function close(): void {
  vm.opened = false;
}

function onHostClick(event: MouseEvent): void {
  if (!opened) {
    return;
  }

  close();
}

function onHostMouseLeave(event: MouseEvent): void {
  if (vm.trigger !== CSSpeedDialButtonTrigger.mouseenter) {
    return;
  }

  if (!opened) {
    return;
  }

  close();
}

function onTriggerClick(event: MouseEvent): void {
  if (vm.trigger !== CSSpeedDialButtonTrigger.click) {
    return;
  }

  event.stopPropagation();
  event.preventDefault();

  open();
}

function onTriggerMouseEnter(event: MouseEvent): void {
  if (vm.trigger !== CSSpeedDialButtonTrigger.mouseenter) {
    return;
  }

  open();
}
</script>

<template>
  <div class="cs-speed-dial-button"
       :class="[directionClassName]"
       @click="onHostClick($event)"
       @mouseleave="onHostMouseLeave($event)">
    <div class="cs-speed-dial-button-target-container"
         :class="{'show-last': needShowTriggerLast}"
         ref="targetContainer"
         @click="onTriggerClick($event)"
         @mouseenter="onTriggerMouseEnter($event)">
      <slot name="speed-dial-target"></slot>
    </div>

    <div class="cs-speed-dial-button-actions-container"
         :style="actionsContainerStyles"
         :class="[directionClassName, opened ? 'opened' : null]">
      <slot name="speed-dial-actions"></slot>
    </div>
  </div>
</template>

<style lang="scss">
.cs-speed-dial-button {
  position: relative;
  display: flex;

  .direction-vertical {
    flex-direction: column;
  }

  .direction-horizontal {
    flex-direction: row;
  }

  &-target-container {
    .show-last {
      order: 2;
    }
  }

  &-actions-container {
    display: flex;
    position: absolute;
    transform: scale(0);
    opacity: 0;
    z-index: 9999;

    &.opened {
      animation: roll .5s ease both;
    }
  }
}

@keyframes roll {
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style>