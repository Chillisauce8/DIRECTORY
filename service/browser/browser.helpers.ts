export type EventHandler<EventType extends Event = Event> = (event?: EventType) => void;


export type RemoveEventListener = () => void;


export function isPlatformBrowser(): boolean {
  return typeof window !== 'undefined';
}


export function getWindowSafe(): Window|null {
  return isPlatformBrowser() ? window : null;
}


export function getDocumentSafe(): Document|null {
  return isPlatformBrowser() ? document : null;
}


export function addEventListenerSafe<EventType extends Event>(target: EventTarget,
                                                              eventType: string,
                                                              eventHandler: EventHandler<EventType>): RemoveEventListener|null {
  if (!target) {
    return null;
  }

  const handler = (event: EventType) => eventHandler(event);

  target.addEventListener(eventType, handler);

  return () => target.removeEventListener(eventType, handler);
}
