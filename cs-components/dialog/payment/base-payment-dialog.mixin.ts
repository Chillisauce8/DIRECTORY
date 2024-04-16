import type { IPaymentSettings } from "~/services/helpers/payment/payment-details.service";


const paymentDialogMixin = {
  setup() {
  },
  data() {
    const title = computed(() => {
      if (this.dialogStageIsSettings()) {
        return this.getStageSettingTitle();
      }

      if (this.dialogStageIsSuccess()) {
        const dataTemplate = this.dataTemplateFabric.get({name: 'paymentPage'})
        return dataTemplate.getValue(`successPage.title`);
      }

      if (this.dialogStageIsFailure()) {
        const dataTemplate = this.dataTemplateFabric.get({name: 'paymentPage'})
        return dataTemplate.getValue(`failurePage.title`);
      }

      return '';
    });

    return {
      title,
      needFullScreen: false,
      stretchContent: false,
      inProgress: true,

      paymentSettingsConfig: null,
      paymentSuccessMessage: null,
      paymentFailureMessage: null,

      paymentMethod: null,
      paymentPeople: [],
      paymentPeopleAmounts: [],
      paymentType: null,
      possiblePaymentTypes: null,

      _dialogStage: null,

      _packageBookingStage: null,

      _dataTemplate: null,

      _balanceDueDate: new Date(),
      _depositDueDate: new Date(),
      _restPayment: '???',

      _messaging: null,
      _commonErrorMessage: null,
    }
  },
  methods: {
    baseInit() {
      this._prepareFormData();
    },

    getStageSettingTitle() {
      return this.paymentSettingsConfig?.title;
    },

    dialogStageIsSettings(): boolean {
      return this._dialogStage === 'settings';
    },

    dialogStageIsSuccess(): boolean {
      return this._dialogStage === 'success';
    },

    dialogStageIsFailure(): boolean {
      return this._dialogStage === 'failure';
    },

    showPaymentFailureDialog(message: string) {
      this.paymentFailureMessage = message;
      this._dialogStage = 'failure';
      this.inProgress = false;
      this.needFullScreen = false;
      this.stretchContent = false;
    },

    showPaymentSuccessDialog(message?: string) {
      if (message) {
        this.paymentSuccessMessage = message;
      }

      this._dialogStage = 'success';
      this.needFullScreen = false;
      this.stretchContent = false;
    },

    getResultMessage(): string {
      if (this.dialogStageIsSuccess()) {
        return this.paymentSuccessMessage;
      }

      return this.paymentFailureMessage;
    },

    getSummaryForCurrentCustomer() {
      return this.currentEvent.getCustomerSummaryItem(this.currentCustomer.getId());
    },

    prepareFinalPaymentAmount(): number {
      if (this.paymentPeopleAmounts && this.paymentPeopleAmounts.length) {
        return this.csLodash.sumBy(this.paymentPeopleAmounts, 'amount');
      }

      return <number>this.paymentSettingsConfig.paymentAmount;
    },

    onPaymentMethodChange(result: any) {
      const paymentMethod = result.value;

      if (this.paymentMethod !== paymentMethod) {
        this.paymentMethod = paymentMethod;

        this.paymentSettingsConfig.paymentFields = this.paymentSettingsConfig.paymentFields.map((item: any) => {
          if (item.name === 'paymentPeople') {
            item.config.showField = (paymentMethod === 'guests');
          }

          return item;
        });

        this.processParamsChanged();
      }
    },

    async onPaymentPeopleChange(result: Array<any>) {
      const customers = this._getCustomers();

      const paymentPeople = result.map((id: string) => {
        return {id: id, name: customers.find(item => item.value === id)?.title};
      });

      if (!this.csLodash.isEqual(this.paymentPeople, paymentPeople)) {
        this.paymentPeople = paymentPeople;

        await this.processParamsChanged();
      }
    },

    async onPaymentTypeChange(result: any) {
      if (this.paymentType !== result.value) {
        this.paymentType = result.value;

        await this.processParamsChanged();
      }
    },

    async processParamsChanged() {
      await this._loadCurrentPaymentTypes();

      this._updatePaymentSettingsConfig();
      const changed = this._fillDefaultSelection();

      if (!changed) {
        if (this.paymentType) {
          await this._loadCurrentPaymentDetails();
        }
      } else {
        return this.processParamsChanged();
      }
    },

    showBalanceDueDate(): boolean {
      return (this.paymentType === 'balance' && this.paymentMethod === 'guests') ||
        (this.paymentType === 'deposit' && (this.paymentMethod === 'organiser' ||
          this.paymentMethod === 'guests'));
    },

    showDepositDueDate(): boolean {
      return this.paymentType === 'deposit' && this.paymentMethod === 'guests';
    },

    showRestPayment(): boolean {
      return this.paymentType === 'deposit' && (this.paymentMethod === 'organiser'
        || this.paymentMethod === 'guests');
    },

    prepareUserDetails() {
      const eventOrganiser = this.currentEvent.getOrganiser();
      const splitOrganiserNames = this.userService.splitFullName(eventOrganiser.name);

      return {
        firstName: this.currentUser.getFirstName(),
        lastName: this.currentUser.getLastName(),
        email: this.currentUser.getEmail(),
        phone: this.currentUser.getPhone(),
        shippingFirstName: this.currentUser.getFirstName(),
        shippingLastName: this.currentUser.getLastName(),
        organiserFirstName: splitOrganiserNames.firstName,
        organiserLastName: splitOrganiserNames.lastName,
      };
    },

    _initCommonErrorMessage() {
      this._commonErrorMessage = this._dataTemplate.getValue('cardDetailsPage.defaultFailureMessage');
    },

    _preparePaymentSettings(): IPaymentSettings {
      return {
        type: this.paymentType,
        method: this.paymentMethod,
        paidForCustomers: this.paymentPeople,
        paymentPeopleAmounts: this.paymentPeopleAmounts,
        customerIdWhoPays: this.currentCustomer.getId(),
        customerNameWhoPays: this.currentCustomer.getName(),
      };
    },

    async _loadCurrentPaymentTypes() {
      const currentPackage = this.currentEvent.getCurrentPackage();

      if (!currentPackage) {
        this.paymentSettingsConfig.paymentAmount = null;
        return;
      }

      this.paymentSettingsConfig.disableControls = true;

      const result = await this.paymentDetailsService.getCurrentPaymentTypes(
        this.currentEvent.getId(), currentPackage.getId(),
        this.paymentPeople)

      this.possiblePaymentTypes = result;
    },

    async _loadCurrentPaymentDetails() {
      const currentPackage = this.currentEvent.getCurrentPackage();

      if (!currentPackage) {
        this.paymentSettingsConfig.paymentAmount = null;
        return;
      }

      const paymentSettings = this._preparePaymentSettings();

      this.paymentSettingsConfig.disableControls = true;

      const result = await this.paymentDetailsService.getCurrentPaymentDetails(
        this.currentEvent.getId(), currentPackage.getId(), paymentSettings);

      this.paymentSettingsConfig = this.csLodash.clone(this.paymentSettingsConfig);
      this.paymentSettingsConfig.paymentAmount = result.amount || null;

      if (this.paymentMethod === 'guests') {
        this.paymentSettingsConfig.paymentCustomerDetails = result.customerDetails;
      } else {
        this.paymentSettingsConfig.paymentCustomerDetails = undefined;
      }

      this.paymentSettingsConfig.minAmount = result.minAmount;

      this._restPayment = result.hasOwnProperty('restPayment') ? result.restPayment : null;
      this.paymentSettingsConfig.disableControls = false;

      this._updatePaymentMessaging();
      this._updatePaymentSettingsMoneyHeaderAndMessage();
    },

    _getCustomers(): Array<any> {
      return this.currentEvent.getCustomerSummary()
        .map((item: any) => {
          return {
            title: item.customer.name,
            value: item.customer.id
          };
        })
        .sort((item1: any, item2: any) => {
          const name1 = item1.title.toLowerCase();
          const name2 = item2.title.toLowerCase();

          if (name1 < name2) { return -1; }
          if (name1 > name2) { return 1; }
          return 0;
        });
    },

    _getCustomersToPay(): Array<any> {
      return this.currentEvent.getCustomersToPay()
        .map((item: any) => {
          return {
            title: item.name,
            value: item.id
          };
        })
        .sort((item1: any, item2: any) => {
          const name1 = item1.title.toLowerCase();
          const name2 = item2.title.toLowerCase();

          if (name1 < name2) { return -1; }
          if (name1 > name2) { return 1; }
          return 0;
        });
    },

    getPaidForCustomer(customerId): Array<any> {
      const summaryItem = this.currentEvent.getCustomerSummaryItem(customerId);

      if (!summaryItem) {
        return [];
      }

      if (!summaryItem.paidForCustomer) {
        return [];
      }

      return summaryItem.paidForCustomer;
    },

    async _prepareFormData() {
      await this.dataTemplatesStore.fetch({templateName: 'paymentPage'});

      this._dataTemplate = this.dataTemplateFabric.get({name: 'paymentPage'});

      this._initCommonErrorMessage();

      try {
        const result = await this._getPackageBookingStage();

        if (!result || !result.paymentAmounts || !result.paymentAmounts.length) {
          this.inProgress = false;
          throw new Error('paymentFail: No proper booking stage params');
        }

        this._packageBookingStage = result;

        this._processPackageBookingStage();
        this._getPaymentAdditionalInfo();
        this._fetchPaymentSuccessMessage();

        this._updatePaymentSettingsConfig();
        this._fillDefaultSelection();

        await this.processParamsChanged();

        this.inProgress = false;
      } catch(error) {
        this.inProgress = false;
        this._processError(error);
      }
    },

    getButtonLabel(): string {
      return this._dataTemplate.getValue('paymentPage.buttonLabel');
    },

    _updatePaymentSettingsConfig() {
      const messaging = this._fetchActualMessaging();

      this.paymentSettingsConfig = {
        title: this._dataTemplate.getValue('paymentPage.title'),
        buttonLabel: this.getButtonLabel(),
        paymentFields: this._getPaymentFields(),
        disableControls: false,
        paymentAmount: '',
        minAmount: 1,
        moneyHeader: messaging ? messaging.moneyHeader : '',
        message: messaging ? messaging.message : ''
      };
    },

    _fillDefaultSelection() {
      let defaultPaymentMethod = this.paymentMethod;
      let defaultPaymentType = this.paymentType;
      let defaultPaymentPeople = this.paymentPeople;

      const paymentFields = this.paymentSettingsConfig.paymentFields;
      const paymentAmounts = paymentFields.find(item => item.name === 'paymentAmounts');
      const paymentPeople = paymentFields.find(item => item.name === 'paymentPeople');
      const paymentMethods = paymentFields.find(item => item.name === 'paymentMethods');

      if (!defaultPaymentMethod && paymentMethods) {
        const paymentMethodsConfig = paymentMethods.config;
        const possibleMethods = paymentMethodsConfig.selectOptions.map(item => item.value);

        if (this.currentEvent.has() && this.currentEvent.getPaymentMethod() &&
          possibleMethods.indexOf(this.currentEvent.getPaymentMethod()) !== -1) {
          defaultPaymentMethod = this.currentEvent.getPaymentMethod();
        } else {
          defaultPaymentMethod = possibleMethods.length ? possibleMethods[0] : null;
        }
      }

      if (paymentAmounts) {
        const paymentAmountsConfig = paymentAmounts.config;
        const selectOptions = paymentAmountsConfig.selectOptions;

        if (!defaultPaymentType ||
          !this.csLodash.includes(selectOptions.map(item => item.value), defaultPaymentType)) {
          defaultPaymentType = paymentAmountsConfig.selectOptions.length ?
            paymentAmountsConfig.selectOptions[0].value : null;
        }
      }

      if (!defaultPaymentPeople.length && paymentPeople) {
        const paymentPeopleConfig = paymentPeople.config;

        const selectedOptions = paymentPeopleConfig.selectedOptions;

        if (selectedOptions && selectedOptions.length) {
          defaultPaymentPeople = selectedOptions.map(item => {
            return {id: item.value, name: item.title};
          });
        }
      }

      if (this.currentEvent.isBooked() && defaultPaymentPeople.length > 1 && !this.paymentType) {
        defaultPaymentType = 'custom';
      }

      let isChanged = false;

      if (defaultPaymentMethod !== this.paymentMethod) {
        this.paymentMethod = defaultPaymentMethod;
        isChanged = true;
      }

      if (defaultPaymentPeople !== this.paymentPeople) {
        this.paymentPeople = defaultPaymentPeople;
        isChanged = true;
      }

      if (defaultPaymentType !== this.paymentType) {
        this.paymentType = defaultPaymentType;
        isChanged = true;
      }

      return isChanged;
    },

    _fetchPaymentSuccessMessage() {
      const filteredMessaging: Array<any> = this._dataTemplate.getArray('successPage.messaging')
        .filter((item: any) => {
          return !item.conditions || (item.conditions.hasOwnProperty('role') &&
            ((this.currentEvent.isOrganiser() && item.conditions.role === 'Organiser') ||
              (!this.currentEvent.isOrganiser() && item.conditions.role === 'Guest')));
        });

      this.paymentSuccessMessage = filteredMessaging.length ? filteredMessaging[0].message : '';
    },

    _updatePaymentSettingsMoneyHeaderAndMessage() {
      const messaging = this._fetchActualMessaging();

      this.paymentSettingsConfig.moneyHeader = messaging ? messaging.moneyHeader : '';
      this.paymentSettingsConfig.message = messaging ? messaging.message : '';
    },

    _fetchActualMessaging(): any {
      if (!this._messaging || !this._messaging.length) {
        return null;
      }

      const role = this.currentEvent.isOrganiser() ? 'Organiser' : 'Guest';
      const paymentMethods = this.paymentMethod === 'organiser' ? 'Organiser' : 'Guests';
      const paymentAmounts = this.paymentType === 'deposit' ? 'Deposit' : 'Balance';

      return this._messaging.filter((item: any) => {
        return !item.conditions || (
          (!item.conditions.role || item.conditions.role === role) &&
          (!item.conditions.paymentMethods || item.conditions.paymentMethods === paymentMethods) &&
          (!item.conditions.paymentAmounts || item.conditions.paymentAmounts === paymentAmounts));
      })[0];
    },

    _updatePaymentMessaging() {
      const context = {
        balanceAmount: this._restPayment,
        balanceDueDate: this.dateHelper.shortViewDateFormat(this._balanceDueDate),
        depositDueDate: this._depositDueDate ? this.dateHelper.shortViewDateFormat(this._depositDueDate) : null
      };

      this._dataTemplate.setContext(context);

      const result: Array<any> = [];

      const messaging = this.csLodash.cloneDeep(this._dataTemplate.getArray('paymentPage.messaging'));

      for (const item of messaging) {
        if (item.hasOwnProperty('message') && this.csLodash.isString(item['message'])) {
          item['message'] = this._dataTemplate.resolveTemplateVariable(item['message']);
        }

        result.push(item);
      }

      this._messaging = result;
    },

    _getPaymentFields(): Array<any> {
      return this._dataTemplate.getArray('paymentPage.fieldOrder')
        .map((item: string) => {
          const paymentFieldSettings = this._getPaymentFieldSettings(item);

          return {
            name: item,
            config: paymentFieldSettings.config,
            onChange: paymentFieldSettings.onChange
          };
        });
    },

    _getPaymentFieldSettings(fieldName: string): any {
      switch (fieldName) {
        case 'paymentMethods':
          return {
            config: this._getPaymentMethodsConfig(),
            onChange: this.onPaymentMethodChange.bind(this)
          };
        case 'paymentPeople':
          return {
            config: this._getPaymentPeopleConfig(),
            onChange: this.onPaymentPeopleChange.bind(this)
          };
        case 'paymentAmounts':
          return {
            config: this._getPaymentAmountsConfig(),
            onChange: this.onPaymentTypeChange.bind(this)
          };
        default:
          return {};
      }
    },

    _processPackageBookingStage() {
      if (!this._packageBookingStage.paymentMethods || !this._packageBookingStage.paymentMethods.length) {
        return;
      }

      if (!this.currentEvent.isOrganiser()) {
        this._packageBookingStage.paymentMethods = this._packageBookingStage.paymentMethods
          .filter((item: string) => {
            return item === 'guests';
          });
      }

      const paymentMethodsDefaultOption = this._dataTemplate.getValue('paymentPage.paymentMethods.default').toLowerCase();

      this._packageBookingStage.paymentMethods = this._packageBookingStage.paymentMethods
        .sort((itemA: string, itemB: string) => {
          if (itemA.toLowerCase() === paymentMethodsDefaultOption) {
            return -1;
          }

          if (itemB.toLowerCase() === paymentMethodsDefaultOption) {
            return 1;
          }

          return 0;
        })
    },

    _getPaymentMethodsConfig(): any {
      const showFieldIfOneOption = this._dataTemplate.getValue('paymentPage.paymentMethods.showFieldIfOneOption').toLowerCase() === 'yes';
      const fieldLabel = this._dataTemplate.getValue('paymentPage.paymentMethods.fieldLabel');
      const optionLabels = this._dataTemplate.getValue('paymentPage.paymentMethods.optionLabels');

      const paymentMethods = this._packageBookingStage.paymentMethods
        .map((item: string) => {
          return {
            title: optionLabels[item],
            value: item.toLowerCase()
          };
        });

      const showPaymentMethods = paymentMethods.length > 1 || (paymentMethods.length === 1 && showFieldIfOneOption);

      const disableField = !!this.currentEvent.getPaymentMethod();

      return {
        showField: showPaymentMethods,
        disableField: disableField,
        label: fieldLabel,
        selectOptions: paymentMethods,
        selectedOption: this.paymentMethod
      };
    },

    _getPaymentPeopleConfig() {
      const customers = this._getCustomers();
      const customersToPay = this._getCustomersToPay();

      const paymentPeopleFieldLabel = this._dataTemplate.getValue('paymentPage.paymentPeople.fieldLabel');

      let selectedCustomers = [];


      const disabledCustomers: Array<any> = customers.filter(item => {
        return customersToPay.findIndex(customerToPay => customerToPay.value === item.value) === -1;
      })
      .map(item => {
        return item.value;
      });

      if (this.paymentPeople.length) {
        this.paymentPeople.forEach(item => {
          const customer = customers.find(item => item.value === item.id);

          if (customer && disabledCustomers.indexOf(item.id) === -1) {
            selectedCustomers.push(customer);
          }
        })
      }

      if (!selectedCustomers.length) {
        const currentCustomerId = this.currentCustomer.getId();

        const paidForCustomersIdList = this.getPaidForCustomer(currentCustomerId)
          .map(item => item.id);

        if (!paidForCustomersIdList.length) {
          paidForCustomersIdList.push(currentCustomerId);
        }

        selectedCustomers = paidForCustomersIdList.filter(item => {
          return disabledCustomers.indexOf(item) === -1
        })
        .map(customerId => {
          return customers.find(item => {
            return item.value === customerId;
          });
        })
        .filter(item => !!item);
      }

      const showPaymentPeople: boolean = this.paymentMethod === 'guests';

      return {
        multiSelect: true,
        showField: showPaymentPeople,
        disableField: false,
        label: paymentPeopleFieldLabel,
        selectOptions: customers,
        disabledOptions: disabledCustomers,
        selectedOptions: selectedCustomers
      }
    },

    _getPaymentAmountsConfig() {
      const fieldLabel = this._dataTemplate.getValue('paymentPage.paymentAmounts.fieldLabel');
      const showFieldIfOneOption = this._dataTemplate.getValue('paymentPage.paymentAmounts.showFieldIfOneOption').toLowerCase() === 'yes';
      const optionLabels = this._dataTemplate.getValue('paymentPage.paymentAmounts.optionLabels');

      const defaultFieldName = this.currentEvent.isOrganiser() ? 'defaultOrganiser' : 'defaultGuest';
      const defaultValue = this._dataTemplate.getValue('paymentPage.paymentAmounts.' + defaultFieldName).toLowerCase();

      const paymentAmounts = (this.possiblePaymentTypes || [])
        .map((item: string) => {
          return {
            title: optionLabels[item],
            value: item.toLowerCase()
          };
        })
        .sort((itemA: any, itemB: any) => {
          if (itemA.value === defaultValue) {
            return -1;
          }

          if (itemB.value === defaultValue) {
            return 1;
          }

          return 0;
        });

      const showPaymentAmounts = this.paymentPeople.length === 1 &&
        (paymentAmounts.length > 1 || (paymentAmounts.length === 1 && showFieldIfOneOption));

      let shouldBeDisabled = false;
      let selectedOption = this.paymentType;

      if (!selectedOption && this.possiblePaymentTypes) {
        selectedOption = this.possiblePaymentTypes[0];
      }

      if (this.paymentMethod === 'guests' && !this.paymentPeople.length) {
        shouldBeDisabled = true;
        selectedOption = null;
      }

      return {
        showField: showPaymentAmounts,
        disableField: shouldBeDisabled,
        label: fieldLabel,
        selectOptions: paymentAmounts,
        selectedOption: selectedOption
      };
    },

    _getPaymentAdditionalInfo() {
      this._balanceDueDate = this.currentEvent.getBalanceDueDate() ? this.currentEvent.getBalanceDueDate() :
        this._getCalculatedBalanceDueDate();

      this._depositDueDate = this.currentEvent.getDepositDueDate() ? this.currentEvent.getDepositDueDate() :
        this._getCalculatedDepositDueDate();
    },

    _getCalculatedBalanceDueDate(): Date {
      if (!this._packageBookingStage.paymentAmounts.find((item: string) => item === 'balance') ||
        !this._packageBookingStage.hasOwnProperty('balance') ||
        !this._packageBookingStage.balance.hasOwnProperty('dueDaysBeforeEvent')) {
        return null;
      }

      const dueDaysBeforeEvent = this._packageBookingStage.balance.dueDaysBeforeEvent;
      const startDate = this.currentEvent.getCurrentPackage().getStartDate();

      let balanceDueDate = this.dateHelper.getDateInNDays(startDate, -dueDaysBeforeEvent);
      const now = new Date();

      if (balanceDueDate < now) {
        balanceDueDate = now;
      }

      return balanceDueDate;
    },

    _getCalculatedDepositDueDate(): Date {
      if (!this._packageBookingStage?.paymentAmounts?.find((item: string) => item === 'deposit') ||
        !this._packageBookingStage.hasOwnProperty('deposit') ||
        !this._packageBookingStage.deposit.hasOwnProperty('dueDaysAfterBooking')) {
        return null;
      }

      return this.dateHelper.getDateInNDays(new Date(),
        this._packageBookingStage.deposit.dueDaysAfterBooking);
    },

    _getPackageBookingStage(): Promise<any> {
      const currentEventId = this.currentEvent.getId();
      const currentPackageId = this.currentEvent.getCurrentPackage().getId();

      return this.eventService.getPackageBookingStage(currentEventId, currentPackageId);
    },

    // _storeCurrentState() {
    //   const url = unref(this.router.currentRoute).fullPath.split('?')[0];
    //   const {query} = unref(this.router.currentRoute);
    //
    //   this.localStorage.store('urlBeforePayment', {url, queryParams: query});
    // },

    _processError(error: any) {
      let messageToShow = this._commonErrorMessage;

      if (error) {
        const message = error.message || error;

        console.error(message);

        if (message.includes('paymentFail:')) {
          messageToShow = message.replace('paymentFail: ', '');
        }
      }

      this.showPaymentFailureDialog(messageToShow);
    },
  }
}

export default paymentDialogMixin;
