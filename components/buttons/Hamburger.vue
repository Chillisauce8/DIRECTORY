<template>
    <div class="hamburger" :class="{ closed: !isOpen, open: isOpen }" @click="toggleOpen">
        <div class="light-on" :class="{ 'light-on--visible': isLightOn }"></div>
        <SvgIcon
            svg="classic-car"
            :class="{
                'car--visible': isOpen || isDoorOpen, // Changed this line
                'car--hidden': !isOpen && !isDoorOpen, // Changed this line
                'car--lights-on': isCarLightsOn
            }"
            button
        />
        <div class="light-off" :class="{ 'light-off--visible': !isLightOn && isDoorOpen }"></div>
        <div class="door-wrapper">
            <div class="garage-door" :class="{ 'garage-door--open': isDoorOpen }">
                <div class="garage-shutter top"></div>
                <div class="garage-shutter middle"></div>
                <div class="garage-shutter bottom"></div>
            </div>
        </div>

        <SvgIcon svg="garage" button :class="{ 'light-on--visible': isLightOn }" />
    </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';

// State management for component
const isDoorOpen = ref(false);
const isLightOn = ref(false);
const isOpen = ref(false);
const isCarLightsOn = ref(false);

// Timeline animation orchestration
const runOpenAnimation = () => {
    // Reset states if needed
    if (!isOpen.value) return;

    // Start animation sequence
    isDoorOpen.value = true;

    // After door opens, show light
    setTimeout(() => {
        isLightOn.value = true;
    }, 1500); // Light appears 500ms after door starts opening
    // After door opens, show light
    setTimeout(() => {
        isCarLightsOn.value = true;
    }, 2500); // Light appears 500ms after door starts opening
};

const runCloseAnimation = () => {
    // Start with slight delay before turning off car lights
    setTimeout(() => {
        isCarLightsOn.value = false;

        // Wait same time as between car/garage lights in open (1000ms)
        setTimeout(() => {
            isLightOn.value = false;

            // Wait same time as initial garage light delay (1500ms)
            setTimeout(() => {
                isDoorOpen.value = false;
            }, 500);
        }, 500);
    }, 500);
};

// Toggle open/closed state when clicked
const toggleOpen = () => {
    isOpen.value = !isOpen.value;
    if (isOpen.value) {
        runOpenAnimation();
    } else {
        runCloseAnimation();
    }
};
</script>

<style lang="scss">
.hamburger {
    --car-stroke: rgba(0, 0, 0, 1);
    --car-body: var(--primary-color);
    --car-wheels: rgba(7, 36, 40, 1);
    --car-lights-on: rgba(255, 213, 11, 1);
    --car-lights-off: rgba(0, 0, 0, 1);
    --garage-light-color: rgb(255, 250, 227);
    --garage-light-shade: rgba(0, 0, 0, 1);
    --garage-light-off: rgba(0, 0, 0, 0.7);
    --garage-door-color: rgba(0, 0, 0, 1);
    --garage-shutter-color: rgba(255, 255, 255, 1);

    position: relative;
    width: 48px;
    height: 48px;
    cursor: pointer;
    display: flex;
    align-items: flex-end;
    justify-content: center;

    .classic-car {
        position: absolute;
        top: 8%;
        width: 80%;
        height: 80%;

        transition: opacity 0.5s ease;
        &.car--hidden {
            opacity: 0;
        }
        &.car--visible {
            opacity: 1; // Force override
        }

        path {
            stroke: var(--car-stroke);
        }

        .wing,
        .bonnet {
            fill: var(--car-body);
        }

        .windscreen {
            fill: none;
        }

        .wheel {
            fill: var(--car-wheels);
        }

        .carlight {
            fill: var(--car-lights-off);
            transition: fill 0.5s ease;
        }
        &.car--lights-on {
            .carlight {
                fill: var(--car-lights-on);
            }
        }
    }

    .light-on,
    .light-off,
    .door-wrapper {
        top: 20%;
        width: 100%;
        height: 71%;
        position: absolute;
    }

    .light-off {
        background-color: var(--garage-light-off);
        opacity: 0;
        transition: opacity 0.5s ease;

        &--visible {
            opacity: 1;
        }
    }

    .light-on {
        background-image: conic-gradient(at 50% 0%, var(--garage-light-shade), var(--garage-light-shade), var(--garage-light-color), var(--garage-light-shade), var(--garage-light-shade));
        opacity: 0;
        transition: opacity 0.5s ease;

        &--visible {
            opacity: 1;
        }
    }

    .door-wrapper {
        display: flex;
        flex-direction: column;
        overflow: hidden;

        .garage-door {
            display: flex;
            flex-grow: 1;
            flex-direction: column;
            justify-content: space-evenly;
            align-items: center;
            width: 100%;
            position: relative;
            transform: translateY(0);
            transition: transform 0.8s ease-in-out;

            .garage-shutter {
                width: 80%;
                height: 3px;
                background-color: var(--garage-shutter-color);
            }

            &--open {
                transform: translateY(-100%);
                background-color: var(--garage-door-color);
            }
        }
    }

    .garage {
        position: absolute;
        top: 0px;
        .bulb {
            fill: none;
            stroke: none;
        }
        &.light-on--visible {
            .bulb {
                stroke: var(--garage-light-color);
                fill: var(--garage-light-color);
            }
        }
    }
}
</style>
