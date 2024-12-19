<template>
    <section :class="classes ? classes : 'form-test'" :id="id">
        <div v-if="arrayOfObject" class="array-of-object-header">
            <h1 v-if="title" class="title array-of-object">{{ title }}</h1>
            <SpeedDial />
        </div>
        <h1 v-else-if="title" class="title">{{ title }}</h1>
        <h2 v-if="subtitle" class="subtitle">{{ subtitle }}</h2>
        <div class="field-block">
            <template v-for="(value, index) in effectiveForm" :key="index">
                <template v-if="getDefaults(value).field">
                    <div class="field-wrapper" :id="value.id" :class="value.component ? value.component : getDefaults(value).field">
                        <label>{{ value.title }}</label>
                        <div class="field">
                            <div class="input-wrapper">
                                <component v-if="value.component" v-bind="value.props" :is="value.component" />
                                <component v-else v-bind="getDefaults(value).props" :is="getDefaults(value).field" />
                            </div>
                            <div v-if="getDefaults(value).speedDial" class="speed-dial-wrapper">
                                <SpeedDial />
                            </div>
                        </div>
                        <div v-if="value.errorMessage" class="error-message">{{ value.errorMessage }}</div>
                        <div v-if="value.subtext" class="subtext">{{ value.subtext }}</div>
                    </div>
                </template>

                <FormBuilder v-if="getObject(value)" :formattedForm="getObject(value)" :id="value.id" :title="value.title" :arrayOfObject="getDefaults(value).arrayOfObject" :classes="getClass(value)" />
            </template>
        </div>
    </section>
</template>

<script setup>
const props = defineProps({
    id: String,
    title: String,
    subtitle: String,
    unformattedForm: Object,
    formattedForm: Object,
    nested: String,
    classes: String,
    arrayOfObject: Boolean
});

// Define reactive reference for the effective form to use in the template
const effectiveForm = computed(() => {
    if (props.formattedForm) {
        return props.formattedForm;
    } else {
        return formatForm(props.unformattedForm);
    }
});

const formatForm = (obj, basePath = '') => {
    const result = {};
    let currentContainer = null;

    for (const key in obj) {
        if (!obj[key] || !obj[key].type) continue; // Ensure the object has a 'type' field

        const originalPath = basePath ? `${basePath}.${key}` : key;
        const itemWithId = { ...obj[key], id: originalPath.replace(/\.items/, '') };

        if (obj[key].type === 'container') {
            result[key] = {
                ...itemWithId,
                properties: {}
            };
            currentContainer = result[key].properties;
        } else if (obj[key].type === '/container') {
            currentContainer = null;
        } else {
            if (obj[key].type === 'object') {
                if ('properties' in obj[key]) {
                    itemWithId.properties = formatForm(obj[key].properties, originalPath);
                } else {
                    itemWithId.properties = {};
                }
            }
            if (obj[key].type === 'array') {
                if ('items' in obj[key]) {
                    if (typeof obj[key].items === 'object' && obj[key].items !== null) {
                        itemWithId.items = formatForm({ items: obj[key].items }, originalPath).items;
                    } else {
                        itemWithId.items = {};
                    }
                } else {
                    itemWithId.items = {};
                }
            }

            if (currentContainer) {
                currentContainer[key] = itemWithId;
            } else {
                result[key] = itemWithId;
            }
        }
    }
    /*
    const myJSON = JSON.stringify(result);
    console.log(myJSON); */
    return result;
};

function getClass(value) {
    let classes = '';
    if (value.class && value.type) {
        classes = value.class + ' ' + value.type;
    } else if (value.class && !value.type) {
        classes = value.class;
    } else if (!value.class && value.type) {
        classes = value.type;
    } else {
        classes = value.type;
    }
    return classes;
}

function getObject(value) {
    if (value.type === 'object' || value.type === 'container') {
        return value.properties;
    } else if (value.type === 'array' && value.items.properties) {
        return value.items.properties;
    } else {
        return false;
    }
}

function getDefaults(value) {
    const showDefault = {};
    if (value.type === 'array') {
        if (value.items.type === 'string') {
            showDefault.field = 'Chips';
            showDefault.props = {};
            showDefault.speedDial = true;
        } else if (value.items.type === 'number') {
            showDefault.field = 'InputNumber';
            showDefault.props = {};
            showDefault.speedDial = true;
        } else if (value.items.type === 'boolean') {
            showDefault.field = 'ToggleSwitch';
            showDefault.props = {};
            showDefault.speedDial = true;
        } else if (value.items.type === 'object') {
            showDefault.arrayOfObject = true;
        }
    } else {
        if (value.type === 'string') {
            showDefault.field = 'InputText';
            showDefault.props = {};
        } else if (value.type === 'number') {
            showDefault.field = 'InputNumber';
            showDefault.props = {};
        } else if (value.type === 'boolean') {
            showDefault.field = 'ToggleSwitch';
            showDefault.props = {};
        }
    }
    return showDefault;
}
</script>

<style lang="scss">
.form-test {
    --background-color: white;
    --text-color: black;
    --form-title-color: black;
    --form-subtitle-color: grey;
    --section-title-color: black;
    --section-side-color: lightgrey;
    --field-subtext-color: grey;
    --error-message-color: crimson;
    background-color: var(--background-color);
    & * {
        font-size: 14px;
        color: var(--text-color);
        font-weight: 400;
        letter-spacing: 1px;
        font-family: system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
    }
    .hide {
        display: none;
    }
    input {
        //    background-color: lightblue;
    }

    section {
        margin: 10px 0 10px;
        padding-left: 20px;
        border-left: 3px solid var(--section-side-color); //  border-radius: 10px;
        &.row .field-block {
            display: flex;
            & > * {
                flex-grow: 1;
            }
        }
    }
    h1 {
        font-weight: 600;
        font-size: 14px;
        color: var(--section-title-color);
        text-transform: uppercase;
        letter-spacing: 2px;
        margin: 5px;
    }
    > h1 {
        font-size: 24px;
        text-align: center;
        color: var(--form-title-color);
    }
    h2 {
        font-size: 18px;
        text-align: center;
        color: var(--form-subtitle-color);
    }

    .field-wrapper {
        display: flex;
        flex-direction: column;
        margin: 10px;
        label {
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 4px;
        }
        .subtext {
            font-size: 12px;
            color: var(--field-subtext-color);
        }
        .error-message {
            font-size: 14px;
            font-weight: 600;
            color: var(--error-message-color);
        }
        .field {
            display: flex;
            flex-direction: row;
            margin-bottom: 0;
            .input-wrapper {
                flex-grow: 1;
                display: flex;
                flex-direction: column;
            }
        }
    }
    .field-group {
        &.row-start {
            display: flex;
            flex-wrap: wrap;
        }
    }
    .p-speeddial {
        position: relative;
        button {
            scale: 0.6;
        }
    }

    .array-of-object-header {
        display: flex;
        justify-content: space-between;
        .p-button:first-of-type {
            background-color: red;
            border-color: red;
        }
    }
}
</style>
