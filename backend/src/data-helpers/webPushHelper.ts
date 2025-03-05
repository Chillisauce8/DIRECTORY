import { WebPushSubscriptionManagement } from './webPushSubscriptionManagement';

const webPush = require('web-push');
import {coreServiceLocator} from '../serviceLocator';
import {ERROR_REASON} from '../const';


const privateSettings = coreServiceLocator.get('privateSettings');

const vapidKeys = privateSettings.WEB_PUSH;

webPush.setVapidDetails('mailto:shtanko.artem.93@gmail.com', vapidKeys.publicKey, vapidKeys.privateKey);


interface IWebPushNotificationAction {
  action: string;
  title: string;
}

export interface IWebPushNotificationData {
  [field: string]: any;
  title?: string;
  body?: string;
  actions?: Array<IWebPushNotificationAction>;
  icon?: string;
  data?: any;
}

export class WebPushHelper {

  constructor(private webPushSubscriptionManagement: WebPushSubscriptionManagement) {
  }

  public create(req: Request, subscription): Promise<any> {
    const userHelper = coreServiceLocator.get('userHelper');
    const user = userHelper.getCurrentUserSync(req);

    if (!user) {
      return Promise.reject({reason: ERROR_REASON.genericAuthError, message: 'Not allowed'});
    }

    const userId = user._doc;

    return this.webPushSubscriptionManagement.create(req, {userId, subscription});
  }

  public async delete(req: Request, endpoint: string): Promise<any> {
    const userHelper = coreServiceLocator.get('userHelper');
    const user = userHelper.getCurrentUserSync(req);

    if (!user) {
      return Promise.reject({reason: ERROR_REASON.genericAuthError, message: 'Not allowed'});
    }

    const node: any = this.webPushSubscriptionManagement.findSubscriptionByEndpoint(req, endpoint);

    if (!node) {
      return Promise.resolve();
    }

    return this.webPushSubscriptionManagement.delete(req, node._doc);
  }

  public async isUserHasSubscriptions(req: Request, userId: string): Promise<boolean> {
    let subscriptionsList = await this.webPushSubscriptionManagement.findSubscriptionListByUserId(req, userId);

    if (!subscriptionsList || !subscriptionsList.length) {
      return false;
    }

    return true;
  }

  public async send(req: Request, userId: string, notificationData: {notification: IWebPushNotificationData}) {
    let subscriptionsList = await this.webPushSubscriptionManagement.findSubscriptionListByUserId(req, userId);

    if (!subscriptionsList || !subscriptionsList.length) {
      return;
    }

    const notificationJSON = JSON.stringify(notificationData);

    for (let sub of subscriptionsList) {
      try {
        await webPush.sendNotification(sub.subscription, notificationJSON);
      } catch (e) {
        console.log('Push notification wasn\'t send:', e.message, 'doc:', sub._doc);
      }
    }
  }
}

