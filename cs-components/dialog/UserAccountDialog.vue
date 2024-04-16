<script setup lang="ts">
import type {EmailFormValidationData} from '~/components/auth/UserEmail.vue';
import {useCurrentUser} from '~/services/helpers/user-common/current-user.factory';
import {useCustomerService} from '~/services/helpers/customer/customer.service';
import {useGlobalElementsTemplateService} from '~/services/helpers/data-templates/global-elements-template.factory';
import {useNotificationMessageService} from '~/services/helpers/notification-message.factory';
import {useInviteService} from '~/services/helpers/event/invite.service.factory';
import {useDialogData, useDialogInstance} from '~/services/dialog/core/dialog.composables';
import {useUserService} from '~/services/helpers/user-common/user-service.factory';
import {useAuthErrorsHelperService} from '~/services/helpers/auth/auth-errors-helper.service.factory';
import {useGmailHelperService} from '~/services/helpers/gmail-helper.service.factory';
import {useUserAccountService} from '~/services/helpers/user-common/user-accout.service.factory';
import type {WatchStopHandle} from 'vue';
import {useVuelidate} from '@vuelidate/core';
import {useCsLodash} from '~/services/cs-lodash.factory';
import type {ExternalResultMessageData} from '~/utils/cs-form-validation-helpers';
import {getDocumentSafe} from '~/services/helpers/browser/browser.helpers';
import {email, helpers, required} from '@vuelidate/validators';
import {vRestrictPattern} from '~/utils/directives/restrict-pattern.directive';
import {useCurrentCustomer} from '~/services/helpers/user-common/current-customer-service.factory';


export interface IAccountData {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  subscribe?: string;
  company?: any;
}


export interface IUserAccountDialogConfig {
  forStaff: boolean;
  topMessage?: string;
  preValidateFields: boolean;
  allowEditName: boolean;
}


export interface UserAccountDialogResult {
  isAccountDataUpdated: boolean;
  isInviteAccepted: boolean;
}


interface UserAccountDialogVM {
  accountDataForm?: any;
  forStaff?: boolean;
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


const dialogData = useDialogData<IUserAccountDialogConfig>();
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
  forStaff: dialogData?.forStaff ?? false,
  topMessage: dialogData?.topMessage ?? null,
});

