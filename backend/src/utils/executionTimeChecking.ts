const moment = require('moment');


export function consoleExecutionTime() {
    return function (target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) {
        let originalMethod = descriptor.value; // save a reference to the original method

        descriptor.value = async function (...args: Array<any>) {
            console.log(propertyKey, 'started');

            const start = moment(new Date());

            const result = await originalMethod.apply(this, args);

            const end = moment(new Date());

            const duration = moment.duration(end.diff(start));
            console.log(propertyKey, 'done', duration.asSeconds(), 'seconds');

            return result;
        };

        return descriptor;
    }
}
