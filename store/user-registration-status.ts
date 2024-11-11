import {definePiniaStoreWithCache} from '~/service/store/define-pinia-store-with-cache';


interface UserRegistrationStatusStoreStateStatus {
  value: 'registrationStarted' | 'registrationFailed' | 'registrationSuccessful';
  data?: any;
}


interface UserRegistrationStatusStoreState {
  status: UserRegistrationStatusStoreStateStatus|null;
}


export const useUserRegistrationStatusStore = definePiniaStoreWithCache('userRegistrationStatus', {
  state: (): UserRegistrationStatusStoreState => ({
    status: null,
  }),
  getters: {},
  actions: {
    set(status: UserRegistrationStatusStoreStateStatus): void {
      this.status = status;
    },
    reset(): void {
      this.$reset();
    }
  },
});


export type UserRegistrationStatusStore = ReturnType<typeof useUserRegistrationStatusStore>;

