<template>
  <transition name="wrapper" @after-leave="destroyContainerIfNeeded">
    <dialog-wrapper v-show="dataState.dialogConfigList.length"
                    @click.native="wrapperClick">
      <template v-for="(dialogConfig, index) in dataState.dialogConfigList">
        <transition name="dialog" mode="out-in" @after-leave="handleDialogClose(dialogConfig)">
          <dialog-component-renderer class="cs-dialog"
                                      :config="dialogConfig?.params?.config"
                                      :dialogInstance="dialogConfig?.params?.dialogInstance"
                                      :component="dialogConfig?.params?.component"
                                      v-if="dialogConfig"
                                      v-show="dialogConfig.visible"
                                      :style="{'z-index': 10 + index}"
                                      @mousedown.native="rendererMouseDown">
          </dialog-component-renderer>
        </transition>
      </template>
    </dialog-wrapper>
  </transition>
</template>

<script setup lang="ts">
import type {OpenDialogParams} from '~/service/dialog/core/dialog-notification.service';
import {useDialogNotificationService} from '~/service/dialog/core/dialog-notification.service';
import {nextTick, onMounted, onUnmounted, reactive, toRaw} from 'vue';
import {addEventListenerSafe, getDocumentSafe, getWindowSafe} from '~/service/helpers/browser/browser.helpers';
import {useDialogContainerCreator} from '~/service/dialog/core/dialog-container-creator';
import type {CoreDialogConfig} from '~/service/dialog/core/dialog.typings';
import {EventEmitterSubscription} from '~/service/models/event-emitter-observable';
import {eventEmitterTake, eventEmitterTap} from '~/service/models/event-emitter-observable-helpers';


interface DialogConfigListItem {
  params: OpenDialogParams;
  visible?: boolean;
  closed?: boolean;
}


interface GlobalDialogContainerVM {
  dialogConfigList: DialogConfigListItem[];
  visibleDialog: DialogConfigListItem;
}


const dialogContainerCreator = useDialogContainerCreator();
const dialogNotificationService = useDialogNotificationService();
const router = useRouter();
const currentInstance = getCurrentInstance();


const dataState = reactive<GlobalDialogContainerVM>({
  dialogConfigList: [],
  visibleDialog: null,
});

const evenListenerRemoverList = [];
const subscriptionsList: EventEmitterSubscription<OpenDialogParams>[] = [];

let renderedDialogMouseDown = false;

function closeTopDialogIfPossible(): void {
  const dialogParams = dataState.visibleDialog?.params as OpenDialogParams<any>;

  if (!dialogParams) {
    return;
  }

  if ((dialogParams?.config as CoreDialogConfig)?.disableClose) {
    return;
  }

  dialogParams.dialogInstance.cancel();
}

function closeDialogFromListOnNavigationEvent(): void {
  getActualDialogConfigList()
    .filter(p => (p?.params?.config)?.closeOnNavigation !== false)
    .forEach(p => {
      markDialogClosed(p as any);
      markDialogLeaving(p as any);
    });

}

function getActualDialogConfigList(): DialogConfigListItem[] {
  return dataState.dialogConfigList
    .filter(i => i !== null) as DialogConfigListItem[];
}

function handleDialogClose(config: DialogConfigListItem): void {
  if (config?.closed) {
    const index = dataState.dialogConfigList.indexOf(config);

    dataState.dialogConfigList[index] = null;
  }

  if (dataState.dialogConfigList.every(i => i === null)) {
    dataState.dialogConfigList = [];
  }
}

function markDialogLeaving(dialogConfig: DialogConfigListItem): void {
  dialogConfig.visible = false;

  markPreviousDialogVisible();

  currentInstance.proxy.$forceUpdate();
}

function markDialogClosed(dialogConfig: DialogConfigListItem): void {
  if (!dialogConfig) {
    return;
  }

  dialogConfig.closed = true;
  currentInstance.proxy.$forceUpdate();
}

