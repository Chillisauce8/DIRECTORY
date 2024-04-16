<template>
  <section-wrapper class="CB-2" :id="id" title="Guest Invites">
 <slot/>
  </section-wrapper>
</template>

<script >


export default {
  props: ["id"],
}
</script>

<style lang="scss">
.guests-invite-wrapper {

}
</style>
