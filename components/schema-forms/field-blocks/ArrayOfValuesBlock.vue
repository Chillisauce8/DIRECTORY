<template>
    <div class="field-wrapper" :class="innerComponentName" :id="props.description.id">
        <template v-if="initDone && sharedFunctions?.shouldBeConstructed(props.description)" v-show="!props.description.xHideValue">
            <label v-if="props.description.title">
                {{ sharedFunctions.getTitle() }}

                <span v-if="sharedFunctions.getDescriptionText()" v-tooltip.bottom="sharedFunctions.getDescriptionText()">
                    <i class="pi pi-question padding_-5"></i>
                </span>
            </label>
            <template v-for="(line, index) in vm.model" :key="index">
                <template v-if="sharedFunctions.shouldItemBeConstructed(vm.rowDescriptions[index], index)">
                    <DynamicField
                        :description="vm.rowDescriptions[index]"
                        :model="vm.model[index]"
                        @modelChange="onModelChange($event, index)"
                        :context="sharedFunctions.createInnerFieldContext(props.description.name, index)"
                        :index="index"
                        :noWrapper="true"
                        @initDone="onControlInitDone($event)"
                        :formLabelType="props.formLabelType"
                        :floatLabelVariant="props.floatLabelVariant"
                    >
                        <SpeedDial :model="createSpeedDialItems(index)" v-if="!sharedFunctions.isReadonly()" direction="left" style="position: relative" />
                    </DynamicField>
                </template>
            </template>

            <div class="empty row start-center" v-if="!vm?.model?.length">
                <Button icon="pi pi-plus" aria-label="Add First Row" v-if="!sharedFunctions.isReadonly() && sharedFunctions.canAddMore()" @click="sharedFunctions.addFirstRow()"> </Button>
            </div>

            <div v-if="!sharedFunctions.isValidMaxItems()" class="text-color_red field_wrap">Max items value is {{ props.description.xMaxItemsValue }}</div>

            <div v-if="!sharedFunctions.isValidMinItems()" class="text-color_red field_wrap">Min items value is {{ props.description.xMinItemsValue }}</div>

            <div v-if="!sharedFunctions.ifValidUniqueItems()" class="text-color_red field_wrap">Items are not unique</div>
        </template>
    </div>
</template>

<script setup lang="ts">
import useBaseArrayFieldControl from '~/composables/schema-forms/useBaseArrayFieldControl';
import type { BaseFieldEmits, BaseFieldProps } from '~/composables/schema-forms/useBaseField';
import { getCurrentInstance } from 'vue';
import type { FormLabelType, FloatLabelVariant } from '~/types/schema-forms';

interface ArrayValuesProps extends BaseFieldProps {
    formLabelType?: FormLabelType;
    floatLabelVariant?: FloatLabelVariant;
}

// @ts-ignore
const props = defineProps<ArrayValuesProps>();
// @ts-ignore
const emits = defineEmits<BaseFieldEmits>();

const innerComponentName = ref();

const { vm, sharedFunctions, initDone } = useBaseArrayFieldControl(props, emits);

onMounted(() => {
    const instance = getCurrentInstance();
    sharedFunctions.doOnMounted(instance);
});

onDeactivated(() => {
    sharedFunctions.onDeactivated();
});

function createSpeedDialItems(index: number) {
    return [
        {
            icon: 'pi pi-plus',
            command: () => sharedFunctions.addRowAfter(index),
            visible: () => sharedFunctions.canAddMore()
        },
        {
            icon: 'pi pi-times',
            command: () => sharedFunctions.deleteRow(index),
            visible: () => sharedFunctions.canRemoveMore()
        },
        {
            icon: 'pi pi-chevron-up',
            command: () => sharedFunctions.moveRowUp(index)
        },
        {
            icon: 'pi pi-chevron-down',
            command: () => sharedFunctions.moveRowDown(index)
        }
    ];
}

function createModelRow() {
    return null;
}

function onModelChange($event: any, index: number) {
    vm.model[index] = $event;
    emits('modelChange', vm.model);
}

function isValid(): boolean {
    return sharedFunctions.isValidMaxItems() && sharedFunctions.isValidMinItems() && sharedFunctions.ifValidUniqueItems();
}

function touch() {
    //
}

function onControlInitDone($event: any) {
    innerComponentName.value = $event.componentName;
}

sharedFunctions.createModelRow = createModelRow;
sharedFunctions.isValid = isValid;
sharedFunctions.touch = touch;
</script>

<style></style>
