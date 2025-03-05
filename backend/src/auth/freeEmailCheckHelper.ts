import {FREE_EMAIL_DOMAIN_REGEX_LIST} from "./freeEmailDomainList";


export class FreeEmailCheckHelper {
  private freeEmailRegexList: RegExp[];

  constructor(private freeEmailRegexPatternList: string[]) {
    this.freeEmailRegexList = freeEmailRegexPatternList.map(pattern => new RegExp(pattern));
  }

  checkDomain(domain: string): boolean {
    const domainWithAd = '@' + domain;

    return this.checkEmailAddress(domainWithAd);
  }

  checkEmailAddress(email: string): boolean {
    return this.freeEmailRegexList
      .some(regex => regex.test(email));
  }
}


export const freeEmailCheckHelper = new FreeEmailCheckHelper(FREE_EMAIL_DOMAIN_REGEX_LIST);

