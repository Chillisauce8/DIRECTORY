<template>
    <card-wrapper class="staff-card card">
      <ImageWrapper type="people" :max="1" />
      <card-text-wrapper>
        <div class="role">{{ role }}</div>
        <h1 class="name">{{ name }}</h1>
        <div class="phone">{{ phone }}</div>
      </card-text-wrapper>
    </card-wrapper>
</template>

<script>
export default {
  data() {
    return {
      role: 'Account Manager',
      name: 'Andrea Jameson',
      phone: '',
    }
  },
}
</script>

<style lang="scss">
.staff-card {
  width: 300px;
  & figure {
    @include aspect-ratio(3, 2);
  }
  & header {
    @include aspect-ratio(2, 1);
  }
  & .name {
    font-size: 24px;
    font-weight: 100;
  }
  & .role {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
  }
  & .phone {
    font-size: 12px;
  }
}
</style>
