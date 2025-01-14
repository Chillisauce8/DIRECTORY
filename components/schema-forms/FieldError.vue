<template>
    <div v-for="(message, type) in validationMessages" :key="type" class="p-error field-error" v-if="hasError(type)">
        {{ message }}
    </div>
</template>

<script setup lang="ts">
import type { BaseValidation, Validation } from '@vuelidate/core';

interface CSErrorProps {
    // Support both single validation and multiple validations
    vuelidateField?: BaseValidation | Validation;
    customValidationMessageMap?: { [errorType: string]: string };
    // New props for multiple validation support
    validations?: { [key: string]: () => boolean };
    messages?: { [key: string]: string };
}

const props = defineProps<CSErrorProps>();

function hasError(type?: string): boolean {
    // Handle multiple validations case
    if (props.validations && type) {
        return !props.validations[type]();
    }

    // Handle single validation case (existing logic)
    if (!props?.vuelidateField) return false;
    if (!props?.vuelidateField?.$dirty) return false;
    return !!getTopValidationError(props?.vuelidateField) ?? false;
}

const validationMessages = computed(() => {
    // Handle multiple validations case
    if (props.validations && props.messages) {
        return props.messages;
    }

    // Handle single validation case
    return props.customValidationMessageMap || {};
});
</script>

<style>
.field-error {
}
</style>
