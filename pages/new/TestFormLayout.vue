<script setup lang="ts"></script>

<template>
    <FormBuilder :unformattedForm="unformattedForm" id="test form" :title="title" :subtitle="subtitle" />
</template>

<style lang="scss"></style>

<script setup>
import { ref } from 'vue';

// const selectedCity = ref();
// const cities = ref([
//     { name: 'New York', code: 'NY' },
//     { name: 'Rome', code: 'RM' },
//     { name: 'London', code: 'LDN' },
//     { name: 'Istanbul', code: 'IST' },
//     { name: 'Paris', code: 'PRS' }
// ]);
//
// const value1 = ref(42723);
// const value2 = ref(58151);
// const value3 = ref(2351.35);
// const value4 = ref(50);

const title = 'Test Form Title';
const subtitle = 'This is where a subtitle would go which could explain a little bit more about the form below';

const unformattedForm = ref({
    name: {
        type: 'string',
        title: 'Name'
    },
    testing: {
        title: 'Testing Nesting',
        type: 'object',
        properties: {
            this: {
                type: 'string',
                title: 'Name'
            },
            that: {
                type: 'string',
                title: 'Description',
                maxLength: 2000,
                component: 'Textarea',
                props: {
                    autoResize: true,
                    rows: 20,
                    cols: 30
                }
            },
            deeper: {
                title: 'Deeper Nesting',
                type: 'object',
                properties: {
                    this: {
                        type: 'string',
                        title: 'Deeper Nested'
                    },
                    that: {
                        type: 'string',
                        title: 'Deeper Nested Description',
                        maxLength: 2000,
                        component: 'Textarea',
                        props: {
                            autoResize: true,
                            rows: 20,
                            cols: 30
                        }
                    }
                }
            }
        }
    },
    rowStart: {
        type: 'container',
        class: 'row',
        title: 'Test Row Start'
    },
    completed: {
        type: 'boolean',
        title: 'Completed'
    },
    status: {
        type: 'string',
        title: 'Status',
        errorMessage: 'Here is message to display on error',
        enum: ['Waiting', 'Approved', 'Complete']
    },
    testString: {
        type: 'string',
        title: 'Test another String',
        subtext: 'here is an example of some form sub text'
    },
    rowEnd: {
        type: '/container'
    },
    pageOrder: {
        type: 'array',
        title: 'Page Order - Array of Object',
        containerClass: 'object',
        hide: {
            if: "['productCategoryGroup', 'locationGroup', 'blog'].includes(/type) === false",
            value: true
        },
        items: {
            type: 'object',
            properties: {
                testString: {
                    type: 'string',
                    title: 'Test String',
                    subtext: 'here is an example of some form sub text'
                },
                section: {
                    type: 'array',
                    title: 'Section',
                    line: 2,
                    fieldType: 'multiselect',
                    items: {
                        type: 'string',
                        enum: ['stag', 'hen', 'groups', 'events', 'golf', 'vouchers']
                    }
                },
                internalObject: {
                    title: 'Internal Object',
                    type: 'object',
                    if: "showInternalArray !== true'",
                    then: {
                        hide: true
                    },
                    hide: 'showInternalArray',
                    properties: {
                        testString2: {
                            type: 'string',
                            title: 'Test String 2',
                            subtext: 'here is an example of some form sub text'
                        },
                        section2: {
                            type: 'array',
                            title: 'Section 2',
                            line: 2,
                            fieldType: 'multiselect',
                            items: {
                                type: 'string',
                                enum: ['stag', 'hen', 'groups', 'events', 'golf', 'vouchers']
                            }
                        }
                    }
                }
            }
        }
    },
    status2: {
        type: 'string',
        title: 'Status 2',
        enum: ['Waiting', 'Approved', 'Complete']
    },
    testArrayString: {
        type: 'array',
        title: 'Test Array String',
        items: {
            type: 'string'
        }
    }
});
</script>
