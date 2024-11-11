import VueCookies from 'vue-cookies';


export class CookieService {
  // @ts-ignore
  private internalService: typeof VueCookies.VueCookies;

  constructor() {
    this.internalService = VueCookies as any;
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

  isKey(keyName: string): boolean {
    return this.internalService.isKey(keyName);
  }

  keys(): string[] {
    return this.internalService.keys();
  }
}


let cookieServiceInstance: CookieService | undefined = undefined;

export function cookieServiceFabric() {
  if (cookieServiceInstance) {
    return cookieServiceInstance;
  }

  cookieServiceInstance = new CookieService();

  return cookieServiceInstance;
}
