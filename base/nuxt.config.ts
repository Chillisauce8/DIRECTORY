// https://nuxt.com/docs/api/configuration/nuxt-config
import { resolve } from 'path';
import environment from './environment';
import { useTheme } from './composables/useTheme';
import commonjs from 'vite-plugin-commonjs';

const { DefaultTheme } = useTheme();

export default defineNuxtConfig({
    modules: ['@nuxt/fonts', '@pinia/nuxt', '@vueuse/nuxt', 'nuxt-delay-hydration', '@primevue/nuxt-module', '@nuxtjs/tailwindcss', '@nuxt/image', '@vueuse/motion/nuxt', '@sidebase/nuxt-auth'],

    auth: {
        baseURL: process.env.NUXT_PUBLIC_AUTH_ORIGIN || 'http://localhost:3000',
        globalMiddleware: true,
        provider: {
            type: 'authjs'
        },
        pages: {
            signIn: '/auth/login',
            register: '/auth/register'
        }
    },

    primevue: {
        autoImport: true,
        options: {
            theme: {
                preset: DefaultTheme,
                options: {
                    darkModeSelector: '.app-dark'
                }
            }
        },
        components: {
            include: '*'  // This will include all PrimeVue components
        },
        directives: {
            include: ['Tooltip', 'ripple']
        }
    },

    devtools: {
        enabled: false
    },

    ssr: environment.ssr ?? true,

    css: [
        resolve(__dirname, './assets/css/global.scss'),
        resolve(__dirname, './assets/styles.scss'),
        resolve(__dirname, './assets/tailwind.css'),
        'primeicons/primeicons.css',
        '@uppy/core/dist/style.css',
        '@uppy/dashboard/dist/style.css',
        '@uppy/drag-drop/dist/style.css',
        '@uppy/progress-bar/dist/style.css'
    ],

    image: {
        cloudinary: {
            baseURL: 'https://media.chillisauce.com/image/upload/'
        }
    },

    app: {
        pageTransition: { name: 'page', mode: 'out-in' },
        head: {
            htmlAttrs: {
                lang: 'en-gb'
            },
            link: [
                { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
            ],
            meta: [],
            script: []
        }
    },

    build: {
        analyze: true
    },

    alias: {
        '@': resolve(__dirname, './'),
        '~': resolve(__dirname, './'),
        quill: process.dev ? 'quill/dist/quill.js' : 'quill'
    },

    vite: {
        css: {
            preprocessorOptions: {
                scss: {
                    additionalData: `
                        @use "sass:math";
                        @use "${resolve(__dirname, './assets/css/vars')}" as *;
                        @use "${resolve(__dirname, './assets/css/_mixins')}" as *;
                    `
                }
            }
        },
        plugins: [
            {
                name: 'custom-blocks',
                transform(code, id) {
                    if (!/vue&type=custom-docs/.test(id)) return;
                    return `export default ${JSON.stringify(code)}`;
                }
            },
            commonjs({
                filter(id) {
                    if (id.includes('node_modules/')) {
                        return true;
                    }
                },
                advanced: {
                    importRules: (id: string) => 'namedFirst'
                }
            })
        ],
        optimizeDeps: {
            exclude: ['fsevents'],
            include: ['quill', 'lodash'],
            noDiscovery: true
        },
        build: {
            sourcemap: false,
            rollupOptions: {
                output: {}
            }
        }
    },

    delayHydration: {
        mode: 'mount',
        replayClick: true
    },

    plugins: [
        { src: resolve(__dirname, './plugins/app.js') },
        { src: resolve(__dirname, './plugins/default-http-interceptors.ts') },
        { src: resolve(__dirname, './plugins/js-extend.ts') }
    ],

    components: {
        dirs: [
            {
                path: '~/components',
                pathPrefix: false
            },
            {
                path: '~/layouts',
                pathPrefix: false
            }
        ]
    },

    pages: true,

    hooks: {
        'pages:extend': (pages: any[]) => {
            pages.push({
                name: 'Edit Test Form',
                path: '/new/test-form/:id',
                file: resolve(__dirname, './pages/new/test-form.vue')
            });
            pages.push({
                name: 'Market List',
                path: '/market',
                file: resolve(__dirname, './pages/market/list.vue')
            });
            pages.push({
                name: 'Market',
                path: '/market/:slug+',
                file: resolve(__dirname, './pages/market/slug.vue')
            });

            pages.push({
                name: 'index',
                path: '/',
                file: resolve(__dirname, './pages/index.vue')
            });
            pages.push({
                name: 'message',
                path: '/new/message',
                file: resolve(__dirname, './pages/new/Message.vue'),
                children: [
                    {
                        path: '',
                        name: 'message-index', // Add name to remove warning
                        redirect: '/new/message/inbox'
                    },
                    {
                        path: 'compose',
                        name: 'message-compose',
                        props: { mode: 'new' }
                    },
                    {
                        path: 'detail/:id',
                        name: 'message-detail',
                        props: true
                    },
                    {
                        path: 'starred',
                        name: 'message-starred',
                        props: true
                    },
                    {
                        path: 'spam',
                        name: 'message-spam',
                        props: true
                    },
                    {
                        path: 'important',
                        name: 'message-important',
                        props: true
                    },
                    {
                        path: 'sent',
                        name: 'message-sent',
                        props: true
                    },
                    {
                        path: 'archived',
                        name: 'message-archived',
                        props: true
                    },
                    {
                        path: 'trash',
                        name: 'message-trash',
                        props: true
                    }
                ]
            });
            pages.push({
                name: 'message',
                path: '/new/message',
                file: resolve(__dirname, './pages/new/Message.vue'),
                children: [
                    {
                        path: '',
                        name: 'message-index',
                        redirect: '/new/message/inbox'
                    },
                    {
                        path: 'inbox',
                        name: 'message-inbox',
                        file: resolve(__dirname, './pages/new/message/[folder].vue')
                    },
                    {
                        path: 'compose',
                        name: 'message-compose',
                        props: { mode: 'new' }
                    },
                    {
                        path: 'thread/:id',
                        name: 'message-thread',
                        props: true
                    },
                    {
                        path: ':folder',
                        name: 'message-folder',
                        file: resolve(__dirname, './pages/new/message/[folder].vue'),
                        props: true
                    }
                ]
            });
        }
    },

    nitro: {
        devProxy: environment.devProxy ?? {},
        routeRules: {
            '/api/auth/**': { cors: true, security: { xframe: 'DENY' } },
            ...environment?.routeRules ?? {}
        },
        publicAssets: [
            {
                dir: 'docs/**/*',
                maxAge: 60 * 60 * 24 * 7 // Cache for 1 week
            }
        ]
    },

    compatibilityDate: '2024-10-14',

    imports: {
        autoImport: true,
        dirs: ['composables/**', 'utils/**']
    },

    runtimeConfig: {}
});
