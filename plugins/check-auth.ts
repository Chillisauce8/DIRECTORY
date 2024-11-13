import {useUserService} from '~/service/user-common/user-service.factory';
import {LoginMethod, UserService} from '~/service/user-common/user.service';
import type {CurrentUserStore} from '~/store/current-user';
import {useCurrentUserStore} from '~/store/current-user';
import type {UserLoginStatusStore} from '~/store/user-login-status';
import {useUserLoginStatusStore} from '~/store/user-login-status';
import type { RouteLocationNormalized, Router } from 'vue-router';
// import {useCurrentCustomer} from '~/service/user-common/current-customer-service.factory';
// import {CurrentCustomer} from '~/service/user-common/current-customer.service';
// import type {CurrentCustomerIdStore} from '~/store/currentCustomerId';
// import {useCurrentCustomerIdStore} from '~/store/currentCustomerId';
import {useCurrentUser} from '~/service/user-common/current-user.factory';
import {CurrentUser} from '~/service/user-common/current-user.service';
import type {NuxtApp} from '#app';


let userService: UserService;
let currentUserStore: CurrentUserStore;
let userLoginStatusStore: UserLoginStatusStore;
let currentUser: CurrentUser;
let router: Router;


function initUserServices(): void {
  userService = useUserService();
  currentUser = useCurrentUser();
}


function initCurrentUserStore(nuxtApp: NuxtApp): void {
  currentUserStore = useCurrentUserStore(nuxtApp?.$pinia);
  userLoginStatusStore = useUserLoginStatusStore(nuxtApp?.$pinia)
}


function initRouter(): void {
  router = useRouter();
}


async function restoreUserByCookieIfPossible(): Promise<void> {
  try {
    await userService.checkLoginTokenActual();
    await onUserSignIn(LoginMethod.cookie);
  } catch (e) {
    await subscribeOnUserSignIn();
  }
}


async function onUserSignIn(loginMethod: LoginMethod): Promise<void> {
  // if (loginMethod !== LoginMethod.cookie) {
  //   const redirectUrl = await restoreCurrentCustomerIfPossible(unref(router.currentRoute));
  // }

  await subscribeOnUserSignOut();
}


async function onUserSignOut(): Promise<void> {
  // currentCustomer.clear();
  await subscribeOnUserSignIn();
}


async function subscribeOnUserSignIn(): Promise<void> {
  const unsubscribe = userLoginStatusStore.$onAction(({name, args, after}) => {
    if (name !== 'set' || args[0]?.value !== 'loginSuccessful') {
      return;
    }

    after(async () => {
      await onUserSignIn(userLoginStatusStore.status.data);

      unsubscribe();
    });
  });
}


async function subscribeOnUserSignOut(): Promise<void> {
  const unsubscribe = currentUserStore.$onAction(({name, after}) => {
    if (name !== 'reset') {
      return;
    }

    if (!currentUserStore.user) {
      return;
    }

    after(async () => {
      await onUserSignOut();

      unsubscribe();
    });
  });
}


export default defineNuxtPlugin((nuxtApp: NuxtApp) => {
  initRouter();
  initUserServices();
  initCurrentUserStore(nuxtApp);

  const unsubscribe = router.beforeEach(async (to, from, next) => {

    //
    // await subscribeOnUserSignOut();
    // await subscribeOnUserSignIn();

    await restoreUserByCookieIfPossible();

    unsubscribe();

    next();
  });
});

