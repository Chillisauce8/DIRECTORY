

export function isObject(obj: any): boolean {
  return typeof obj === 'object' && obj !== null && ! Array.isArray(obj);
}


export function isString(value: any): boolean {
  return typeof value === 'string' || value instanceof String;
}


export function isNumber(value: any): boolean {
  return typeof value === 'number' && isFinite(value);
}


export function isUndefined(value: any): boolean {
  return value === undefined;
}


export function isDate(value: any): boolean {
  return Object.prototype.toString.call(value) === '[object Date]'
}

export function pullFromArray(arr: any[], values: any[]) {
  return arr.filter(function (item) {
    return values.indexOf(item) < 0;
  });
}


export function union(a: any[], b: any[]): any[] {
  return [...new Set([...a, ...b])];
}


export function intersection(a: any[], b: any[]): any[] {
  return a.filter(function(n) {
    return b.indexOf(n) !== -1;
  });
}


export function groupBy(list: any[], keyGetter: Function) {
  const map = new Map();

  list.forEach((item) => {
    const key = keyGetter(item);
    const collection = map.get(key);
    if (!collection) {
      map.set(key, [item]);
    } else {
      collection.push(item);
    }
  });

  return Object.fromEntries(map);
}


export function isEqual(x: any, y: any): boolean {
  const ok = Object.keys, tx = typeof x, ty = typeof y;
  return x && y && tx === 'object' && tx === ty ? (
    ok(x).length === ok(y).length &&
    ok(x).every(key => isEqual(x[key], y[key]))
  ) : (x === y);
}


function isFunction(variableToCheck: any) {
  return variableToCheck instanceof Function;
}

export function cloneDeep(entity: any, cache = new WeakMap): any {
  const referenceTypes = ['Array', 'Object', 'Map', 'Set', 'Date'];
  const entityType = Object.prototype.toString.call(entity);
  if (
    !new RegExp(referenceTypes.join('|')).test(entityType) ||
    entity instanceof WeakMap ||
    entity instanceof WeakSet
  ) return entity;
  if (cache.has(entity)) {
    return cache.get(entity);
  }
  const c = new entity.constructor;

  if (entity instanceof Map) {
    entity.forEach((value, key) => c.set(cloneDeep(key), cloneDeep(value)));
  }
  if (entity instanceof Set) {
    entity.forEach((value) => c.add(cloneDeep(value)));
  }
  if (entity instanceof Date) {
    return new Date(entity);
  }
  cache.set(entity, c);
  return Object.assign(c, ...Object.keys(entity).map((prop) => ({ [prop]: cloneDeep(entity[prop], cache) })));
}


export function differenceBy(array1: any[], array2: any[], key: string) {
  return array1.filter(a => !array2.some(b => b[key] === a[key]))
}


export function difference(array1: any[], array2: any[]) {
  return array1.filter(a => !array2.some(b => b === a));
}


export function differenceWith(array1: any[], array2: any[], comparator: (a1: any, a2: any) => boolean) {
  if (!array2) {
    return [...array1];
  }

  return array1.filter(a1 => !array2.some(a2 => comparator(a1, a2)));
}


export function uniq(array: any[]): any[] {
  return [...new Set(array)];
}


export function uniqBy(array: any[], key: string): any[] {
  const keysArray = array.map(item => item[key]);
  return array.filter((value, index, array) => keysArray.indexOf(value[key]) === index);
}


export function uniqWith(array: any[], keyGetter: (item: any) => boolean): any[] {
  const keysArray = array.map(item => keyGetter(item));
  return array.filter((value, index, array) => keysArray.indexOf(keyGetter(value)) === index);
}


export function debounce(func: Function, wait: number, immediate?: boolean) {
  // 'private' variable for instance
  // The returned function will be able to reference this due to closure.
  // Each call to the returned function will share this common timer.
  let timeout: NodeJS.Timeout | null;

  // Calling debounce returns a new anonymous function
  return function() {
    // @ts-ignore
    let context: any = this;
    let args = arguments;

    let callNow = immediate && !timeout;

    clearTimeout(timeout as NodeJS.Timeout);

    timeout = setTimeout(function() {
      timeout = null;

      if (!immediate) {
        func.apply(context, args);
      }
    }, wait);

    if (callNow) func.apply(context, args);
  }
}