function getPreviousDialogConfig(): DialogConfigListItem {
  return getActualDialogConfigList()
    .filter(i => i !== dataState.visibleDialog)
    .reverse()
    .find(c => !c?.closed) as DialogConfigListItem ?? null;
}

function markPreviousDialogVisible() {
  const config = getPreviousDialogConfig();

  if (!config) {
    return;
  }

  if (config?.closed) {
    return;
  }

  config.visible = true;
  dataState.visibleDialog = config;
}

function markPreviousDialogHidden() {
  const config = getPreviousDialogConfig();

  if (!config) {
    return;
  }

  config.visible = false;
}

function handleDialogOpen(params: OpenDialogParams): void {
  dataState.dialogConfigList.push({params, visible: false});

  const config = dataState.dialogConfigList[dataState.dialogConfigList.length - 1];

  dataState.visibleDialog = config;

  nextTick(() => {
    markPreviousDialogHidden();

    config.visible = true;
  });

  params.dialogInstance.onResultPublish()
    .pipe(
      eventEmitterTake(1),
      eventEmitterTap(() => markDialogClosed(config as any)),
      eventEmitterTap(() => markDialogLeaving(config as any)),
    )
    .subscribe();
}

function destroyContainerIfNeeded() {
  if (dataState.dialogConfigList.length) {
    return;
  }

  dialogContainerCreator.removeDialogContainer();
}

function addNavigationEventListeners(): void {
  const window = getWindowSafe();

  if (!window) {
    return;
  }

  const handler = () => {
    closeDialogFromListOnNavigationEvent();
  }

  evenListenerRemoverList.push(
    addEventListenerSafe(window, 'popstate', handler),
    addEventListenerSafe(window, 'hashchange', handler),
  );

  if (router) {
    evenListenerRemoverList.push(
      router.afterEach(() => handler()),
    );
  }
}

function addEscapeButtonPressListener() {
  const document = getDocumentSafe();

  const handler = (event: KeyboardEvent) => {
    if (event.code !== 'Escape') {
      return;
    }

    closeTopDialogIfPossible();
  };

  evenListenerRemoverList.push(
    addEventListenerSafe(document, 'keydown', handler),
  );
}

function stopDialogClickPropagation(name: string, event: MouseEvent): void {
  event.stopPropagation();
  event.preventDefault();
}

function subscribeOnDialogOpenEvent() {
  const sub = dialogNotificationService.onDialogOpened()
    .subscribe(dialogParams => handleDialogOpen(dialogParams));

  subscriptionsList.push(sub);
}


onMounted(() => {
  subscribeOnDialogOpenEvent();
  addNavigationEventListeners();
  addEscapeButtonPressListener();
});

onUnmounted(() => {
  subscriptionsList.forEach(s => s.unsubscribe());
  subscriptionsList.splice(0, evenListenerRemoverList.length);

  evenListenerRemoverList.forEach(r => r());
  evenListenerRemoverList.splice(0, evenListenerRemoverList.length);
});

function wrapperClick(event: Event) {
  if (renderedDialogMouseDown) {
    renderedDialogMouseDown = false;

    return;
  }

  const dialogWrapperClass = 'dialog-wrapper';

  if ((event?.target as HTMLElement)?.classList.contains(dialogWrapperClass)) {
    closeTopDialogIfPossible();
  }
}

function rendererMouseDown(event: Event): void {
  if (event.type !== 'mousedown') {
    return;
  }

  renderedDialogMouseDown = true;
}

</script>

<style lang="scss">
.dialog-wrapper {
  &.wrapper-enter-active {
    animation: wrapper-in 1.5s linear both;
  }
  &.wrapper-leave-active {
    animation: wrapper-out 1s linear both;
  }

  .the-dialog {
    &.dialog-enter-active {
      position: absolute;
      animation: dialog-in 1s ease 0.5s both;
    }

    &.dialog-leave-active {
      position: absolute;
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
