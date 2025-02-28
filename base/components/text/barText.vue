<template>
  <header class="bar-text W2">
    <div class="block-1">
      <h1 class="text-1">{{ props.title }}</h1>
      <div class="bar-1"></div>
    </div>
    <div v-if="props.subTitle" class="block-2">
      <h2 class="text-2">
        {{ props.subTitle }}
      </h2>
      <div class="bar-2"></div>
    </div>
  </header>
</template>

<script>
export default {
  props: ["props"],
};
</script>

<style lang="scss">
.bar-text-disabled {
  display: flex;
  flex-direction: column;
  color: white;
  & .block-1,
  & .block-2 {
    position: relative;
    padding: 10px;
    //   background-color: greenyellow;
    overflow: hidden;
  }

  & .bar-1,
  & .bar-2 {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    //  background-color: red;
  }
  & .bar-1 {
    background-image: linear-gradient(
      to right,
      rgb(0, 180, 219, 1),
      rgb(0, 131, 176, 1)
    );
    transform: translateX(-100%);
    animation: bar-in 1s ease-in-out 1s, bar-out 1s ease-in-out 2s;
  }
  & .bar-2 {
    background-image: linear-gradient(
      to right,
      rgb(115, 200, 169, 1),
      rgb(55, 59, 68, 1)
    );
    animation: bar-in 1s ease-in-out 3s, bar-out 1s ease-in 4s;
    transform: translateX(-100%);
  }
  & .text-1 {
    // font-family: 'Times New Roman', Times, serif;
    opacity: 0;
    //    font-weight: 600;
    //    text-transform: uppercase;
    //    letter-spacing: 20px;

    //   text-shadow: 5px 5px #000000, 4px 4px #000000, 3px 3px #000000,
    //     2px 2px #000000, 1px 1px #000000;
    animation: fade-in 1s ease-in-out 2.5s both;
  }
  & .text-2 {
    // font-size: 16px;
    opacity: 0;
    text-shadow: 1px 1px #000000;
    animation: fade-in 1s ease-in-out 4.5s both;
  }
}

@keyframes bar-in {
  0% {
    transform: translateX(-100%);
    opacity: 0;
  }
  100% {
    transform: translateX(0%);
    opacity: 1;
  }
}

@keyframes bar-out {
  0% {
    transform: translateX(0%);
    opacity: 1;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translateX(100%);
    opacity: 0;
  }
}

@keyframes fade-in {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
</style>
