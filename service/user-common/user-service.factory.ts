import { UserService } from '~/service/user-common/user.service';
import { useCurrentUser } from '~/service/user-common/current-user.factory';
import { useRoleService } from '~/service/user-common/role-service.factory';
// import { useCookieService } from '~/service/storage/cookie-service.factory';
// import chilliLocalStorageService from '~/service/storage/chilli-local-storage.service';
import {useUserLoginStatusStore} from '~/store/user-login-status';
import {useUserRegistrationStatusStore} from '~/store/user-registration-status';
import {useUserSessionStatusStore} from '~/store/user-session-status';
import { getServiceInstance, storeServiceInstance } from "~/service/services-store";
import { httpService } from '~/service/http/http.service';
import { serviceComposableFactory } from '~/service/service-composable-factory';

const serviceToken = 'useUserService';

export const useUserService = serviceComposableFactory(serviceToken, nuxtApp => {
  const currentUser = useCurrentUser();
  const roleService = useRoleService();
  // const localStorage = chilliLocalStorageService;
  // const cookieService = useCookieService();
  const userLoginStatusStore = useUserLoginStatusStore();
  const userRegistrationStatusStore = useUserRegistrationStatusStore();
  const userSessionStatusStore = useUserSessionStatusStore();

  return new UserService(httpService, userLoginStatusStore, userRegistrationStatusStore, userSessionStatusStore,
    currentUser, roleService);
  // localStorage, cookieService);
});
