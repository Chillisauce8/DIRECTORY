<script setup>
import { $t, updatePreset, updateSurfacePalette } from '@primevue/themes';
import Aura from '@primevue/themes/aura';
import Lara from '@primevue/themes/lara';
import { ref, onMounted } from 'vue';
import { useTheme } from '~/composables/useTheme';

defineProps({
    simple: {
        type: Boolean,
        default: false
    }
});

const { layoutState, layoutConfig, setPrimary, setSurface, setPreset, setMenuMode, setMenuTheme, onConfigSidebarToggle, toggleDarkMode, isDarkTheme, setElevation, setRounding, setCard, applyThemeClasses } = useLayout();

const presets = {
    Aura,
    Lara
};
const presetOptions = ref(Object.keys(presets));
const preset = ref(layoutConfig.preset);
const themeOptions = ref([
    { name: 'Light', value: false },
    { name: 'Dark', value: true }
]);
const darkTheme = ref(layoutConfig.darkTheme);
const menuMode = ref(layoutConfig.menuMode);
const menuTheme = ref(layoutConfig.menuTheme);

const { DefaultTheme } = useTheme();
const primitiveColors = DefaultTheme.primitive;

const primaryColors = ref([
    { name: 'noir', palette: {} },
    { name: 'emerald', palette: primitiveColors.emerald },
    { name: 'green', palette: primitiveColors.green },
    { name: 'lime', palette: primitiveColors.lime },
    { name: 'orange', palette: primitiveColors.orange },
    { name: 'amber', palette: primitiveColors.amber },
    { name: 'yellow', palette: primitiveColors.yellow },
    { name: 'teal', palette: primitiveColors.teal },
    { name: 'cyan', palette: primitiveColors.cyan },
    { name: 'sky', palette: primitiveColors.sky },
    { name: 'blue', palette: primitiveColors.blue },
    { name: 'indigo', palette: primitiveColors.indigo },
    { name: 'violet', palette: primitiveColors.violet },
    { name: 'purple', palette: primitiveColors.purple },
    { name: 'fuchsia', palette: primitiveColors.fuchsia },
    { name: 'pink', palette: primitiveColors.pink },
    { name: 'rose', palette: primitiveColors.rose }
]);

const surfaces = ref([
    { name: 'slate', palette: primitiveColors.slate },
    { name: 'gray', palette: primitiveColors.gray },
    { name: 'zinc', palette: primitiveColors.zinc },
    { name: 'neutral', palette: primitiveColors.neutral },
    { name: 'stone', palette: primitiveColors.stone }
]);

const elevationOptions = [
    { value: 'flat', label: 'Flat' },
    { value: 'high', label: 'High' }
];

const roundingOptions = [
    { value: 'rounded', label: 'Rounded' },
    { value: 'square', label: 'Square' }
];

const cardOptions = [
    { value: 'polaroid', label: 'Polaroid' },
    { value: 'simple', label: 'Simple' }
];

onMounted(() => {
    applyThemeClasses();
});

function getPresetExt() {
    const color = primaryColors.value.find((c) => c.name === layoutConfig.primary);

    if (color.name === 'noir') {
        return {
            semantic: {
                primary: {
                    50: '{surface.50}',
                    100: '{surface.100}',
                    200: '{surface.200}',
                    300: '{surface.300}',
                    400: '{surface.400}',
                    500: '{surface.500}',
                    600: '{surface.600}',
                    700: '{surface.700}',
                    800: '{surface.800}',
                    900: '{surface.900}',
                    950: '{surface.950}'
                },
                colorScheme: {
                    light: {
                        primary: {
                            color: '{primary.950}',
                            contrastColor: '#ffffff',
                            hoverColor: '{primary.800}',
                            activeColor: '{primary.700}'
                        },
                        highlight: {
                            background: '{primary.950}',
                            focusBackground: '{primary.700}',
                            color: '#ffffff',
                            focusColor: '#ffffff'
                        }
                    },
                    dark: {
                        primary: {
                            color: '{primary.50}',
                            contrastColor: '{primary.950}',
                            hoverColor: '{primary.200}',
                            activeColor: '{primary.300}'
                        },
                        highlight: {
                            background: '{primary.50}',
                            focusBackground: '{primary.300}',
                            color: '{primary.950}',
                            focusColor: '{primary.950}'
                        }
                    }
                }
            }
        };
    } else {
        return {
            semantic: {
                primary: color.palette
            }
        };
    }
}

