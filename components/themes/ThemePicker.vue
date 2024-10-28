<template>
    <div>
        <!-- Lightness Selector -->
        <div>
            <label for="lightness">Lightness:</label>
            <select id="lightness" v-model="selectedLightness">
                <option v-for="lightness in lightnessOptions" :key="lightness.value" :value="lightness.value">
                    {{ lightness.label }}
                </option>
            </select>
        </div>
        <!-- Color Selector -->
        <div>
            <label for="color">Color:</label>
            <select id="color" v-model="selectedColor">
                <option v-for="color in colorOptions" :key="color.value" :value="color.value">
                    {{ color.label }}
                </option>
            </select>
        </div>
        <!-- Style Selector -->
        <div>
            <label for="style">Style:</label>
            <select id="style" v-model="selectedStyle">
                <option v-for="style in styleOptions" :key="style.value" :value="style.value">
                    {{ style.label }}
                </option>
            </select>
        </div>
        <!-- Elevation Selector -->
        <div>
            <label for="elevation">Elevation:</label>
            <select id="elevation" v-model="selectedElevation">
                <option v-for="elevation in elevationOptions" :key="elevation.value" :value="elevation.value">
                    {{ elevation.label }}
                </option>
            </select>
        </div>
        <!-- Rounding Selector -->
        <div>
            <label for="rounding">Rounding:</label>
            <select id="rounding" v-model="selectedRounding">
                <option v-for="rounding in roundingOptions" :key="rounding.value" :value="rounding.value">
                    {{ rounding.label }}
                </option>
            </select>
        </div>
        <!-- Card Selector -->
        <div>
            <label for="card">Card:</label>
            <select id="card" v-model="selectedCard">
                <option v-for="card in cardOptions" :key="card.value" :value="card.value">
                    {{ card.label }}
                </option>
            </select>
        </div>
    </div>
</template>

<script setup lang="ts">
type Option = { value: string; label: string };

const selectedLightness = ref<string>(localStorage.getItem('lightness') || 'light');
const selectedColor = ref<string>(localStorage.getItem('color') || 'martini');
const selectedStyle = ref<string>(localStorage.getItem('style') || 'default');
const selectedElevation = ref<string>(localStorage.getItem('elevation') || 'high');
const selectedRounding = ref<string>(localStorage.getItem('rounding') || 'rounded');
const selectedCard = ref<string>(localStorage.getItem('card') || 'polaroid');

const lightnessOptions: Option[] = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' }
];

const colorOptions: Option[] = [
    { value: 'martini', label: 'Martini' },
    { value: 'gulf', label: 'Gulf' }
];

const styleOptions: Option[] = [{ value: 'default', label: 'Default' }];

const elevationOptions: Option[] = [
    { value: 'flat', label: 'Flat' },
    { value: 'high', label: 'High' }
];

const roundingOptions: Option[] = [
    { value: 'rounded', label: 'Rounded' },
    { value: 'square', label: 'Square' }
];

const cardOptions: Option[] = [
    { value: 'polaroid', label: 'Polaroid' },
    { value: 'simple', label: 'Simple' }
];

const applyThemeClasses = () => {
    document.body.className = `
        theme-color-${selectedColor.value}
        theme-style-${selectedStyle.value}
        theme-elevation-${selectedElevation.value}
        theme-lightness-${selectedLightness.value}
        theme-rounding-${selectedRounding.value}
        theme-card-${selectedCard.value}
    `
        .replace(/\s+/g, ' ')
        .trim();
};

onMounted(applyThemeClasses);

watch([selectedLightness, selectedColor, selectedStyle, selectedElevation, selectedRounding, selectedCard], applyThemeClasses);

watch(selectedLightness, (newValue) => localStorage.setItem('lightness', newValue));
watch(selectedColor, (newValue) => localStorage.setItem('color', newValue));
watch(selectedStyle, (newValue) => localStorage.setItem('style', newValue));
watch(selectedElevation, (newValue) => localStorage.setItem('elevation', newValue));
watch(selectedRounding, (newValue) => localStorage.setItem('rounding', newValue));
watch(selectedCard, (newValue) => localStorage.setItem('card', newValue));
</script>
