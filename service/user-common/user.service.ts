import {CurrentUser} from '~/service/user-common/current-user.service';
import {RoleService} from '~/service/user-common/role.service';
// import {CookieService} from '~/service/storage/cookie.service';
// import {ChilliLocalStorageService} from '~/service/storage/chilli-local-storage.service';
import type {UserLoginStatusStore} from '~/store/user-login-status';
import type {UserRegistrationStatusStore} from '~/store/user-registration-status';
import type {UserSessionStatusStore} from '~/store/user-session-status';
import {
  HttpService
} from '~/service/http/http.service';
import type {
  BaseHttpResponseData,
  CommonHttpResponseData,
  HttpResponseData,
} from '~/service/http/http.service';
import {UserCustomCollections} from '~/service/user-common/user-data.interface';
import type { UserData} from '~/service/user-common/user-data.interface';


export enum SwpUserType {
  staff = 'swpStaff',
  customer = 'swpCustomer',
}

export enum UserTypes {
  staff = 'staff',
  customer = 'customer',
  supplierContact = 'supplierContact'
}


export enum LoginMethod {
  auto = 'auto',
  loginForm = 'loginForm',
  token = 'token',
  cookie = 'cookie',
}


export interface RegistrationUserParams {
  email: string;
  lastName: string;
  firstName: string,
  phone?: string,
}


export interface EmailValidationData {
  isEmailValid: boolean;
  isValidationOverridden?: boolean;
}


export interface RegistrationCustomerParams extends RegistrationUserParams {
  emailValidation: EmailValidationData;
  verifiedPhone: boolean;
  password?: string;
}


export type UserSessionActionType = 'registrationStarted' |
  'registrationFailed' |
  'registrationSuccessful' |
  'loginStarted' |
  'loginFailed' |
  'loginSuccessful' |
  'logoutStarted' |
  'logoutSuccessful';


export type UserSessionActionData = LoginMethod | {loginMethod: LoginMethod, reason: string} | string | Event | void;


interface UserAPIResponse extends BaseHttpResponseData {
  user: UserData;
}


export interface UserRegistrationSettings {
  generatePassword: boolean;
  customCollection: UserCustomCollections;
  enforcePassword?: boolean;
  loginUser?: boolean;
  selfRegistration?: boolean;
}


export class UserService {

  constructor(private httpService: HttpService,
              private userLoginStatusStore: UserLoginStatusStore,
              private userRegistrationStatusStore: UserRegistrationStatusStore,
              private userSessionStatusStore: UserSessionStatusStore,
              private currentUser: CurrentUser,
              private roleService: RoleService,
              //private localStorage: ChilliLocalStorageService,
              //private cookieService: CookieService
  ) {

  }

  splitFullName(fullName: string) {
    const names = fullName.trim().split(' ');
    const firstName = names[0];
    const lastName = names.length > 1 ? names.slice(1).join(' ') : '';

    return {firstName: firstName.trim(), lastName: lastName.trim()};
  }

  public getLoginAPIUrl(): string {
    return '/api/login';
  }

  public getRegistrationAPIUrl(): string {
    return '/api/register/app-user';
  }

  public getGoogleLoginRedirectUrlGetterUrl(username?: string): string {
    throw 'need to implement'
    return `/getOAuthGoogleLoginUrl/${username}`;
  }

  public getLogoutAPIUrl(): string {
    return '/api/logout';
  }

  public getUserAPIUrl(): string {
    return '/api/user';
  }

  public getRegisteredCookieName(): string {
    return 'registered';
  }

  public getLastUserTypeStorageKey() {
    return 'lastUserType';
  }

  public async getMinifiedUserNode(userId: string): Promise<UserData> {
    try {
      return (await this.httpService.get<UserData>(`/api/user/minified/${userId}`))?.data;
    } catch (e) {
      return null;
    }
  }

  public async checkLoginTokenActual(): Promise<void> {
    if (!this.isPossibleToRestoreUserByCookies()) {
      this.notifySessionRestoringDone();
      this.currentUser.reset();
      throw Error('Empty user data');
    }

    this.notifyUserLogInStarted(LoginMethod.cookie);

    let response: CommonHttpResponseData<UserData>;

    try {
      response = await this.httpService.get<UserData>(this.getUserAPIUrl());
    } catch (e) {

    }

    const userData = response?.data ?? null;

    if (!userData) {
      this.currentUser.reset();
      this.notifySessionRestoringDone();

      throw 'Empty user data';
    }

    this.currentUser.set(userData);

    await this.fetchRolesForCurrentUser();

    // this.rememberLastUserType();

    this.notifyUserHasLoggedIn(LoginMethod.cookie);
    this.notifySessionRestoringDone();
  }

