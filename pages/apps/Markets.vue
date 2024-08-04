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
                cloudinaryId: '6636566a01ec8110073b9bfb',
                alt: 'BMW 1'
            },
            {
                cloudinaryId: '663657aa01ec8110073b9c27',
                alt: 'BMW 2'
            },
            {
                cloudinaryId: '663657cd87fa1f24532a355e',
                alt: 'BMW 3'
            },
            {
                cloudinaryId: '663657eb87fa1f24532a3568',
                alt: 'BMW 4'
            }
        ],
        make: 'BMW',
        name: 'M3 E30',
        yearFrom: '1950',
        yearToo: '1957'
    },
    {
        images: [
            {
                cloudinaryId: '66365818e70ac51006d4d762',
                alt: 'Cobra 1'
            },
            {
                cloudinaryId: '6636584c44688d10012094ee',
                alt: 'Cobra 2'
            },
            {
                cloudinaryId: '6636586de70ac51006d4d787',
                alt: 'Cobra 3'
            },
            {
                cloudinaryId: '6636589087fa1f24532a3582',
                alt: 'Cobra 4'
            }
        ],
        make: 'Shelby',
        name: '427 Sehlby Cobra',
        yearFrom: '1938',
        yearToo: '1944'
    },
    {
        images: [
            {
                cloudinaryId: '6636591d44688d10012094fd',
                alt: 'Merc 1'
            },
            {
                cloudinaryId: '6636595944688d1001209505',
                alt: 'Merc 2'
            },
            {
                cloudinaryId: '6636597ae70ac51006d4d7dd',
                alt: 'Merc 3'
            },
            {
                cloudinaryId: '66365998e70ac51006d4d7e6',
                alt: 'Merc 4'
            }
        ],
        make: 'Mercedes',
        name: 'SL 300 Gullwing',
        year: '1955',
        yearFrom: '1966',
        yearToo: '1970'
    },
    {
        images: [
            {
                cloudinaryId: '66365a43e70ac51006d4d811',
                alt: 'Rolls 1'
            },
            {
                cloudinaryId: '66365a61e70ac51006d4d814',
                alt: 'Rolls 2'
            },
            {
                cloudinaryId: '66365a9b87fa1f24532a35d0',
                alt: 'Rolls 3'
            },
            {
                cloudinaryId: '66365abb87fa1f24532a35d3',
                alt: 'Rolls 4'
            }
        ],
        make: 'Rolls-Royce',
        name: 'Phantom',
        year: '2010',
        yearFrom: '1989',
        yearToo: '1999'
    },
    {
        images: [
            {
                cloudinaryId: '66365b5ee70ac51006d4d845',
                alt: 'Lambo 1'
            },
            {
                cloudinaryId: '66365ba693a20f781cf46dd5',
                alt: 'Lambo 2'
            },
            {
                cloudinaryId: '66365bc7e70ac51006d4d857',
                alt: 'Lambo 3'
            },
            {
                cloudinaryId: '66365be9e70ac51006d4d862',
                alt: 'Lambo 4'
            }
        ],
        make: 'Lamborghini',
        name: 'Murcielago Roadster',
        year: '2001',
        yearFrom: '1968',
        yearToo: '1977'
    }
]);

const vehicles = ref([
    {
        images: [
            {
                cloudinaryId: '65466c15afa7da0f964a0012',
                alt: 'Car Alt Text'
            }
        ],
        make: 'Alfa Romeo',
        name: 'Alfa Romeo 2000 Spider Veloce',
        year: '1973',
        yearFrom: '1968',
        yearToo: '1977',
        saleType: 'Auction',
        price: 30000,
        engine: '4.2 l',
        odometer: '12,499',
        transmission: 'manual 5 speed',
        stearinSide: 'left'
    },
    {
        images: [
            {
                cloudinaryId: '65466bfcafa7da0f964a000e',
                alt: 'Car Alt Text'
            }
        ],
        make: 'Ford',
        name: "Ford Model A 'The Ballard Special' Speedster",
        year: '1930',
        yearFrom: '1958',
        yearToo: '1971',
        saleType: 'Auction',
        price: 45000,
        engine: '3.2 l',
        odometer: '45,000',
        transmission: 'manual 4 speed',
        stearinSide: 'right'
    },
    {
        images: [
            {
                cloudinaryId: '65466c4dafa7da0f964a011c',
                alt: 'Car Alt Text'
            }
        ],
        make: 'Renault',
        name: 'Alpine Renault A110',
        year: '1956',
        yearFrom: '1938',
        yearToo: '1947',
        saleType: 'Fixed Price',
        price: 20000,
        engine: '2.2 l',
        odometer: '125,000',
        transmission: 'manual 3 speed',
        stearinSide: 'right'
    },
    {
        images: [
            {
                cloudinaryId: '65466babc302c20f89908e11',
                alt: 'Car Alt Text'
            }
        ],
        make: 'Porshe',
        name: 'Porsche 911 (997) GT3 RS',
        year: '2007',
        yearFrom: '1964',
        yearToo: '1974',
        saleType: 'Fixed Price',
        price: 33000,
        engine: '2.1 l',
        odometer: '43,000',
        transmission: 'manual 4 speed',
        stearinSide: 'right'
    },
    {
        images: [
            {
                cloudinaryId: '661fecb3d7eafa12344017a8',
                alt: 'Car Alt Text'
            }
        ],
        make: 'Austin Healey',
        name: 'Austin-Healey 3000 MK II',
        year: '1961',
        yearFrom: '1969',
        yearToo: '1987',
        saleType: 'Auction',
        price: 33000,
        engine: '2.4 l',
        odometer: '44,000',
        transmission: 'manual 4 speed',
        stearinSide: 'left'
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
        <DataView :value="vehicles" paginator :rows="7" layout="grid" :sortOrder="sortOrder" :sortField="sortField">
            <template #header>
                <div class="flex flex-column sm:flex-row sm:align-items-center sm:justify-content-between gap-3">
                    <span class="text-xl text-900 font-semibold">Sub Markets</span>
                    <Dropdown v-model="sortKey" :options="sortOptions" optionLabel="label" placeholder="Sort By" class="w-full md:w-15rem" @change="onSortChange($event)" />
                </div>
            </template>
            <template #grid="slotProps">
                <layout-grid>
                    <ModelCard v-for="(item, index) in slotProps.items" :key="index" :name="item.name" :make="item.make" :yearFrom="item.yearFrom" :yearToo="item.yearToo" :images="item.images" />
                </layout-grid>
            </template>
        </DataView>
        <DataView :value="vehicles" paginator :rows="7" layout="grid" :sortOrder="sortOrder" :sortField="sortField">
            <template #header>
                <div class="flex flex-column sm:flex-row sm:align-items-center sm:justify-content-between gap-3">
                    <span class="text-xl text-900 font-semibold">Listings</span>
                    <Dropdown v-model="sortKey" :options="sortOptions" optionLabel="label" placeholder="Sort By" class="w-full md:w-15rem" @change="onSortChange($event)" />
                </div>
            </template>
            <template #grid="slotProps">
                <layout-grid>
                    <ListingCard
                        v-for="(item, index) in slotProps.items"
                        :key="index"
                        :name="item.name"
                        :make="item.make"
                        :images="item.images"
                        :year="item.year"
                        :saleType="item.saleType"
                        :price="item.price"
                        :engine="item.engine"
                        :odometer="item.odometer"
                        :transmission="item.transmission"
                        :stearingSide="item.stearingSide"
                    />
                </layout-grid>
            </template>
        </DataView>
    </div>
</template>
