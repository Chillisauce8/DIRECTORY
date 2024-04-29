<template>
  <transition name="swap">
    <div class="product-card-details" :class="[props.open ? 'open' : 'closed']">
      <div v-show="!props.open" class="product-info">

        <div v-if="optionsString">
          <LazySvgIcon svg="star" class="inline" /> {{ optionsString }}
        </div>

        <div v-if="addOnsString">
          <LazySvgIcon svg="add" class="inline"/> {{ addOnsString }}
        </div>
      </div>

      <div v-show="open" class="close-block Center">
        Tap Here to Close
        <LazySvgIcon svg="point" />
      </div>
    </div>
  </transition>
</template>

<script lang="ts" setup>
import { usePackageTimesHelperService } from '~/service/helpers/package-builder/package-times-helper.service.factory';
import { useProductTimesHelperService } from '~/service/helpers/product/product-times-helper-service.factory';
import { useUnitsCountHelper } from '~/service/helpers/package-builder/units-count-helper.servise.factory';
import { useEventPermissionsService } from '~/service/helpers/event/event-permissions.service.factory';
import { useDataTemplateFabricService } from '~/service/helpers/data-templates/data-template-fabric.factory';
import { useGlobalElementsTemplateService } from '~/service/helpers/data-templates/global-elements-template.factory';
import { useDateHelper } from '~/service/helpers/date-helper.factory';
import { useEventSummaryService } from '~/service/helpers/event/event-summary.service.factory';
import { useVenueService } from '~/service/helpers/product/venue.service.factory';
import {PackageProduct} from '~/service/models/packageProduct';
import {useDataTemplatesStore} from '~/store/dataTemplates';
import { useProductPageHelperService } from '~/service/helpers/product/product-page-helper.service.factory';


interface ProductCardBasketDetailsProps {
  packageProductDescription: PackageProduct;
  dayIndex: number;
  location: any;
  dayDate?: Date;
  open?: boolean;
}


const props = defineProps<ProductCardBasketDetailsProps>();

const packageTimesHelper = usePackageTimesHelperService();
const productTimesHelper = useProductTimesHelperService();
const unitsCountHelper = useUnitsCountHelper();
const eventPermissionsService = useEventPermissionsService();
const dataTemplateFabric = useDataTemplateFabricService();
const globalElementsTemplateService = useGlobalElementsTemplateService();
const dateHelper = useDateHelper();
const venueService = useVenueService();
// const productPageHelper = useProductPageHelperService();


const vm = reactive({
  packageProductDetails: null,
  venueToBeConfirmed: null,
  packageProductDescription: null,
  dayDate: null,
  dayIndex: null,
  location: props.location,
  productVenueName: null,
});

watch(() => props?.packageProductDescription, v => {
  vm.packageProductDescription = v;
});


const dataTemplate = dataTemplateFabric.get({
  name: "event",
  notUpdateDefaultHeaderTemplate: true,
});


const addOnsString = computed(() => {
  if (!vm.packageProductDescription.packageProduct.product) {
    return '';
  }

  const names = vm.packageProductDescription.packageProduct.product.getAddons()
      .filter((item: any) => item.selected)
      .map((item: any) => item.product.getName());

  return names.join(', ');
});

const optionsString = computed(() => {
  if (!vm.packageProductDescription.packageProduct.product) {
    return null;
  }

  const names = vm.packageProductDescription.packageProduct.product.getOptions()
      .filter((item: any) => item.selected)
      .map((item: any) => item.product.getName());

  return names.join(', ');
});


function _getWarningMessage(name: string, context?: any) {
  return globalElementsTemplateService.getMessageFromDictionaryVariables(name, context);
}


onBeforeMount(async () => {
  vm.packageProductDescription = props.packageProductDescription;

  vm.venueToBeConfirmed = dataTemplate.getValue("event.venueToBeConfirmed");

});
</script>

<style lang="scss">
.content-switch {
  height: 100%;
  & .close-block {
    height: 80%;
    font-family: $ff2;
    font-size: 12px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 3px;
    & .icon {
      animation: up-down 2s linear 1s 1;
      width: 32px;
      height: 32px;
      color: $C2;
    }
  }
}
</style>
