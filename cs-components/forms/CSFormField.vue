<script setup lang="ts">
import {CSFormFieldControlInjToken, CSFromFieldControl} from '~/utils/cs-form-field-contol';
import {eventEmitterTap} from '~/services/models/event-emitter-observable-helpers';

const currentInstance = getCurrentInstance();

const formFieldControl = new CSFromFieldControl();
provide(CSFormFieldControlInjToken, formFieldControl);


const vm = reactive({
  placeholder: '',
  inputIsFocused: false,
  inputHasValue: false,
  inputIsDisabled: false,
});


function subscribeOnControlEvents(): () => void {
  const placeholderChangeSub = formFieldControl
    .onPlaceholderChange()
    .pipe(
      eventEmitterTap(v => vm.placeholder = v),
    )
    .subscribe();

  const hasValueChangeSub = formFieldControl
    .onHasValueChange()
    .pipe(
      eventEmitterTap(v => vm.inputHasValue = v),
    )
    .subscribe();

  const isFocusedChangeSub = formFieldControl
    .onIsFocusedChange()
    .pipe(
      eventEmitterTap(v => vm.inputIsFocused = v),
    )
    .subscribe();

  const isDisabledChangeSub = formFieldControl
    .onIsDisabledChange()
    .pipe(
      eventEmitterTap(v => vm.inputIsDisabled = v),
    )
    .subscribe();

  return () => {
    placeholderChangeSub.unsubscribe();
    hasValueChangeSub.unsubscribe();
    isFocusedChangeSub.unsubscribe();
    isDisabledChangeSub.unsubscribe();
  };
}


subscribeOnControlEvents();


function getDefaultSlotInstance() {
  const defaultSlot = currentInstance?.slots?.default();

  return defaultSlot?.[0] ?? null;
}

function getDefaultPlaceholder(): string {
  const instance = getDefaultSlotInstance();

  if (!instance) {
    return null;
  }

  return instance.props?.placeholder ?? null;
}
</script>

<template>
  <div class="cs-form-field"
       :class="{'cs-form-field-disabled': vm.inputIsDisabled}">
    <div class="cs-form-field-content">
      <label class="cs-form-field-content-placeholder"
             :class="{'cs-form-field-content-placeholder-floating': vm.inputHasValue || vm.inputIsFocused}">{{ vm.placeholder }}</label>
      <div class="cs-form-field-content-input">
        <slot></slot>
      </div>
    </div>

    <div class="cs-form-field-spacer"></div>

    <div class="cs-form-field-suffix">
        <slot name="suffix">
          <p class="cs-form-field-suffix-placeholder"></p>
        </slot>
    </div>
  </div>
</template>

<style lang="scss">
$floating-elements-position: calc(0px - ($fc-placeholder-floating-text-size * $fc-font-line-height) - $fc-input-padding-x - $fc-input-margin-x);

.cs-form-field {
  display: flex;
  flex-direction: column;
  flex-grow: 1;

  width: 100%;
 // margin: calc($fc-placeholder-floating-text-size) 0; 
  padding-top: 0.8em; // Makes input fields a bit more space to breath.
  position: relative;

  &-disabled {
    .cs-form-field-content {
      &-placeholder {
        color: $fc-font-color-disabled;
      }
    }

    .cs-form-field-spacer {
      border-bottom: 1px $fc-border-color-disabled dashed;
    }
  }

  &-content {
    display: flex;
    flex-direction: row;
    flex-grow: 1;
    width: 100%;

    position: relative;

    &-placeholder {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-self: center;
      line-height: $fc-font-line-height;

      position: absolute;
      z-index: 0;
      top: calc(($fc-input-padding-x + $fc-input-margin-x) / 2);

      font-size: $fc-font-size;
      cursor: pointer;

      transition: all 200ms ease;

      &-floating {
        top: $floating-elements-position;

        font-size: $fc-placeholder-floating-text-size !important;
      }
    }

    &-input {
      position: relative;
      display: flex;
      flex-direction: row;
      flex: 1;
      padding: $fc-input-padding-x $fc-input-padding-y;
      margin: $fc-input-margin-x $fc-input-margin-y;
    }
  }

  &-spacer {
    width: 100%;
    height: 0;
    border-bottom: 1px $fc-border-color solid;
  }

  &-suffix {
    font-size: $fc-placeholder-floating-text-size;
    min-height: calc(1em + $fc-placeholder-floating-text-size);
  }
}
</style>