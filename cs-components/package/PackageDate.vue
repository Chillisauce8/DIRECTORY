<template>
  <div class="package-date">
    <div
      v-if="props.isFirstDay && props.display === 'full-package'"
      class="action-buttons"
    >
      <tool-helper
        class="add-date-message"
        title="Click to add your dates etc"
        :closeButton="false"
        point="down">
      </tool-helper>

      <LazyCSDatepicker
        v-model="vm.date"
        placeholder="Start date"
        display="button"
        :class="{ disabled: vm.isDateDisabled }"
        :enable-time-picker="false"
        :format="dateFormat"
        :prepared-value="preparedValue"
        :min-date="vm.minDate"
        :max-date="vm.maxDate"
        :disabled="vm.isDateDisabled"
        :required="vm.isDateRequired"
        @update:model-value="(value) => emits('update:startDate', value)"
        @update:datepicker-instance="
          (value) => emits('update:datepickerInstance', value.value)
        "
      >
      </LazyCSDatepicker>

      <ButtonSelect
        v-if="isFinite(vm.nights) && vm.nights !== null"
        :class="{ disabled: vm.isNightsSelectDisabled }"
        :value="vm.nights"
        :options="vm.nightsOptions"
        :label-getter="vm.nightsLabelGetter"
        :disabled="vm.isNightsSelectDisabled"
        @update:value="(value) => emits('update:nights', value)"
      >
      </ButtonSelect>

      <ButtonSelect
        v-if="vm.people"
        :class="{ disabled: vm.isPeopleSelectDisabled }"
        :value="vm.people"
        :options="vm.peopleOptions"
        :label-getter="vm.peopleLabelGetter"
        :disabled="vm.isPeopleSelectDisabled"
        @update:value="(value) => emits('update:people', value)"
      >
      </ButtonSelect>
    </div>

    <div v-else class="package-date-wrapper">
      <div class="date-date">{{ preparedValue }}</div>
      <!--     <LazySvgIcon svg="add-circle" class="add-day  None"></LazySvgIcon>
      <LazySvgIcon svg="remove-circle" class="remove-day  None"></LazySvgIcon> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDateHelper } from "~/service/helpers/date-helper.factory";
import type { CSDatepickerProps } from "~/components/forms/CSDatepicker.vue";

export interface SelectProps {
  options?: any[];
  labelGetter?: (v: any) => string;
  disabled?: boolean;
}

interface PackageDateProps {
  date: Date | undefined;
  dayIndex: number;
  isFirstDay?: boolean;
  datepickerProps?: CSDatepickerProps;
  people?: number;
  peopleSelectProps?: SelectProps;
  nights?: number;
  nightsSelectProps?: SelectProps;
  display?: string;
}

interface PackageDateEmits {
  (e: "update:startDate", value: Date): void;
  (e: "update:datepickerInstance", value: any);
  (e: "update:people", value: number): void;
  (e: "update:nights", value: number): void;
}

interface PackageDateVM {
  date: Date;
  minDate: Date;
  maxDate: Date;
  isDateDisabled: boolean;
  isDateRequired: boolean;
  people: number;
  peopleOptions: number[];
  peopleLabelGetter: (v: any) => string;
  isPeopleSelectDisabled: boolean;
  nights: number;
  nightsOptions: number[];
  nightsLabelGetter: (v: any) => string;
  isNightsSelectDisabled: boolean;
}

const props = defineProps<PackageDateProps>();
const emits = defineEmits<PackageDateEmits>();

const dateHelper = useDateHelper();

const vm = reactive<PackageDateVM>({
  date: props.date,
  minDate: props.datepickerProps?.minDate,
  maxDate: props.datepickerProps?.maxDate,
  isDateDisabled: props.datepickerProps?.disabled,
  isDateRequired: props.datepickerProps?.required,
  people: props.people,
  peopleOptions: props.peopleSelectProps?.options,
  peopleLabelGetter: props.peopleSelectProps?.labelGetter,
  isPeopleSelectDisabled: props.peopleSelectProps?.disabled,
  nights: props.nights,
  nightsOptions: props.nightsSelectProps?.options,
  nightsLabelGetter: props.nightsSelectProps?.labelGetter,
  isNightsSelectDisabled: props.nightsSelectProps?.disabled,
});

const preparedValue = computed(() =>
  props?.date ? dateFormat(props.date) : `Day ${props.dayIndex + 1}`
);

function dateFormat(date: Date): string {
  return dateHelper.viewDateFormat(date);
}

function initVM() {
  vm.date = props.date;
  vm.minDate = props.datepickerProps?.minDate;
  vm.maxDate = props.datepickerProps?.maxDate;
  vm.isDateDisabled = props.datepickerProps?.disabled;
  vm.isDateRequired = props.datepickerProps?.required;
  vm.people = props.people;
  vm.peopleOptions = props.peopleSelectProps?.options;
  vm.peopleLabelGetter = props.peopleSelectProps?.labelGetter;
  vm.isPeopleSelectDisabled = props.peopleSelectProps?.disabled;
  vm.nights = props.nights;
  vm.nightsOptions = props.nightsSelectProps?.options;
  vm.nightsLabelGetter = props.nightsSelectProps?.labelGetter;
  vm.isNightsSelectDisabled = props.nightsSelectProps?.disabled;
}

watch(
  () => props.date,
  () => initVM()
);
watch(
  () => props.datepickerProps,
  () => initVM()
);
watch(
  () => props.people,
  () => initVM()
);
watch(
  () => props.peopleSelectProps,
  () => initVM()
);
watch(
  () => props.nights,
  () => initVM()
);
watch(
  () => props.nightsSelectProps,
  () => initVM()
);
</script>

<style lang="scss">
body.event-date-true {
  .package-date {
    .tool-helper {
      display: none;
    }
  }
}
@include mobile{
body.event-date-false {
  .package-date {
    margin-top:50px;
  }
}
}
body.area-supplier .tool-helper{
  display: none;
}
.package-date {
  font-family: $ff2;
  text-transform: uppercase;
  font-weight: 500;
  //letter-spacing: px;
  font-size: 18px;
  // margin: 1em 0 0.4em 0;
  @include mobile {
    font-size: 12px;

    // letter-spacing: 2px;
  }

  .action-buttons {
    display: flex;
    justify-content: space-between;
    position: relative;

    .button-content-wrapper.disabled {
      button {
        padding: calc(0.5em + 2px) 0;
        cursor: auto;
      }
    }

    .tool-helper {
      position: absolute;
      z-index: 1;
      @include mobile {
        color: $C2;
        top: -85px;
        //  left: 300px;
        width: 100%;
        .icon {
          &.down {
            position: absolute;
            bottom: -35px;
            left: 90px;
            transform: rotate(50deg);
          }
        }
      }
      @include desktop {
        color: $C2;
        top: -75px;
        left: -300px;
        width: 250px;
        .icon {
          &.down {
            position: absolute;
            bottom: -10px;
            right: -40px;
            transform: rotate(-70deg);
          }
        }
      }
    }
  }
  .package-date-wrapper {
    display: flex;
  }
}
</style>
