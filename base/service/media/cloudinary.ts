export interface CloudinaryMediaTransformationParams {
  width?: number;
  height?: number;
  dpr?: number | 'auto';
  offset?: number;
  crop?: string;
  quality?: string;
  format?: string;
}


export const CLOUDINARY_DOMAIN = 'media.chillisauce.com';


export const TRANSFORMATION_PARAMETER_NAME_TO_URL_STYLE_MAP = {
  width: 'w',
  height: 'h',
  dpr: 'dpr',
  offset: 'so',
  crop: 'c',
  quality: 'q',
  format: 'f',
}


export const URL_STYLE_TRANSFORMATION_PARAMETER_TO_NAME_MAP =
  Object.entries(TRANSFORMATION_PARAMETER_NAME_TO_URL_STYLE_MAP)
    .reduce((result, [key, value]) => {
      result[value] = key;
      return result;
  }, {});


export function isSrcToCloudinary(src: string): boolean {
  if (!src) {
    return false;
  }

  return src.indexOf(CLOUDINARY_DOMAIN) !== -1;
}


export function getTransformationPartFromCloudinaryURL(src: string): string {
  if (!isSrcToCloudinary(src)) {
    return null;
  }

  const urlParts = src.split('/');

  for (const urlPart of urlParts) {
    const isTransformationsUrlPart = Object.values(TRANSFORMATION_PARAMETER_NAME_TO_URL_STYLE_MAP)
      .some(t => urlPart.indexOf(`${t}_`) !== -1);

    if (isTransformationsUrlPart) {
      return urlPart;
    }
  }

  return null;
}


export function parseTransformationUrl(transformationsString: string): CloudinaryMediaTransformationParams {
  const partList = transformationsString.split(',');

  const result: any = {};

  for (const part of partList) {
    const [key, value] = part.split('_');

    const paramName = URL_STYLE_TRANSFORMATION_PARAMETER_TO_NAME_MAP[key];

    result[paramName] = isNaN(+value) ? value : parseInt(value, 10);
  }

  return result;
}


export function prepareTransformationsUrl(transformations: CloudinaryMediaTransformationParams): string {
  const resultParts = [];

  const defaultTransformations: CloudinaryMediaTransformationParams = {
    crop: 'fill',
    quality: 'auto',
    format: 'auto',
    dpr: 2.0
  };

  Object.keys(transformations).forEach(key => transformations[key] === undefined && delete transformations[key]);

  const preparedParams = {
    ...defaultTransformations,
    ...transformations,
  };

  for (const [key, value] of Object.entries(preparedParams)) {
    const urlParamName = TRANSFORMATION_PARAMETER_NAME_TO_URL_STYLE_MAP[key];

    const urlPart = `${urlParamName}_${value}`;

    resultParts.push(urlPart);
  }

  return resultParts.join(',');
}
