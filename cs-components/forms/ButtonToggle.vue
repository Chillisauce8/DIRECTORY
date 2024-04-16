<template>
  <div class="button-toggle">
    <template v-for="item in dataState.itemList">
      <div class="button"
                  :class="{'active': item === dataState.value}"
                  @click.native="updateValue(item)">{{item}}</div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import {reactive, watch} from 'vue';


interface ButtonToggleProps {
  modelValue: string;
  itemList: string[];
}


interface ButtonToggleEmits {
  (e: 'update:modelValue', value: string): void;
}


const props = defineProps<ButtonToggleProps>();
const emits = defineEmits<ButtonToggleEmits>();


const dataState = reactive({
  itemList: props.itemList ?? [],
  value: props?.modelValue ?? null,
  index: props?.itemList?.indexOf(props?.modelValue),
});


watch(() => props.itemList, (v) => {
  dataState.itemList = v;
  dataState.value = v.find(i => i === props.modelValue);
});

watch(() => props.modelValue, (v) => {
  if (v === dataState.value) {
    return;
  }

  const value = dataState.itemList.find(i => i === v);

  updateValue(value);
});


function updateValue(value: string): void {
  dataState.value = value;

  emits('update:modelValue', dataState.value);
}
</script>

<style lang="scss">
.button-toggle {
 // margin-left: 64px;
  display: flex;
  justify-content: center;
  & .button{
  //  margin: 0 0.5em;
    padding: 0 0.5em;
  }
    & .active {
      border-bottom: 2px solid $C1;
    }

}

</style>
