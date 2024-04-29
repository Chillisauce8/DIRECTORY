<script setup lang="ts">
import type {EmailFormValidationData} from '~/components/auth/UserEmail.vue';
import {useCurrentUser} from '~/service/helpers/user-common/current-user.factory';
import {useCustomerService} from '~/service/helpers/customer/customer.service';
import {useGlobalElementsTemplateService} from '~/service/helpers/data-templates/global-elements-template.factory';
import {useNotificationMessageService} from '~/service/helpers/notification-message.factory';
import {useInviteService} from '~/service/helpers/event/invite.service.factory';
import {useDialogData, useDialogInstance} from '~/service/dialog/core/dialog.composables';
import {useUserService} from '~/service/helpers/user-common/user-service.factory';
import {useAuthErrorsHelperService} from '~/service/helpers/auth/auth-errors-helper.service.factory';
import {useGmailHelperService} from '~/service/helpers/gmail-helper.service.factory';
import {useUserAccountService} from '~/service/helpers/user-common/user-accout.service.factory';
import type {WatchStopHandle} from 'vue';
import {useVuelidate} from '@vuelidate/core';
import {useCsLodash} from '~/service/cs-lodash.factory';
import type {ExternalResultMessageData} from '~/utils/cs-form-validation-helpers';
import {getDocumentSafe} from '~/service/helpers/browser/browser.helpers';
import {email, helpers, required} from '@vuelidate/validators';
import {vRestrictPattern} from '~/utils/directives/restrict-pattern.directive';
import {useCurrentCustomer} from '~/service/helpers/user-common/current-customer-service.factory';


export interface IAccountDialogConfig {
  customerDetails: any;
  editPermissionName: string;
  topMessage?: string;
}


interface UserAccountDialogVM {
  accountDataForm?: any;
  topMessage?: string;
  ipData?: any;
  verifyPhoneResult?: boolean;
  verifyEmail?: boolean;
  error?: string;
  initialAccountData?: any;
  possibleSubscribeSelectValues?: any[];
  emailValidationResult?: EmailFormValidationData;
  isAccountDataUpdated?: boolean;
  isInviteAccepted?: boolean;
  needToShowEraseMyAccountButton?: boolean;
  disabled?: boolean;
  fullNameDisabled?: boolean;
  isCustomerUser?: boolean;
}


const dialogData = useDialogData<IAccountDialogConfig>();
const dialogInstance = useDialogInstance<UserAccountDialogResult>();
const currentUser = useCurrentUser();
const userService = useUserService();
const customerService = useCustomerService();
const authErrorsHelperService = useAuthErrorsHelperService();
const globalElementsTemplateService = useGlobalElementsTemplateService();
const notificationMessageService = useNotificationMessageService();
const inviteService = useInviteService();
const gmailHelperService = useGmailHelperService();
const userAccountService = useUserAccountService();
const router = useRouter();
const currentInstance = getCurrentInstance();
const _ = useCsLodash();
const currentCustomer = useCurrentCustomer();


const vm = reactive<UserAccountDialogVM>({
  topMessage: dialogData?.topMessage ?? null,
  needToShowEraseMyAccountButton: true,
});

Object.assign(vm, {
  accountDataForm: getFormModel(),
  disabled: !canSaveAccountData(),
  fullNameDisabled: !currentUser.isStaffOrHiddenStaff(),
});

