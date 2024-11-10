<template>
    <div class="testing">
        <div>ICON DISPLAY</div>
        <SvgIconDisplay />
        <div>ICON LIST</div>
        <SvgIconList />
    </div>
</template>

<script>
export default {};
</script>

<style lang="scss">
.testing {
    .the-logo {
        width: 400px;
        .mark-outer {
            fill: blue;
        }
        .mark-middle {
            fill: pink;
        }
        .mark-inner {
            fill: green;
        }
        .letter-c-1 {
            fill: turquoise;
        }
        .letter-h-1 {
            fill: turquoise;
        }
        .letter-i-1 {
            fill: maroon;
        }
        .letter-i-1-dot {
            fill: maroon;
        }
        .letter-l-1 {
            fill: indigo;
        }
        .letter-l-2 {
            fill: plum;
        }
        .letter-s-1 {
            fill: magenta;
        }
        .letter-i-2 {
            fill: tan;
        }
        .letter-i-2-dot {
            fill: tan;
        }
    }
    .the-mark {
        width: 100px;
        .outer {
            fill: palevioletred;
        }
        .middle {
            fill: green;
        }
        .inner {
            fill: blue;
        }
    }
}
</style>
