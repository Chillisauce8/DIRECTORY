<template>
  <card-wrapper class="manager-card card">
      <ImageWrapper class="manager-image" :cloudinaryId="dataState.managerImageId" :width="290" loading="eager" />
      <card-text-wrapper>
      <div class="role">Your Account Manager</div>
      <h1 class="name">{{dataState.manager.name}}</h1>
      <div class="phone">
        <a :href="'tel:' + dataState.managerPhone" class="hover-text-color_blue">
          Call Me: {{ dataState.managerPhone }}
        </a>
      </div>
      <div class="email">{{dataState.manager.email}}</div>
    </card-text-wrapper>
  </card-wrapper>
</template>

<script>
import {useCurrentEvent} from "~/service/helpers/event/current-event.service.factory";
import {useStaffService} from "~/service/helpers/staff-common/staff.factory";

export default {
  props: ['event'],
  setup() {
    return {
      currentEvent: useCurrentEvent(),
      staffService: useStaffService(),
    }
  },
  data() {
    return {
      dataState: {
        manager: this.event.getManager(),
        managerPhone: undefined,
        managerImageId: undefined,
      }
    }
  },
  methods: {
    async getManagerPhone() {
      return this.dataState.manager?.phone ?? this.staffService.getPhone(this.dataState.manager.id);
    }
  },
  watch: {
    event: async function (newVal, oldVal) {
      this.dataState.manager = this.event.getManager();
      this.dataState.managerImageId = await this.staffService.getImage(this.dataState.manager.id);
      this.dataState.managerPhone = await this.getManagerPhone();
    }
  },
  async beforeMount() {
    this.dataState.managerImageId = await this.staffService.getImage(this.dataState.manager.id);
    this.dataState.managerPhone = await this.getManagerPhone();
  }
}
</script>

<style lang="scss">
.manager-card {
  width: 300px;
  & figure {
    @include aspect-ratio(1, 1);
  }
  & header {
    @include aspect-ratio(2, 1);
  }
  & .name {
    font-size: 18px;
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
