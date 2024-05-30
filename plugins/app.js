import BlockViewer from '@/components/BlockViewer.vue';
import Tooltip from 'primevue/tooltip';

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.component('BlockViewer', BlockViewer);
});
