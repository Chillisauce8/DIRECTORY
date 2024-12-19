<template>
    <div class="input-wrapper">
        <component
            :is="props.componentName"
            v-model="props.model"
            @update:modelValue="onModelChange($event)"
            v-bind="props.componentProperties"
            :invalid="validator?.$error"
            :class="[props.validator?.$error ? 'p-invalid' : '', isEmpty() ? 'empty-field' : '', props.componentProperties.readonly ? 'view-mode' : '']"
        >
        </component>
    </div>
    <FieldError class="error-message" v-if="props.validator" :vuelidate-field="props.validator.vuelidateField"> </FieldError>
</template>

<script setup lang="ts">
import FieldError from '~/components/schema-forms/FieldError.vue';
import { isObject } from '~/service/utils';

interface SchemaComponentProps {
    componentName: string;
    componentProperties: any;
    validator?: any;
    model: any;
}

export interface SchemaComponentEmits {
    (e: 'onModelChange', value: any): void;
}

// @ts-ignore
const props = defineProps<SchemaComponentProps>();
// @ts-ignore
const emits = defineEmits<SchemaComponentEmits>();

function onModelChange(value: any) {
    emits('onModelChange', value);
}

function isEmpty() {
    if (!props.model) {
        return true;
    }

    if (Array.isArray(props.model) && props.model.length === 0) {
        return true;
    }

    if (isObject(props.model) && Object.keys(props.model).length === 0) {
        return true;
    }

    return false;
}
</script>

<style lang="scss"></style>
