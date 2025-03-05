
import * as _ from 'lodash';
import {DateHelper} from 'x-utils';
import {WebPushHelper} from './webPushHelper';


export interface ITaskNotificationData {
  userId: string,
  taskName: string,
  event?: any,
  product?: any,
  supplier?: any,
  customer?: any,
  company?: any,
}


enum NotificationActions {
  showEvent = 'showEvent',
  showProduct = 'showProduct',
  showSupplier = 'showSupplier',
  showCustomer = 'showCustomer',
  showCompany = 'showCompany',
  call = 'call',
}


export class TasksWebPushNotificationsHelper {
  constructor(private dateHelper: DateHelper, private webPushHelper: WebPushHelper) {}

  public async notifyStaffUserAboutTask(req: Request, taskData: ITaskNotificationData) {
    const notification = this.buildStaffTaskPushNotification(taskData);
    return this.webPushHelper.send(req, taskData.userId, {notification});
  }

  public async notifySupplierContactUserAboutTask(req: Request, taskData: ITaskNotificationData) {
    const notification = this.buildSupplierTaskPushNotification(taskData);
    return this.webPushHelper.send(req, taskData.userId, {notification});
  }

  private buildStaffTaskPushNotification(taskData: ITaskNotificationData) {
    const tag = this.prepareTag(taskData);
    const {actions, actionsDescription} = this.prepareActions(taskData, true);

    return {
      requireInteraction: true,
      tag,
      renotify: true,
      title: taskData.taskName,
      body: this.buildTaskNotificationBody(taskData),
      actions,
      data: {
        actionsDescription,
      }
    }
  }

  private buildSupplierTaskPushNotification(taskData: ITaskNotificationData) {
    const tag = this.prepareTag(taskData);
    const {actions, actionsDescription} = this.prepareActions(taskData, false);

    return {
      requireInteraction: true,
      tag,
      renotify: true,
      title: taskData.taskName,
      body: this.buildTaskNotificationBody(taskData),
      actions,
      data: {
        actionsDescription,
      }
    }
  }

  private prepareTag(taskData: ITaskNotificationData): string {
    let tag = taskData.taskName.split(' ').map((item: string, index: number) =>
      !index ? item : _.capitalize(item)).join('');

    if (taskData.event) {
      tag += `-${this.buildEventTag(taskData.event)}`;
    }

    if (taskData.product) {
      tag += `-${taskData.product._doc || taskData.product.productId}`;
    }

    if (taskData.supplier) {
      tag += `-supplier_${taskData.supplier._doc}`;
    }

    if (taskData.customer) {
      tag += `-customer_${taskData.customer._doc}`;
    }

    if (taskData.company) {
      tag += `-company_${taskData.company._doc}`;
    }

    return tag;
  }

  private prepareActions(taskData: ITaskNotificationData, forStaff: boolean = true): {actions, actionsDescription} {
    const actions = [];
    const actionsDescription = {};

    if (taskData.event) {
      actions.push({action: NotificationActions.showEvent, title: 'Show event'});
      const url = forStaff ? this.buildEventUrlForStaff(taskData.event) :
        this.buildEventUrlForSupplier(taskData.event, taskData.supplier);

      actionsDescription[NotificationActions.showEvent] = {url};
    }

    if (taskData.product && !taskData.event) {
      actions.push({action: NotificationActions.showProduct, title: 'Show product'});
      actionsDescription[NotificationActions.showProduct] =
        {url: `/supplier/${taskData.supplier._doc}/product/${taskData.product._doc || taskData.product.productId}`};
    }

    if (forStaff) {
      if (taskData.supplier && !taskData.event) {
        actions.push({action: NotificationActions.showSupplier, title: 'Show supplier'});
        actionsDescription[NotificationActions.showSupplier] = {url: `/supplier/${taskData.supplier._doc}/index/details`};
      }

      if (taskData.customer && !taskData.event) {
        actions.push({action: NotificationActions.showCustomer, title: 'Show customer'});
        actionsDescription[NotificationActions.showCustomer] =
          {url: `/admin/raw-data/is:customer/${taskData.customer._doc}`};
      }

      if (taskData.company && !taskData.event) {
        actions.push({action: NotificationActions.showCompany, title: 'Show company'});
        actionsDescription[NotificationActions.showCompany] = {url: `/admin/company/${taskData.company._doc}`};
      }

      if (taskData.supplier && taskData.event) {
        actions.push({action: NotificationActions.call, title: 'Call'});
        actionsDescription[NotificationActions.call] = {url: this.buildSupplierPhoneUrl(taskData.supplier)};
      }
    }

    return {actions, actionsDescription};
  }

  private getEventId(event) {
    return event._doc;
  }

  private getOrganiserName(event) {
    return event.eventSummary.organiser.name;
  }

  private getOrganiserId(event) {
    return event.eventSummary.organiser.id;
  }

  private getEventType(event) {
    return event.eventSummary.section;
  }

  private buildEventUrlForStaff(event) {
    const eventId = this.getEventId(event);
    const section = this.getEventType(event);
    const customerId = this.getOrganiserId(event);

    return `/my-events?customerId=${customerId}&eventId=${eventId}&section=${section}`;
  }

  private buildEventUrlForSupplier(event, supplier) {
    const eventId = this.getEventId(event);
    return `/supplier/${supplier._doc}/event/${eventId}/package`;
  }

  private buildOrganiserPhoneUrl(event) {
    return `tel:${event.eventSummary.organiser.phone}`;
  }

  private getSupplierName(supplier) {
    return supplier.name;
  }

  private getProductName(product) {
    return product.content ? product.content.name : product.productCustom.content.name;
  }

  private buildTaskNotificationBody(taskData: ITaskNotificationData): string {
    let result = '';

    if (taskData.event) {
      result += `${this.getOrganiserName(taskData.event)};\n`;
    }

    if (taskData.supplier) {
      result += `Supplier: ${this.getSupplierName(taskData.supplier)};\n`;
    }

    if (taskData.product) {
      result += `Product: ${this.getProductName(taskData.product)};\n`;
    }

    if (taskData.customer) {
      result += `Customer: ${taskData.customer.name};\n`;
    }

    if (taskData.company) {
      result += `Company: ${taskData.company.name};\n`;
    }

    return result;
  }

  private buildSupplierPhoneUrl(supplier): string {
    return `tel:${supplier.phone}`;
  }

  private buildEventTag(event) {
    const eventId = this.getEventId(event);
    const organiserId = this.getOrganiserId(event);

    return `event-${eventId}-organiser-${organiserId}`;
  }
}

