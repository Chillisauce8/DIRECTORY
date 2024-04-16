<template>
  <card-wrapper class="customer-contact-card user-customer-none">
    <LazySvgIcon svg="person" />
    <div class="customer-details">Customer Details</div>
    <h1>{{ dataState.customerName }}</h1>
    <div class="phone">
    <a :tel="dataState.customerPhone"> {{ dataState.customerPhone }}</a>
  </div>
  </card-wrapper>
</template>

<script>
export default {
  props: ["event"],
  setup() {
    return {};
  },
  data() {
    return {
      dataState: {
        customerName: "",
        customerPhone: "",
      },
    };
  },
  watch: {
    event: function (newVal, oldVal) {
      this.init();
    },
  },
  beforeMount() {
    this.init();
  },
  methods: {
    init() {
      const organiser = this.event.getOrganiser();
      this.dataState.customerName = organiser?.name;
      this.dataState.customerPhone = organiser?.phone;
    },
  },
};
</script>

<style lang="scss">
.customer-contact-card {
  text-align: center;
  width: 300px;
  padding: 10px;
  .customer-details {
    margin: 40px 0 20px;
    font-family: $ff2;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 5px;
  }
 .phone{
  margin-top: 20px;
  font-family: $ff2;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 5px;
  font-size: 16px;
 }
}
</style>
