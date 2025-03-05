interface Newable<T> {
    new (...args: any[]): T;
}

export const EventEmitter: Newable<Object> = require('promise-events');

export const globalEmitter: any = new EventEmitter();
