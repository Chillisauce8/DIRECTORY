<template>
  <HeroHeaderWrapper class="location-header">
    <image-wrapper
      :cloudinaryId="locationImage"
      loading="eager"
      dpr="1"
      :grayscale="true"
      :width="1000"

      :tint="true"
      class="random-tint"
    >
      <h1 class="X-Center">
        <div class="location">{{ location?.name }}</div>
        <div class="activity">{{ eventName[section] }}</div>
        <meta itemprop="name" :content="location?.name + ' ' + eventName[section]" />
      </h1>
      <div itemprop="offers" itemtype="https://schema.org/AggregateOffer" itemscope>
        <meta itemprop="lowPrice" content="29" />
        <meta itemprop="highPrice" content="279" />
        <meta itemprop="priceCurrency" content="GBP" />
      </div>
      <div class="ratings X-Center">
        <template v-if="reviewsScore">
          <StarRating :stars="reviewsScore" />
          <!--     <div class="reviews">{{reviewsDescription}}</div> -->
          <div
            class="reviews"
          >
            <span >{{ roundedReviewsScore }}</span
              ><span> from </span
              ><span >{{ reviewsTotal }}</span
              ><span> Reviews </span>
          </div>
        </template>
        <div class="dates">
          <LazyCSDatepicker
              v-model="startDate"
              placeholder="Start date"
              display="button"
              :class="{ disabled: isStartDateDisabled }"
              :enable-time-picker="false"
              :format="dateFormat"
              :prepared-value="startDateViewValue"
              :min-date="startDateSettings.minDate"
              :max-date="startDateSettings.maxDate"
              :disabled="isStartDateDisabled"
              :required="isStartDateRequired"
              @update:model-value="onStartDateUpdated"
          />

          <ButtonSelect
              :value="nightsCount"
              :class="{ disabled: isNightsSelectDisabled }"
              :options="nightsOptions"
              :label-getter="nightsLabelGetter"
              :disabled="isNightsSelectDisabled"
              @update:value="onNightsCountUpdated"
          />

          <ButtonSelect
              :value="peopleCount"
              :class="{ disabled: isPeopleSelectDisabled }"
              :options="peopleOptions"
              :label-getter="peopleLabelGetter"
              :disabled="isPeopleSelectDisabled"
              @update:value="onPeopleCountUpdated"
          />
        </div>
        <ButtonMain @click.native="showEnquiryForm()" id="location-enquiry-button" class="ANIMATE area-my-events-hidden">
          Get <span class="button-location-header">{{ location?.name }}<br/></span>{{ eventName[section] }}
        </ButtonMain>
      </div>
    </image-wrapper>
  </HeroHeaderWrapper>
</template>

<script>
import { useSelectMediaHelper } from "~/service/helpers/select-media-helper.factory";
import { useEnquiryFormDialogShowService } from "~/service/dialog/enquiry-form-dialog-show.service";
import { usePackageCommonSettingsStore } from "~/store/packageCommonSettings";
import { useDateHelper } from "~/service/helpers/date-helper.factory";
import { useSettingsTemplateService } from "~/service/helpers/data-templates/settings-template.factory";
import { useEventPackageBuilder } from "~/service/helpers/package-builder/package-builder.service.factory";

