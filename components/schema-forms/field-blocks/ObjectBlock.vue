<template>
    <!-- Main section that wraps the object block, only shows if conditions are met -->
    <section :class="sharedFunctions.prepareClasses()" v-if="sharedFunctions?.shouldBeConstructed(props.description.header)" v-show="!props.description.xHideValue" :id="props.description.id">
        <!-- Title section with optional tooltip -->
        <h1 class="title" v-if="props.description.header.title">
            {{ sharedFunctions.getTitle() }}
            <i class="icon icon-question-mark" v-if="sharedFunctions.getDescriptionText()" v-tooltip.bottom="sharedFunctions.getDescriptionText()"></i>
        </h1>

        <!-- Loops through each line of fields -->
        <template v-for="(line, lineIndex) in vm.lines" v-show="!isAllLineHidden(line)">
            <div class="field-block">
                <template v-for="item in line">
                    <template v-if="shouldItemBeConstructed(item)" v-tooltip.bottom="item.description.description">
                        <DynamicField
                            v-if="item.blockComponent === BlockComponents.value"
                            :description="item.description"
                            :model="vm.model[item.description.name]"
                            @modelChange="onModelChange(item.description.name, $event)"
                            :context="sharedFunctions.createInnerFieldContext(props.description.name, index)"
                            :formLabelType="props.formLabelType"
                            :floatLabelVariant="props.floatLabelVariant"
                        >
                        </DynamicField>

                        <DynamicFieldBlock v-if="item.blockComponent !== BlockComponents.value" :description="item" :context="vm.context" :model="vm.model" @modelChange="onModelChange(null, $event)"> </DynamicFieldBlock>
                    </template>
                </template>
            </div>
        </template>
    </section>
</template>

<script setup lang="ts">
import { onMounted, getCurrentInstance } from 'vue';
import type { BaseFieldEmits, BaseFieldProps } from '~/composables/schema-forms/useBaseField';
import useBaseField from '~/composables/schema-forms/useBaseField';
import { isObject } from '~/service/utils';
import DynamicFieldBlock from '~/components/schema-forms/DynamicFieldBlock.vue';
import DynamicField from '~/components/schema-forms/DynamicField.vue';
import { BlockComponents } from '~/service/schema-forms/blockComponents';
import type { FormLabelType, FloatLabelVariant } from '~/types/schema-forms';

// Interface extending base props with form label customization options
interface ObjectProps extends BaseFieldProps {
    formLabelType?: FormLabelType;
    floatLabelVariant?: FloatLabelVariant;
}

// Component setup and initialization
const props = defineProps<ObjectProps>();
const emits = defineEmits<BaseFieldEmits>();

let { vm, sharedFunctions } = useBaseField(props, emits);

const initFieldBase = sharedFunctions.initField;

vm.lines = [];

sharedFunctions.initField = initField;

/**
 * Initializes the field by:
 * 1. Setting up the model as an empty object if invalid
 * 2. Creating line arrays for field layout
 * 3. Handling required fields and default values
 * 4. Organizing content into lines based on x-line property
 */
function initField(): void {
    initFieldBase();

    if (!vm.model || !isObject(vm.model) || Array.isArray(vm.model)) {
        vm.model = {};
    }

    vm.lines = [[]];

    if (vm.model === undefined || vm.model === null) {
        if (props.description.header.required) {
            sharedFunctions.createModel();
        } else if (!props.description.header.xClose || props.description.header.xClose.default === false) {
            sharedFunctions.createModel();
        }
    }

    if (vm.model && !Object.keys(vm.model).length) {
        if (props.description.header.xClose && props.description.header.xClose.default === true) {
            sharedFunctions.deleteModel();
        }
    }

    props.description.content.forEach((item: any) => {
        const description = item.description;

        let lineNumber = 0;
        if (description.xLine || description.rawData.line) {
            lineNumber = (description.xLine || description.rawData.line) - 1; // x-line uses lines starts form 1
            while (lineNumber >= vm.lines.length) {
                vm.lines.push([]);
            }
        }

        vm.lines[lineNumber].push(item);
    });
}

// Lifecycle hooks for component initialization and cleanup
onMounted(() => {
    const instance = getCurrentInstance();
    sharedFunctions.doOnMounted(instance);
});

onDeactivated(() => {
    sharedFunctions.onDeactivated();
});

/**
 * Checks if all elements in a line should be hidden
 * Returns true if every element in the line is either hidden, removed, or shouldn't be constructed
 */
function isAllLineHidden(line: Array<any>): boolean {
    return line.every((elem: any) => {
        return elem.description.xHideValue || elem.description.xRemoveValue || !sharedFunctions.shouldBeConstructed(elem.description, undefined, null, false);
    });
}

/**
 * Determines if the title should be shown for a specific line
 * Shows title only for the first visible line
 */
function shouldShowTitle(lineIndex: number): boolean {
    const firstDisplayedLineIndex = vm.lines.findIndex((line: any) => !isAllLineHidden(line));
    return firstDisplayedLineIndex === lineIndex;
}

/**
 * Handles model changes:
 * - For individual fields: updates specific property in model
 * - For entire objects: replaces whole model
 * Emits the updated model to parent component
 */
function onModelChange(descriptionName: string | null, $event: any) {
    if (descriptionName) {
        const modelClone = { ...vm.model };
        modelClone[descriptionName] = $event;
        vm.model = modelClone;
    } else {
        vm.model = $event;
    }

    emits('modelChange', vm.model);
}

/**
 * Determines if a field item should be constructed/shown
 * Keeps track of previous state to handle conditional rendering
 */
function shouldItemBeConstructed(item: any): boolean {
    const result = sharedFunctions.shouldBeConstructed(item.description, null, item.shouldItemBeConstructedPrevValue || null);

    if (item.shouldItemBeConstructedPrevValue === false && result) {
        //
    }

    item.shouldItemBeConstructedPrevValue = result;
    return result;
}
</script>

<style scoped></style>
