import {
  DefaultPermissionsHelperService
} from '~/service/user-common/permissions-helper.service';

import { serviceComposableFactory } from '~/service/service-composable-factory';

const serviceToken = 'usePermissionsHelperService';

export const usePermissionsHelperService =
  serviceComposableFactory(
    serviceToken,
    nuxtApp => new DefaultPermissionsHelperService());

