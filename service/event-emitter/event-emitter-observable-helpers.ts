import type {EventEmitterObserverNext} from '~/services/models/event-emitter-observable';
import {
  EventEmitterObservable,
  EventEmitterSubscriber
} from '~/services/models/event-emitter-observable';


export type EventEmitterObservablePipeOperator<I, O> = (obs: EventEmitterObservable<I>) => EventEmitterObservable<O>;


export function eventEmitterObsFirstValueFrom<Data extends unknown = any>(obs: EventEmitterObservable<Data>): Promise<Data> {
  return new Promise(resolve => {
    const subscription = obs.subscribe({
      next: data => {
        resolve(data);

        subscription.unsubscribe();
      },
    });
  });
}


export function eventEmitterTap<T>(fn: EventEmitterObserverNext<T>): EventEmitterObservablePipeOperator<T, T> {
  return (obs) => {
    return new EventEmitterObservable<T>(s => {
      const subscriber = new EventEmitterSubscriber({
        next: (value: T) => {
          fn(value);
          s.next(value);
        },
        complete: () => {
          subscriber.unsubscribe();
          s.complete();
        },
      });

      obs.subscribe(subscriber);
    });
  };
}


export function eventEmitterFinalize<T>(fn: () => void): EventEmitterObservablePipeOperator<T, T> {
  return (obs) => {
    return new EventEmitterObservable<T>(s => {
      const subscriber = new EventEmitterSubscriber({
        next: (value: T) => {
          s.next(value);
        },
        complete: () => {
          fn();
          subscriber.unsubscribe();
          s.complete();
        },
      });

      obs.subscribe(subscriber);
    });
  };
}


export function eventEmitterTake<T>(count: number): EventEmitterObservablePipeOperator<T, T> {
  if (count <= 0) {
    return (obs) => new EventEmitterObservable<never>(s => s.complete());
  }

  return (obs) => {
    let callCount = 0;

    return new EventEmitterObservable<T>(s => {

      const subscriber = new EventEmitterSubscriber({
        next: (value: T) => {
          ++callCount;

          s.next(value);

          if (callCount => count) {
            subscriber.unsubscribe();
            s.complete();
          }
        },
        complete: () => {
          subscriber.unsubscribe();
          s.complete();
        },
      });


      obs.subscribe(subscriber);
    });
  }
}


export function eventEmitterFilter<T>(filterFn: (data: T) => boolean): EventEmitterObservablePipeOperator<T, T> {
  return (obs) => {
    return new EventEmitterObservable<T>(s => {
      const subscriber = new EventEmitterSubscriber({
        next: (value: T) => {
          const needEmit = filterFn(value);

          if (!needEmit) {
            return;
          }

          s.next(value);
        },
        complete: () => {
          subscriber.unsubscribe();
          s.complete();
        },
      });

      obs.subscribe(subscriber);
    });
  };
}


export function eventEmitterMap<T, R>(mapFn: (data: T) => R): EventEmitterObservablePipeOperator<T, R> {
  return (obs) => {
    return new EventEmitterObservable<R>(s => {
      const subscriber = new EventEmitterSubscriber({
        next: (value: T) => s.next(mapFn(value)),
        complete: () => {
          subscriber.unsubscribe();
          s.complete();
        },
      });

      obs.subscribe(subscriber);
    });
  };
}


export function eventEmitterSwitchMap<T, R>(switchMapFn: (data: T) => EventEmitterObservable<R>): EventEmitterObservablePipeOperator<T, R> {
  return (obs) => {
    return new EventEmitterObservable<R>(s => {
      let completed = false;

      const sourceSubscriber = new EventEmitterSubscriber<T>({
        next: v => {
          const switchMapSubscriber = new EventEmitterSubscriber<R>({
            next: v => {
              if (completed) {
                switchMapSubscriber.unsubscribe();
                return;
              }

              s.next(v);
            },
            complete: () => switchMapSubscriber.unsubscribe(),
          });

          switchMapFn(v).subscribe(switchMapSubscriber);
        },
        complete: () => {
          completed = true;

          sourceSubscriber.unsubscribe();
          s.complete();
        },
      });
    });
  };
}