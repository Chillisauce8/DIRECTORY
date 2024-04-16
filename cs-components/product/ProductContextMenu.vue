<template>
  <ContextMenu v-if="props.params && vm.items?.length > 0" v-model:show="vm.opened" :options="vm.options">
    <template v-for="item in vm.items">
      <ContextMenuItem :label="item.label"
                       @click="onClick(item.dayIndex)">
      </ContextMenuItem>
    </template>
  </ContextMenu>
</template>


<script setup lang="ts">
import type { IProductContextMenuItem } from "~/services/helpers/product/product-context-menu.service";
import type { IOpenContextMenuParams } from "~/services/helpers/context-menu-helper.service";
import type { MenuOptions } from "~/components/context-menu/ContextMenuDefine";
import ContextMenu from "~/components/context-menu/ContextMenu.vue";
import ContextMenuItem from "~/components/context-menu/ContextMenuItem.vue";


interface ProductContextMenuProps {
  items: IProductContextMenuItem[],
  params?: IOpenContextMenuParams;
}

interface ProductContextMenuEmits {
  (e: 'click', value: number): void;
}

interface ProductContextMenuVM {
  opened: boolean;
  options: MenuOptions;
  items: IProductContextMenuItem[];
}


const props = defineProps<ProductContextMenuProps>();
const emits = defineEmits<ProductContextMenuEmits>();

const vm = reactive<ProductContextMenuVM>({
  opened: false,
  options: undefined,
  items: undefined,
});


function init() {
  vm.opened = false;
  vm.options = undefined;
  vm.items = props.items;
}

function onClick(dayIndex: number) {
  emits('click', dayIndex);
}


onMounted(() => {
  init();
});


watch(
  () => props.params,
  v => {
    if (!v) {
      return;
    }

    init();

    vm.opened = true;

    vm.options = {
      ...(props.params as any),
      closeWhenScroll: false,
    };
  },
  {deep: true},
);
</script>

<style scoped lang="scss">

</style>
