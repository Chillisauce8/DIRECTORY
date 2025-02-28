import {
  EventEmitterObservable,
  EventEmitterSubscriber, EventEmitterSubscription,
} from './event-emitter-observable';


export type EventEmitterHandler<Data = unknown> = (data?: Data) => void;


export class EventEmitter<T extends unknown = any> extends EventEmitterObservable<T> {
  protected readonly subscriberList: EventEmitterSubscriber<T>[] = [];

  /** @deprecated use subscribe method instead */
  public on(handler: EventEmitterHandler<T>): EventEmitterSubscription {
    return this.subscribe(handler);
  }

  /** @deprecated use next method instead */
  public emit(value: T): void {
    this.next(value);
  }

  public next(value: T): void {
    this.subscriberList.forEach(s => s.next(value));
  }

  public complete(): void {
    this.subscriberList.forEach(s => s.complete());

    this.clearSubscriberList();
  }

  public asEventEmitterObservable(): EventEmitterObservable<T> {
    return new EventEmitterObservable<T>(s => this.handleSubscribe(s));
  }

  protected handleSubscribe(subscriber: EventEmitterSubscriber<T>): void {
    this.subscriberList.push(subscriber);

    subscriber
      .onUnsubscribe(() => {
        const index = this.subscriberList.indexOf(subscriber);

        this.subscriberList.splice(index, 1);
      });
  }

  protected clearSubscriberList(): void {
    this.subscriberList.splice(0, this.subscriberList.length);
  }
}


export class EventEmitterWithLastValue<T = unknown> extends EventEmitter<T> {
  private lastValue: T;

  constructor(value: T) {
    super();

    this.lastValue = value;
  }

  public next(value: T) {
    this.lastValue = value;

    super.next(value);
  }

  protected handleSubscribe(subscriber: EventEmitterSubscriber<T>) {
    super.handleSubscribe(subscriber);

    if (this.lastValue !== undefined) {
      setTimeout(() => subscriber.next(this.lastValue));
    }
  }
}
