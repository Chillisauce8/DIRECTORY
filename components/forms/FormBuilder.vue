<template>
    <div class="form">
        <template v-for="(value, index) in schema">
            <div>Index: {{ index }} Value: {{ value }}</div>
            <div v-if="value.type" class="field-group" :class="[index, value.type]">
                <div class="field" :id="getFieldId(index, parent)">
                    <label for="integeronly"> {{ index }} </label>
                    <component v-if="value.component" v-bind="value.props" :is="value.component" />
                    <component v-else v-bind="defaultField[value.type].props" :is="defaultField[value.type].field" />
                </div>
            </div>
            <FormBuilder v-if="checkObject(value)" :schema="value" :parent="getFieldId(index, parent)" />
        </template>
    </div>
</template>
<script setup>
const props = defineProps({
    schema: Object,
    parent: String
});

const value = '';
const defaultField = {
    string: {
        field: 'InputText',
        props: {}
    },
    boolean: {
        field: 'InputSwitch',
        props: {}
    },
    number: {
        field: 'InputNumber',
        props: {}
    },
    array: {
        field: 'InputNumber',
        props: {}
    },
    object: {
        field: 'InputNumber',
        props: {}
    }
};

function getFieldId(index, parent) {
    if (parent) {
        console.log(parent + '.' + index);
        return parent + '.' + index;
    } else {
        console.log(index);
        return index;
    }
}

function checkObject(index, value) {
    if ((typeof value == 'object' && index == 'properties') || index == 'items') {
        console.log(typeof value);

        return true;
    } else {
        console.log(typeof value);
        console.log(value);
        return false;
    }
}
</script>
<style lang="scss"></style>