  public async login(username: string, password: string, auto: boolean = false): Promise<UserData> {
    const data = {username: username, password: password};

    const loginMethod: LoginMethod = auto ? LoginMethod.auto : LoginMethod.loginForm;

    this.notifyUserLogInStarted(loginMethod);

    let response: HttpResponseData<UserData>;

    try {
      response = await this.httpService.post<UserData>(this.getLoginAPIUrl(), data);
    } catch (ex) {
      const data = (ex as any).response?.data;

      const error = (data as any)?.message ?? data ?? ex;

      this.notifyUserLoggedInFail(loginMethod, error);
      throw data ?? ex;
    }

    return this.handleLoginResponse(response, loginMethod);
  }

  public async logout(): Promise<void> {
    const loggingOutStartedEvent = new CustomEvent('loggingOutStarted', {cancelable: true});
    this.notifyUserLoggingOutStarted(loggingOutStartedEvent);

    if (loggingOutStartedEvent.defaultPrevented) {
      return;
      // return 'Logout prevented';
    }

    return this.httpService.get<void>(this.getLogoutAPIUrl())
      .then(() => this.currentUser.reset())
      .then(() => this.notifyUserLoggedOut());
  }

  // public getLastUserType(): string {
  //   return this.localStorage.retrieve(this.getLastUserTypeStorageKey());
  // }

  public async register(registrationData: RegistrationUserParams,
                        registerSettings: UserRegistrationSettings): Promise<UserData> {
    const settings = {
      enforcePassword: false,
      loginUser: true,
      ...registerSettings,
      selfRegistration: !!this.currentUser.getId(),
    };

    this.notifyUserRegistrationStarted();

    const requestData = {
      settings,
      user: {
        general: registrationData,
        content: {},
      },
    };

    let responseData: HttpResponseData<UserData>;

    try {
      responseData = await this.httpService.post<UserData>(this.getRegistrationAPIUrl(), requestData);
    } catch (e) {
      this.notifyUserRegistrationFailed(e as string);

      throw e;
    }

    this.notifyUserHasRegistered();

    return responseData.data;
  }

  public async registerCustomer(registrationData: RegistrationCustomerParams,
                                settings: Partial<UserRegistrationSettings> = {}): Promise<UserData> {
    const {email, password, lastName, firstName, phone, emailValidation, verifiedPhone} = registrationData;

    const preparedRegistrationData = {
      username: email,
      password: password,
      email: email,
      lastName: lastName,
      firstName: firstName,
      phone: phone,
      type: UserTypes.customer,
      emailValidation: emailValidation,
      phoneVerified: verifiedPhone,
    };

    return this.register(preparedRegistrationData, {
      generatePassword: false,
      ...settings,
      customCollection: UserCustomCollections.customers,
    });
  }

  public async registerCustomerWithPasswordGeneration(registrationData: RegistrationCustomerParams,
                                                      settings: Partial<UserRegistrationSettings> = {}): Promise<UserData> {
    const {email, lastName, firstName, phone, emailValidation, verifiedPhone} = registrationData;

    const preparedRegistrationData = {
      username: email,
      email: email,
      lastName: lastName,
      firstName: firstName,
      phone: phone,
      generatePassword: true,
      sendInvite: true,
      type: UserTypes.customer,
      emailValidation: emailValidation,
      phoneVerified: verifiedPhone,
    };

    return this.register(preparedRegistrationData, {
      ...settings,
      customCollection: UserCustomCollections.customers,
      generatePassword: true
    });
  }

  public async handleLoginResponse(response: UserAPIResponse | HttpResponseData<UserData>,
                                   loginMethod: LoginMethod): Promise<UserData> {
    let user: any;

    if (response) {
      user = (response as UserAPIResponse)?.user ??
        (response as HttpResponseData<UserData>).data ?? response;
    } else {
      const reason = 'empty user data';
      this.notifyUserLoggedInFail(loginMethod, reason);
      throw new Error(reason);
    }

    this.currentUser.resetPreviousStaff();
    this.currentUser.set(user);

    await this.fetchRolesForCurrentUser();
    await this.notifyUserHasLoggedIn(loginMethod);

    this.rememberLastUserType();
    // this.rememberUserWasRegistered();

    return user;
  }

