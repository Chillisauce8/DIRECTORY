<template>
  <section class="event-small-card">
    <div class="name">{{name}}</div>
    <div class="date">{{date}}</div>
    <div class="location">{{location}}</div>
    <div class="status">{{status}}</div>
    <div class="organiser-key">Organiser :</div>
    <div class="organiser">{{organiser}}</div>
    <div class="manager-key">Chillisauce Manager :</div>
    <div class="manager">{{ manager }}</div>
    <div class="mab-key user-staff-show">MAB :</div>
    <div class="mab user-staff-show">{{ managerAtBooking }}</div>
  </section>
</template>

<script>
export default {
  props: {
    name: {
      type: String,
      default: () => "",
    },
    date: {
      type: String,
      default: () => "",
    },
    location: {
      type: String,
      default: () => "",
    },
    status: {
      type: String,
      default: () => "",
    },
    organiser: {
      type: String,
      default: () => "",
    },
    manager: {
      type: String,
      default: () => "",
    },
    managerAtBooking: {
      type: String,
      default: () => "",
    },
  },
};
</script>

<style lang="scss">
.event-small-card {
  cursor: pointer;  
  margin-top: 10px;  
  font-family: $ff1;
  border-left: 4px solid $CB-2;
  white-space: nowrap;
  overflow-x: hidden;
  text-overflow: ellipsis;
  padding: 3px 5px;
  width: 100%;
  background-color: $CB-05;
  line-height: 1.3;
  @include mobile {
    font-size: 12px;
  }
  @include desktop {
    font-size: 14px;
  }
  transition: all 0.5s ease-in-out;
  &.selected, &:hover{
    background-color: $CB-1;
    border-left: 4px solid $C1;

  }

  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  grid-template-rows: 1fr 1fr 1fr 1fr;
  //grid-row-gap: 0px;
  grid-column-gap: 5px;
  grid-template-areas:
    "name date"
    "location status"
    "organiser-key organiser"
    "manager-key manager";

    & > div{
        white-space: nowrap;
  overflow-x: hidden;
  text-overflow: ellipsis;
    }

  & .name {
    grid-area: name;
  }
  & .date {
    grid-area: date;
  }
  & .locations {
    grid-area: location;
  }
  & .status {
    grid-area: status;
  }
  & .organiser-key {
    grid-area: organiser-key;
  }
  & .organiser {
    grid-area: organiser;
  }
  & .manager-key {
    grid-area: manager-key;
  }
  & .manager{
    grid-area: manager;
  }

  & > div:nth-child(-n + 2) {
    @include desktop {
      font-size: 14px;
    }

    font-weight: bold;
  }
}
</style>
