<script setup lang="ts">
import {vAutofocus} from '~/utils/directives/autofocus';
import {useCompanyService} from '~/service/helpers/company.service.factory';


interface CompanyEditorProps {
  modelValue: any;
  placeholder?: string;
  minChars?: number;
  autofocus?: boolean;
  disabled?: boolean;
}


interface CompanyEditorEmits {
  (e: 'update:modelValue', value: any): void;
}


const companyService = useCompanyService();


const props = withDefaults(defineProps<CompanyEditorProps>(), {
  placeholder: 'Company, at least 3 chars',
  minChars: 3,
  autofocus: false,
});

const emits = defineEmits<CompanyEditorEmits>();


function autocompleteItemTextGetter(item: any): string {
  return item.name;
}

async function optionsListGetter(searchString: string) {
  const fields = {
    _doc: 1,
    name: 1,
    domain: 1,
  };

  searchString = searchString.trim();

  const queryConfig = {
    searchString,
    fields,
    count: 1000,
    page: 0,
  };

  const companyList = await companyService.getList(queryConfig);

  return this._sortResult(companyList);
}

function _sortResult(companyList: Array<any>): Array<any> {
  return companyList.sort((item1: any, item2: any) => {
    const name1 = item1.name ? item1.name.toLowerCase() : item1.domain?.toLowerCase();
    const name2 = item2.name ? item2.name.toLowerCase() : item2.domain?.toLowerCase();

    if (name1 < name2) { return -1; }
    if (name1 > name2) { return 1; }
    return 0;
  });
}
</script>

<template>
  <LazyCSAutocomplete v-autofocus="{disabled: props?.autofocus !== true}"
                  :model-value="props?.modelValue"
                  :placeholder="props.placeholder"
                  :min-chars="props.minChars"
                  :options-list-getter="optionsListGetter"
                  :label-getter="v => v.name"
                  :disabled="props.disabled"
                  @update:modelValue="emits('update:modelValue', $event)">
  </LazyCSAutocomplete>
</template>

<style scoped lang="scss">

</style>
