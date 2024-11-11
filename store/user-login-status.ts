import {definePiniaStoreWithCache} from '~/service/store/define-pinia-store-with-cache';


interface UserLoginStatusStoreStateStatus {
  value: 'loginStarted' | 'loginSuccessful' | 'loginFailed' | 'logoutStarted' | 'logoutSuccessful';
  data?: any;
}


interface UserLoginStatusStoreState {
  status: UserLoginStatusStoreStateStatus|null;
}


export const useUserLoginStatusStore = definePiniaStoreWithCache('userLoginStatus', {
  state: (): UserLoginStatusStoreState => ({
    status: null,
  }),
  getters: {

  },
  actions: {
    set(status: UserLoginStatusStoreStateStatus): void {
      this.status = status;
    },
    reset() {
      this.$reset();
    }
  },
});


export type UserLoginStatusStore = ReturnType<typeof useUserLoginStatusStore>;
