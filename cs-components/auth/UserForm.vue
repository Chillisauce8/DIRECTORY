<template>
  <form name="user-form" @submit="submit">
    <CSFormField>
      <CSInput v-model="dataState.user.fullName"
               class="Flex Grow input"
               type="text"
               name="name"
               placeholder="Firstname Lastname"
               :disabled="props?.inProgress">
      </CSInput>

      <template #suffix>
        <CSError class="cs-form-text-error" :vuelidate-field="v$.user.fullName"></CSError>
      </template>
    </CSFormField>

    <CSFormField>
      <CSInput v-model="dataState.user.email"
               class="Flex Grow input"
               type="email"
               name="email"
               placeholder="Email"
               :disabled="props?.inProgress">
      </CSInput>

      <template #suffix>
        <CSError class="cs-form-text-error" :vuelidate-field="v$.user.email"></CSError>
      </template>
    </CSFormField>


    <CSFormField>
      <CSInput v-model="dataState.user.phone"
               class="Flex Grow input"
               type="tel"
               name="phone"
               placeholder="Phone"
               :disabled="props?.inProgress">
      </CSInput>

      <template #suffix>
        <CSError class="cs-form-text-error" :vuelidate-field="v$.user.phone"></CSError>
      </template>
    </CSFormField>

    <CSFormField v-if="!dataState.generatePasswordMode" class="password-field">
      <CSInput class="input"
               v-bind:type="dataState.passwordVisible ? 'text' : 'password'"
               name="password"
               placeholder="Type here to edit your password"
               v-model="dataState.user.password">
      </CSInput>

      <button type="button"
              class="show-hide-button"
              @click="dataState.passwordVisible = !dataState.passwordVisible">
        <LazySvgIcon :svg="dataState.passwordVisible ? 'eye' : 'eye-close' "></LazySvgIcon>
      </button>

      <template #suffix>
        <CSError class="cs-form-text-error" :vuelidate-field="v$?.user.password"></CSError>
      </template>
    </CSFormField>

    <ButtonMain type="submit" :processing="dataState.inProgress">Save</ButtonMain>
    <ButtonMain class="small" type="button" @click.native="signOut">Sign out</ButtonMain>

  </form>
</template>

<script setup lang="ts">
import {computed, reactive, toRaw} from 'vue';
import {email, required} from '@vuelidate/validators';
import {
  csUserNameValidator,
  swpPatternValidator,
  swpUKPhoneValidator
} from '~/utils/cs-form-validators';
import type {Validation} from '@vuelidate/core';
import {useVuelidate} from '@vuelidate/core';
import {extractNamePartsFromFullName} from '~/service/helpers/user-common/user-form-helpers';
import CSFormField from '~/components/forms/CSFormField.vue';
import CSError from '~/components/forms/CSError.vue';
import {getValidationErrorMessage} from '~/utils/cs-form-validation-helpers';
import type {BaseUserDbNode} from '~/helpers/user-data-helpers';


export interface UserFormUserData extends BaseUserDbNode {
  fullName: string;
  password: string;
}


export interface UserFormProps {
  user: BaseUserDbNode;
  passwordValidationRegex?: string | RegExp;
  inProgress?: boolean;
}


export interface UserFormEmits {
  (e: 'action:submit', value: UserFormUserData): void;
  (e: 'action:sign-out'): void;
}


const props = defineProps<UserFormProps>();
const emits = defineEmits<UserFormEmits>();

const dataState = reactive({
  user: prepareUserDataForForm(props.user),
  passwordVisible: false,
  defaultPasswordValidationRegex: /^.{6,}$/,
  errorMessage: null,
  inProgress: false,
});

const formValidationRules = computed(() => ({
  user: {
    fullName: {
      required,
      name: csUserNameValidator(),
    },
    email: {email, required},
    phone: {
      swpUKPhoneValidator: swpUKPhoneValidator(),
    },
    password: {
      pattern: swpPatternValidator(getPasswordValidationRegex()),
    },
  }
}));

const v$ = useVuelidate(formValidationRules, dataState, {$autoDirty: true});


function getPasswordValidationRegex(): RegExp {
  if (!props.passwordValidationRegex) {
    return toRaw(dataState).defaultPasswordValidationRegex as RegExp;
  }

  if (props.passwordValidationRegex instanceof RegExp) {
    return props.passwordValidationRegex;
  }

  if (typeof props.passwordValidationRegex === 'string') {
    return new RegExp(props.passwordValidationRegex, 'gi');
  }

  return toRaw(dataState).defaultPasswordValidationRegex as RegExp;
}

function prepareUserDataForForm(userData: BaseUserDbNode): UserFormUserData {
  const fullName = `${userData.firstName} ${userData.lastName}`;

  return {
    ...userData,
    fullName,
    password: '',
  };
}

function getValidationError(validation: Validation): string | null {
  return getValidationErrorMessage(validation);
}

function onFormInputChange(event: InputEvent): void {
  const {name} = (event.target as any);

  if (v$.value?.[name]?.$dirty) {
    setTimeout(() => v$?.[name].$touch());
  }
}

function prepareFormUserDataForSubmit(formUserData: UserFormUserData): UserFormUserData {
  const {fullName} = formUserData;

  const {firstName, lastName} = extractNamePartsFromFullName(fullName);

  const userData = {
    ...formUserData,
    firstName,
    lastName,
  };

  return userData;
}

function submit(event: Event): void {
  event.preventDefault();
  dataState.errorMessage = null;

  v$.value.$touch();

  if (v$.value.$invalid) {
    return;
  }

  const userData = prepareFormUserDataForSubmit(dataState.user);

  emits('action:submit', userData);
}

function signOut() {
  emits('action:sign-out');
}
</script>

<style lang="scss">
</style>
