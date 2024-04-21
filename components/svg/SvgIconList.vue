<!-- SvgIcon.vue -->

<template>
  <div class="svg-icon-list">
    <h1 class="X-Center">ICONS</h1>
    <div class="Row list">
      <template v-for="icon in icons" :key="icon">
        <div class="icon-list-item">
          <LazySvgIcon :svg="icon" />
          <div class="name">{{ icon }}</div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  data: function () {
    return {
      icons: [
        "hamburger",
        "sun",
        "sun-pin",
        "chevron-right",
        "chevron-down",
        "chevron-left",
        "chevron-up",
        "phone",
        "hotel",
        "activity",
        "beer",
        "cocktail",
        "nightlife",
        "compass",
        "map",
        "map-pin",
        "eye",
        "eye-close",
        "cog",
        "filters",
        "list",
        "help",
        "info",
        "warning",
        "date",
        "bin",
        "edit",
        "check-circle",
        "check-circle-fill",
        "question-circle",
        "add-circle",
        "remove-circle",
        "copy",
        "close",
        "add",
        "reload",
        "component",
        "play",
        "clock",
        "bus",
        "nightclub",
        "beach",
        "plane",
        "meal",
        "heart",
        "email",
        "group",
        "person",
        "boy",
        "girl",
        "gun",
        "target",
        "drinks",
        "jeep",
        "squid",
        "star",
        "rocket",
        "octopus",
        "rugby",
        "windsurf",
        "pound-circle",
        "cherries",
        "bra",
        "surfing",
        "helmet",
        "flight",
        "climbing",
        "camping",
        "thumb-up",
        "song",
        "cupcake",
        "snowboard",
        "vip-circle",
        "ticket",
        "heels",
        "atv",
        "graduate",
        "torch",
        "flame",
        "viking",
        "wine",
        "irish",
        "lips",
        "strawberry",
        "pottery",
        "champagne",
        "alert",
        "submarine",
        "bell",
        "note",
        "lotus",
        "six-pack",
        "setting",
        "ten",
        "stag",
        "capital",
        "infinity",
        "tick",
        "double-tick",
        "castle",
        "piggy-bank",
        "moustache",
        "purse",
        "skyscraper",
        "book",
        "invite",
        "point",
        "linkedin",
        "facebook",
        "twitter",
        "pinterest",
        "instagram",
        "youtube",
        "dial",
        "dial2",
        "steering",
        "arrow-left",
        "whatsapp",
        "headphone-user",
        "calendar",
        "search",
        "cruise",
        "flight-baggage",
        "megaphone",
        "fast-food",
        "drawn-arrow-1",
        "drawn-arrow-2",
        "x-circle",
        "pickleball-player",
        "sunbathe",
        "medal",
        "medal-1",
        "medal-2",
        "red-flag",
        "gearstick",
      ],
    };
  },
};
</script>

<style lang="scss">
.svg-icon-list {
  margin: 0 auto;
  width: 90%;
  & > h1 {
    margin-bottom: 50px;
  }
  & .list {
    flex-wrap: wrap;
  }
  & .icon-list-item {
    text-align: center;
    padding: 20px;
  }
  & i.icon {
    width: 48px;
    height: 48px;
  }
  & .name {
    margin-top: 10px;
    font-size: 14px;
  }
}
</style>
