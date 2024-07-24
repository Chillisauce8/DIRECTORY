<script setup lang="ts"></script>

<template>
    <div class="form">
        <div class="object">
            <div class="field-group">
                <div class="field">
                    <label for="text">Username</label>
                    <InputText id="text" v-model="value" />
                </div>
            </div>

            <div class="field-group">
                <div class="field">
                    <label for="username">Username</label>
                    <InputText id="username" v-model="value" />
                    <div class="message">Enter your username to reset your password.</div>
                </div>
            </div>
        </div>
        <div class="object">
            <div class="field-group">
                <div class="field" style="max-width: 250px">
                    <label for="username">Username</label>
                    <InputText id="username" v-model="value" />
                    <div class="message">Enter your username to reset your password.</div>
                </div>
            </div>
            <div class="field-group">
                <div class="field">
                    <label for="username">Rating</label>
                    <Rating v-model="valueX" />
                </div>
            </div>
            <div class="field-group">
                <div class="field">
                    <label for="username">Username</label>
                    <InputText id="username" v-model="value" />
                </div>
            </div>
            <div class="field-group">
                <div class="field">
                    <label for="city-select">List Box</label>
                    <Listbox id="city-select" v-model="selectedCity" :options="cities" optionLabel="name" />
                </div>
            </div>
            <div class="field-group">
                <div class="field">
                    <label for="city-select">List Box</label>
                    <Listbox id="city-select" v-model="selectedCity" :options="cities" optionLabel="name" />
                </div>
            </div>
            <div class="object">
                <div class="row-start field-group">
                    <div class="field">
                        <label for="integeronly"> Integer Only </label>
                        <InputNumber v-model="value1" inputId="integeronly" fluid />
                    </div>
                    <div class="field">
                        <label for="withoutgrouping"> Without Grouping </label>
                        <InputNumber v-model="value2" inputId="withoutgrouping" :useGrouping="false" fluid />
                    </div>
                    <div class="field">
                        <label for="minmaxfraction"> Min-Max Fraction Digits </label>
                        <InputNumber v-model="value3" inputId="minmaxfraction" :minFractionDigits="2" :maxFractionDigits="5" fluid />
                    </div>
                </div>
                <div class="field-group">
                    <div class="field">
                        <label for="minmax"> Min-Max Boundaries </label>
                        <InputNumber v-model="value4" inputId="minmax" :min="0" :max="100" fluid />
                    </div>
                </div>
            </div>
            <div class="array">
                <div class="header">
                    <div class="title">Array Title</div>
                </div>
                <div class="row-start field-group object">
                    <div class="field">
                        <label for="integeronly"> Integer Only </label>
                        <InputNumber v-model="value1" inputId="integeronly" fluid />
                    </div>
                    <div class="field">
                        <label for="withoutgrouping"> Without Grouping </label>
                        <InputNumber v-model="value2" inputId="withoutgrouping" :useGrouping="false" fluid />
                    </div>
                    <div class="field">
                        <label for="minmaxfraction"> Min-Max Fraction Digits </label>
                        <InputNumber v-model="value3" inputId="minmaxfraction" :minFractionDigits="2" :maxFractionDigits="5" fluid />
                    </div>
                    <SpeedDial />
                </div>
            </div>
        </div>
    </div>
    <FormBuilder :schema="testSchema" />
</template>

<style lang="scss">
.form {
    & * {
        font-size: 14px;
        color: black;
        font-weight: 400;
        letter-spacing: 1px;
        font-family: system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
    }
    .title {
        font-weight: 600;
        font-size: 18px;
        color: black;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin: 20px 0 0 10px;
    }
    .field-group {
        &.row-start {
            display: flex;
            flex-wrap: wrap;
        }
        .field {
            display: flex;
            flex-direction: column;
            margin: 20px 10px 10px;
            label {
                font-size: 12px;
                font-weight: 600;
                letter-spacing: 2px;
                text-transform: uppercase;
                color: navy;
            }
            .message {
                font-size: 12px;
            }
        }
    }
    .p-speeddial {
        position: relative;
        button {
            scale: 0.6;
        }
    }
}
</style>

<script setup>
import { ref } from 'vue';

const selectedCity = ref();
const cities = ref([
    { name: 'New York', code: 'NY' },
    { name: 'Rome', code: 'RM' },
    { name: 'London', code: 'LDN' },
    { name: 'Istanbul', code: 'IST' },
    { name: 'Paris', code: 'PRS' }
]);

const value1 = ref(42723);
const value2 = ref(58151);
const value3 = ref(2351.35);
const value4 = ref(50);

const testSchema = ref({
    name: {
        type: 'string',
        title: 'Name'
    },
    description: {
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
    startDate: {
        type: 'string',
        title: 'Date',
        component: 'Calendar',
        props: {
            showIcon: true,
            iconDisplay: 'input',
            dateFormat: 'D dd M yy'
        }
    },
    endDate: {
        type: 'string',
        title: 'End Date',
        component: 'Calendar',
        props: {
            showIcon: true,
            iconDisplay: 'input',
            dateFormat: 'D dd M yy'
        }
    },
    members: {
        type: 'array',
        title: 'Members',
        items: {
            type: 'object',
            title: 'Member'
        },
        join: {
            collection: 'member',
            mappings: [
                {
                    from: 'name'
                },
                {
                    from: 'image'
                }
            ]
        }
    },
    vehicles: {
        type: 'array',
        title: 'Vehicles',
        component: 'MultiSelect',
        props: {
            optionLabel: 'name',
            filter: true
        },
        items: {
            type: 'object',
            title: 'Vehicle'
        },
        join: {
            collection: 'vehicles',
            mappings: [
                {
                    from: 'name'
                },
                {
                    from: 'image'
                }
            ]
        }
    },
    completed: {
        type: 'boolean',
        title: 'Completed'
    },
    status: {
        type: 'string',
        title: 'Status',
        enum: ['Waiting', 'Approved', 'Complete']
    },
    comments: {
        type: 'number',
        title: 'Comments'
    },
    attachments: {
        type: 'number',
        title: 'Attachments'
    },
    pageOrder: {
        type: 'array',
        title: 'Page Order',
        hide: {
            if: "['productCategoryGroup', 'locationGroup', 'blog'].includes(/type) === false",
            value: true
        },
        items: {
            type: 'object',
            properties: {
                order: {
                    type: 'number',
                    title: 'order'
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
                }
            }
        }
    }
});
</script>