  async sendRecoveryPasswordMessage(email: string): Promise<any> {
    // TODO:
    return this.httpService.post(`${this.getUserAPIUrl()}/recovery`, {email: email});
  }

  async setNewPasswordWithToken(token: string, password: string): Promise<any> {
    // TODO:
    return this.httpService.post(`${this.getUserAPIUrl()}/password?token=${token}&password=${password}`);
  }

  async getPasswordStrengthByToken(token: string): Promise<any> {
    // TODO:
    return this.httpService.post(`${this.getUserAPIUrl()}/password/strength?token=${token}`);
  }

  public async updateAccount(accountData: Object): Promise<any> {
    return this.httpService.update<UserData>(this.getUserAPIUrl(), accountData)
      .then(({data: userData}) => {

          if (this.currentUser.isHiddenStaff()) {
            userData.roles = this.currentUser.getHiddenStaffData()?.roles;

            this.currentUser.setPreviousStaffData(userData);

            return;
          }

          const roles = this.currentUser.getRoles();
          this.currentUser.set(userData);
          this.currentUser.setRoles(roles);
        })
        .catch((reason: string) => {
          if (reason === 'Timeout error') {
            return this.checkLoginTokenActual();
          } else {
            throw reason;
          }
        });
  }

  // public checkWasEverRegistered(): boolean {
  //   return !!this.localStorage.retrieve(this.getRegisteredCookieName());
  // }

  protected notifyUserRegistrationStarted() {
    this.userRegistrationStatusStore.set({value: 'registrationStarted'});
  }

  protected notifyUserRegistrationFailed(reason: string) {
    this.userRegistrationStatusStore.set({value: 'registrationFailed', data: reason});
  }

  private notifyUserHasRegistered() {
    this.userRegistrationStatusStore.set({value: 'registrationSuccessful'});
  }

  protected notifyUserLogInStarted(loginMethod: LoginMethod) {
    this.userLoginStatusStore.set({value: 'loginStarted', data: loginMethod});
  }

  protected notifyUserHasLoggedIn(loginMethod: LoginMethod) {
    this.userLoginStatusStore.set({value: 'loginSuccessful', data: loginMethod});
  }

  protected notifyUserLoggedInFail(loginMethod: LoginMethod, reason: string) {
    this.userLoginStatusStore.set({value: 'loginFailed', data: {loginMethod, reason}});
  }

  protected notifyUserLoggingOutStarted(event: Event) {
    this.userLoginStatusStore.set({value: 'logoutStarted', data: event});
  }

  protected notifyUserLoggedOut() {
    this.userLoginStatusStore.set({value: 'logoutSuccessful'});
  }

  protected notifySessionRestoringDone() {
    this.userSessionStatusStore.set({value: 'done'});
  }

  private isPossibleToRestoreUserByCookies(): boolean {
    if (!this.currentUser.hasUserSession()) {
      return false;
    }

    if (!this.currentUser.wasRegistered()) {
      return false;
    }

    if (!this.getLastUserType()) {
      return false;
    }

    return true;
  }

  // private rememberUserWasRegistered() {
  //   const isRegisteredCookie = this.cookieService.get(this.getRegisteredCookieName());
  //   this.localStorage.store(this.getRegisteredCookieName(), isRegisteredCookie);
  // }

  private async getRolesByNames(names: string[]): Promise<any> {
    if (!names || !names.length) {
      return [];
    }

    return Promise.all(names.map(name => this.roleService.getByName(name)));
  }

  private async fetchRolesForCurrentUser(): Promise<any> {
    const roles: any[] = this.currentUser.getRoles();

    if (!roles || !roles.length) {
      return null;
    }

    return this.getRolesByNames(roles.map(role => role['name']))
      .then((fetchedRoles: any[]) => {
        this.currentUser.setRoles(fetchedRoles);
      });
  }

  // private rememberLastUserType() {
  //   const lastUserType = this.currentUser.getType();
  //
  //   if (lastUserType) {
  //     this.localStorage.store(this.getLastUserTypeStorageKey(), lastUserType);
  //   }
  // }
}