export function debounceAsync(
  func,
  wait = 0,
  {
    leading = false,
    cancelObj = 'canceled'
  } = {}
) {
  let timerId, latestResolve, shouldCancel

  return function ( ...args ) {
    if ( !latestResolve ) { // The first call since last invocation.
      return new Promise( ( resolve, reject ) => {
        latestResolve = resolve
        if ( leading ) {
          invokeAtLeading.apply( this, [ args, resolve, reject ] );
        } else {
          timerId = setTimeout( invokeAtTrailing.bind( this, args, resolve, reject ), wait )
        }
      })
    }

    shouldCancel = true
    return new Promise( ( resolve, reject ) => {
      latestResolve = resolve
      timerId = setTimeout( invokeAtTrailing.bind( this, args, resolve, reject ), wait )
    })
  }

  function invokeAtLeading( args, resolve, reject ) {
    func.apply( this, args ).then( resolve ).catch( reject )
    shouldCancel = false
  }

  function invokeAtTrailing( args, resolve, reject ) {
    if ( shouldCancel && resolve !== latestResolve ) {
      reject( cancelObj )
    } else {
      func.apply( this, args ).then( resolve ).catch( reject )
      shouldCancel = false
      clearTimeout( timerId )
      timerId = latestResolve = null
    }
  }
}

export function deleteNullProperties(obj: any, recurse: boolean) {

  if (obj instanceof Array) {
    for (let i = 0; i < obj.length; i++) {
      if (obj[i] === null || obj[i] === undefined) {
        obj.splice(i, 1);
        i--;
      }
    }
  }

  for (const i in obj) {
    if (obj[i] === null || obj[i] === undefined) {
      delete obj[i];
    } else if (recurse && typeof obj[i] === 'object') {
      deleteNullProperties(obj[i], recurse);
    }
  }
}


export function deletePropertiesWithPrefix(obj: any, prefix: string|Function, recurse: boolean) {
  for (const i in obj) {
    if (isString(prefix) && i.indexOf(<string>prefix) === 0) {
      delete obj[i];
    } else if (isFunction(prefix) && (<Function>prefix)(i)) {
      delete obj[i];
    } else if (recurse && typeof obj[i] === 'object') {
      deletePropertiesWithPrefix(obj[i], prefix, recurse);
    }
  }
}


export function setObjectPropertyByString(obj: any, property: any, value: any) {
  if (typeof property === 'string') {
    property = property.split('.');
  }

  if (obj[property[0]] === undefined) {
    return;
  }

  if (property.length > 1) {
    const e = property.shift();
    setObjectPropertyByString(obj[e] = isObject(obj[e]) ? obj[e] : {}, property, value);
  } else {
    obj[property[0]] = value;
  }
}


export function stripProperties(obj: any, recurse: boolean) {
  for (const i in obj) {
    if (isString(obj[i])) {
      obj[i] = obj[i].replace(/^\s+|\s+$/g, '');
    } else if (recurse && typeof obj[i] === 'object') {
      stripProperties(obj[i], recurse);
    }
  }
}


export function getValueFromObject(obj: any, path: string): any {
  const pathSteps = path.split('.');

  let result = obj;
  for (const pathStep of pathSteps) {
    if (!result || !(pathStep in result)) {
      return null;
    }

    result = result[pathStep];
  }

  return result;
}


export function strEnum<T extends string>(o: Array<T>): {[K in T]: K} {
  return <any>o.reduce((res, key) => {
    res[key] = key;
    return res;
  }, Object.create(null));
}


export function camelToSnake(string: string) {
  return string.replace(/[\w]([A-Z])/g, (m) => {
    return m[0] + '-' + m[1];
  }).toLowerCase();
}


export function toCamel(string: string) {
  return string.replace(/([-_][a-z])/ig, ($1) => {
    return $1.toUpperCase()
      .replace('-', '')
      .replace('_', '');
  });
}

export function pick(obj: object, props: string[]) {
  if (!obj || !props) return;

  const picked: object = {};

  props.forEach(function(prop) {
    // @ts-ignore
    picked[prop] = obj[prop];
  });

  return picked;
}
