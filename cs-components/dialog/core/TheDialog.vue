<template>
  <section class="the-dialog" :class="{ fullscreen: dataState.config.fullscreen, 'no-close': hideCloseButton }">
    <div class="top Row Y-Center" :class="{ fullscreen: dataState.config.fullscreen, 'no-close': hideCloseButton }">
      <template v-if="!dataState.config.title">
        <div class="header-content">
          <slot name="header-content"></slot>
        </div>
      </template>

      <div class="title" v-if="dataState.config.title">{{ dataState.config.title }}</div>

      <CloseButton id="dialog-close-button"
                   v-if="!hideCloseButton"
                   :style="{opacity: dataState.config.hideCloseButton ? 0 : 1}"
                   @click="cancelModal()" />

    </div>

    <div class="content" :class="classes">
      <div v-if="dataState.config.subTitle" class="sub-title">{{dataState.config.subTitle}}</div>
      <slot/>
    </div>
  </section>
</template>

<script setup lang="ts">
import { inject, reactive, watch } from 'vue';
import {DialogInstance, DialogInstanceInjToken} from '~/service/dialog/core/dialog-instance';
import type {CoreDialogConfig} from '~/service/dialog/core/dialog.typings';
import {DialogConfigInjToken} from '~/service/dialog/core/dialog.typings';
import {useDialogInstance} from '~/service/dialog/core/dialog.composables';
import {defaultCloseButtonClickHandlerFactory} from '~/service/dialog/core/dialog.helpers';


export interface DialogProps {
  title?: string;
  subTitle?: string;
  fullscreen?: boolean;
  stretchContent?: boolean;
  hideCloseButton?: boolean;
  hideOverflow?: boolean;
}


export interface DialogEmits {
  (e: 'dialog:closeClick'): void;
}


const props = defineProps<DialogProps>();
const emits = defineEmits<DialogEmits>();

const {title, subTitle, fullscreen, stretchContent, hideOverflow} = props;

const dialogConfig = inject<CoreDialogConfig<any>>(DialogConfigInjToken);
const dialogInstance = useDialogInstance<any>(DialogInstanceInjToken);


const dataState = reactive({
  config: {title, subTitle, fullscreen, stretchContent, hideOverflow, ...dialogConfig},
});

const classes = computed(() => {
  return {
    'stretch-content': dataState.config.stretchContent,
    'no-overflow': dataState.config.hideOverflow,
  };
});

watch(() => props.fullscreen, v => dataState.config.fullscreen = v);
watch(() => props?.stretchContent, v => dataState.config.stretchContent = v);

const cancelModal = defaultCloseButtonClickHandlerFactory();

function setHtmlOverflowY(value: string) {
  const elements = document.getElementsByTagName('html');

  if (elements?.length > 0) {
    elements[0].style.overflowY = value;
  }
}

onMounted(() => {
  if (fullscreen) {
    setHtmlOverflowY('hidden');
  }
});

onUnmounted(() => {
  if (fullscreen) {
    setHtmlOverflowY('auto');
  }
});
</script>

<style lang="scss">
.the-dialog {
  background-color: $CB;
  font-family: $ff2;
  & .no-close {
    .title, .header-content {
      width: 100% !important;
    }
  }
  & .top {
    display: flex;
    justify-content: flex-end;
    height: 64px;
    text-align: center;
    background-color: $CB-05;
    & .title, .header-content {
      width: calc(100% - 128px);
      font-family: $ff2;
      text-transform: uppercase;
      @include desktop{
        font-size: 20px;
        letter-spacing: 5px;
      }
      @include mobile{
        font-size: 18px;
        letter-spacing: 3px;

      }
    }
    .header-content {
      width: calc(100% - 128px);
    }
  }
  & .content {
    max-height: calc(100% - 64px);
    overflow: auto;
    padding: clamp( 20px, 10%, 50px );
    & > .sub-title {
        font-size: 0.85em;
        position: relative;
        top: -1.2em;
        text-align: center;
      }
    & .button-main:not(.list-button){
      margin-top: 2em;
    }
    &.stretch-content {
      height: calc(100% - 64px);
    }
    &.no-overflow {
      overflow: hidden;
    }
  }
  &.fullscreen {
    @include desktop {
      width: 90%;
      height: 90%;
    }
    @include mobile {
      width: 100%;
      height: 100%;
    }
    & .content{
      @include desktop{
        padding-top: 20px;
      }
      @include mobile{
        padding: 5%;
      }
    }
  }
  &.large {
    width: 700px !important;
  }
  &.x-large {
    width: 900px !important;
  }
  &:not(.fullscreen) {
    width: clamp(320px, 95vw, 560px);
    min-height: clamp(320px, 50vw, 400px);
    max-height: 95vh;
  }
}
.dialog-wrapper {
  &.wrapper-enter-active {
    animation: wrapper-in 1.5s linear both;
    & .the-dialog {
      animation: dialog-in 1s ease 0.5s both;
    }
  }
  &.wrapper-leave-active {
    animation: wrapper-out 1s linear both;
    & .the-dialog {
      animation: dialog-out 0.4s ease-in both;
    }
  }
}

@keyframes wrapper-in {
  0% {
    background: rgba(0, 0, 20, 0);
  }
  33% {
    background: rgba(0, 0, 20, 0.8);
  }
}
@keyframes dialog-in {
  0% {
    transform: translateY(100vh);
  }
}

@keyframes wrapper-out {
  50% {
    background: rgba(0, 0, 20, 0.8);
  }
  100% {
    background: rgba(0, 0, 20, 0);
  }
}
@keyframes dialog-out {
  100% {
    transform: translateY(100vh);
  }
}
</style>
