<template>
  <slot></slot>
</template>

<script>

</script>

<style lang="scss">
.marketing-card {
  width: 300px;
  cursor: auto;
  &.link{
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

.marketing-booster-2 {
  padding: 10px;
  background-image: $GBC-5;
  // justify-content: center;

  & .title {
    font-size: 12px;
    font-family: $ff2;
  }
  & .icon-list-item {
    padding: 12px;
    & .logo {
      height: 24px;
      width: fit-content;
      & svg {
        height: 100%;
      }
    }
  }
}

.marketing-timeline {
  margin: 0 auto;
  counter-reset: number; // For incrementing the number on the child elements
  & .marketing-timeline-entry {
    margin: 0 auto;
    &:nth-child(odd) {
      @include desktop() {
        flex-direction: row-reverse;
      }
    }
    & .marketing-image {
      margin: 10px;
    }

    & .copy,
    & .images {
      @include desktop() {
        padding-top: 80px;
      }
    }
    & .images {
      @include mobile() {
        padding: 40px 0;
      }

      @include aspect-ratio(3, 2);
      order: 1;
      @include mobile() {
        order: 3;
      }
      width: clamp(300px, 90vw, 500px);
    }
    & .copy {
      order: 3;
      @include mobile() {
        order: 2;
      }
      margin: 10px;
      width: clamp(300px, 90vw, 500px);
      @include mobile() {
        text-align: center;
      }
      & > h1 {
        font-size: 28px;
        margin-bottom: 20px;
      }
    }
    & .timeline {
      order: 2;
      @include mobile() {
        order: 1;
      }
      width: 100px;
      position: relative;
      min-height: 100px;
      //   background-color: pink;
      & .dotted-line {
        height: 100%;
        border-left: 2px dashed $CB-3;
      }
      & .circle-container {
        height: 75px;
        width: 100%;
        // background-color: $CB;
        @include overlay();
        & .number {
          font-family: $ff2;
          font-size: 20px;
          color: white;
          text-align: center;
          background-color: $C1;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          line-height: 1;
          &:after {
            counter-increment: number;
            content: counter(number);
          }
        }
      }
    }
  }
}

.marketing-booster-1 {
  color:white;
  padding: 10px;

  background-image: $GBC-4;
  text-align: center;

  & > div {
    font-size: 14px;

    letter-spacing: 5px;
    text-transform: uppercase;
    @include desktop() {
      margin: 0 50px;
    }
    @include mobile() {
      font-size: 10px;
      margin: 5px 5%;
    }
  }
}

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
    font-family: $ff2;
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

.hero-strip {
  & .stress-list {
    & ul {
      border-left: 3px solid $C1;
      padding-left: 20px;
      margin-bottom: 40px;
    }
    & li {
      //      margin-bottom: 10px;
      letter-spacing: 2px;
      @include font-size(1);
    }
  }
  & .image-left figure {
    @include aspect-ratio(3, 2);
    background-image: linear-gradient(#2193b0, #6dd5ed);
  }

  & .image-right figure {
    @include aspect-ratio(1, 1);
    background-image: linear-gradient(#2193b0, #6dd5ed);
  }
}
</style>