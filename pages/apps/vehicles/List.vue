<script setup>
import { ref } from 'vue';

const sortOrder = ref(-1);
const sortOptions = [
    { label: 'Year', value: 'year' },
    { label: 'Name', value: 'name' },
    { label: 'Nickname', value: 'nickname' }
];

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
        nickname: 'Fat Bastard'
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
        nickname: 'Red Devil'
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
        year: '1956'
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
        nickname: 'Little Bastard'
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
        nickname: 'The Fly'
    }
]);

const posts = ref([
    {
        coverImage: '/demo/images/blog/blog-1.png',
        profile: '/demo/images/avatar/circle/avatar-f-1.png',
        title: 'Car 1',
        description: 'Ornare egestas pellentesque facilisis in a ultrices erat diam metus integer sed',
        comment: 2,
        share: 7,
        day: '15',
        month: 'October'
    },
    {
        coverImage: '/demo/images/blog/blog-2.png',
        profile: '/demo/images/avatar/circle/avatar-f-2.png',
        title: 'Magazine',
        description: 'Magna iaculis sagittis, amet faucibus scelerisque non ornare non in penatibus ',
        comment: 5,
        share: 1,
        day: '20',
        month: 'Nov'
    },
    {
        coverImage: '/demo/images/blog/blog-3.png',
        profile: '/demo/images/avatar/circle/avatar-m-1.png',
        title: 'Science',
        description: 'Purus mattis mi, libero maecenas volutpat quis a morbi arcu pharetra, mollis',
        comment: 2,
        share: 6,
        day: '23',
        month: 'Oct'
    },
    {
        coverImage: '/demo/images/blog/blog-4.png',
        profile: '/demo/images/avatar/circle/avatar-m-1.png',
        title: 'Blog',
        description: 'Curabitur vitae sit justo facilisi nec, sodales proin aliquet libero volutpat nunc',
        comment: 5,
        share: 5,
        day: '14',
        month: 'Dec'
    },
    {
        coverImage: '/demo/images/blog/blog-5.png',
        profile: '/demo/images/avatar/circle/avatar-f-3.png',
        title: 'Magazine',
        description: 'Id eget arcu suspendisse ullamcorper dolor lobortis dui et morbi penatibus quam',
        comment: 4,
        share: 1,
        day: '05',
        month: 'Apr'
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
        <DataView :value="posts" paginator :rows="7" layout="grid" :sortOrder="sortOrder" :sortField="sortField">
            <template #header>
                <div class="flex flex-column sm:flex-row sm:align-items-center sm:justify-content-between gap-3">
                    <span class="text-xl text-900 font-semibold">Posts</span>
                    <Dropdown v-model="sortKey" :options="sortOptions" optionLabel="label" placeholder="Sort By" class="w-full md:w-15rem" @change="onSortChange($event)" />
                </div>
            </template>
            <template #grid="slotProps">
                <div class="grid grid-nogutter">
                    <div v-for="(item, index) in slotProps.items" :key="index" class="col-12 md:col-4">
                        <div class="p-3">
                            <div class="surface-100 cursor-pointer z-index border-round">
                                <div class="relative">
                                    <img :src="item.coverImage" class="w-full" :alt="item.description.split(' ', 1)" />
                                    <img :src="item.profile" class="flex absolute w-4rem h-4rem" :style="{ bottom: '-1.5rem', right: '1.5rem' }" :alt="item.description.split(' ', 1)" />
                                </div>
                                <div class="p-3">
                                    <div class="text-900 font-semibold text-xl mb-3">{{ item.title }}</div>
                                    <p class="text-700 text-lg mt-0 mb-5">{{ item.description }}</p>

                                    <div class="flex flex-wrap gap-2 align-items-center justify-content-between">
                                        <span class="flex align-items-center text-900">
                                            <i class="pi pi-comment mr-2"></i>
                                            <span class="font-semibold">{{ item.comment }}</span>
                                        </span>
                                        <span class="flex align-items-center text-900">
                                            <i class="pi pi-share-alt mr-2"></i>
                                            <span class="font-semibold">{{ item.share }}</span>
                                        </span>
                                        <span class="flex align-items-center text-900">
                                            <i class="pi pi-clock mr-2"></i>
                                            <span class="font-semibold mr-1">{{ item.day }}</span>
                                            <span class="font-semibold">{{ item.month }}</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </DataView>
    </div>

    <div class="card">
        <DataView :value="vehicles" paginator :rows="7" layout="grid" :sortOrder="sortOrder" :sortField="sortField">
            <template #header>
                <div class="flex flex-column sm:flex-row sm:align-items-center sm:justify-content-between gap-3">
                    <span class="text-xl text-900 font-semibold">Vehicles</span>
                    <Dropdown v-model="sortKey" :options="sortOptions" optionLabel="label" placeholder="Sort By" class="w-full md:w-15rem" @change="onSortChange($event)" />
                </div>
            </template>
            <template #grid="slotProps">
                <div class="grid grid-nogutter">
                    <VehicleCard v-for="(item, index) in slotProps.items" :key="index" :name="item.name" :make="item.make" :year="item.year" :images="item.images" :nickname="item.nickname" />
                </div>
            </template>
        </DataView>
    </div>
</template>