const validationRules = computed(() => {
  return {
    fullName: {
      required,
      pattern: helpers.regex(/^(?:([A-Za-z\-\.]{2,}){1}( {1}[A-Za-z\-\.\']{2,} {0,1})+)$/)
    },
    email: [required, email],
    phone: {
      required,
      pattern: helpers.regex(/^((\+){0,1}([0-9]){10,})$/)
    },
  };
});

const v$ = useVuelidate(validationRules, vm.accountDataForm, {
  $autoDirty: true,
});

let _phoneChangeWatch: WatchStopHandle;

let internationalPhoneNumber: string;
let companyId: string;


function init() {
  vm.possibleSubscribeSelectValues = [
    {text: '', value: null},
    {text: 'Yes', value: 'Yes'},
    {text: 'No', value: 'No'},
  ];

  vm.initialAccountData = getAccountDataFromForm();
  vm.error = null;
}

function destroy() {
  if (_phoneChangeWatch) {
    _phoneChangeWatch();
  }
}

function needToShowLogOutButton(): boolean {
  return false;
}

function needToShowPasswordField(): boolean {
  return false;
}

function needToShowCompanyField(): boolean {
  return false;
}

function needToShowInviteField(): boolean {
  return currentUser.isStaffOrHiddenStaff();
}

function needToShowSubscribeField(): boolean {
  return currentUser.isStaffOrHiddenStaff();
}


function canSaveAccountData(): boolean {
  if (dialogData.editPermissionName) {
    return currentUser.hasPermission(dialogData.editPermissionName);
  }

  return false;
}

function enableAccountDataForm(): void {
  vm.disabled = false;
}

function disableAccountDataForm(): void {
  if (vm.disabled) {
    return;
  }

  vm.disabled = true;
}

function getAccountData(): any {
  return {
    id: dialogData.customerDetails._doc,
    fullName: dialogData.customerDetails.name,
    email: dialogData.customerDetails.email,
    phone: dialogData.customerDetails.phone,
    subscribe: dialogData.customerDetails.subscribe || '',
  };
}

function getFormModel() {
  const data = getAccountData();

  let phone = '';

  if (data.phone) {
    phone = data.phone.replace(/[^0-9+]/g, '');

    if (phone.indexOf('+') === 0) {
      phone = '+';
    } else {
      phone = '';
    }

    phone += data.phone.replace(/[^0-9]/g, '');
  }

  return {
    fullName: data.fullName,
    email: data.email,
    phone: phone,
    password: '',
    inviteLink: '',
    subscribe: data.subscribe,
    companyName: data?.company?.name ?? '',
  }
}


async function logout() {
  const result = await userService.logout();

  if (result !== 'prevented') {
    await router.push('/');
  }

  dialogInstance.cancel();
}

async function save() {
  return _save();
}

async function eraseMyAccount(event: MouseEvent) {
  event.preventDefault();

  const customerId = dialogData.customerDetails._doc;

  const customer = await userAccountService.eraseCustomerAccount(customerId);

  if (customer?._doc !== customerId) {
    return;
  }

  if (currentUser.isCustomer() && !currentUser.isStaffOrHiddenStaff()) {
    await logout();

    return;
  }

  if (currentUser.isStaffOrHiddenStaff()) {
    await _refreshUserDetails();
    vm.accountDataForm = getFormModel();
  }
}

async function _save() {
  if (v$.value.$invalid) {
    v$.value.$touch();
    return;
  }

  disableAccountDataForm();

  await _getSaveAccountDataPromise();
  await _getAcceptInvitePromise();

  const result = {
    isAccountDataUpdated: vm.isAccountDataUpdated,
    isInviteAccepted: vm.isInviteAccepted,
  };

  dialogInstance.close(result);
}

async function _getSaveAccountDataPromise(): Promise<any> {
  vm.error = null;

  const accountData = getAccountDataFromForm();

  if (_.isEqual(vm.initialAccountData, accountData)) {

    return Promise.resolve(null);
  }

  try {
    const result = await saveAccountData(accountData);
    vm.isAccountDataUpdated = true;

    return result;
  } catch (error) {
    enableAccountDataForm();

    if (_.includes(error, userService.emailValidateError)) {
      vm.emailValidationResult = {isEmailValid: false};
      return;
    }

    if (authErrorsHelperService.getSignUpErrorType(error) === 'email') {
      error = globalElementsTemplateService
          .getMessageFromDictionaryVariables('signUpEmailExistError', {email: accountData.email});
    }

    vm.error = error;
  }
}

async function _getAcceptInvitePromise(): Promise<any> {
  const token = _getTokenFromForm();

  if (!token) {
    return Promise.resolve(null);
  }

  try {
    const result = await inviteService.acceptInvite(token, getAccountData().id, true);

    if (result?.isInviteAccepted) {
      vm.isInviteAccepted = true;
      notificationMessageService.showGuestHasBeenAddedMessage(getAccountData().fullName);
    }

    return result;
  } catch (e) {
    console.log(e);
  }
}

function getAdditionalAccountData(): any {
  if (vm.verifyPhoneResult === null) {
    return null;
  }

  return {
    phoneVerified: vm.verifyPhoneResult
  };
}

function saveAccountData(accountData: Object): Promise<any> {
  return customerService.updateAccount(dialogData.customerDetails._doc, accountData);
}

async function _refreshUserDetails(): Promise<any> {
  const result = await customerService.getDetails(currentUser.getId());

  const roles = currentUser.getRoles();
  currentUser.set(result);
  currentUser.setRoles(roles);

  return  result;
}

function getAccountDataFromForm(): any {
  const data = toRaw(vm.accountDataForm);

  const splitNames = userService.splitFullName(data.fullName);
  const email = data.email ? data.email.toLowerCase() : data.email;

  let password = data.password;

  if (password === '') {
    password = null;
  }

  const phone = internationalPhoneNumber || data.phone;

  let accountData: any = {
    username: email,
    email: email,
    lastName: splitNames.lastName,
    firstName: splitNames.firstName,
    password: password,
    subscribe: data.subscribe,
  };

  if (needToShowCompanyField()) {
    accountData.companyId = companyId;
  }

  if (phone) {
    accountData.phone = phone;
  }

  const additionalAccountData = getAdditionalAccountData();

  if (additionalAccountData) {
    accountData = Object.assign(accountData, additionalAccountData);
  }

  return accountData;
}

function _getTokenFromForm(): string {
  if (!needToShowInviteField()) {
    return null;
  }

  const data = toRaw(vm.accountDataForm);

  if (!data.inviteLink) {
    return null;
  }

  const splitLink = data.inviteLink.split('/');

  return splitLink && splitLink.length > 0 ? splitLink[splitLink.length - 1] : null;
}

function telInputChangeDetectorFunc() {
  currentInstance.proxy.$forceUpdate();
}


onMounted(() => init());

onUnmounted(() => destroy());
</script>

<template>
  <TheDialog title="My Account"
             class="dialog-with-form">
    <form v-if="vm.accountDataForm" name="user-account-dialog" @submit.prevent="save">
      <div v-if="dialogData?.topMessage" class="text-align_center margin_0_0_1">
        <p>{{ dialogData.topMessage }}</p>
      </div>

      <CSFormField>
        <CSInput type="text"
                 placeholder="Full Name"
                 :disabled="vm.disabled || vm.fullNameDisabled"
                 v-model="vm.accountDataForm.fullName">
        </CSInput>

        <template #suffix>
          <CSError class="cs-form-text-error"
                   :vuelidate-field="v$.fullName"
                   :custom-validation-message-map="{pattern: 'Use full name (Firstname and Surname)'}">
          </CSError>
        </template>
      </CSFormField>

      <UserEmail placeholder="Email"
                 v-model="vm.accountDataForm.email"
                 v-model:is-email-valid="vm.emailValidationResult"
                 :autofocus="false"
                 :disabled="vm.disabled"
                 :verify-email="vm.verifyEmail">
      </UserEmail>

      <CSFormField>
        <CSInput id="phone"
                 type="tel"
                 name="phone"
                 placeholder="Phone Number"
                 v-model="vm.accountDataForm.phone"
                 :disabled="vm.disabled"
                 v-restrict-pattern="/^((\+){0,1}([0-9]){0,})$/"
                 @input=telInputChangeDetectorFunc()>
        </CSInput>

        <template #suffix>
          <CSError class="cs-form-text-error"
                   :vuelidate-field="v$.phone"
                   :custom-validation-message-map="{pattern: 'This field should contain a minimum of 10 digits'}">
          </CSError>
        </template>
      </CSFormField>

      <UserPassword v-if="needToShowPasswordField()"
                    :is-new-password="true"
                    v-model="vm.accountDataForm.password"
                    placeholder="Type here to edit your password"
                    :disabled="vm.disabled"
                    :required="false"
                    :check="true"
                    :autocomplete="false">
      </UserPassword>

      <CSFormField v-if="needToShowInviteField()">
        <CSInput v-model="vm.accountDataForm.inviteLink"
                 :disabled="vm.disabled"
                 type="text"
                 placeholder="Enter invite link to add to event">
        </CSInput>
      </CSFormField>

      <CSFormField v-if="needToShowSubscribeField()">
        <LazyCSSelect v-model="vm.accountDataForm.subscribe"
                  placeholder="Receive offers and ideas"
                  :disabled="vm.disabled"
                  :option-list="vm.possibleSubscribeSelectValues"
                  :label-getter="i => i.text">
        </LazyCSSelect>
      </CSFormField>

      <div class="text-align_center text-color_error" v-if="vm.error">
        <p>Update account error</p>
        <p>{{vm.error}}</p>
      </div>

      <div class="Flex Column Center">
        <div class="Flex Row Grow full-width">
          <FormButtonWrapper>
            <ButtonMain class="_2nd"
                        :disabled="vm.disabled"
                        v-if="vm.needToShowEraseMyAccountButton"
                        @click="eraseMyAccount($event)">
              Erase My Account
            </ButtonMain>

            <ButtonMain
                        type="submit"
                        :disabled="!canSaveAccountData() || vm.disabled">
              Save
            </ButtonMain>
          </FormButtonWrapper>
        </div>

        <ButtonMain class="_3rd"
                    v-if="needToShowLogOutButton()"
                    :disabled="vm.disabled"
                    @click.native="logout()">Sign out</ButtonMain>
      </div>
    </form>
  </TheDialog>
</template>

<style lang="scss">
</style>
