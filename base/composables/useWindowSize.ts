import { ref, onMounted, onUnmounted } from 'vue';

// This function helps track the browser window size and determine if we're on mobile or desktop
export function useWindowSize(breakpoint = 960) {
    // Track window dimensions
    const width = ref(0);
    const height = ref(0);
    // Track device type based on screen width
    const isMobile = ref(true);
    const isDesktop = ref(false);

    // Update all size-related values when the window changes
    const updateSize = () => {
        width.value = window.innerWidth;
        height.value = window.innerHeight;
        // Consider it desktop if wider than breakpoint (default 960px)
        isDesktop.value = width.value > breakpoint;
        isMobile.value = !isDesktop.value;
    };

    // Start listening for window resize when component is created
    onMounted(() => {
        window.addEventListener('resize', updateSize);
        updateSize();
    });

    // Clean up event listener when component is destroyed
    onUnmounted(() => {
        window.removeEventListener('resize', updateSize);
    });

    return { width, height, isMobile, isDesktop };
}
