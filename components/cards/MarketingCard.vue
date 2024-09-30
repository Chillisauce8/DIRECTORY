<template>
    <card-wrapper class="marketing-card" :class="{ 'X-Center': props.svg, link: props.link }" :link="props.link">
        <swp-picture v-if="images" :images="images" :max="1" widths="290:870" :increment="290" aspectRatio="3:2" loading="lazy" />
        <LazySvgIcon v-else-if="props.svg" :svg="props.svg" />
        <card-text-wrapper>
            <h1 v-if="props.title">{{ props.title }}</h1>
            <div v-if="props.copy" class="copy">
                {{ props.copy }}
            </div>
        </card-text-wrapper>
    </card-wrapper>
</template>

<script>
export default {
    props: ['props']
};
</script>

<style lang="scss">
.marketing-card {
    width: 300px;
    cursor: auto;
    &.link {
        cursor: pointer;
    }

    & figure {
        @include aspect-ratio(2, 1);
    }
    & header {
        text-align: center;
        & h1 {
            margin: 18px 0;
            font-size: 18px;
        }
        & .copy {
            font-size: 16px;
        }

        //     min-height: 150px;
    }
    & i.icon {
        width: 72px;
        height: 72px;
        color: $C1;
    }
}
</style>
