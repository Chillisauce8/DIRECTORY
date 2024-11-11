import type {RoleDbNode} from '~/service/user-common/role.typings';
import {definePiniaStoreWithCache} from '~/service/store/define-pinia-store-with-cache';
import { httpService } from '~/service/http/http.service';


interface RolesStoreStateRolesMap {
  [name: string]: RoleDbNode;
}


interface RolesStoreState {
  roles: RolesStoreStateRolesMap;
  loading: boolean;
  error: string;
}


export const useRolesStore = definePiniaStoreWithCache('roles', {
  state: (): RolesStoreState => ({
    roles: {},
    loading: false,
    error: '',
  }),
  getters: {
    data: state => state.roles,
    byName: state => name => state?.roles?.[name] ?? null,
  },
  actions: {
    set({name, data}: {name: string; data: RoleDbNode}): void {
      this.roles[name] = data;
    },
    reset(): void {
      this.roles = [];
    },
    setLoading(isLoading: boolean): void {
      this.loading = isLoading;
    },
    setError(error: string): void {
      this.error = error;
    },
    async fetchByName({roleName}: {roleName: string}): Promise<void> {
      if (this.byName(roleName)) {
        return;
      }

      this.setLoading(true);

      try {
        const url = '/api/role/name/';

        const response = await httpService.get<RoleDbNode[]>(url + roleName);

        const data = response.data;
        this.set({name: roleName, data});
      } catch (ex) {
        console.log('roles fetch error: ' + ex.message);
        this.setError(ex.message);
      } finally {
        this.setLoading(false);
      }
    },

  },
});


export type RoleStore = ReturnType<typeof useRolesStore>;
