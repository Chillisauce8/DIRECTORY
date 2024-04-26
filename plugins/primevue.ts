import PrimeVueStyled from 'primevue/styled';
import Button from 'primevue/button';

export default defineNuxtPlugin(async nuxtApp => {
  nuxtApp.vueApp.use(PrimeVueStyled);
  nuxtApp.vueApp.component('PrimeButton', Button);
});
