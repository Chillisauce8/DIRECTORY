import {EventEmitterSubscription} from "~/services/models/event-emitter-observable";
import {Store} from 'pinia';


export type StoreEventEmitterHandler<D = unknown, R = unknown> = (data?: D, next?: (D) => void) => R;


export interface StoreEventEmitterParams {
  storeGetter?: {
    name: string;
    callArgs?: any[];
  }
  valueGetter?: (state: any, getters?: any) => any;
}


export interface ExecuteHandlerPipeParams<T> {
  data: T;
  currentHandlerIndex?: number;
}


export type StoreValueEmitterSubscribeOnNext<D> = (data: D) => any;


export type StoreValueEmitterSubscribeOnError<E> = (error: E) => any;


class StoreValueEmitterSubscription extends EventEmitterSubscription {
  constructor(private unwatch: () => void) {
    super();
  }

  unsubscribe(): void {
    this.unwatch();
  }
}


export class StoreValueEmitter<T = unknown> {
  private handlersPipe: StoreEventEmitterHandler<T>[] = [];

  constructor(private params: StoreEventEmitterParams,
              protected store: Store) {
    if (!params) {
      throw 'Please configure store event emitter';
    }
  }

  public pipe(...handlerPipe: StoreEventEmitterHandler<T>[]): StoreValueEmitter<T> {
    this.handlersPipe = [...this.handlersPipe, ...handlerPipe];

    return this;
  }

  public subscribe(next: StoreValueEmitterSubscribeOnNext<T>,
                   error: StoreValueEmitterSubscribeOnError<any>): EventEmitterSubscription {
    const unwatch = this.store
      .$subscribe((mutation, state) => {
        this.executeHandlerPipeRecursive({data: state as T}, next, error);
      });

    return new StoreValueEmitterSubscription(unwatch);
  }

  public toPromise(): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const unwatch = this.store
        .$subscribe((mutation, state) => {
          this.executeHandlerPipeRecursive({data: state as T}, resolve, reject);

          unwatch();
        });
    });
  }

  private executeHandlerPipeRecursive<Error = unknown>(params: ExecuteHandlerPipeParams<T>,
                                                       done: StoreValueEmitterSubscribeOnNext<T>,
                                                       onError: StoreValueEmitterSubscribeOnError<Error>): void {
    const {data, currentHandlerIndex = 0} = params;

    if (!this.handlersPipe?.length) {
      done(data);
    }

    const handler = this.handlersPipe[currentHandlerIndex];

    const next = currentHandlerIndex === this.handlersPipe.length - 1 ?
      (result) => done(result) :
      (updatedData) => this.executeHandlerPipeRecursive({
        data: updatedData,
        currentHandlerIndex: currentHandlerIndex + 1
      }, done, onError);

    try {
      handler(data, next);
    } catch (e) {
      onError(e);
    }
  }
}


export function pipeMap<D = unknown>(handler: StoreEventEmitterHandler<D, D>) {
  return (data, next) => next(handler(data));
}


export function pipeTap<D = unknown>(handler: StoreEventEmitterHandler<D, void>) {
  return (data, next) => {
    handler(data);

    next(data);
  };
}


export function pipeFilter<D = unknown>(handler: StoreEventEmitterHandler<D, boolean>) {
  return (data, next) => {
    const needCallNext = handler(data);

    if (!needCallNext) {
      return;
    }

    next(data);
  };
}