Object.assign(vm, {
  isCustomerUser: currentUser?.isCustomer() && (vm.forStaff || !currentUser?.isHiddenStaff()),
  accountDataForm: getFormModel(),
  disabled: !canSaveAccountData(),
  fullNameDisabled: !dialogData?.allowEditName && !currentUser.isStaffOrHiddenStaff(),
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


const externalValidationResults =
  reactive<Partial<Record<string, ExternalResultMessageData[]>>>({});

const v$ = useVuelidate(validationRules, vm.accountDataForm, {
  $autoDirty: true,
  $externalResults: externalValidationResults as any
});

let _phonePrevValue: string;
let _phoneChangeWatch: WatchStopHandle;

let internationalPhoneNumber: string;
let checkPhonePromise: Promise<any>;
let companyId: string = getCompanyId();


function init() {
  if (needToGetUserIpData()) {
    _getUserIpData();
  }

  vm.possibleSubscribeSelectValues = [
    {text: '', value: null},
    {text: 'Yes', value: 'Yes'},
    {text: 'No', value: 'No'},
  ];

  vm.initialAccountData = getAccountDataFromForm();
  vm.error = null;

  if (needToGetUserIpData()) {
    _phoneChangeWatch = _initPhoneChangeSubscription();
  }

  vm.needToShowEraseMyAccountButton = currentUser.isCustomer() && !vm.forStaff;

  if (dialogData.preValidateFields) {
    v$.value.$validate();
    onPhoneInputBlur();
  }
}

function destroy() {
  if (_phoneChangeWatch) {
    _phoneChangeWatch();
  }
}

function needToShowLogOutButton(): boolean {
  return vm.forStaff || !currentUser.isHiddenStaff();
}

function needToShowPasswordField(): boolean {
  return vm.forStaff || !currentUser.isHiddenStaff();
}

function needToShowCompanyField(): boolean {
  return false;
  // return !vm.forStaff && currentUser.isCustomer() && currentUser.isStaffOrHiddenStaff();
}

function needToShowInviteField(): boolean {
  return !vm.forStaff && currentUser.isCustomer() && currentUser.isStaffOrHiddenStaff();
}

function needToShowSubscribeField(): boolean {
  return !vm.forStaff && currentUser.isCustomer() && !currentUser.isVirtual();
}

function needToShowUpdateGmailTokenButton(): boolean {
  if (currentUser.isHiddenStaff() && !vm.forStaff) {
    return false;
  }

  const gMailToken = currentUser.getGmailTokenData();

  return Object.keys(gMailToken).length > 0;
}

function canSaveAccountData(): boolean {
  return vm.forStaff || !currentUser.isVirtual();
}

function openUpdateGMailTokenPrompt() {
  return gmailHelperService.openUpdateTokenDialog();
}

function onPhoneInputBlur() {
  checkPhonePromise = _checkPhoneBeforeSave();
  checkPhonePromise.then(() => checkPhonePromise = null);
}

function enableAccountDataForm(): void {
  vm.disabled = false;
}

function disableAccountDataForm(): void {
  if (vm.disabled) {
    return;
  }

  _unsubscribeFromPhoneChange();
  vm.disabled = true;
  _subscribeOnPhoneChange();
}

function getAccountData(): IAccountData {
  if (dialogData?.forStaff && currentUser.isHiddenStaff()) {
    return {
      id: currentUser.getHiddenStaffId(),
      fullName: currentUser.getHiddenStaffFullName(),
      email: currentUser.getHiddenStaffEmail(),
      phone: currentUser.getHiddenStaffPhone(),
    };
  }

  return {
    id: currentUser.getId(),
    fullName: currentUser.getFullName(),
    email: currentUser.getEmail(),
    phone: currentUser.getPhone(),
    subscribe: currentUser.getSubscribe(),
    company: currentUser.getCompany(),
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

function getCompanyId(): string {
  const data = getAccountData();
  return data?.company?.id ?? null;
}


async function logout() {
  const result = await userService.logout();

  if (result !== 'prevented') {
    await router.push('/');
  }

  dialogInstance.cancel();
}

async function save() {
  const checkObservable = checkPhonePromise ? checkPhonePromise : Promise.resolve(true);

  checkObservable
    .then(() => _save());
}

function onCompanySelect(company: any) {
  companyId = company?._doc ?? null;
}

async function eraseMyAccount(event: MouseEvent) {
  event.preventDefault();

  const customerId = currentUser.getId();

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

  if (vm.error) {
    return;
  }

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
  accountData = Object.assign({}, accountData, {emailValidation: vm.emailValidationResult});

  if (_needToSaveCustomerAccountData()) {
    return _saveCustomerAccountData(accountData);
  } else {
    return _saveOwnAccountData(accountData);
  }
}

function _needToSaveCustomerAccountData(): boolean {
  if (currentUser.isToggledStaff()) {
    return true;
  }

  return currentUser.isHiddenStaff() && !vm.forStaff;
}

async function _checkPhoneBeforeSave(): Promise<boolean> {
  if (!needToValidatePhone()) {
    return Promise.resolve(true);
  }

  const phone = vm.accountDataForm.phone;

  if (!phone) {
    setPhoneError();
    return Promise.resolve(true);
  }

  if (phone === _phonePrevValue) {
    if (!vm.verifyPhoneResult) {
      setPhoneError();
    }

    return Promise.resolve(true);
  }

  _phonePrevValue = phone;

  if (v$?.value?.phone?.$invalid) {
    return Promise.resolve(true);
  }

  internationalPhoneNumber = null;

  try {
    const {data} = await userService.validatePhone(phone, 10000);

    if (data.valid) {
      internationalPhoneNumber = data.internationalNumber;
      vm.verifyPhoneResult = true;
    } else {
      setPhoneError();

      return false;
    }
  } catch (e) {
    setPhoneError();

    return false;
  }
}

function setPhoneError() {
  externalValidationResults.phone = [{name: 'phone', message: 'This field needs to be a valid phone number'}];
}

function _saveOwnAccountData(accountData: Object) {
  return userService.updateAccount(accountData);
}

async function _saveCustomerAccountData(accountData: Object) {
  const result = await customerService.updateAccount(currentUser.getId(), accountData);

  _refreshUserDetails();

  return result;
}

async function _refreshUserDetails(): Promise<any> {
  const result = await customerService.getDetails(currentUser.getId());

  const roles = currentUser.getRoles();
  currentUser.set(result);
  currentUser.setRoles(roles);

  return  result;
}

function needToGetUserIpData(): boolean {
  return !currentUser.isLoggedIn() || (currentUser.isCustomer() && !currentUser.isStaffOrHiddenStaff());
}

function _getUserIpData() {
  return userService.getIpInfo()
    .then(result => {
      vm.ipData = result;
      _onIpDataChange();

      return result;
    });
}

function needToValidatePhone(): boolean {
  if (!needToGetUserIpData()) {
    return false;
  }

  return ['gb', 'ru', 'ge', ''].includes(vm?.ipData?.countryCode?.toLowerCase());
}

function _subscribeOnPhoneChange() {
  _phoneChangeWatch = _initPhoneChangeSubscription();
}

function _unsubscribeFromPhoneChange() {
  if (_phoneChangeWatch) {
    _phoneChangeWatch();
  }
}

function _initPhoneChangeSubscription(): WatchStopHandle {
  return watch(() => vm.accountDataForm.phone, () => vm.verifyPhoneResult = false);
}

function _onIpDataChange() {
  if (!vm.ipData) {
    return;
  }

  if (!vm.accountDataForm.phone) {
    return;
  }

  if (!v$?.value?.phone?.$dirty) {
    return;
  }

  const document = getDocumentSafe();

  if (!document) {
    return;
  }

  const phoneEl = document.getElementById('phone');

  if (!phoneEl)  {
    return;
  }

  if (document.activeElement !== phoneEl) {
    onPhoneInputBlur();
  }
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

if (currentUser.isCustomer() && !vm.forStaff) {
  vm.verifyEmail = true;
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
                 v-restrict-pattern="testName"
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
                 :verify-email="vm.verifyEmail"
                 :verify-on-init="dialogData.preValidateFields">
      </UserEmail>

      <CSFormField>
        <CSInput id="phone"
                 type="tel"
                 name="phone"
                 placeholder="Phone Number"
                 v-model="vm.accountDataForm.phone"
                 :disabled="vm.disabled"
                 v-restrict-pattern="/^((\+){0,1}([0-9]){0,})$/"
                 @keydown.enter="onPhoneInputBlur()"
                 @blur="onPhoneInputBlur()"
                 @input=telInputChangeDetectorFunc()>
        </CSInput>

        <template #suffix>
          <CSError class="cs-form-text-error"
                   :vuelidate-field="v$.phone"
                   :custom-validation-message-map="{pattern: 'This field should contain a minimum of 10 digits'}">
          </CSError>
        </template>
      </CSFormField>

<!--      <CSFormField v-if="needToShowCompanyField()">-->
<!--        <CompanyEditor v-model="vm.accountDataForm.company"-->
<!--                       :disabled="vm.disabled"-->
<!--                       @update:modelValue="onCompanySelect">-->
<!--        </CompanyEditor>-->
<!--      </CSFormField>-->

      <UserPassword v-if="needToShowPasswordField()"
                    :is-new-password="true"
                    v-model="vm.accountDataForm.password"
                    placeholder="Type here to edit your password"
                    :disabled="vm.disabled"
                    :required="false"
                    :check="true"
                    :autocomplete="false">
      </UserPassword>

      <CSFormField v-if="!dialogData.preValidateFields && needToShowInviteField()">
        <CSInput v-model="vm.accountDataForm.inviteLink"
                 :disabled="vm.disabled"
                 type="text"
                 placeholder="Enter invite link to add to event">
        </CSInput>
      </CSFormField>

      <CSFormField v-if="!dialogData.preValidateFields && needToShowSubscribeField()">
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
                        v-if="!dialogData.preValidateFields && vm.needToShowEraseMyAccountButton"
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
                    v-if="!dialogData.preValidateFields && needToShowLogOutButton()"
                    :disabled="vm.disabled"
                    @click.native="logout()">Sign out</ButtonMain>
      </div>
    </form>
  </TheDialog>
</template>

<style lang="scss">
</style>