export default {
  props: ["section", "location"],
  setup() {
    return {
      selectMediaHelper: useSelectMediaHelper(),
      enquiryFormDialogShowService: useEnquiryFormDialogShowService(),
      packageCommonSettingsStore: usePackageCommonSettingsStore(),
      dateHelper: useDateHelper(),
      settingsTemplateService: useSettingsTemplateService(),
      packageBuilder: useEventPackageBuilder(),
    };
  },
  data() {
    return {
      eventName: {
        stag: "Stag Do Ideas",
        hen: "Hen Do Ideas",
        groups: "Group Event Ideas",
        events: "Corporate Event Ideas",
      },
      packageCommonSettingsStoreSubscription: undefined,
      startDate: undefined,
      prevStartDate: undefined,
      isStartDateRequired: false,
      isStartDateDisabled: false,
      nightsCount: undefined,
      nightsOptions: [],
      nightsLabelGetter: (v) => v === 1 ? `${v} Night` : `${v} Nights`,
      isNightsSelectDisabled: false,
      peopleCount: undefined,
      peopleOptions: [],
      peopleLabelGetter: (v) => `${v} People`,
      isPeopleSelectDisabled: false,
    };
  },
  mounted() {
    this.subscribeOnPackageSettingsChanges();
    this.initPackageSettingsControls();
  },
  unmounted() {
    if (this.packageCommonSettingsStoreSubscription) {
      this.packageCommonSettingsStoreSubscription();
    }
  },
  methods: {
    subscribeOnPackageSettingsChanges() {
      this.packageCommonSettingsStoreSubscription = this.packageCommonSettingsStore.$onAction(({after}) => {
        after(() => {
          this.initPackageSettingsControls();
        });
      });
    },

    initPackageSettingsControls() {
      this.startDate = this.packageSettings?.startDate;
      this.prevStartDate = this.startDate;

      this.nightsCount = this.packageSettings?.nightsCount;
      this.nightsOptions = this.nightsSettings.possibleCounts;

      this.peopleCount = this.packageSettings?.peopleCount;
      this.peopleOptions = this.peopleSettings.possibleCounts;
    },

    getProperReviewsItem() {
      if (!this.location?.filteredReviews?.length) {
        return null;
      }

      return this.location.filteredReviews.find(
        (ratingItem) => ratingItem.section === this.section
      );
    },

    showEnquiryForm() {
      this.enquiryFormDialogShowService.show();
    },

    dateFormat(date) {
      return this.dateHelper.viewDateFormat(date);
    },

    setPackageSettingsForCurrentSection() {
      this.packageCommonSettingsStore.setForSection({
        section: this.section,
        data: {
          startDate: this.startDate,
          nightsCount: this.nightsCount,
          peopleCount: this.peopleCount,
          setManually: true
        },
      });
    },

    onStartDateUpdated() {
      if ((!this.startDate && !this.prevStartDate) || (this.startDate?.getTime() === this.prevStartDate?.getTime())) {
        return;
      }

      this.prevStartDate = this.startDate;
      this.setPackageSettingsForCurrentSection();

      if (this.packageBuilder.has()) {
        setTimeout(() => this.packageBuilder.setStartDate(this.startDate));
      }
    },

    onNightsCountUpdated(value) {
      if (this.nightsCount === value) {
        return;
      }

      this.nightsCount = value;
      this.setPackageSettingsForCurrentSection();

      if (this.packageBuilder.has()) {
        setTimeout(() => this.packageBuilder.setNightsCount(value));
      }
    },

    onPeopleCountUpdated(value) {
      if (this.peopleCount === value) {
        return;
      }

      this.peopleCount = value;
      this.setPackageSettingsForCurrentSection();

      if (this.packageBuilder.has()) {
        setTimeout(() => this.packageBuilder.setPeopleCount(this.peopleCount));
      }
    },
  },
  computed: {
    locationImage() {
      const imageItem = this.selectMediaHelper.getOneImageBySection(
        this.location?.imageList,
        this.section,
      );

      return imageItem?.image?.id;
    },

    reviewsScore() {
      const reviewsItem = this.getProperReviewsItem();

      if (!reviewsItem) {
        return 0;
      }

      return reviewsItem.score;
    },

    reviewsDescription() {
      const reviewsItem = this.getProperReviewsItem();

      if (!reviewsItem) {
        return "";
      }

      return `${parseFloat(reviewsItem.score).toFixed(2)} from ${
        reviewsItem.count
      } Reviews`;
    },

    roundedReviewsScore() {
      const reviewsItem = this.getProperReviewsItem();
      if (!reviewsItem) {
        return "";
      }
      return parseFloat(reviewsItem.score).toFixed(2);
    },

    reviewsTotal() {
      const reviewsItem = this.getProperReviewsItem();
      if (!reviewsItem) {
        return "";
      }
      return reviewsItem.count;
    },

    packageSettings() {
      return this.packageCommonSettingsStore.forSection(this.section);
    },

    startDateViewValue() {
      return this.startDate ? this.dateFormat(this.startDate) : "Start Date";
    },

    startDateSettings() {
      return this.settingsTemplateService.getSettingsStartDate(this.section);
    },

    nightsSettings() {
      return this.settingsTemplateService.getSettingsNights(this.section);
    },

    peopleSettings() {
      return this.settingsTemplateService.getSettingsPeople(this.section);
    },
  },
};
</script>

<style lang="scss">
.location-header {
  & .button-location-header{
    display: none;
  }
  & .activity {
    font-size: 0.7em;
  }
  & .ratings {
    & .stars {
      color: $CB-05;
      font-size: 1em;
      text-shadow: 1px 1px #000000;
    }
    & .reviews {
      color: $CB-05;
      // font-weight: bold;
      font-size: 0.6em;
      text-shadow: 1px 1px #000000;
    }
  }
  .dates{
    display: flex;
    > div{
      margin: 5px;
    }
    font-size: 80%;
  }
}
</style>
