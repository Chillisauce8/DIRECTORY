export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.config.errorHandler = (error, instance, info) => {
    console.group('Vue Error Handler');
    console.error('Error:', error);
    console.log('Component:', instance);
    console.log('Info:', info);
    console.groupEnd();
  };

  window.addEventListener('unhandledrejection', event => {
    console.group('Unhandled Promise Rejection');
    console.error('Error:', event.reason);
    console.log('Promise:', event.promise);
    console.groupEnd();
  });
});
