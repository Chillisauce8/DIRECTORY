<template>
    <div ref="selfRef" class="schema-form-array-of-values-field">
        <div v-if="sharedFunctions?.shouldBeConstructed(props.description)" v-show="!props.description.xHideValue">
            <div v-for="(line, index) in vm.model" :key="index">
                <p class="label flex-none" v-if="props.description.title && index === 0">
                    {{ sharedFunctions.getTitle() }}

                    <span v-if="sharedFunctions.getDescriptionText()" v-tooltip.bottom="sharedFunctions.getDescriptionText()">
                        <i class="pi pi-question padding_-5"></i>
                    </span>
                </p>

                <p class="label flex-none" v-if="props.description.title && index !== 0"></p>

                <div class="flex" v-if="sharedFunctions.shouldItemBeConstructed(vm.rowDescriptions[index], index)">
                    <DynamicControl :description="vm.rowDescriptions[index]" :model="vm.model[index]" @modelChange="onModelChange($event)" :context="sharedFunctions.createInnerFieldContext(props.description.name, index)" :noPlaceholder="true">
                    </DynamicControl>
                </div>

                <SpeedDial :model="createSpeedDialItems(index)" v-if="!sharedFunctions.isReadonly()" direction="left" :style="{ top: 'calc(50% - 2rem)', right: 0 }" />
            </div>

            <div class="empty row start-center" v-if="!vm?.model?.length">
                <p class="label flex">
                    {{ sharedFunctions.getTitle() }}

                    <span v-if="sharedFunctions.getDescriptionText()" v-tooltip.bottom="sharedFunctions.getDescriptionText()">
                        <i class="pi pi-question padding_-5"></i>
                    </span>
                </p>

                <Button icon="pi pi-plus" aria-label="Add First Row" v-if="!sharedFunctions.isReadonly() && sharedFunctions.canAddMore()" @click="sharedFunctions.addFirstRow()"> </Button>
            </div>

            <div v-if="!sharedFunctions.isValidMaxItems()" class="text-color_red field_wrap">Max items value is {{ props.description.xMaxItemsValue }}</div>

            <div v-if="!sharedFunctions.isValidMinItems()" class="text-color_red field_wrap">Min items value is {{ props.description.xMinItemsValue }}</div>

            <div v-if="!sharedFunctions.ifValidUniqueItems()" class="text-color_red field_wrap">Items are not unique</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import useBaseArrayFieldControl from '~/composables/schema-forms/useBaseArrayFieldControl';
import type { BaseFieldEmits, BaseFieldProps } from '~/composables/schema-forms/useBaseField';
import { getCurrentInstance } from 'vue';

// @ts-ignore
const props = defineProps<BaseFieldProps>();
// @ts-ignore
const emits = defineEmits<BaseFieldEmits>();

const selfRef = ref(null);

const { vm, sharedFunctions } = useBaseArrayFieldControl(props, emits);

onMounted(() => {
    const instance = getCurrentInstance();

    const parentObjectField = sharedFunctions.getParentByName(instance, 'ObjectField');
    const parentDynamicControl = sharedFunctions.getParentByName(instance, 'DynamicControl');
    const parentGroupField = sharedFunctions.getParentByName(instance, 'FormGroup');
    const schemaForm = sharedFunctions.getParentByName(instance, 'SchemaForm');

    const refs = {
        self: instance,
        form: {
            formName: schemaForm?.props.formName,
            needCorrectExistingValues: true
        },
        parentObjectField: parentObjectField,
        parentGroupField: parentGroupField,
        parentDynamicControl: parentDynamicControl
    };

    sharedFunctions.setRefs(refs);

    sharedFunctions.doOnMounted();
});

onDeactivated(() => {
    sharedFunctions.onDeactivated();
});

function createSpeedDialItems(index: number) {
    return [
        {
            icon: 'pi-plus',
            command: () => sharedFunctions.addRowAfter(index),
            visible: () => sharedFunctions.canAddMore()
        },
        {
            icon: 'pi-times',
            command: () => sharedFunctions.deleteRow(index),
            visible: () => sharedFunctions.canRemoveMore()
        },
        {
            icon: 'pi-chevron-up',
            command: () => sharedFunctions.moveRowUp(index)
        },
        {
            icon: 'pi-chevron-down',
            command: () => sharedFunctions.moveRowDown(index)
        }
    ];
}

function createModelRow() {
    return null;
}

function onModelChange($event: any) {
    vm.model = $event;
    emits('modelChange', vm.model);
}

function isValid(): boolean {
    return sharedFunctions.isValidMaxItems() && sharedFunctions.isValidMinItems() && sharedFunctions.ifValidUniqueItems();
}

function touch() {
    //
}

sharedFunctions.createModelRow = createModelRow;
sharedFunctions.isValid = isValid;
sharedFunctions.touch = touch;
</script>

<style></style>
