import BlockViewer from '@/components/BlockViewer.vue';
import InputText from 'primevue/inputtext';
import AutoComplete from "primevue/autocomplete";
import Textarea from "primevue/textarea";
import InputNumber from "primevue/inputnumber";
import ToggleSwitch from "primevue/toggleswitch";
import Checkbox from "primevue/checkbox";
import MultiSelect from "primevue/multiselect";
import Select from "primevue/select";
import InputChips from "primevue/inputchips";
import DatePicker from "primevue/datepicker";

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.component('BlockViewer', BlockViewer);
    nuxtApp.vueApp.component('InputText', InputText);
    nuxtApp.vueApp.component('AutoComplete', AutoComplete);
    nuxtApp.vueApp.component('Textarea', Textarea);
    nuxtApp.vueApp.component('InputNumber', InputNumber);
    nuxtApp.vueApp.component('DatePicker', DatePicker);
    nuxtApp.vueApp.component('ToggleSwitch', ToggleSwitch);
    nuxtApp.vueApp.component('Checkbox', Checkbox);
    nuxtApp.vueApp.component('MultiSelect', MultiSelect);
    nuxtApp.vueApp.component('InputChips', InputChips);
    nuxtApp.vueApp.component('Select', Select);
});
