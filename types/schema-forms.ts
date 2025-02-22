/**
 * Type for form label display styles
 */
export type FormLabelType = 'no-label' | 'float-label' | 'above-label' | 'left-label';

/**
 * Type for float label positioning variants
 */
export type FloatLabelVariant = 'on' | 'in' | 'over';

/**
 * Default form label type constant
 */
export const DEFAULT_FORM_LABEL_TYPE: FormLabelType = 'above-label';

/**
 * Default float label variant constant
 */
export const DEFAULT_FLOAT_LABEL_VARIANT: FloatLabelVariant = 'on';

/**
 * Props interface for form label configuration
 */
export type FormLabelProps = {
    formLabelType?: FormLabelType;
    floatLabelVariant?: FloatLabelVariant;
};
