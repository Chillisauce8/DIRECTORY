import type {EventEmitterObservablePipeOperator} from './event-emitter-observable-helpers';


export abstract class EventEmitterSubscription<Data extends unknown = any> {
  public abstract unsubscribe(): void;
}

export type EventEmitterObserverNext<Data extends unknown> = (data?: Data) => void;


export interface EventEmitterObserver<Data extends unknown> {
  next: EventEmitterObserverNext<Data>;
  complete?: () => void;
}


export class EventEmitterSubscriber<Data extends unknown> implements EventEmitterSubscription<Data> {
  private completed: boolean = false;
  private readonly finalizerList: (() => void)[] = [];

  constructor(private observer: EventEmitterObserver<Data>) {}

  public next(data: Data) {
    if (this.completed) {
      return;
    }

    this.observer.next(data);
  }

  public complete() {
    if (this.completed) {
      return;
    }

    this.completed = true;

    if (this.observer?.complete) {
      this.observer?.complete();
    }
  }

  public unsubscribe() {
    this.complete();
    this.finalizerList.forEach(f => f());
  }

  public onUnsubscribe(finalizer: () => void): void {
    this.finalizerList.push(finalizer);
  }
}


export class EventEmitterObservable<Data extends unknown> {
  constructor(protected handler?: (subscriber: EventEmitterSubscriber<Data>) => void) {}

  pipe(): EventEmitterObservable<Data>;
  pipe<A>(opA: EventEmitterObservablePipeOperator<Data, A>): EventEmitterObservable<A>;
  pipe<A, B>(opA: EventEmitterObservablePipeOperator<Data, A>,
             opB: EventEmitterObservablePipeOperator<A, B>): EventEmitterObservable<B>;
  pipe<A, B, C>(opA: EventEmitterObservablePipeOperator<Data, A>,
                opB: EventEmitterObservablePipeOperator<A, B>,
                opC: EventEmitterObservablePipeOperator<B, C>): EventEmitterObservable<C>;
  pipe<A, B, C, D>(opA: EventEmitterObservablePipeOperator<Data, A>,
                   opB: EventEmitterObservablePipeOperator<A, B>,
                   opC: EventEmitterObservablePipeOperator<B, C>,
                   opD: EventEmitterObservablePipeOperator<C, D>): EventEmitterObservable<D>;
  pipe(...operators: EventEmitterObservablePipeOperator<any, any>[]): EventEmitterObservable<unknown>;
  public pipe(...operators: EventEmitterObservablePipeOperator<any, any>[]): EventEmitterObservable<any> {
    return operators.reduce((obs, op) => op(obs), this);
  }

  public subscribe(observer?: EventEmitterObserver<Data> | EventEmitterObserverNext<Data>): EventEmitterSubscription {
    const normalizedObserver = typeof observer === 'undefined' ? {next: () => {}} :
      typeof observer === 'function' ? {next: observer} : observer;

    if (typeof normalizedObserver.complete === 'undefined') {
      normalizedObserver.complete = () => {};
    }

    const subscriber = new EventEmitterSubscriber(normalizedObserver);

    this.handleSubscribe(subscriber);

    return subscriber;
  }

  protected handleSubscribe(subscriber: EventEmitterSubscriber<Data>): void {
    if (typeof this.handler === 'function') {
      this.handler(subscriber);
    }
  }
}
