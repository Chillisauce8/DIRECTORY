import {definePiniaStoreWithCache} from '~/service/store/define-pinia-store-with-cache';
import type { BaseUserDbNode } from '~/service/user-common/user-data.interface';


export interface CurrentUserStoreState {
  user: BaseUserDbNode|null;
}


export const useCurrentUserStore = definePiniaStoreWithCache('currentUser', {
  state: (): CurrentUserStoreState => ({
    user: null,

  }),
  getters: {

  },
  actions: {
    set(userData: BaseUserDbNode): void {
      this.user = userData;
    },
    reset(): void {
      this.$reset();
    },
  },
});


export type CurrentUserStore = ReturnType<typeof useCurrentUserStore>;
