import {cloneDeep, isEqual, isObject, isArray, isNull} from 'lodash';


interface ElementJSONAttributes {
  '@id': string;
  '@class': string;
  '@href': string;
  '@src': string;
  '@alt': string;
  '@title': string;
  '@name': string;
  '@property': string;
  '@content': string;
}


interface ElementJSON extends Partial<ElementJSONAttributes> {
  text?: string;
  [nestedElementJSON: string]: any;
}


interface ElementJSONWithTagName extends ElementJSON {
  tagName: string;
}


function getDuplicatingPathList(obj1: ElementJSON, obj2: ElementJSON, basePath = '') {
  let paths: string[] = [];

  const keyList = Object.keys(obj1);

  const filteredKeyList = keyList.filter(k => !k.startsWith('@'))
    .filter(k => k !== 'text');

  for (const key of filteredKeyList) {
    if (!obj1.hasOwnProperty(key) || !obj2.hasOwnProperty(key)) {
      continue;
    }

    const newPath = basePath ? `${basePath}.${key}` : key;

    if (isEqual(obj1[key], obj2[key])) {
      paths.push(newPath);

      continue;
    }

    if (isObject(obj1[key]) && isObject(obj2[key])) {
      paths = [...paths, ...(getDuplicatingPathList(obj1[key], obj2[key], newPath))];
    }
  }

  return paths;
}


function getElementJSONListByPath(obj: ElementJSON, path: string): ElementJSONWithTagName[] {
  const pathPartList = path.split('.');

  const elementList = [];

  let currentElement = obj;

  for (const pathPart of pathPartList) {
    currentElement = currentElement[pathPart];

    const tagName = /\d/.test(pathPart) ? pathPartList[pathPartList.indexOf(pathPart) - 1] : pathPart;

    elementList.push({...currentElement, tagName});
  }

  return elementList;
}


function checkElementJSONIsCommonTag(elementJSON: ElementJSONWithTagName): boolean {
  const htmlTagList = ['meta', 'nav', 'header', 'footer'];

  const {tagName} = elementJSON;

  return htmlTagList.includes(tagName);
}


function checkElementClassListContainsCommonClass(elementJSON: ElementJSONWithTagName): boolean {
  const cssClassNameList = [
    'nav',
    'navbar',
    'navigation',
    'menu',
    'nav-item',
    'breadcrumbs',
    'breadcrumb',
    'breadcrumb-nav',
    'breadcrumb-item',
    'header',
    'site-header',
    'header-container',
    'header-wrap',
    'footer',
    'site-footer',
    'footer-content',
    'footer-wrap'
  ];

  const classList = elementJSON['@class'];

  if (!classList) {
    return false;
  }

  return cssClassNameList.some(c => classList.includes(c));
}


function checkElementIdContainsCommonId(elementJSON: ElementJSONWithTagName): boolean {
  const elementIdList = [
    'nav',
    'navbar',
    'main-nav',
    'menu',
    'breadcrumbs',
    'breadcrumb-nav',
    'breadcrumb',
    'header',
    'site-header',
    'main-header',
    'footer',
    'site-footer',
    'main-footer'
  ];

  const elementId = elementJSON['@id'];

  if (!elementId) {
    return false;
  }

  return elementIdList.some(i => elementId.includes(i));
}


function checkDuplicatingFieldNeedRemove(elementJSON: ElementJSONWithTagName): boolean {
  if (checkElementJSONIsCommonTag(elementJSON)) {
    return true;
  }

  if (checkElementClassListContainsCommonClass(elementJSON)) {
    return true;
  }

  if (checkElementIdContainsCommonId(elementJSON)) {
    return true;
  }

  return false;
}


function getValueByPath(obj: Record<string, any>, path: string): any {
  const pathPartList = path.split('.');

  let currentValue = obj;

  for (const pathPart of pathPartList) {
    currentValue = currentValue[pathPart];

    if (!currentValue) {
      return null;
    }
  }

  return currentValue;
}


function replaceValueWithNullByPath(obj: Record<string, any>, path: string): void {
  const pathPartList = path.split('.');

  const targetValueKeyInParent = pathPartList.pop();
  const pathToParent = pathPartList.join('.');

  const parentValue = getValueByPath(obj, pathToParent);

  if (!pathPartList) {
    return;
  }

  if (!targetValueKeyInParent) {
    return;
  }

  parentValue[targetValueKeyInParent] = null;
}


function deleteNullProperties(obj: any, recurse: boolean = true) {
  if (isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      if (isNull(obj[i])) {
        obj.splice(i, 1);
        i--;
      }
    }
  }

  for (let i in obj) {
    if (isNull(obj[i])) {
      delete obj[i];
    } else if (recurse && isObject(obj[i])) {
      deleteNullProperties(obj[i], recurse);
    }
  }
}


export function removeObjectFieldsByPathList(obj: Record<string, any>, pathList: string[]): Record<string, any> {
  const objClone = cloneDeep(obj);

  pathList.forEach(path => replaceValueWithNullByPath(objClone, path));

  deleteNullProperties(objClone);

  return objClone;
}


export function getUselessPageJSONPathList(pageJSON1: ElementJSON, pageJSON2: ElementJSON): string[] {
  const duplicatingPathList = getDuplicatingPathList(pageJSON1, pageJSON2);

  const duplicatingPathList1 = duplicatingPathList.filter(path => {
    const elementJSONList = getElementJSONListByPath(pageJSON1, path);

    return elementJSONList
      .some(elem => checkDuplicatingFieldNeedRemove(elem));
  });

  const duplicatingPathList2 = duplicatingPathList.filter(path => {
    const elementJSONList = getElementJSONListByPath(pageJSON2, path);

    return elementJSONList
      .some(elem => checkDuplicatingFieldNeedRemove(elem));
  });

  const uselessPageJSONPathList = duplicatingPathList1;

  duplicatingPathList2.forEach(path => {
    if (uselessPageJSONPathList.includes(path)) {
      return;
    }

    uselessPageJSONPathList.push(path);
  });

  return uselessPageJSONPathList;
}