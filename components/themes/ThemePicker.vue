<template>
    <div class="card flex flex-col gap-4">
        <!-- Color Selector -->
        <!-- <div>
            <Select v-model="selectedColor" :options="colorOptions" optionLabel="label" optionValue="value" placeholder="Color" />
        </div> -->
        <!-- Elevation Selector -->

        <Select v-model="selectedElevation" size="small" :options="elevationOptions" optionLabel="label" optionValue="value" placeholder="Elevation" />

        <!-- Rounding Selector -->

        <Select v-model="selectedRounding" size="small" :options="roundingOptions" optionLabel="label" optionValue="value" placeholder="Rounding" />

        <!-- Card Selector -->

        <Select v-model="selectedCard" size="small" :options="cardOptions" optionLabel="label" optionValue="value" placeholder="Card" />
    </div>
</template>

<script setup lang="ts">
import Select from 'primevue/select';

type Option = { value: string; label: string };

// const selectedColor = ref<string>(localStorage.getItem('color') || 'martini');
const selectedElevation = ref<string>(localStorage.getItem('elevation') || 'high');
const selectedRounding = ref<string>(localStorage.getItem('rounding') || 'rounded');
const selectedCard = ref<string>(localStorage.getItem('card') || 'simple');

// const colorOptions: Option[] = [
//     { value: 'martini', label: 'Martini' },
//     { value: 'gulf', label: 'Gulf' }
// ];

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
     
        theme-elevation-${selectedElevation.value}
        theme-rounding-${selectedRounding.value}
        theme-card-${selectedCard.value}
    `
        .replace(/\s+/g, ' ')
        .trim();
};

onMounted(applyThemeClasses);

watch([selectedElevation, selectedRounding, selectedCard], applyThemeClasses);

// watch(selectedColor, (newValue) => localStorage.setItem('color', newValue));
watch(selectedElevation, (newValue) => localStorage.setItem('elevation', newValue));
watch(selectedRounding, (newValue) => localStorage.setItem('rounding', newValue));
watch(selectedCard, (newValue) => localStorage.setItem('card', newValue));
</script>
