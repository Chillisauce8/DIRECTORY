import { RoleServiceImpl } from '~/service/user-common/role.service';
import {useRolesStore} from '~/store/roles';
import { serviceComposableFactory } from '~/service/service-composable-factory';


const serviceToken = 'useRoleService';

export const useRoleService = serviceComposableFactory(serviceToken, nuxtApp => {
  const rolesStore = useRolesStore(nuxtApp?.$pinia);

  return new RoleServiceImpl(rolesStore);
});
