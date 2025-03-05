import { coreServiceLocator } from '../serviceLocator';
import { EmailHelper } from '../data-helpers/emailHelper';
import { UrlShortener } from '../data-helpers/urlShortener';
import { WebPushSubscriptionManagement } from '../data-helpers/webPushSubscriptionManagement';
import { LogErrorManagement } from '../data-helpers/logErrorManagement';
import { TasksWebPushNotificationsHelper } from '../data-helpers/tasksWebPushNotificationsHelper';
import type { IDataCrud } from '../db';
import * as mime from 'mime-types';
import { DataApiHelper } from './data-api';


export async function initDataHelpersServices() {

  const dataCrudService = coreServiceLocator.get<IDataCrud>('dataCrudService');
  const cacheHelper = coreServiceLocator.get('cacheHelper');
  const privateSettings = coreServiceLocator.get('privateSettings');
  const dateHelper = coreServiceLocator.get('dateHelper');
  const requestHelper = coreServiceLocator.get('requestHelper');
  const chatGptHelper = coreServiceLocator.get('chatGptHelper');
  const definitionCrud = coreServiceLocator.get('definitionCrud');

  const {CloudflareDNSHelper} = await import('./cloudflareDNSHelper');
  const cloudflareDNSHelper = new CloudflareDNSHelper(privateSettings.CLOUDFLARE_DNS);
  coreServiceLocator.register('cloudflareDNSHelper', cloudflareDNSHelper);

  const {GoogleApiOAuthHelper} = await import('./googleApiOAuthHelper');
  const googleApiOAuthHelper = new GoogleApiOAuthHelper();
  coreServiceLocator.register('googleApiOAuthHelper', googleApiOAuthHelper);

  const emailHelper = new EmailHelper(dataCrudService);
  coreServiceLocator.register('emailHelper', emailHelper);

  const urlShortener = new UrlShortener(dataCrudService);
  coreServiceLocator.register('urlShortener', urlShortener);

  const webPushSubscriptionManagement = new WebPushSubscriptionManagement(dataCrudService, cacheHelper);
  coreServiceLocator.register('webPushSubscriptionManagement', webPushSubscriptionManagement);

  const {WebPushHelper} = await import('./webPushHelper');
  const webPushHelper = new WebPushHelper(webPushSubscriptionManagement);
  coreServiceLocator.register('webPushHelper', webPushHelper);

  const logErrorManagement = new LogErrorManagement(dataCrudService, requestHelper);
  coreServiceLocator.register('logErrorManagement', logErrorManagement);

  const tasksWebPushNotificationsHelper = new TasksWebPushNotificationsHelper(dateHelper, webPushHelper);
  coreServiceLocator.register('tasksWebPushNotificationsHelper', tasksWebPushNotificationsHelper);

  const { CsResetCDNCacheHelper } = await import('./csResetCDNCacheHelper');
  const csResetCDNCacheHelper = new CsResetCDNCacheHelper(privateSettings.CDN_CONFIG, privateSettings.SITE_URL);
  coreServiceLocator.register('csResetCDNCacheHelper', csResetCDNCacheHelper);

  const { TemplateHelper } = await import('./templateHelper');
  const templateHelper = new TemplateHelper();
  coreServiceLocator.register('templateHelper', templateHelper);

  const { TemplateManagement } = await import('./templateManagement');
  const templateManagement = new TemplateManagement(dataCrudService);
  coreServiceLocator.register('templateManagement', templateManagement);

  const {ListingsHelper} = await import('./listings-helper');
  const listingHelper = new ListingsHelper(dataCrudService, dateHelper, chatGptHelper);
  coreServiceLocator.register('listingsHelper', listingHelper);

  const {BrowserStaticManagement} = await import('./browserStaticManagement');
  const browserStaticManagement = new BrowserStaticManagement(dataCrudService, templateManagement, dateHelper);
  coreServiceLocator.register('browserStaticManagement', browserStaticManagement);

  const {BrowserStaticHelper} = await import('./browserStaticHelper');
  const browserStaticHelper = new BrowserStaticHelper(browserStaticManagement, mime);
  coreServiceLocator.register('browserStaticHelper', browserStaticHelper);

  const {DataApiHelper} = await import('./data-api');
  const dataApiHelper = new DataApiHelper(dataCrudService, definitionCrud, requestHelper);
  coreServiceLocator.register('dataApiHelper', dataApiHelper);
}
