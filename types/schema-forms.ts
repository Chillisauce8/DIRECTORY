export type FormLabelType = 'no-label' | 'float-label' | 'above-label' | 'left-label';
export type FloatLabelVariant = 'on' | 'in' | 'over';

// Default values as constants that can be imported
export const DEFAULT_FORM_LABEL_TYPE: FormLabelType = 'above-label';
export const DEFAULT_FLOAT_LABEL_VARIANT: FloatLabelVariant = 'on';

// Don't extend interfaces, instead combine the types we need
export type FormLabelProps = {
    formLabelType?: FormLabelType;
    floatLabelVariant?: FloatLabelVariant;
};
