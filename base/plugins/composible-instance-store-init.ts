export default defineNuxtPlugin({
  name: 'composibleInstanceStore',
  setup: (nuxtApp) => {
    const composibleInstanceStore = {};

    return {
      provide: {
        composibleInstanceStore,
      },
    };
  },
});