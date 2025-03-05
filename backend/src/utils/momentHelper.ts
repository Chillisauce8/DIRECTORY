import {DateHelper} from 'x-utils';
import moment from 'moment';

export class MomentHelper {
  private dateHelper = new DateHelper();

  saveDateFormatUTC(date: Date): string {
    if (!date) {
      return undefined;
    }

    return moment.utc(date).format('YYYY-MM-DD');
  }

  saveTimeFormatUTC(date: Date): string {
    if (!date) {
      return undefined;
    }

    let result = moment.utc(date).format('hh:mm A');

    if (result.indexOf('12') === 0 && result.indexOf('AM') !== -1) {
      result = result.replace('12', '00');
    }

    return result;
  }

  saveDateTimeFormatUTC(date: Date) {
    if (!date) {
      return undefined;
    }

    return moment.utc(date).format('YYYY-MM-DD[T]HH:mm:ssZ');
  }

  parseDateTimeFields(day: string, time: string, timezoneOffset: number = 0): Date {
    const dayObj = day ? this.dateHelper.parseSaveDateFormat(day) : new Date();

    const dateTimeObj = time ? this.dateHelper.parseTime(time, dayObj) : dayObj;

    return moment(dateTimeObj)
      .subtract(timezoneOffset + new Date().getTimezoneOffset(), 'minutes')
      .toDate();
  }

  updateDateFieldInTimezone(day: string, prevDay: string, time: string, timezoneOffset: number = 0) {
    const prevDateTimeObj = this.parseDateTimeFields(prevDay, time, timezoneOffset - new Date().getTimezoneOffset());

    let dateTimeObj = this.dateHelper.parseSaveDateFormat(day);

    dateTimeObj.setHours(prevDateTimeObj.getHours());
    dateTimeObj.setMinutes(prevDateTimeObj.getMinutes());
    dateTimeObj.setSeconds(prevDateTimeObj.getSeconds());

    return moment(dateTimeObj)
      .add(timezoneOffset - new Date().getTimezoneOffset(), 'minutes')
      .toDate();
  }

  updateTimeFieldInTimezone(time: string, day: string, prevTime: string, timezoneOffset: number = 0) {
    if (!time) {
      return null;
    }

    const prevDateTimeObj = this.parseDateTimeFields(day, prevTime, timezoneOffset - new Date().getTimezoneOffset());

    const dateTimeObj = this.dateHelper.parseTime(time, prevDateTimeObj);

    return moment(dateTimeObj)
      .add(timezoneOffset - new Date().getTimezoneOffset(), 'minutes')
      .toDate();
  }
}
