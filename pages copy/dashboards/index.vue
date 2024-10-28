<script setup>
import { ProductService } from '../../service/ProductService';
import { FilterMatchMode } from '@primevue/core/api';
import { onMounted, ref, watch } from 'vue';

const { getPrimary, getSurface, isDarkTheme } = useLayout();
const knobValue = ref(90);
const products = ref([]);
const weeks = ref([
    {
        label: 'Last Week',
        value: 0,
        data: [
            [65, 59, 80, 81, 56, 55, 40],
            [28, 48, 40, 19, 86, 27, 90]
        ]
    },
    {
        label: 'This Week',
        value: 1,
        data: [
            [35, 19, 40, 61, 16, 55, 30],
            [48, 78, 10, 29, 76, 77, 10]
        ]
    }
]);
const selectedWeek = ref(weeks.value[0]);
const pieOptions = ref({});
const barOptions = ref({});
const barData = ref({});
const pieData = ref({});
const salesTableRef = ref(null);
const filterSalesTable = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

onMounted(() => {
    ProductService.getProductsSmall().then((data) => (products.value = data));
    selectedWeek.value = weeks.value[0];
    setChartData();
});

function setChartData() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');
    pieData.value = {
        labels: ['Electronics', 'Fashion', 'Household'],
        datasets: [
            {
                data: [300, 50, 100],
                backgroundColor: [documentStyle.getPropertyValue('--p-primary-700'), documentStyle.getPropertyValue('--p-primary-400'), documentStyle.getPropertyValue('--p-primary-100')],
                hoverBackgroundColor: [documentStyle.getPropertyValue('--p-primary-600'), documentStyle.getPropertyValue('--p-primary-300'), documentStyle.getPropertyValue('--p-primary-200')]
            }
        ]
    };
    pieOptions.value = {
        animation: {
            duration: 0
        },
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: textColor,
                    usePointStyle: true,
                    font: {
                        weight: 700
                    },
                    padding: 28
                },
                position: 'bottom'
            }
        }
    };
    barData.value = {
        labels: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
        datasets: [
            {
                label: 'Revenue',
                backgroundColor: documentStyle.getPropertyValue('--p-primary-500'),
                barThickness: 12,
                borderRadius: 12,
                data: selectedWeek.value.data[0]
            },
            {
                label: 'Profit',
                backgroundColor: documentStyle.getPropertyValue('--p-primary-200'),
                barThickness: 12,
                borderRadius: 12,
                data: selectedWeek.value.data[1]
            }
        ]
    };
    barOptions.value = {
        animation: {
            duration: 0
        },
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: textColor,
                    usePointStyle: true,
                    font: {
                        weight: 700
                    },
                    padding: 28
                },
                position: 'bottom'
            }
        },
        scales: {
            x: {
                ticks: {
                    color: textColorSecondary,
                    font: {
                        weight: 500
                    }
                },
                grid: {
                    display: false,
                    drawBorder: false
                }
            },
            y: {
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    color: surfaceBorder,
                    drawBorder: false
                }
            }
        }
    };
}

