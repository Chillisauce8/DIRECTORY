<template>
    <div class="p-error field-error" v-if="inputValidationHasError()">{{ getInputValidationErrorMessage() }}</div>
</template>

<script setup lang="ts">
import type { BaseValidation, Validation } from '@vuelidate/core';

import { getTopValidationError, getValidationErrorMessage } from '~/service/forms-validators';

interface CSErrorProps {
    vuelidateField?: BaseValidation | Validation;
    customValidationMessageMap?: { [errorType: string]: string };
}

const props = defineProps<CSErrorProps>();

function inputValidationHasError(): boolean {
    if (!props?.vuelidateField) {
        return false;
    }

    if (!props?.vuelidateField?.$dirty) {
        return false;
    }

    return !!getTopValidationError(props?.vuelidateField) ?? false;
}

function getInputValidationErrorMessage(): string | null {
    if (!props?.vuelidateField) {
        return null;
    }

    return getValidationErrorMessage(props.vuelidateField, props.customValidationMessageMap);
}
</script>

<style>
.field-error {
}
</style>
