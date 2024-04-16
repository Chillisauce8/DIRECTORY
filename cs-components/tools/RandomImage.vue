<template>
  <SWPImage :src="image"></SWPImage>
</template>

<script>
export default {
  props: {
    type: String,
  },
  computed: {
    image: function () {
      let selectedArray = "";
      if (!this.type) {
        selectedArray = this.default;
      } else {
        selectedArray = this.type;
      }

      let theLength = this.images[selectedArray].length;

      let number = Math.floor(Math.random() * theLength);

      let selectedImage = this.images[selectedArray][number];

      let image = this.url + selectedImage;
      return image;
    },
  },
  data() {
    return {
      default: "activities",
      url: "https://media.chillisauce.com/image/upload/f_auto,q_auto/",
      images: {
        cars: [
          "6427155f86a2900f9066fef0",
          "64271547cbd6a80f8776b57b",
          "642715b7a5b5090f8b4eda02",
          "6427157386a2900f9066ff00",
          "6427157386a2900f9066ff00",
          "6427158aa5b5090f8b4ed9c5",
          "642715f086a2900f9066ff61",
          "642715a586a2900f9066ff2e",
          "6427161586a2900f9066ff83",
          "642715da86a2900f9066ff53",
          "6427162686a2900f9066ff88",
          "6427160386a2900f9066ff77",
          "64271649a5b5090f8b4eda48",
          "6427163686a2900f9066ff96",
          "642718bfcbd6a80f8776b91c",
          "64271886a5b5090f8b4edb9d",
          "642718cfcbd6a80f8776b925",
          "642718ddcbd6a80f8776b92d",
          "642718ec86a2900f9067028a",
          "642718fecbd6a80f8776b93a",
          "6427190fcbd6a80f8776b941",
        ],
        people: [
          "ce4bffc0f8f3c3bce817",
          "0f2312d431285c51a57b",
          "55e83645d72461c57480",
          "9a5bb993b91c976504a8",
          "1ff50f36923a327eac10",
          "7a6574ba8f3f6f22b4f4",
          "12486cdf528bb9770004",
          "5d9dec55070e0027d82cf55e",
          "532f7ae6fea15e529267",
          "f7d550c7e62eeb646c9e",
          "5c10e48831185d4cac6367b1",
          "7db5cc3df88e13ffefff",
          "2f8bec77ac24e023afd9",
          "5984d302b1a2208c24ba",
          "ec63e177a8179070503f",
          "5d975e51c7e6c127804b9f2e",
          "f2f1ba9559db023067ef",
          "7b88199b2e9b0924cc2a",
          "51e6a43ab0a59de603e5",
          "4db018e798890ad41a89",
          "01acdfbb2ae949936b5a",
        ],
        hotels: [
          "ad053cf632cd0e24e772",
          "9fe1d81b869543140eaa",
          "0887391ddb6af578fe7b",
          "30d080fb6b60d8d0a834",
          "2e8ae9daa43de923a174",
          "195d96b7cfa8d1ff809a",
          "d8501b8936f99a0c5977",
          "a94f00f2fc07e55c7425",
          "2b80ebdd53c333c0971b",
          "1b29605686b03ee6fb95",
          "990b9234c30fae35b930",
        ],
        locations: [
          "f1a2dfae6d9c38ab474b",
          "5b6c955eb3a7b7faa23a",
          "d472978c0b87e009e03f",
          "5c1121ed31185d4cac637a0a",
          "b6912614cd073206e809",
          "4144fd3e79481e66e4df",
          "b1557fccfd39c4dbb34d",
          "d18a369b56be517eca67",
          "e0783b5a4ffdd03ac87b",
          "4251fc935e0733ac425f",
          "55c5eda1d699067225ba",
          "ad6774e0295cf9d8d086",
          "d96244ba88eba2dc2426",
          "dd00ec500f2864a3a81a",
          "ae086b68d68a3c0b28e6",
          "89d33da67fdac7738291",
          "b2aa788150c2537dd3ad",
        ],
        activities: [
          "5d1231b62b1d430826217c0a",
          "da0393c5c7a389c210ea",
          "fafb238a024c2e04b988",
          "18e3216bc73139b5acc3",
          "8b5e627074b6af43cd7f",
          "eaab78fd885af66872fd",
          "5c52f515e24e907fabdbf308",
          "401d3cba8999e47076d0",
          "7bd7e79dc34dcf935d36",
          "a1b82fb4cd72c1fbe5a1",
          "7c7f60a3b8426cc94a31",
          "64e3af466d7abb572b0d",
          "c46e4f8d5c94e4da11bc",
          "cacf43badc8df1761007",
          "80ddd0a4f6de6d721b9f",
          "09343aafbea42a7dc6a3",
          "a42cb5a59c37fe348839",
          "dbf5cf53e7672a63ec0a",
          "70d312fc62a10b57cb97",
          "4f637fed2406ea327144",
          "86ee29412e9dd4240ae3",
          "5bf5662ef68c010513c4dde3",
          "510d363804059ab95107",
          "e4618f729c6192ef9e7f",
          "5ccae39e1d33610c9c34dea8",
          "5ccadf69376d7c093f54e7a4",
          "641f9e8d1ea82cdf6b17",
          "5d25f2fc65b7a629b60b2a2f",
          "098ee8bbca707913100e",
          "0c46c240e085442d719e",
          "ea5f6f4a507f7c6aca91",
          "994706e6bd958bb5a134",
          "98b0521f1a231f5a0ce1",
          "5c49e96f1008d535e59285d1",
          "f2ab62818a8474ff9986",
        ],
      },
      /*      image: "https://picsum.photos/600/600?random=" + Math.ceil(Math.random() * 100),
       */
    };
  },
};
</script>

<style lang="scss"></style>
