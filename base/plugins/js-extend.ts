

export default defineNuxtPlugin(() => {
  String.prototype['hashCode'] = function() {
    let hash = 0, i, chr, len;

    if (this.length === 0) {
      return hash;
    }

    for (i = 0, len = this.length; i < len; i++) {
      chr = this.charCodeAt(i);

      /* tslint:disable */
      hash  = ((hash << 5) - hash) + chr;
      hash |= 0; // convert to 32bit integer
      /* tslint:enable */
    }

    return hash;
  };
});
