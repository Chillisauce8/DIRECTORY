

export class CookieService {
  // @ts-ignore
  private internalService;

  constructor() {
    // this.internalService = nuxtApp.$cookies;
  }

  set(keyName: string, value: any, expires?: string | number | Date,
      path?: string, domain?: string, secure?: boolean, sameSite?: string): void {
    this.internalService.set(keyName, value, expires, path, domain, secure, sameSite);
  }

  get(keyName: string): any {
    return this.internalService.get(keyName);
  }

  remove(keyName: string, path?: string, domain?: string): boolean {
    return this.internalService.remove(keyName, path, domain);
  }
}
