<script setup>
import AppConfig from '../../layouts/AppConfig.vue';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

definePageMeta({
    layout: 'custom'
});

const router = useRouter();

const { isDarkTheme } = useLayout();

const isHidden = ref(false);

function toggleHidden() {
    isHidden.value = !isHidden.value;
}

function smoothScroll(id) {
    document.querySelector(id).scrollIntoView({
        behavior: 'smooth'
    });
}

function navigateAndToggle(id) {
    smoothScroll(id);
    toggleHidden();
}

function navigateToDashboard() {
    router.push('/');
}
</script>

<template>
    <div class="relative overflow-hidden flex flex-col justify-center">
        <div class="bg-circle opacity-50" :style="{ top: '-200px', left: '-700px' }"></div>
        <div class="bg-circle hidden lg:flex" :style="{ top: '50px', right: '-800px', transform: 'rotate(60deg)' }"></div>
        <div class="landing-wrapper">
            <div class="flex items-center justify-between relative lg:static py-12 px-6 mx-0 md:px-16 lg:px-20 lg:py-12 lg:mx-20">
                <a class="cursor-pointer" @click="navigateToDashboard">
                    <svg width="124" height="22" viewBox="0 0 124 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10.4851 0L0 20.9465H3.53702L10.4856 6.07843L17.2944 20.9465H20.9715L10.4851 0Z" fill="var(--primary-color)" />
                        <path d="M13.84 15.7927L16.2077 21.0016H11.7682L13.84 15.7927Z" fill="var(--primary-color)" />
                        <path d="M9.04645 21.0016L6.67875 15.7927L4.60701 21.0016H9.04645Z" fill="var(--primary-color)" />
                        <path d="M40.9033 14.5217H34.771L33.1753 18.0007H30.8467L37.9346 2.77661L44.772 18.0007H42.4062L40.9033 14.5217ZM40.022 12.49L37.8975 7.61938L35.6709 12.49H40.022Z" fill="var(--primary-color)" />
                        <path
                            d="M52.4927 12.1838V18.0007H50.3311V3.67651H52.7803C53.9802 3.67651 54.8862 3.76001 55.4985 3.927C56.117 4.09399 56.6613 4.40942 57.1314 4.87329C57.954 5.67733 58.3652 6.69165 58.3652 7.91626C58.3652 9.22746 57.9261 10.2665 57.0479 11.0334C56.1696 11.8004 54.9852 12.1838 53.4946 12.1838H52.4927ZM52.4927 10.1799H53.2998C55.2852 10.1799 56.2778 9.4161 56.2778 7.88843C56.2778 6.41024 55.2542 5.67114 53.207 5.67114H52.4927V10.1799Z"
                            fill="var(--primary-color)"
                        />
                        <path
                            d="M63.6367 10.7737C63.6367 8.75741 64.3758 7.02563 65.854 5.57837C67.326 4.1311 69.0949 3.40747 71.1607 3.40747C73.2017 3.40747 74.952 4.13729 76.4116 5.59692C77.8775 7.05656 78.6104 8.80998 78.6104 10.8572C78.6104 12.9167 77.8744 14.664 76.4024 16.0989C74.9242 17.54 73.1398 18.2605 71.0493 18.2605C69.2001 18.2605 67.5394 17.6204 66.0674 16.3401C64.447 14.9237 63.6367 13.0683 63.6367 10.7737ZM65.8169 10.8015C65.8169 12.3848 66.3488 13.6868 67.4126 14.7073C68.4702 15.7278 69.6918 16.238 71.0772 16.238C72.5801 16.238 73.848 15.7185 74.8809 14.6794C75.9138 13.628 76.4302 12.3477 76.4302 10.8386C76.4302 9.31095 75.9199 8.03068 74.8994 6.9978C73.8851 5.95874 72.6296 5.43921 71.1328 5.43921C69.6423 5.43921 68.3836 5.95874 67.357 6.9978C66.3303 8.0245 65.8169 9.2924 65.8169 10.8015Z"
                            fill="var(--primary-color)"
                        />
                        <path d="M87.2495 3.67651V15.969H91.4615V18.0007H85.0879V3.67651H87.2495Z" fill="var(--primary-color)" />
                        <path d="M99.4327 3.67651V15.969H103.645V18.0007H97.271V3.67651H99.4327Z" fill="var(--primary-color)" />
                        <path
                            d="M108.146 10.7737C108.146 8.75741 108.885 7.02563 110.363 5.57837C111.835 4.1311 113.604 3.40747 115.67 3.40747C117.711 3.40747 119.461 4.13729 120.921 5.59692C122.387 7.05656 123.12 8.80998 123.12 10.8572C123.12 12.9167 122.384 14.664 120.912 16.0989C119.433 17.54 117.649 18.2605 115.559 18.2605C113.709 18.2605 112.049 17.6204 110.577 16.3401C108.956 14.9237 108.146 13.0683 108.146 10.7737ZM110.326 10.8015C110.326 12.3848 110.858 13.6868 111.922 14.7073C112.98 15.7278 114.201 16.238 115.586 16.238C117.089 16.238 118.357 15.7185 119.39 14.6794C120.423 13.628 120.94 12.3477 120.94 10.8386C120.94 9.31095 120.429 8.03068 119.409 6.9978C118.394 5.95874 117.139 5.43921 115.642 5.43921C114.152 5.43921 112.893 5.95874 111.866 6.9978C110.84 8.0245 110.326 9.2924 110.326 10.8015Z"
                            fill="var(--primary-color)"
                        />
                    </svg>
                </a>

                <i v-styleclass="{ selector: '@next', enterClass: 'hidden', leaveToClass: 'hidden', hideOnOutsideClick: true }" class="pi pi-bars !text-4xl cursor-pointer block md:!hidden text-surface-700 dark:text-surface-100"></i>

                <div class="items-center flex-grow-1 hidden md:flex absolute md:static w-full md:px-0 z-30 shadow md:shadow-none animate-fadein" :class="{ hidden: isHidden }" :style="{ top: '80px', right: '0%' }">
                    <ul class="list-none p-4 md:p-0 m-0 ml-auto flex md:items-center select-none flex-col md:flex-row cursor-pointer">
                        <li>
                            <a @click="navigateAndToggle('#home')" class="flex m-0 md:ml-8 px-0 py-4 text-surface-900 dark:text-surface-0 font-medium leading-normal">
                                <span>Home</span>
                            </a>
                        </li>
                        <li>
                            <a @click="navigateAndToggle('#apps')" class="flex m-0 md:ml-8 px-0 py-4 text-surface-900 dark:text-surface-0 font-medium leading-normal">
                                <span>Apps</span>
                            </a>
                        </li>
                        <li>
                            <a @click="navigateAndToggle('#pricing')" class="flex m-0 md:ml-8 px-0 py-4 text-surface-900 dark:text-surface-0 font-medium leading-normal">
                                <span>Pricing</span>
                            </a>
                        </li>
                        <li>
                            <a @click="navigateAndToggle('#features')" class="flex m-0 md:ml-8 px-0 py-4 text-surface-900 dark:text-surface-0 font-medium leading-normal">
                                <span>Features</span>
                            </a>
                        </li>

                        <li>
                            <Button type="button" label="Buy Now" class="m-0 mt-4 md:mt-0 md:ml-8"></Button>
                        </li>
                    </ul>
                </div>
            </div>
            <div class="py-6 px-6 mx-0 md:mx-12 lg:mx-20 lg:px-20 z-20">
                <div id="home" class="grid grid-cols-12 gap-4 grid-nogutter justify-between items-center mb-12 py-12 md:mb-20 md:py-20">
                    <div class="col-span-12 md:col-span-4 flex flex-col gap-6 order-1 md:order-none items-center md:items-start text-center md:text-left">
                        <span class="block text-surface-900 dark:text-surface-0 font-bold text-4xl">Modern, stylish and clean</span>
                        <span class="block text-surface-700 dark:text-surface-100 text-lg">The ultimate collection of design-agnostic, flexible and accessible UI Components.</span>
                        <ul class="flex flex-wrap gap-8 list-none p-0">
                            <li class="flex items-center">
                                <div class="p-1 rounded-full bg-green-400 inline-block mr-2"></div>
                                <span class="text-surface-900 dark:text-surface-0 font-semibold">Javascript</span>
                            </li>
                            <li class="flex items-center">
                                <div class="p-1 rounded-full bg-green-400 inline-block mr-2"></div>
                                <span class="text-surface-900 dark:text-surface-0 font-semibold">TypeScript</span>
                            </li>
                            <li class="flex items-center">
                                <div class="p-1 rounded-full bg-green-400 inline-block mr-2"></div>
                                <span class="text-surface-900 dark:text-surface-0 font-semibold">Vue</span>
                            </li>
                        </ul>
                        <Button type="button" label="Live Preview" icon="pi pi-arrow-right" iconPos="right" class="w-48" outlined></Button>
                    </div>

                    <div class="col-span-12 md:col-span-7 order-none md:order-1 mb-12 md:mb-0 rounded">
                        <img :src="`/demo/images/landing/${isDarkTheme ? 'dashboard-dark' : 'dashboard-light'}.png`" alt="" class="w-full h-full rounded shadow animate-duration-1000 animate-fadeinright" />
                    </div>
                </div>

                <div id="apps" class="my-12 md:my-20">
                    <span class="text-surface-900 dark:text-surface-0 block font-bold text-5xl mb-6 text-center">Apps</span>
                    <span class="text-surface-700 dark:text-surface-100 block text-xl mb-20 text-center leading-normal">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Velit numquam eligendi quos.</span>

                    <div class="flex flex-col lg:flex-row items-center justify-between mt-20 gap-20">
                        <div class="flex flex-col items-center">
                            <img
                                :src="`/demo/images/landing/${isDarkTheme ? 'chat-dark' : 'chat-light'}.png`"
                                alt="chat"
                                class="w-full h-full rounded border-surface-200 dark:border-surface-700 shadow animate-duration-500 animate-scalein origin-top"
                            />
                            <span class="block text-surface-900 dark:text-surface-0 text-lg font-semibold mt-6">Chat</span>
                        </div>
                        <div class="flex flex-col items-center">
                            <img
                                :src="`/demo/images/landing/${isDarkTheme ? 'mail-dark' : 'mail-light'}.png`"
                                alt="chat"
                                class="w-full h-full rounded border-surface-200 dark:border-surface-700 shadow animate-duration-500 animate-scalein origin-top"
                            />
                            <span class="block text-surface-900 dark:text-surface-0 text-lg font-semibold mt-6">Mail</span>
                        </div>
                    </div>
                </div>

                <div id="pricing" class="my-12 py-12 md:my-20 md:py-20">
                    <div class="text-surface-900 dark:text-surface-0 font-bold text-5xl mb-6 text-center">Pricing Plans</div>
                    <div class="text-surface-700 dark:text-surface-100 text-xl mb-20 text-center leading-normal">Choose a plan that works best for you and your team.</div>

                    <div class="flex flex-col lg:flex-row gap-4 grid-nogutter justify-center mt-20">
                        <div class="w-full lg:w-1/2 xl:w-1/3">
                            <div class="p-4 h-full">
                                <div class="shadow p-12 h-full flex flex-col bg-surface-0 dark:bg-surface-900" :style="{ borderRadius: '6px' }">
                                    <span class="text-surface-900 dark:text-surface-0 block font-medium text-xl mb-2 text-center">Basic Licence</span>
                                    <span class="font-bold block text-2xl text-surface-900 dark:text-surface-0 text-center">$29</span>

                                    <ul class="list-none p-0 m-0 flex-grow-1 mt-12">
                                        <li class="flex items-center mb-4">
                                            <i class="pi pi-check text-green-500 mr-2"></i>
                                            <span>Up to 10 Active Users</span>
                                        </li>
                                        <li class="flex items-center mb-4">
                                            <i class="pi pi-check text-green-500 mr-2"></i>
                                            <span>Up to 30 Project Integrations</span>
                                        </li>
                                        <li class="flex items-center mb-4">
                                            <i class="pi pi-check text-green-500 mr-2"></i>
                                            <span>Analytics Module</span>
                                        </li>
                                        <li class="flex items-center mb-4">
                                            <i class="pi pi-times text-red-500 mr-2"></i>
                                            <span>Finance Module</span>
                                        </li>
                                    </ul>

                                    <Button label="Choose Plan" class="px-8 w-full mt-12" outlined icon="pi pi-arrow-right" iconPos="right"></Button>
                                </div>
                            </div>
                        </div>

                        <div class="w-full lg:w-1/2 xl:w-1/3">
                            <div class="p-4 h-full">
                                <div class="shadow p-12 h-full flex flex-col bg-surface-0 dark:bg-surface-900" :style="{ borderRadius: '6px' }">
                                    <span class="text-surface-900 dark:text-surface-0 block font-medium text-xl mb-2 text-center">Extended Licence</span>
                                    <span class="font-bold block text-2xl text-surface-900 dark:text-surface-0 text-center">$49</span>

                                    <ul class="list-none p-0 m-0 flex-grow-1 mt-12">
                                        <li class="flex items-center mb-4">
                                            <i class="pi pi-check text-green-500 mr-2"></i>
                                            <span>Up to 10 Active Users</span>
                                        </li>
                                        <li class="flex items-center mb-4">
                                            <i class="pi pi-check text-green-500 mr-2"></i>
                                            <span>Up to 30 Project Integrations</span>
                                        </li>
                                        <li class="flex items-center mb-4">
                                            <i class="pi pi-check text-green-500 mr-2"></i>
                                            <span>Analytics Module</span>
                                        </li>
                                        <li class="flex items-center mb-4">
                                            <i class="pi pi-times text-red-500 mr-2"></i>
                                            <span>Finance Module</span>
                                        </li>
                                    </ul>

                                    <Button label="Choose Plan" class="px-8 w-full mt-12" outlined icon="pi pi-arrow-right" iconPos="right"></Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div id="features" class="my-12 py-12 md:my-20 md:py-20">
                    <span class="text-surface-900 dark:text-surface-0 block font-bold text-5xl mb-6 text-center">Features</span>
                    <span class="text-surface-700 dark:text-surface-100 block text-xl mb-20 text-center leading-normal"
                        >PrimeTek Informatics is the author of PrimeVue, a UI Component vendor with well known vastly popular projects including PrimeFaces, PrimeNG and PrimeReact.</span
                    >

                    <div class="grid grid-cols-12 gap-4 mt-20">
                        <div class="col-span-12 md:col-span-6 xl:col-span-3 flex justify-center p-4">
                            <div class="box p-6 w-full bg-surface-0 dark:bg-surface-900 border-surface-200 dark:border-surface-700 border rounded">
                                <img :src="`/demo/images/landing/icon-components.svg`" alt="components icon" class="block mb-4" />
                                <span class="text-surface-900 dark:text-surface-0 block font-semibold mb-4 text-lg">90+ UI Components</span>
                                <p class="m-0 text-secondary text-surface-700 dark:text-surface-100">The ultimate set of UI Components to assist you with 90+ impressive Vue Components.</p>
                            </div>
                        </div>
                        <div class="col-span-12 md:col-span-6 xl:col-span-3 flex justify-center p-4">
                            <div class="box p-6 w-full bg-surface-0 dark:bg-surface-900 border-surface-200 dark:border-surface-700 border rounded">
                                <img :src="`/demo/images/landing/icon-community.svg`" alt="components icon" class="block mb-4" />
                                <span class="text-surface-900 dark:text-surface-0 block font-semibold mb-4 text-lg">Community</span>
                                <p class="m-0 text-secondary text-surface-700 dark:text-surface-100">Connect with the other open source community members, collaborate and have a voice in the project roadmap.</p>
                            </div>
                        </div>
                        <div class="col-span-12 md:col-span-6 xl:col-span-3 flex justify-center p-4">
                            <div class="box p-6 w-full bg-surface-0 dark:bg-surface-900 border-surface-200 dark:border-surface-700 border rounded">
                                <img :src="`/demo/images/landing/icon-productivity.svg`" alt="components icon" class="block mb-4" />
                                <span class="text-surface-900 dark:text-surface-0 block font-semibold mb-4 text-lg">Productivity</span>
                                <p class="m-0 text-secondary text-surface-700 dark:text-surface-100">Boost your productivity by achieving more in less time and accomplish amazing results.</p>
                            </div>
                        </div>
                        <div class="col-span-12 md:col-span-6 xl:col-span-3 flex justify-center p-4">
                            <div class="box p-6 w-full bg-surface-0 dark:bg-surface-900 border-surface-200 dark:border-surface-700 border rounded">
                                <img :src="`/demo/images/landing/icon-accessibility.svg`" alt="components icon" class="block mb-4" />
                                <span class="text-surface-900 dark:text-surface-0 block font-semibold mb-4 text-lg">Accessibility</span>
                                <p class="m-0 text-secondary text-surface-700 dark:text-surface-100">The ultimate set of UI Components to assist you with 90+ impressive Vue Components.</p>
                            </div>
                        </div>
                        <div class="col-span-12 md:col-span-6 xl:col-span-3 flex justify-center p-4">
                            <div class="box p-6 w-full bg-surface-0 dark:bg-surface-900 border-surface-200 dark:border-surface-700 border rounded">
                                <img :src="`/demo/images/landing/icon-support.svg`" alt="components icon" class="block mb-4" />
                                <span class="text-surface-900 dark:text-surface-0 block font-semibold mb-4 text-lg">Enterprise Support</span>
                                <p class="m-0 text-secondary text-surface-700 dark:text-surface-100">Exceptional support service featuring response within 1 business day and option to request enhancements and new features for the library.</p>
                            </div>
                        </div>
                        <div class="col-span-12 md:col-span-6 xl:col-span-3 flex justify-center p-4">
                            <div class="box p-6 w-full bg-surface-0 dark:bg-surface-900 border-surface-200 dark:border-surface-700 border rounded">
                                <img :src="`/demo/images/landing/icon-mobile.svg`" alt="components icon" class="block mb-4" />
                                <span class="text-surface-900 dark:text-surface-0 block font-semibold mb-4 text-lg">Mobile</span>
                                <p class="m-0 text-secondary text-surface-700 dark:text-surface-100">First class support for responsive design led by touch optimized elements.</p>
                            </div>
                        </div>
                        <div class="col-span-12 md:col-span-6 xl:col-span-3 flex justify-center p-4">
                            <div class="box p-6 w-full bg-surface-0 dark:bg-surface-900 border-surface-200 dark:border-surface-700 border rounded">
                                <img :src="`/demo/images/landing/icon-theme.svg`" alt="components icon" class="block mb-4" />
                                <span class="text-surface-900 dark:text-surface-0 block font-semibold mb-4 text-lg">Themes</span>
                                <p class="m-0 text-secondary text-surface-700 dark:text-surface-100">Built on a design-agnostic api, choose from a vast amount of themes such as material, bootstrap, custom or develop your own.</p>
                            </div>
                        </div>
                        <div class="col-span-12 md:col-span-6 xl:col-span-3 flex justify-center p-4">
                            <div class="box p-6 w-full bg-surface-0 dark:bg-surface-900 border-surface-200 dark:border-surface-700 border rounded">
                                <img :src="`/demo/images/landing/icon-ts.svg`" alt="components icon" class="block mb-4" />
                                <span class="text-surface-900 dark:text-surface-0 block font-semibold mb-4 text-lg">Typescript</span>
                                <p class="m-0 text-secondary text-surface-700 dark:text-surface-100">Top-notch support for Typescript with types and tooling assistance.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="grid grid-cols-12 gap-4 justify-between my-12 pt-6 md:my-20">
                    <div class="col-span-12 md:col-span-2 text-center md:text-left">
                        <a class="cursor-pointer" href="#">
                            <svg width="124" height="22" viewBox="0 0 124 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M10.4851 0L0 20.9465H3.53702L10.4856 6.07843L17.2944 20.9465H20.9715L10.4851 0Z" fill="var(--primary-color)" />
                                <path d="M13.84 15.7927L16.2077 21.0016H11.7682L13.84 15.7927Z" fill="var(--primary-color)" />
                                <path d="M9.04645 21.0016L6.67875 15.7927L4.60701 21.0016H9.04645Z" fill="var(--primary-color)" />
                                <path d="M40.9033 14.5217H34.771L33.1753 18.0007H30.8467L37.9346 2.77661L44.772 18.0007H42.4062L40.9033 14.5217ZM40.022 12.49L37.8975 7.61938L35.6709 12.49H40.022Z" fill="var(--primary-color)" />
                                <path
                                    d="M52.4927 12.1838V18.0007H50.3311V3.67651H52.7803C53.9802 3.67651 54.8862 3.76001 55.4985 3.927C56.117 4.09399 56.6613 4.40942 57.1314 4.87329C57.954 5.67733 58.3652 6.69165 58.3652 7.91626C58.3652 9.22746 57.9261 10.2665 57.0479 11.0334C56.1696 11.8004 54.9852 12.1838 53.4946 12.1838H52.4927ZM52.4927 10.1799H53.2998C55.2852 10.1799 56.2778 9.4161 56.2778 7.88843C56.2778 6.41024 55.2542 5.67114 53.207 5.67114H52.4927V10.1799Z"
                                    fill="var(--primary-color)"
                                />
                                <path
                                    d="M63.6367 10.7737C63.6367 8.75741 64.3758 7.02563 65.854 5.57837C67.326 4.1311 69.0949 3.40747 71.1607 3.40747C73.2017 3.40747 74.952 4.13729 76.4116 5.59692C77.8775 7.05656 78.6104 8.80998 78.6104 10.8572C78.6104 12.9167 77.8744 14.664 76.4024 16.0989C74.9242 17.54 73.1398 18.2605 71.0493 18.2605C69.2001 18.2605 67.5394 17.6204 66.0674 16.3401C64.447 14.9237 63.6367 13.0683 63.6367 10.7737ZM65.8169 10.8015C65.8169 12.3848 66.3488 13.6868 67.4126 14.7073C68.4702 15.7278 69.6918 16.238 71.0772 16.238C72.5801 16.238 73.848 15.7185 74.8809 14.6794C75.9138 13.628 76.4302 12.3477 76.4302 10.8386C76.4302 9.31095 75.9199 8.03068 74.8994 6.9978C73.8851 5.95874 72.6296 5.43921 71.1328 5.43921C69.6423 5.43921 68.3836 5.95874 67.357 6.9978C66.3303 8.0245 65.8169 9.2924 65.8169 10.8015Z"
                                    fill="var(--primary-color)"
                                />
                                <path d="M87.2495 3.67651V15.969H91.4615V18.0007H85.0879V3.67651H87.2495Z" fill="var(--primary-color)" />
                                <path d="M99.4327 3.67651V15.969H103.645V18.0007H97.271V3.67651H99.4327Z" fill="var(--primary-color)" />
                                <path
                                    d="M108.146 10.7737C108.146 8.75741 108.885 7.02563 110.363 5.57837C111.835 4.1311 113.604 3.40747 115.67 3.40747C117.711 3.40747 119.461 4.13729 120.921 5.59692C122.387 7.05656 123.12 8.80998 123.12 10.8572C123.12 12.9167 122.384 14.664 120.912 16.0989C119.433 17.54 117.649 18.2605 115.559 18.2605C113.709 18.2605 112.049 17.6204 110.577 16.3401C108.956 14.9237 108.146 13.0683 108.146 10.7737ZM110.326 10.8015C110.326 12.3848 110.858 13.6868 111.922 14.7073C112.98 15.7278 114.201 16.238 115.586 16.238C117.089 16.238 118.357 15.7185 119.39 14.6794C120.423 13.628 120.94 12.3477 120.94 10.8386C120.94 9.31095 120.429 8.03068 119.409 6.9978C118.394 5.95874 117.139 5.43921 115.642 5.43921C114.152 5.43921 112.893 5.95874 111.866 6.9978C110.84 8.0245 110.326 9.2924 110.326 10.8015Z"
                                    fill="var(--primary-color)"
                                />
                            </svg>
                        </a>
                    </div>

                    <div class="col-span-12 md:col-span-10 lg:col-span-7">
                        <div class="grid grid-cols-12 gap-4 text-center md:text-left">
                            <div class="col-span-12 md:col-span-3">
                                <h4 class="font-medium text-xl leading-normal mb-4 text-surface-900 dark:text-surface-0">Company</h4>
                                <a class="leading-normal block cursor-pointer mb-2 text-surface-700 dark:text-surface-100">About Us</a>
                                <a class="leading-normal block cursor-pointer mb-2 text-surface-700 dark:text-surface-100">News</a>
                                <a class="leading-normal block cursor-pointer mb-2 text-surface-700 dark:text-surface-100">Investor Relations</a>
                                <a class="leading-normal block cursor-pointer mb-2 text-surface-700 dark:text-surface-100">Careers</a>
                                <a class="leading-normal block cursor-pointer text-surface-700 dark:text-surface-100">Media Kit</a>
                            </div>

                            <div class="col-span-12 md:col-span-3 mt-6 md:mt-0">
                                <h4 class="font-medium text-xl leading-normal mb-4 text-surface-900 dark:text-surface-0">Resources</h4>
                                <a class="leading-normal block cursor-pointer mb-2 text-surface-700 dark:text-surface-100">Get Started</a>
                                <a class="leading-normal block cursor-pointer mb-2 text-surface-700 dark:text-surface-100">Learn</a>
                                <a class="leading-normal block cursor-pointer text-surface-700 dark:text-surface-100">Case Studies</a>
                            </div>

                            <div class="col-span-12 md:col-span-3 mt-6 md:mt-0">
                                <h4 class="font-medium text-xl leading-normal mb-4 text-surface-900 dark:text-surface-0">Community</h4>
                                <a class="leading-normal block cursor-pointer mb-2 text-surface-700 dark:text-surface-100">Discord</a>
                                <a class="leading-normal block cursor-pointer mb-2 text-surface-700 dark:text-surface-100">Events</a>
                                <a class="leading-normal block cursor-pointer mb-2 text-surface-700 dark:text-surface-100">FAQ</a>
                                <a class="leading-normal block cursor-pointer text-surface-700 dark:text-surface-100">Blog</a>
                            </div>

                            <div class="col-span-12 md:col-span-3 mt-6 md:mt-0">
                                <h4 class="font-medium text-xl leading-normal mb-4 text-surface-900 dark:text-surface-0">Legal</h4>
                                <a class="leading-normal block cursor-pointer mb-2 text-surface-700 dark:text-surface-100">Brand Policy</a>
                                <a class="leading-normal block cursor-pointer mb-2 text-surface-700 dark:text-surface-100">Privacy Policy</a>
                                <a class="leading-normal block cursor-pointer text-surface-700 dark:text-surface-100">Terms of Service</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <AppConfig simple />
</template>

<style scoped>
.bg-circle {
    width: 1000px;
    height: 1000px;
    border-radius: 50%;
    background-image: linear-gradient(140deg, var(--primary-color), var(--surface-ground) 80%);
    position: absolute;
    opacity: 0.25;
    z-index: -1;
}
</style>
