

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

  return map;
}


export function isEqual(x: any, y: any): boolean {
  const ok = Object.keys, tx = typeof x, ty = typeof y;
  return x && y && tx === 'object' && tx === ty ? (
    ok(x).length === ok(y).length &&
    ok(x).every(key => isEqual(x[key], y[key]))
  ) : (x === y);
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
  return array1.filter(a => !array2.some(b => b === a))
}

export function differenceWith(array1: any[], array2: any[], comparator: (a1: any, a2: any) => boolean) {
  return array1.filter(a1 => !array2.some(a2 => comparator(a1, a2)))
}

export function uniq(array: any[]): any[] {
  return [...new Set(array)];
}

export function uniqBy(array: any[], key: string): any[] {
  const keysArray = array.map(item => item[key]);
  return array.filter((value, index, array) => keysArray.indexOf(value[key]) === index);
}


export function debounce(func: Function, wait: number, immediate?: boolean) {
  // 'private' variable for instance
  // The returned function will be able to reference this due to closure.
  // Each call to the returned function will share this common timer.
  let timeout: NodeJS.Timeout | null;

  // Calling debounce returns a new anonymous function
  return function() {
    // reference the context and args for the setTimeout function
    // @ts-ignore
    let context: any = this;
    let args = arguments;

    // Should the function be called now? If immediate is true
    //   and not already in a timeout then the answer is: Yes
    let callNow = immediate && !timeout;

    // This is the basic debounce behaviour where you can call this
    //   function several times, but it will only execute once
    //   (before or after imposing a delay).
    //   Each time the returned function is called, the timer starts over.
    clearTimeout(timeout as NodeJS.Timeout);

    // Set the new timeout
    timeout = setTimeout(function() {

      // Inside the timeout function, clear the timeout variable
      // which will let the next execution run when in 'immediate' mode
      timeout = null;

      // Check if the function already ran with the immediate flag
      if (!immediate) {
        // Call the original function with apply
        // apply lets you define the 'this' object as well as the arguments
        //    (both captured before setTimeout)
        func.apply(context, args);
      }
    }, wait);

    // Immediate mode and no wait timer? Execute the function...
    if (callNow) func.apply(context, args);
  }
}
