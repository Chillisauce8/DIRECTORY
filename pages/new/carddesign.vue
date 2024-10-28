<script setup>
import { ref } from 'vue';

const sortOrder = ref(-1);
const sortOptions = [
    { label: 'Year', value: 'year' },
    { label: 'Name', value: 'name' },
    { label: 'Nickname', value: 'nickname' }
];

const cors = ref([
    {
        images: [
            {
                id: '6636566a01ec8110073b9bfb',
                alt: 'BMW 1'
            },
            {
                id: '663657aa01ec8110073b9c27',
                alt: 'BMW 2'
            },
            {
                id: '663657cd87fa1f24532a355e',
                alt: 'BMW 3'
            },
            {
                id: '663657eb87fa1f24532a3568',
                alt: 'BMW 4'
            }
        ],
        make: 'BMW',
        name: 'M3 E30',
        year: '2001',
        nickname: 'Red Baron'
    },
    {
        images: [
            {
                id: '66365818e70ac51006d4d762',
                alt: 'Cobra 1'
            },
            {
                id: '6636584c44688d10012094ee',
                alt: 'Cobra 2'
            },
            {
                id: '6636586de70ac51006d4d787',
                alt: 'Cobra 3'
            },
            {
                id: '6636589087fa1f24532a3582',
                alt: 'Cobra 4'
            }
        ],
        make: 'Shelby',
        name: '427 Sehlby Cobra',
        year: '1992'
        // nickname: 'Red Baron'
    },
    {
        images: [
            {
                id: '6636591d44688d10012094fd',
                alt: 'Merc 1'
            },
            {
                id: '6636595944688d1001209505',
                alt: 'Merc 2'
            },
            {
                id: '6636597ae70ac51006d4d7dd',
                alt: 'Merc 3'
            },
            {
                id: '66365998e70ac51006d4d7e6',
                alt: 'Merc 4'
            }
        ],
        make: 'Mercedes',
        name: 'SL 300 Gullwing',
        year: '1955',
        nickname: 'Bullet'
    },
    {
        images: [
            {
                id: '66365a43e70ac51006d4d811',
                alt: 'Rolls 1'
            },
            {
                id: '66365a61e70ac51006d4d814',
                alt: 'Rolls 2'
            },
            {
                id: '66365a9b87fa1f24532a35d0',
                alt: 'Rolls 3'
            },
            {
                id: '66365abb87fa1f24532a35d3',
                alt: 'Rolls 4'
            }
        ],
        make: 'Rolls-Royce',
        name: 'Phantom',
        year: '2010',
        nickname: 'Daisy'
    },
    {
        images: [
            {
                id: '66365b5ee70ac51006d4d845',
                alt: 'Lambo 1'
            },
            {
                id: '66365ba693a20f781cf46dd5',
                alt: 'Lambo 2'
            },
            {
                id: '66365bc7e70ac51006d4d857',
                alt: 'Lambo 3'
            },
            {
                id: '66365be9e70ac51006d4d862',
                alt: 'Lambo 4'
            }
        ],
        make: 'Lamborghini',
        name: 'Murcielago Roadster',
        year: '2001'
        // nickname: 'Bullet'
    }
]);

const vehicles = ref([
    {
        images: [
            {
                id: '65466c15afa7da0f964a0012',
                alt: 'Car Alt Text'
            }
        ],
        make: 'Alfa Romeo',
        name: 'Alfa Romeo 2000 Spider Veloce',
        year: '1973',
        nickname: 'Fat Bastard'
    },
    {
        images: [
            {
                id: '65466bfcafa7da0f964a000e',
                alt: 'Car Alt Text'
            }
        ],
        make: 'Ford',
        name: "Ford Model A 'The Ballard Special' Speedster",
        year: '1930',
        nickname: 'Red Devil'
    },
    {
        images: [
            {
                id: '65466c4dafa7da0f964a011c',
                alt: 'Car Alt Text'
            }
        ],
        make: 'Renault',
        name: 'Alpine Renault A110',
        year: '1956'
    },
    {
        images: [
            {
                id: '65466babc302c20f89908e11',
                alt: 'Car Alt Text'
            }
        ],
        make: 'Porshe',
        name: 'Porsche 911 (997) GT3 RS',
        year: '2007',
        nickname: 'Little Bastard'
    },
    {
        images: [
            {
                id: '661fecb3d7eafa12344017a8',
                alt: 'Car Alt Text'
            }
        ],
        make: 'Austin Healey',
        name: 'Austin-Healey 3000 MK II',
        year: '1961',
        nickname: 'The Fly'
    }
]);

const sortField = ref(null);
const sortKey = ref(null);

const onSortChange = (event) => {
    const value = event.value.value;
    const sortValue = event.value;

    if (value.indexOf('!') === 0) {
        sortOrder.value = 1;
        sortField.value = value.substring(1, value.length);
        sortKey.value = sortValue;
    } else {
        sortOrder.value = -1;
        sortField.value = value;
        sortKey.value = sortValue;
    }
};
</script>

<template>
    <div class="card">
        <Select :value="vehicles" paginator :rows="7" layout="grid" :sortOrder="sortOrder" :sortField="sortField">
            <template #header>
                <div class="flex flex-column sm:flex-row sm:align-items-center sm:justify-content-between gap-3">
                    <span class="text-xl text-900 font-semibold">Vehicles</span>
                    <Select v-model="sortKey" :options="sortOptions" optionLabel="label" placeholder="Sort By"
                            class="w-full md:w-15rem" @change="onSortChange($event)" />
                </div>
            </template>
            <template #grid="slotProps">
                <layout-grid>
                    <VehicleCard v-for="(item, index) in slotProps.items" :key="index" :name="item.name" :make="item.make" :year="item.year" :images="item.images" :nickname="item.nickname" />
                </layout-grid>
            </template>
        </Select>
    </div>
</template>
