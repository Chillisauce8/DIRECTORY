<template>
    <BaseCard :data-item="cardData" collection="vehicles" :grid-id="gridId" class="vehicle-card">
        <template #card-content>
            <div v-if="nickname" class="nickname">"{{ nickname }}"</div>
            <h1 class="name">{{ year }} {{ make }} {{ name }}</h1>
        </template>
    </BaseCard>
</template>

<script setup lang="ts">
interface VehicleCardProps {
    images?: string[];
    name: string;
    nickname?: string;
    make: string;
    year: string | number;
    gridId?: string;
}

const props = withDefaults(defineProps<VehicleCardProps>(), {
    gridId: 'vehicle-list'
});

const cardData = {
    _id: props.images?.[0] || 'vehicle-card',
    name: `${props.year} ${props.make} ${props.name}`
};
</script>

<style lang="scss">
.vehicle-card {
    figure,
    picture {
        @include aspect-ratio(3, 2);
    }
    .overlay-testing {
        background-color: pink;
    }
    header {
        @include aspect-ratio(3, 1);
        //     min-height: 150px;
    }

    .name {
        font-family: var(--primary-font-family);
        font-size: 14px;
        font-weight: 100;
    }
    .nickname {
        font-size: 16px;
        font-family: var(--primary-font-family);
        font-weight: 600;
        letter-spacing: 0.3rem;
        text-transform: uppercase;
    }
}
</style>
