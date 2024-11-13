import {CurrentUser} from '~/service/user-common/current-user.service';
import { usePermissionsHelperService } from '~/service/user-common/permissions-helper.factory';
import {useCurrentUserStore} from '~/store/current-user';
import { serviceComposableFactory } from '~/service/service-composable-factory';


const serviceToken = 'useCurrentUser';

export const useCurrentUser = serviceComposableFactory(serviceToken, nuxtApp => {
  const permissionsHelperService = usePermissionsHelperService();
  const currentUserStore = useCurrentUserStore(nuxtApp?.$pinia);

  return new CurrentUser(permissionsHelperService, currentUserStore);
});