function updateColors(type, color) {
    if (type === 'primary') {
        setPrimary(color.name);
    } else if (type === 'surface') {
        setSurface(color.name);
    }

    applyTheme(type, color);
}

function applyTheme(type, color) {
    if (type === 'primary') {
        updatePreset(getPresetExt());
    } else if (type === 'surface') {
        updateSurfacePalette(color.palette);
    }
}

function onPresetChange() {
    setPreset(preset.value);
    const presetValue = presets[preset.value];
    const surfacePalette = surfaces.value.find((s) => s.name === layoutConfig.surface)?.palette;

    $t().preset(presetValue).preset(getPresetExt()).surfacePalette(surfacePalette).use({ useDefaultOptions: true });
}
</script>

<template>
    <button class="layout-config-button config-link" type="button" @click="onConfigSidebarToggle">
        <i class="pi pi-cog"></i>
    </button>

    <Drawer
        v-model:visible="layoutState.configSidebarVisible"
        position="right"
        class="layout-config-sidebar w-80"
        :pt="{
            pcCloseButton: { root: 'ml-auto' }
        }"
    >
        <div class="flex flex-col gap-4">
            <div class="flex flex-col gap-4">
                <Select
                    v-model="layoutConfig.elevation"
                    size="small"
                    :options="elevationOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Elevation"
                    @change="
                        (e) => {
                            setElevation(e.value);
                            applyThemeClasses();
                        }
                    "
                />

                <Select
                    v-model="layoutConfig.rounding"
                    size="small"
                    :options="roundingOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Rounding"
                    @change="
                        (e) => {
                            setRounding(e.value);
                            applyThemeClasses();
                        }
                    "
                />

                <Select
                    v-model="layoutConfig.card"
                    size="small"
                    :options="cardOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Card"
                    @change="
                        (e) => {
                            setCard(e.value);
                            applyThemeClasses();
                        }
                    "
                />
            </div>

            <div>
                <span class="text-lg font-semibold">Primary</span>
                <div class="pt-2 flex gap-2 flex-wrap">
                    <button
                        v-for="primaryColor of primaryColors"
                        :key="primaryColor.name"
                        type="button"
                        @click="updateColors('primary', primaryColor)"
                        v-tooltip.bottom="primaryColor.name"
                        :class="['cursor-pointer w-6 h-6 rounded-full flex flex-shrink-0 items-center justify-center p-0 outline-none outline-offset-1', { 'outline-primary': layoutConfig.primary === primaryColor.name }]"
                        :style="{ backgroundColor: `${primaryColor.name === 'noir' ? 'var(--text-color)' : primaryColor.palette['500']}` }"
                    ></button>
                </div>
            </div>

            <div>
                <span class="text-lg font-semibold">Surface</span>
                <div class="pt-2 flex gap-2 flex-wrap">
                    <button
                        v-for="surface of surfaces"
                        :key="surface.name"
                        type="button"
                        @click="updateColors('surface', surface)"
                        v-tooltip.bottom="surface.name"
                        :class="['cursor-pointer w-6 h-6 rounded-full flex flex-shrink-0 items-center justify-center p-0 outline-none outline-offset-1', { 'outline-primary': layoutConfig.surface === surface.name }]"
                        :style="{ backgroundColor: `${surface.palette['500']}` }"
                    ></button>
                </div>
            </div>

            <div>
                <div class="flex flex-col gap-2">
                    <span class="text-lg font-semibold">Presets</span>
                    <SelectButton v-model="preset" @change="onPresetChange" :options="presetOptions" :allowEmpty="false" />
                </div>
            </div>

            <div>
                <div class="flex flex-col gap-2">
                    <span class="text-lg font-semibold">Color Scheme</span>
                    <SelectButton v-model="darkTheme" @change="toggleDarkMode" :options="themeOptions" optionLabel="name" optionValue="value" :allowEmpty="false" />
                </div>
            </div>

            <template v-if="!simple">
                <div>
                    <div class="flex flex-col gap-2">
                        <span class="text-lg font-semibold">Menu Type</span>
                        <div class="flex flex-wrap flex-col gap-3">
                            <div class="flex">
                                <div class="flex items-center gap-2 w-1/2">
                                    <RadioButton name="menuMode" value="static" v-model="menuMode" @update:modelValue="setMenuMode" inputId="mode1"></RadioButton>
                                    <label for="mode1">Static</label>
                                </div>

                                <div class="flex items-center gap-2 w-1/2">
                                    <RadioButton name="menuMode" value="overlay" v-model="menuMode" @update:modelValue="setMenuMode" inputId="mode2"></RadioButton>
                                    <label for="mode2">Overlay</label>
                                </div>
                            </div>
                            <div class="flex">
                                <div class="flex items-center gap-2 w-1/2">
                                    <RadioButton name="menuMode" value="slim" v-model="menuMode" @update:modelValue="setMenuMode" inputId="mode3"></RadioButton>
                                    <label for="mode2">Slim</label>
                                </div>
                                <div class="flex items-center gap-2 w-1/2">
                                    <RadioButton name="menuMode" value="slim-plus" v-model="menuMode" @update:modelValue="setMenuMode" inputId="mode4"></RadioButton>
                                    <label for="mode3">Slim+</label>
                                </div>
                            </div>
                            <div class="flex">
                                <div class="flex items-center gap-2 w-1/2">
                                    <RadioButton name="menuMode" value="reveal" v-model="menuMode" @update:modelValue="setMenuMode" inputId="mode5"></RadioButton>
                                    <label for="mode4">Reveal</label>
                                </div>
                                <div class="flex items-center gap-2 w-1/2">
                                    <RadioButton name="menuMode" value="drawer" v-model="menuMode" @update:modelValue="setMenuMode" inputId="mode6"></RadioButton>
                                    <label for="mode5">Drawer</label>
                                </div>
                            </div>
                            <div class="flex">
                                <div class="flex items-center gap-2 w-1/2">
                                    <RadioButton name="menuMode" value="horizontal" v-model="menuMode" @update:modelValue="setMenuMode" inputId="mode7"></RadioButton>
                                    <label for="mode7">Horizontal</label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <div class="flex flex-col gap-2">
                        <span class="text-lg font-semibold">Menu Theme</span>
                        <div class="flex flex-wrap flex-col gap-4">
                            <div class="flex items-center gap-2">
                                <RadioButton v-model="menuTheme" value="colorScheme" :checked="menuTheme === 'colorScheme'" name="menuTheme" @change="() => setMenuTheme('colorScheme')" inputId="mode1"></RadioButton>
                                <label for="mode1">Color Scheme</label>
                            </div>

                            <div class="flex items-center gap-2">
                                <RadioButton v-model="menuTheme" value="primaryColor" :checked="menuTheme === 'primaryColor'" name="menuTheme" @change="() => setMenuTheme('primaryColor')" inputId="mode2"></RadioButton>
                                <label for="mode2">Primary Color</label>
                            </div>
                            <div class="flex items-center gap-2">
                                <RadioButton v-model="menuTheme" value="transparent" :checked="menuTheme === 'transparent'" name="menuTheme" @change="() => setMenuTheme('transparent')" inputId="mode3"></RadioButton>
                                <label for="mode2">Transparent</label>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </div>
    </Drawer>
</template>
