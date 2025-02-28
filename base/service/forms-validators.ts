// @ts-ignore
import { helpers } from '@vuelidate/validators';
// @ts-ignore
import type { BaseValidation, ErrorObject, Validation, ValidatorResponse } from '@vuelidate/core';


export function patternValidator(regExp: RegExp, errorMessage: string = '') {
  return helpers.withMessage(errorMessage, helpers.regex(regExp));
}


type CustomValidationErrorMessageGetterFn = (e: ErrorObject) => string;


interface VuelidateForEachResponseErrors {
  [fieldName: string]: ErrorObject[];
}


interface VuelidateForEachResponse extends ValidatorResponse {
  $errors: VuelidateForEachResponseErrors[];
}


interface VuelidateErrorObject<Response extends unknown = any> extends ErrorObject {
  $response: Response;
}

export interface CSCustomValidationErrorMap {
  [errorName: string]: string | CustomValidationErrorMessageGetterFn;
}


interface CollectionValidationErrorGetterParams {
  itemIndex: number;
  itemFieldName: string;
}

export interface ExternalResultMessageData {
  name: string;
  message: string;
}


export interface VuelidateCollectionValidation extends Validation {
  $each?: VuelidateErrorObject<VuelidateForEachResponse>;
}


const customValidationErrorMap = {
  required: 'Required',
  pattern: 'This field does not look correct',
  minLength: (e: ErrorObject) => `This field is too short (min length ${(e.$params as any).min})`,
  maxLength: (e: ErrorObject) => `This field is too long (max length ${(e.$params as any).max})`,
  minValue: 'This field is too small',
  maxValue: 'This field is too big',
  email: 'This field needs to be a valid email',
  url: 'This field needs to be a valid URL',
};


export function getTopValidationError(validation: BaseValidation | Validation): ErrorObject {
  return validation?.$errors?.[0] ?? validation?.$externalResults?.[0] ?? null;
}


export function getTopCollectionItemValidationError(validation: VuelidateCollectionValidation,
                                                    params: CollectionValidationErrorGetterParams): ErrorObject {
  const {itemIndex, itemFieldName} = params;

  const rawVuelidateCollectionField = toRaw(validation);

  return unref(rawVuelidateCollectionField?.$each?.$response)?.$errors?.[itemIndex]?.[itemFieldName]?.[0] ?? null;
}


export function getMessageFromErrorObject(validation: BaseValidation | Validation,
                                          currentError: ErrorObject,
                                          errorMessageMap: CSCustomValidationErrorMap = customValidationErrorMap): string|null {
  const defaultErrorMessage = 'Field is not valid';

  // validation.$error field should be equal to expression below
  // but it was incorrect during debug
  // manually calculated value here
  // docs https://vuelidate-next.netlify.app/api/state.html#error
  const isFieldInvalid = validation.$dirty && !validation.$pending && validation.$invalid;

  if (!isFieldInvalid && !currentError) {
    return null;
  } else if (isFieldInvalid && !currentError) {
    return defaultErrorMessage;
  }

  if (currentError.$validator === '$externalResults') {
    const messageData: ExternalResultMessageData = currentError?.$message as any;

    const {message, name} = messageData;
    // @ts-ignore
    return errorMessageMap?.[name] ?? message;
  }

  const validatorName = (currentError?.$params as any)?.type ?? currentError.$validator;

  if (errorMessageMap?.[validatorName]) {
    return typeof errorMessageMap?.[validatorName] === 'string' ?
      errorMessageMap?.[validatorName] :
      // @ts-ignore
      errorMessageMap?.[validatorName](currentError);
  }

  if (currentError?.$message) {
    return currentError?.$message as string;
  }

  if (currentError?.$response?.$message) {
    return currentError?.$response?.$message;
  }

  return defaultErrorMessage;
}


export function getCollectionItemFieldErrorMessage(validation: VuelidateCollectionValidation,
                                                   params: CollectionValidationErrorGetterParams,
                                                   errorMessageMap?: CSCustomValidationErrorMap): string|null {
  const error = getTopCollectionItemValidationError(validation, params);

  return getMessageFromErrorObject(validation, error, errorMessageMap);
}


export function getValidationErrorMessage(validation: BaseValidation | Validation,
                                          errorMessageMap?: CSCustomValidationErrorMap): string|null {
  const currentError = getTopValidationError(validation);

  return getMessageFromErrorObject(validation, currentError, errorMessageMap);
}
