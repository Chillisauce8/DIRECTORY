import {definePiniaStoreWithCache} from '~/service/store/define-pinia-store-with-cache';


interface UserSessionStatusStoreStateStatus {
  value: 'done';
  data?: any;
}


interface UserSessionStatusStoreState {
  status: UserSessionStatusStoreStateStatus|null;
}


export const useUserSessionStatusStore = definePiniaStoreWithCache('userSessionStatus', {
  state: (): UserSessionStatusStoreState => ({
    status: null
  }),
  getters: {

  },
  actions: {
    set(status: UserSessionStatusStoreStateStatus): void {
      this.status = status;
    },
    reset(): void {
      this.$reset();
    }
  },
});


export type UserSessionStatusStore = ReturnType<typeof useUserSessionStatusStore>;
