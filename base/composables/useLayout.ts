import { computed, reactive, ref, watch } from 'vue';
import type { Ref } from 'vue';

const DESKTOP_WIDTH = 991; // Add this line

interface LayoutConfig {
    preset: string;
    primary: string;
    surface: string | null;
    darkTheme: boolean;
    menuMode: string;
    menuTheme: string;
    elevation: string;
    rounding: string;
    card: string;
}

interface LayoutState {
    staticMenuDesktopInactive: boolean;
    overlayMenuActive: boolean;
    sidebarActive: boolean;
    anchored: boolean;
    overlaySubmenuActive: boolean;
    profileSidebarVisible: boolean;
    configSidebarVisible: boolean;
    staticMenuMobileActive: boolean;
    menuHoverActive: boolean;
    activeMenuItem: string | null;
}

const layoutConfig = reactive<LayoutConfig>({
    preset: 'Aura',
    primary: 'emerald',
    surface: null,
    darkTheme: false,
    menuMode: 'main', // Default to main but still allow others
    menuTheme: 'colorScheme',
    elevation: 'high',
    rounding: 'rounded',
    card: 'simple'
});

const layoutState = reactive<LayoutState>({
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

const outsideClickListener: Ref<((event: MouseEvent) => void) | null> = ref(null);

export function useLayout() {
    const setPrimary = (value: string): void => {
        layoutConfig.primary = value;
    };

    const setSurface = (value: string): void => {
        layoutConfig.surface = value;
    };

    const setPreset = (value: string): void => {
        layoutConfig.preset = value;
    };

    const setMenuMode = (mode: string): void => {
        layoutConfig.menuMode = mode;

        if (layoutConfig.menuMode === 'static') {
            layoutState.staticMenuDesktopInactive = false;
        }
    };

    const setMenuTheme = (value: string): void => {
        layoutConfig.menuTheme = value;
    };

    const toggleDarkMode = (): void => {
        if (!document.startViewTransition) {
            executeDarkModeToggle();
            return;
        }

        document.startViewTransition(() => executeDarkModeToggle());
    };

    const executeDarkModeToggle = (): void => {
        layoutConfig.darkTheme = !layoutConfig.darkTheme;
        document.documentElement.classList.toggle('app-dark');
    };

    const setActiveMenuItem = (item: string | { value: string }): void => {
        layoutState.activeMenuItem = typeof item === 'string' ? item : item.value;
    };

    const setMenuStates = (value: boolean): void => {
        layoutState.overlaySubmenuActive = value;
        layoutState.menuHoverActive = value;
    };

    const setStaticMenuMobile = (): void => {
        layoutState.staticMenuMobileActive = !layoutState.staticMenuMobileActive;
    };

    const watchSidebarActive = (): void => {
        watch(isSidebarActive, (newVal) => {
            if (newVal) {
                bindOutsideClickListener();
            } else {
                unbindOutsideClickListener();
            }
        });
    };

    const onMenuToggle = (): void => {
        if (layoutConfig.menuMode === 'overlay') {
            layoutState.overlayMenuActive = !layoutState.overlayMenuActive;
        }

        if (window.innerWidth > DESKTOP_WIDTH) {
            // Replace 991
            layoutState.staticMenuDesktopInactive = !layoutState.staticMenuDesktopInactive;
        } else {
            layoutState.staticMenuMobileActive = !layoutState.staticMenuMobileActive;
        }
    };

    const onProfileSidebarToggle = (): void => {
        layoutState.profileSidebarVisible = !layoutState.profileSidebarVisible;
    };

    const onConfigSidebarToggle = (): void => {
        if (isSidebarActive.value) {
            resetMenu();
            unbindOutsideClickListener();
        }

        layoutState.configSidebarVisible = !layoutState.configSidebarVisible;
    };

    const onSidebarToggle = (value: boolean): void => {
        layoutState.sidebarActive = value;
    };

    const onAnchorToggle = (): void => {
        layoutState.anchored = !layoutState.anchored;
    };

    const bindOutsideClickListener = (): void => {
        if (!outsideClickListener.value) {
            outsideClickListener.value = (event: MouseEvent) => {
                if (isOutsideClicked(event)) {
                    resetMenu();
                }
            };
            document.addEventListener('click', outsideClickListener.value);
        }
    };

    const unbindOutsideClickListener = (): void => {
        if (outsideClickListener.value) {
            document.removeEventListener('click', outsideClickListener.value);
            outsideClickListener.value = null;
        }
    };

    const isOutsideClicked = (event: MouseEvent): boolean => {
        const sidebarEl = document.querySelector('.layout-sidebar');
        const topbarButtonEl = document.querySelector('.topbar-menubutton');
        const target = event.target as Node;

        return !(sidebarEl?.isSameNode(target) || sidebarEl?.contains(target) || topbarButtonEl?.isSameNode(target) || topbarButtonEl?.contains(target));
    };

    const resetMenu = (): void => {
        layoutState.overlayMenuActive = false;
        layoutState.overlaySubmenuActive = false;
        layoutState.staticMenuMobileActive = false;
        layoutState.menuHoverActive = false;
        layoutState.configSidebarVisible = false;
    };

    const isDarkTheme = computed(() => layoutConfig.darkTheme);
    const isSidebarActive = computed(() => layoutState.overlayMenuActive || layoutState.staticMenuMobileActive || layoutState.overlaySubmenuActive);
    const isDesktop = computed(() => window.innerWidth > DESKTOP_WIDTH); // Replace 991
    const isSlim = computed(() => layoutConfig.menuMode === 'slim');
    const isSlimPlus = computed(() => layoutConfig.menuMode === 'slim-plus');
    const isHorizontal = computed(() => layoutConfig.menuMode === 'horizontal'); // Add this line
    const getPrimary = computed(() => layoutConfig.primary);
    const getSurface = computed(() => layoutConfig.surface);

    const setElevation = (value: string): void => {
        layoutConfig.elevation = value;
    };

    const setRounding = (value: string): void => {
        layoutConfig.rounding = value;
    };

    const setCard = (value: string): void => {
        layoutConfig.card = value;
    };

    const applyThemeClasses = (): void => {
        document.body.className = `
            theme-elevation-${layoutConfig.elevation}
            theme-rounding-${layoutConfig.rounding}
            theme-card-${layoutConfig.card}
        `
            .replace(/\s+/g, ' ')
            .trim();
    };

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
        unbindOutsideClickListener,
        setElevation,
        setRounding,
        setCard,
        applyThemeClasses
    };
}
