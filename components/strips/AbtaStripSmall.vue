<template>
    <section class="abta-strip-small Column-Row">
        <div>ABTA Member</div>
        <SvgLogo svg="abta" class="abta-logo no-stoke original-color" />
        <div>Financial Protection</div>
    </section>
</template>

<script>
export default {};
</script>

<style lang="scss">
.abta-strip-small {
    background-image: $GBC-3;
    padding: 12px;
    text-align: center;
    & .abta-logo {
        width: 100px;
        @include mobile() {
            margin: 10px 0;
        }
    }
    & > div {
        font-family: var(--primary-font-family);
        letter-spacing: 5px;
        text-transform: uppercase;
        @include desktop() {
            margin: 0 50px;
        }
        @include mobile() {
            font-size: 12px;
        }
    }
}
</style>