function formatCurrency(value) {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

function exportCSV() {
    salesTableRef.value.exportCSV();
}

function onWeekChange() {
    let newBarData = { ...barData.value };
    newBarData.datasets[0].data = selectedWeek.value.data[0];
    newBarData.datasets[1].data = selectedWeek.value.data[1];
    barData.value = newBarData;
    setChartData();
}

function getBadgeSeverity(inventoryStatus) {
    switch (inventoryStatus.toLowerCase()) {
        case 'instock':
            return 'success';
        case 'lowstock':
            return 'warn';
        case 'outofstock':
            return 'danger';
        default:
            return 'info';
    }
}

watch([getPrimary, getSurface, isDarkTheme], () => {
    setChartData();
});
</script>
<template>
    <div class="grid grid-cols-12 gap-8">
        <div class="col-span-12 md:col-span-6 xl:col-span-3">
            <div class="card h-full">
                <span class="font-semibold text-lg">Sales</span>
                <div class="flex justify-between items-start mt-4">
                    <div class="w-6/12">
                        <span class="text-4xl font-bold text-surface-900 dark:text-surface-0">120</span>
                        <div class="text-green-500">
                            <span class="font-medium">+12%</span>
                            <i class="pi pi-arrow-up text-xs ml-2"></i>
                        </div>
                    </div>
                    <div class="w-6/12">
                        <svg width="100%" viewBox="0 0 258 96" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M1 93.9506L4.5641 94.3162C8.12821 94.6817 15.2564 95.4128 22.3846 89.6451C29.5128 83.8774 36.641 71.6109 43.7692 64.4063C50.8974 57.2018 58.0256 55.0592 65.1538 58.9268C72.2821 62.7945 79.4103 72.6725 86.5385 73.5441C93.6667 74.4157 100.795 66.2809 107.923 65.9287C115.051 65.5765 122.179 73.0068 129.308 66.8232C136.436 60.6396 143.564 40.8422 150.692 27.9257C157.821 15.0093 164.949 8.97393 172.077 6.43766C179.205 3.9014 186.333 4.86425 193.462 12.0629C200.59 19.2616 207.718 32.696 214.846 31.0487C221.974 29.4014 229.103 12.6723 236.231 5.64525C243.359 -1.38178 250.487 1.29325 254.051 2.63076L257.615 3.96827"
                                :style="{ strokeWidth: '2px', stroke: 'var(--primary-color)' }"
                                stroke="10"
                            />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-span-12 md:col-span-6 xl:col-span-3">
            <div class="card h-full">
                <span class="font-semibold text-lg">Revenue</span>
                <div class="flex justify-between items-start mt-4">
                    <div class="w-6/12">
                        <span class="text-4xl font-bold text-surface-900 dark:text-surface-0">$4500</span>
                        <div class="text-green-500">
                            <span class="font-medium">+20%</span>
                            <i class="pi pi-arrow-up text-xs ml-2"></i>
                        </div>
                    </div>
                    <div class="w-6/12">
                        <svg width="100%" viewBox="0 0 115 41" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M1 35.6498L2.24444 32.4319C3.48889 29.214 5.97778 22.7782 8.46667 20.3627C10.9556 17.9473 13.4444 19.5522 15.9333 21.7663C18.4222 23.9803 20.9111 26.8035 23.4 30.6606C25.8889 34.5176 28.3778 39.4085 30.8667 37.2137C33.3556 35.0189 35.8444 25.7383 38.3333 26.3765C40.8222 27.0146 43.3111 37.5714 45.8 38.9013C48.2889 40.2311 50.7778 32.3341 53.2667 31.692C55.7556 31.0499 58.2444 37.6628 60.7333 39.4617C63.2222 41.2607 65.7111 38.2458 68.2 34.9205C70.6889 31.5953 73.1778 27.9597 75.6667 23.5955C78.1556 19.2313 80.6444 14.1385 83.1333 13.8875C85.6222 13.6365 88.1111 18.2272 90.6 20.2425C93.0889 22.2578 95.5778 21.6977 98.0667 18.8159C100.556 15.9341 103.044 10.7306 105.533 7.37432C108.022 4.01806 110.511 2.50903 111.756 1.75451L113 1"
                                :style="{ strokeWidth: '1px', stroke: 'var(--primary-color)' }"
                            />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-span-12 md:col-span-6 xl:col-span-3">
            <div class="card h-full">
                <span class="font-semibold text-lg">Visitors</span>
                <div class="flex justify-between items-start mt-4">
                    <div class="w-6/12">
                        <span class="text-4xl font-bold text-surface-900 dark:text-surface-0">360</span>
                        <div class="text-pink-500">
                            <span class="font-medium">+24%</span>
                            <i class="pi pi-arrow-down text-xs ml-2"></i>
                        </div>
                    </div>
                    <div class="w-6/12">
                        <svg width="100%" viewBox="0 0 115 41" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M1.5 1L2.74444 2.61495C3.98889 4.2299 6.47778 7.4598 8.96667 9.07151C11.4556 10.6832 13.9444 10.6767 16.4333 11.6127C18.9222 12.5487 21.4111 14.4271 23.9 16.6724C26.3889 18.9178 28.8778 21.5301 31.3667 20.1977C33.8556 18.8652 36.3444 13.5878 38.8333 11.3638C41.3222 9.13969 43.8111 9.96891 46.3 11.9894C48.7889 14.0099 51.2778 17.2217 53.7667 16.2045C56.2556 15.1873 58.7444 9.9412 61.2333 11.2783C63.7222 12.6155 66.2111 20.5359 68.7 21.4684C71.1889 22.401 73.6778 16.3458 76.1667 16.0009C78.6556 15.6561 81.1444 21.0217 83.6333 24.2684C86.1222 27.515 88.6111 28.6428 91.1 27.4369C93.5889 26.2311 96.0778 22.6916 98.5667 22.7117C101.056 22.7317 103.544 26.3112 106.033 29.7859C108.522 33.2605 111.011 36.6302 112.256 38.3151L113.5 40"
                                :style="{ strokeWidth: '1px', stroke: 'var(--p-pink-500)' }"
                            />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-span-12 md:col-span-6 xl:col-span-3">
            <div class="card h-full">
                <span class="font-semibold text-lg">Stock</span>
                <div class="flex justify-between items-start mt-4">
                    <div class="w-6/12">
                        <span class="text-4xl font-bold text-surface-900 dark:text-surface-0">164</span>
                        <div class="text-green-500">
                            <span class="font-medium">+30%</span>
                            <i class="pi pi-arrow-up text-xs ml-2"></i>
                        </div>
                    </div>
                    <div class="w-6/12 text-right">
                        <Knob v-model="knobValue" valueTemplate="90%" readonly :strokeWidth="2" :size="90" class="-mt-8 ml-8"></Knob>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-span-12 xl:col-span-9">
            <div class="card h-full">
                <div class="flex items-start justify-between mb-12">
                    <span class="text-surface-900 dark:text-surface-0 text-xl font-semibold">Revenue Overview</span>
                    <Select :options="weeks" v-model="selectedWeek" class="w-40" optionLabel="label" @change="onWeekChange"></Select>
                </div>
                <Chart type="bar" :height="300" :data="barData" :options="barOptions"></Chart>
            </div>
        </div>
        <div class="col-span-12 xl:col-span-3">
            <div class="card h-full">
                <div class="text-surface-900 dark:text-surface-0 text-xl font-semibold mb-12">Sales by Category</div>
                <Chart type="pie" :data="pieData" :height="300" :options="pieOptions"></Chart>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-7">
            <div class="card">
                <div class="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                    <div class="text-surface-900 dark:text-surface-0 text-xl font-semibold mb-4 md:mb-0">Recent Sales</div>
                    <div class="inline-flex items-center">
                        <IconField>
                            <InputIcon class="pi pi-search" />
                            <InputText type="text" v-model="filterSalesTable.global.value" placeholder="Search" :style="{ borderRadius: '2rem' }" class="w-full" />
                        </IconField>
                        <Button icon="pi pi-upload" class="mx-4 export-target-button" rounded v-tooltip="'Export'" @click="exportCSV"></Button>
                    </div>
                </div>
                <DataTable ref="salesTableRef" :value="products" dataKey="id" paginator :rows="5" responsiveLayout="scroll" v-model:filters="filterSalesTable">
                    <template #empty> No products found.</template>
                    <Column field="name" header="Name" sortable :headerStyle="{ minWidth: '12rem' }">
                        <template #body="{ data }">
                            {{ data.name }}
                        </template>
                    </Column>
                    <Column field="category" header="Category" sortable :headerStyle="{ minWidth: '10rem' }">
                        <template #body="{ data }">
                            {{ data.category }}
                        </template>
                    </Column>
                    <Column field="price" header="Price" sortable :headerStyle="{ minWidth: '10rem' }">
                        <template #body="{ data }">
                            {{ formatCurrency(data.price) }}
                        </template>
                    </Column>
                    <Column field="inventoryStatus" header="Status" sortable :headerStyle="{ minWidth: '10rem' }">
                        <template #body="{ data }">
                            <Tag :severity="getBadgeSeverity(data.inventoryStatus)">{{ data.inventoryStatus }}</Tag>
                        </template>
                    </Column>
                    <Column class="text-center">
                        <template #body>
                            <Button type="button" icon="pi pi-search" outlined rounded></Button>
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-5">
            <div class="card h-full">
                <div class="text-surface-900 dark:text-surface-0 text-xl font-semibold mb-4">Top Products</div>
                <ul class="list-none p-0 m-0">
                    <template v-for="(product, i) in products" :key="{ i }">
                        <li v-if="i < 6" class="flex items-center justify-between p-4">
                            <div class="inline-flex items-center">
                                <img :src="`/demo/images/product/${product.image}`" :alt="product.name" width="75" class="shadow flex-shrink-0" />
                                <div class="flex flex-col ml-4">
                                    <span class="font-medium text-lg mb-1">{{ product.name }}</span>
                                    <Rating v-model="product.rating" readonly :cancel="false"></Rating>
                                </div>
                            </div>
                            <span class="ml-auto font-semibold text-xl p-text-secondary">${{ product.price }}</span>
                        </li>
                    </template>
                </ul>
            </div>
        </div>
    </div>
</template>
