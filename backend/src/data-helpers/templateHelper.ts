export interface ITemplateFiltrationParams {
  section?: string
  productType?: string;
}


export class TemplateHelper {

  constructor() {
    //
  }

  getFilteredArrayOfVariants(variants: Array<any>, filtrationParams: ITemplateFiltrationParams): Array<Object> {
    if (!variants) {
      return null;
    }

    if (!Array.isArray(variants)) {
      return variants;
    }

    variants = this._filterBySection(variants, filtrationParams.section);
    variants = this._filterByProductType(variants, filtrationParams.productType);

    return variants;
  }

  private _filterBySection(variants: Array<Object>, section: string): Array<Object> {
    if (!section) {
      return variants;
    }

    return variants.filter((item: any) => {
      if (item.conditions && item.conditions.section) {
        return !item.conditions.section || !item.conditions.section.length ||
          item.conditions.section.filter((item: string) => item === section).length;
      }

      return !item['section'] || !item['section'].length || item['section']
          .filter((item: string) => item === section).length;
    });
  }

  private _filterByProductType(variants: Array<Object>, productType: string): Array<Object> {
    if (!productType) {
      return variants;
    }

    return variants.filter((item: any) => {
      if (item.conditions && item.conditions.productType) {
        return !item.conditions.productType || !item.conditions.productType.length ||
          item.conditions.productType.filter((item: string) => item === productType).length;
      }

      return !item['productType'] || !item['productType'].length || item['productType']
          .filter((item: string) => item === productType).length;
    });
  }

}
