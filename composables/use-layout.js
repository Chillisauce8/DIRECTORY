import { computed, reactive, ref, watch } from 'vue';

const layoutConfig = reactive({
    preset: 'Aura',
    primary: 'emerald',
    surface: null,
    darkTheme: false,
    menuMode: 'static',
    menuTheme: 'colorScheme'
});

const layoutState = reactive({
    staticMenuDesktopInactive: false,
    overlayMenuActive: false,
    sidebarActive: false,
    anchored: false,
    overlaySubmenuActive: false,
    profileSidebarVisible: false,
    configSidebarVisible: false,
    staticMenuMobileActive: false,
    menuHoverActive: false,
    activeMenuItem: null
});

const outsideClickListener = ref(null);

export function useLayout() {
    const setPrimary = (value) => {
        layoutConfig.primary = value;
    };

    const setSurface = (value) => {
        layoutConfig.surface = value;
    };

    const setPreset = (value) => {
        layoutConfig.preset = value;
    };

    const setMenuMode = (mode) => {
        layoutConfig.menuMode = mode;

        if (layoutConfig.menuMode === 'static') {
            layoutState.staticMenuDesktopInactive = false;
        }
    };

    const setMenuTheme = (value) => {
        layoutConfig.menuTheme = value;
    };

    const toggleDarkMode = () => {
        if (!document.startViewTransition) {
            executeDarkModeToggle();

            return;
        }

        document.startViewTransition(() => executeDarkModeToggle(event));
    };

    const executeDarkModeToggle = () => {
        layoutConfig.darkTheme = !layoutConfig.darkTheme;
        document.documentElement.classList.toggle('app-dark');
    };

    const setActiveMenuItem = (item) => {
        layoutState.activeMenuItem = item.value || item;
    };

    const setMenuStates = (value) => {
        layoutState.overlaySubmenuActive = value;
        layoutState.menuHoverActive = value;
    };

    const setStaticMenuMobile = () => {
        layoutState.staticMenuMobileActive = !layoutState.staticMenuMobileActive;
    };

    const watchSidebarActive = () => {
        watch(isSidebarActive, (newVal) => {
            if (newVal) {
                bindOutsideClickListener();
            } else {
                unbindOutsideClickListener();
            }
        });
    };

    const onMenuToggle = () => {
        if (layoutConfig.menuMode === 'overlay') {
            layoutState.overlayMenuActive = !layoutState.overlayMenuActive;
        }

        if (window.innerWidth > 991) {
            layoutState.staticMenuDesktopInactive = !layoutState.staticMenuDesktopInactive;
        } else {
            layoutState.staticMenuMobileActive = !layoutState.staticMenuMobileActive;
        }
    };

    const onProfileSidebarToggle = () => {
        layoutState.profileSidebarVisible = !layoutState.profileSidebarVisible;
    };

    const onConfigSidebarToggle = () => {
        if (isSidebarActive.value) {
            resetMenu();
            unbindOutsideClickListener();
        }

        layoutState.configSidebarVisible = !layoutState.configSidebarVisible;
    };

    const onSidebarToggle = (value) => {
        layoutState.sidebarActive = value;
    };

    const onAnchorToggle = () => {
        layoutState.anchored = !layoutState.anchored;
    };

    const bindOutsideClickListener = () => {
        if (!outsideClickListener.value) {
            outsideClickListener.value = (event) => {
                if (isOutsideClicked(event)) {
                    resetMenu();
                }
            };
            document.addEventListener('click', outsideClickListener.value);
        }
    };

    const unbindOutsideClickListener = () => {
        if (outsideClickListener.value) {
            document.removeEventListener('click', outsideClickListener.value);
            outsideClickListener.value = null;
        }
    };

    const isOutsideClicked = (event) => {
        const sidebarEl = document.querySelector('.layout-sidebar');
        const topbarButtonEl = document.querySelector('.topbar-menubutton');

        return !(sidebarEl?.isSameNode(event.target) || sidebarEl?.contains(event.target) || topbarButtonEl?.isSameNode(event.target) || topbarButtonEl?.contains(event.target));
    };

    const resetMenu = () => {
        layoutState.overlayMenuActive = false;
        layoutState.overlaySubmenuActive = false;
        layoutState.staticMenuMobileActive = false;
        layoutState.menuHoverActive = false;
        layoutState.configSidebarVisible = false;
    };

    const isDarkTheme = computed(() => layoutConfig.darkTheme);
    const isSidebarActive = computed(() => layoutState.overlayMenuActive || layoutState.staticMenuMobileActive || layoutState.overlaySubmenuActive);
    const isDesktop = computed(() => window.innerWidth > 991);
    const isSlim = computed(() => layoutConfig.menuMode === 'slim');
    const isSlimPlus = computed(() => layoutConfig.menuMode === 'slim-plus');
    const isHorizontal = computed(() => layoutConfig.menuMode === 'horizontal');

    const getPrimary = computed(() => layoutConfig.primary);
    const getSurface = computed(() => layoutConfig.surface);

    return {
        layoutConfig,
        layoutState,
        getPrimary,
        getSurface,
        setPrimary,
        setSurface,
        setPreset,
        setMenuMode,
        setMenuTheme,
        toggleDarkMode,
        onMenuToggle,
        setMenuStates,
        setStaticMenuMobile,
        watchSidebarActive,
        isSidebarActive,
        isDarkTheme,
        setActiveMenuItem,
        onProfileSidebarToggle,
        onConfigSidebarToggle,
        onSidebarToggle,
        onAnchorToggle,
        isSlim,
        isSlimPlus,
        isHorizontal,
        isDesktop,
        unbindOutsideClickListener
    };
}