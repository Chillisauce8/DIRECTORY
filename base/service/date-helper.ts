import {startOfDay} from 'date-fns';
import {startOfYear} from 'date-fns';
import {endOfYear} from 'date-fns';
import {endOfDay} from 'date-fns';
import {add} from 'date-fns';
import {getDay} from 'date-fns';
import {getMonth} from 'date-fns';
import {getYear} from 'date-fns';
import {format} from 'date-fns';
import {parse} from 'date-fns';
import {parseISO} from 'date-fns';
import {differenceInCalendarMonths} from 'date-fns';
import {differenceInDays} from 'date-fns';
import {differenceInHours} from 'date-fns';
import {differenceInMinutes} from 'date-fns';
import {differenceInSeconds} from 'date-fns';
import {isWithinInterval} from 'date-fns';
import {endOfMonth} from 'date-fns';
import {startOfMonth} from 'date-fns';
import {addWeeks} from 'date-fns';
import {startOfWeek} from 'date-fns';
import {endOfWeek} from 'date-fns';
import {setISODay} from 'date-fns';
import {isValid} from 'date-fns';


export class DateHelper {

  public daysOfTheWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  public daysOfTheWeekShortNames = this.daysOfTheWeek.map((name: string) => name.slice(0, 3));

  constructor() {
    //
  };

  hasGapBetweenDays(daysArray: Array<string>, isLongDaysName: boolean = false) {
    const daysOfTheWeek = isLongDaysName ? this.daysOfTheWeek : this.daysOfTheWeekShortNames;

    const firstDayIndex = daysOfTheWeek.indexOf(daysArray[0]);
    const lastDayIndex = firstDayIndex + daysArray.length;

    const daysSlice: string[] = [];

    for (let i = firstDayIndex; i < lastDayIndex; ++ i) {
      daysSlice.push(daysOfTheWeek[i % daysOfTheWeek.length]);
    }

    return !this._isArraysEqual(daysSlice, daysArray);
  }

  getStartOfTheDay(date: Date | null | undefined): Date | undefined {
    if (date) {
      return startOfDay(date);
    }

    return undefined;
  }

  getEndOfTheDay(date: Date | null | undefined): Date | undefined {
    if (date) {
      return endOfDay(date);
    }

    return undefined;
  }

  startOfYear(date: Date | null | undefined): Date | undefined {
    if (date) {
      return startOfYear(date);
    }

    return undefined;
  }

  endOfYear(date: Date | null | undefined): Date | undefined {
    if (date) {
      return endOfYear(date);
    }

    return undefined;
  }

  getStartOfTheMonth(date: Date | null | undefined): Date | undefined {
    if (date) {
      return startOfMonth(date);
    }

    return undefined;
  }

  getEndOfTheMonth(date: Date | null | undefined): Date | undefined {
    if (date) {
      return endOfMonth(date);
    }

    return undefined;
  }

  getClosestDateForDayOfWeek(date: Date | null | undefined, dayName: string, afterOnly?: boolean): Date | undefined {
    const parsedDate = parse(dayName, 'eee', new Date());
    const dayIndex = getDay(parsedDate);

    if (!date) {
      return undefined;
    }

    let resultDate = this.getDateInNDays(startOfWeek(date), dayIndex);

    if (!resultDate) {
      return undefined;
    }

    if (afterOnly && resultDate < date) {
      resultDate = addWeeks(resultDate, 1);
    }

    return resultDate;
  }

  getDateInNDays(date: Date | null | undefined, daysCount: number): Date | undefined {
    if (date) {
      return add(date, {days: daysCount});
    }

    return undefined;
  }

  getDayInDays(day: string, daysCount: number): string {
    const date = parse(day.substr(0, 3), 'EEE', new Date());
    return this.getShortDayOfWeek(this.getDateInNDays(date, daysCount));
  }

  getNextDayOfWeek(day: string): string | undefined {
    const index: number = this.daysOfTheWeekShortNames.indexOf(day);

    if (index < 0) {
      return undefined;
    } else if (index < 6) {
      return this.daysOfTheWeekShortNames[index + 1];
    }

    return this.daysOfTheWeekShortNames[0];
  }

  addYearsToDate(date: Date, years: number): Date | undefined {
    if (!date) {
      return undefined;
    }

    return add(date, {years: years});
  }

  addMonthsToDate(date: Date, months: number): Date | undefined {
    if (!date) {
      return undefined;
    }

    return add(date, {months: months});
  }

  addMinutesToDate(date: Date, minutes: number): Date | undefined {
    if (date) {
      return add(date, {minutes: minutes});
    }

    return undefined;
  };

  addSecondsToDate(date: Date, seconds: number): Date | undefined {
    if (date) {
      return add(date, {seconds: seconds});
    }

    return undefined;
  }

  subtractMinutesFromDate(date: Date, minutes: number): Date | undefined {
    if (date) {
      return add(date, {minutes: -minutes});
    }

    return undefined;
  };

  subtractSecondsFromDate(date: Date, seconds: number): Date | undefined {
    if (date) {
      return add(date, {seconds: -seconds});
    }

    return undefined;
  }

  subtractDaysFromDate(date: Date, days: number): Date | undefined {
    if (date) {
      return add(date, {days: -days});
    }

    return undefined;
  };

  subtractYearsToDate(date: Date, years: number): Date | undefined {
    if (!date) {
      return undefined;
    }

    return add(date, {years: -years});
  }

  addHoursToDate(date: Date, hours: number): Date | undefined {
    if (date) {
      return add(date, {hours: hours});
    }

    return undefined;
  };

  subtractHoursFromDate(date: Date, hours: number): Date | undefined {
    if (date) {
      return add(date, {hours: -hours});
    }

    return undefined;
  };

  format(date: Date, formatString: string): string {
    if (date) {
      return format(date, formatString);
    }

    return '';
  }

  parse(dateString: string, formatString: string): Date {
    return parse(dateString, formatString, new Date());
  }

  parseRelativeDate(dateString: string, baseDate?: Date): Date | undefined {
    if (!dateString) {
      return undefined;
    }

    const firstWordList = ['now', 'weekStart', 'weekEnd', 'monthStart', 'monthEnd', 'yearStart', 'yearEnd'];
    const unitList = ['d'];
    const stateList = {firstWord: 0, firstSpace: 1, sign: 2, secondSpace: 3, number: 4, unit: 5, end: 6};

    let state = stateList.firstWord;
    let i = 0;

    let date: Date | null = null;
    let isInvalid = false;
    let sign = 1;
    let count = 0;

    while (state !== stateList.end && i < dateString.length) {
      if (state === stateList.firstWord) {
        for (const word of firstWordList) {
          if (!dateString.startsWith(word)) {
            continue;
          }

          switch (word) {
            case 'now':
              date = baseDate || new Date();
              break;
            case 'weekStart':
              date = startOfWeek(baseDate || new Date(), {weekStartsOn: 1});
              break;
            case 'weekEnd':
              date = endOfWeek(baseDate || new Date(), {weekStartsOn: 1});
              break;
            case 'monthStart':
              date = startOfMonth(baseDate || new Date());
              break;
            case 'monthEnd':
              date = endOfMonth(baseDate || new Date());
              break;
            case 'yearStart':
              date = startOfYear(baseDate || new Date());
              break;
            case 'yearEnd':
              date = endOfYear(baseDate || new Date());
              break;
            default:
              date = null;
              break;
          }

          if (date) {
            i = word.length;
            break;
          }
        }

        if (date) {
          date = this.getStartOfTheDay(date) as Date;
          state = stateList.firstSpace;
        } else {
          isInvalid = true;
          state = stateList.end;
        }
      } else if (state === stateList.firstSpace || state === stateList.secondSpace) {
        const matchPattern = dateString.slice(i).match(/^(\s)+/);

        if (matchPattern && matchPattern.length > 0 && matchPattern[0]?.length > 0) {
          i += matchPattern[0].length;
        }

        if (state === stateList.firstSpace) {
          state = stateList.sign;
        } else if (state === stateList.secondSpace) {
          state = stateList.number;
        } else {
          state = stateList.end;
        }
      } else if (state === stateList.sign) {
        if (dateString[i] === '+') {
          sign = 1;
          i++;
          state = stateList.secondSpace;
        } else if (dateString[i] === '-') {
          sign = -1;
          i++;
          state = stateList.secondSpace;
        } else {
          isInvalid = true;
          state = stateList.end;
        }
      } else if (state === stateList.number) {
        const matchPattern = dateString.slice(i).match(/^\d+/);

        if (matchPattern && matchPattern.length > 0 && matchPattern[0]?.length > 0) {
          count = parseInt(matchPattern[0], 10);
          i += matchPattern[0].length;

          if (count && isFinite(count)) {
            state = stateList.unit;
          } else {
            isInvalid = true;
            state = stateList.end;
          }
        } else {
          isInvalid = true;
          state = stateList.end;
        }
      } else if (state === stateList.unit) {
        const unitString = dateString.slice(i);

        for (const unit of unitList) {
          if (!unitString.startsWith(unit)) {
            continue;
          }

          switch (unit) {
            case 'd':
              date = this.getDateInNDays(date, sign*count);
              break;
            default:
              isInvalid = true;
              break;
          }

          break;
        }

        state = stateList.end;
      }
    }

    return isInvalid ? null : date;
  }

  getDayOfWeek(date: Date | null): string {
    if (date) {
      return format(date, 'eeee');
    }

    return '';
  }

  getShortDayOfWeek(date: Date | null): string {
    if (date) {
      return format(date, 'eee');
    }

    return '';
  }

  getYear(date: Date): string {
    if (date) {
      return format(date, 'yyyy');
    }

    return '';
  }

  getMonth(date: Date): string {
    if (date) {
      return format(date, 'MMM');
    }

    return '';
  }

  getHour24(date: Date): string {
    if (date) {
      return format(date, 'HH');
    }

    return '';
  }

  getPrevYearSimilarDate(date: Date | null): Date | undefined {
    if (!date) {
      return undefined;
    }

    const targetDayIndex = this.getWeekDayIndex(date);
    const prevYearDate = this.subtractYearsToDate(date, 1);

    const prevYearDayIndex = this.getWeekDayIndex(prevYearDate);
    const indexesDiff = targetDayIndex - prevYearDayIndex;

    return this.getDateInNDays(prevYearDate, indexesDiff);
  }

  parseMonth(value: string): number {
    const date = parse(value, 'MMM', new Date());
    return getMonth(date);
  }

  parseTime(time: string | null | undefined, baseDate?: Date | null | undefined): Date | undefined {
    if (!time) {
      return undefined;
    }

    const resultDate = baseDate ? new Date(baseDate.getTime()) : new Date();

    const group = time.match(/(\d+)(?::(\d\d))?\s*(p?)/i);

    if (!group) {
      return undefined;
    }

    resultDate.setHours(parseInt(group[1], 10) + (group[3] && group[1] !== '12' ? 12 : 0));
    resultDate.setMinutes(parseInt(group[2], 10) || 0);
    resultDate.setSeconds(0);
    resultDate.setMilliseconds(0);

    return resultDate;
  }

  parseSaveDateFormat(dateString: string): Date | undefined {
    if (!dateString) {
      return undefined;
    }

    try {
      return parseISO(dateString);
    } catch (ex) {
      //
    }

    return undefined;
  }

  parseSaveDateFormatUTC(dateString: string): Date | undefined {
    const resultDate = this.parseSaveDateFormat(dateString);
    return this.toUTC(resultDate);
  }

  saveDateFormat(date: Date | null): string | undefined {
    if (date) {
      return format(date, 'yyyy-MM-dd');
    }

    return undefined;
  }

  saveDateFormatUTC(date: Date | null): string | undefined {
    if (date) {
      return format(this.toUTC(date) as Date, 'yyyy-MM-dd');
    }

    return undefined;
  }

  saveDateTimeFormat(date: Date | null): string | undefined {
    if (date) {
      return format(date, `yyyy-MM-dd'T'HH:mm:ssXXX`);
    }

    return undefined;
  }

  saveDateFormatFromRelative(date: Date | string, isDateTime?: boolean, isUtc?: boolean, update?: (arg0: Date | null) => Date):
    string | undefined {
    if (!date) {
      return undefined;
    }

    let dateObj: Date | null = null;

    if (typeof date === 'string') {
      dateObj = this.parseRelativeDate(<string>date);
    } else if (Object.prototype.toString.call(date) === '[object Date]') {
      dateObj = date as Date;
    }

    if (!dateObj || !this.isValidDate(dateObj)) {
      return undefined;
    }

    if (isUtc) {
      dateObj = this.addMinutesToDate(dateObj, dateObj.getTimezoneOffset());
    }

    if (update) {
      dateObj = update(dateObj);
    }

    return isDateTime ? this.saveDateTimeFormat(dateObj) : this.saveDateFormat(dateObj);
  }

  viewDateFormat(date: Date): string {
    if (!date) {
      return '';
    }

    return format(date, 'EEE dd MMM yyyy');
  }

  viewDateFormatUTC(date: Date): string {
    if (!date) {
      return '';
    }

    return format(this.toUTC(date) as Date, 'EEE dd MMM yyyy');
  }

  shortViewDateFormat(date: Date): string {
    if (!date) {
      return '';
    }

    return format(date, 'dd MMM yyyy');
  }

  viewTimeFormat(date: Date | null): string | undefined {
    if (date) {
      return format(date, 'H:mm');
    }

    return undefined;
  }

  viewTimeFormatUTC(date: Date | null): string | undefined {
    if (date) {
      return format(this.toUTC(date) as Date, 'H:mm');
    }

    return undefined;
  }

  viewTimeFormatFull(date: Date): string | undefined {
    if (date) {
      return format(date, 'H:mm:ss xxx');
    }

    return undefined;
  }

  inputDateFormat(date: Date): string | undefined {
    if (date) {
      return format(date, 'dd/MM/yyyy');
    }

    return undefined;
  }

  inputTimeFormat(date: Date): string | undefined {
    if (date) {
      return format(date, 'HH:mm');
    }

    return undefined;
  }

  inputTimeFormatUTC(date: Date): string | undefined {
    if (date) {
      return format(this.toUTC(date) as Date, 'HH:mm');
    }

    return undefined;
  }

  saveTimeFormat(date: Date): string | undefined {
    if (date) {
      let result = format(date, 'hh:mm aa');
      if (result.indexOf('12') === 0 && result.indexOf('AM') !== -1) {
        result = result.replace('12', '00');
      }

      return result;
    }

    return undefined;
  }

  timeStringToViewTimeFormat(time: string): string | undefined {
    const date = this.parseTime(time);
    return this.viewTimeFormat(date);
  }

  timeStringToViewTimeFormatUTC(time: string): string | undefined {
    const date = this.parseTime(time);
    return this.viewTimeFormatUTC(date);
  }

  isNextDay(date1: Date, date2: Date): boolean {
    return differenceInDays(date1, date2) === 1;
  }

  getOffsetInCalendarMonths(date1: Date, date2: Date): number {
    return differenceInCalendarMonths(date1, date2);
  }

  getOffsetInDays(date1: Date, date2: Date | null, precise = false): number | undefined {
    if (!date2) {
      return undefined;
    }

    return differenceInDays(date1, date2);
  }

  getOffsetInHours(date1: Date, date2: Date): number {
    return differenceInHours(date1, date2);
  }

  getOffsetInMinutes(date1: Date, date2: Date): number {
    return differenceInMinutes(date1, date2);
  }

  getOffsetInSeconds(date1: Date, date2: Date): number {
    return differenceInSeconds(date1, date2);
  }

  isDayInDaysRange(day: string, dayFrom: string, dayTo: string): boolean {
    const dayShortName = day && day.length > 2 ? day.slice(0, 3) : null;
    const dayFromShortName = dayFrom && dayFrom.length > 2 ? dayFrom.slice(0, 3) : null;
    const dayToShortName = dayTo && dayTo.length > 2 ? dayTo.slice(0, 3) : null;

    const dayIndex = dayShortName ? this.daysOfTheWeekShortNames.indexOf(dayShortName) : -1;
    const dayFromIndex = dayFromShortName ? this.daysOfTheWeekShortNames.indexOf(dayFromShortName) : -1;
    const dayToIndex = dayToShortName ? this.daysOfTheWeekShortNames.indexOf(dayToShortName) : -1;

    if (dayIndex === -1 || dayFromIndex === -1) {
      return false;
    }

    if (dayToIndex === dayFromIndex || dayToIndex === -1) {
      return dayIndex === dayFromIndex;
    } else if (dayToIndex > dayFromIndex) {
      return dayIndex >= dayFromIndex && dayIndex <= dayToIndex;
    } else {
      return dayIndex >= dayFromIndex || dayIndex <= dayToIndex;
    }
  };

  getNextDayOfWeekName(dayOfWeekName: string): string {
    let index = this.daysOfTheWeek.indexOf(dayOfWeekName);
    if (index === -1) {
      throw 'impossible day of week';
    }

    if (index === this.daysOfTheWeek.length - 1) {
      return this.daysOfTheWeek[0];
    }

    return this.daysOfTheWeek[index + 1];
  };

  getWeekDayIndex(date: Date | null): number {
    const dayOfWeek = this.getDayOfWeek(date);
    return this.daysOfTheWeek.indexOf(dayOfWeek);
  }

  isDayOfWeekName(value: string): boolean {
    const index = this.daysOfTheWeek.indexOf(value);
    return index !== -1;
  }

  getDetailedDateObject(date: Date | string): any {
    if (!date) {
      return undefined;
    }

    const targetDate = typeof date === 'string' ? this.parseSaveDateFormat(date) : date;

    if (!targetDate) {
      return undefined;
    }

    return {
      year: getYear(targetDate),
      month: this.getMonth(targetDate),
      day: format(targetDate, 'eee'),
      time: this.inputTimeFormat(targetDate),
      hour: parseInt(format(targetDate, 'HH'), 10),
    };
  }

  isDateInCurrentMonth(date: Date | string): boolean | undefined {
    if (!date) {
      return undefined;
    }

    const targetDate = typeof date === 'string' ? this.parseSaveDateFormat(date) : date;
    const currentDate = new Date();

    return isWithinInterval(targetDate as Date, {
      start: startOfMonth(currentDate),
      end: endOfMonth(currentDate),
    });
  }

  toUTC(date: Date | null): Date | undefined {
    if (!date) {
      return undefined;
    }

    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(),
      date.getMinutes(), date.getSeconds(), date.getMilliseconds()));

    // date.setTime(date.getTime() + date.getTimezoneOffset() * 60 * 1000);
  }

  setISODay(date: Date, dayIndex: number): Date {
    return setISODay(date, dayIndex);
  }

  isValidDate(date: Date): boolean {
    return isValid(date);
  }

  substractYearsToDate(date: Date, years: number): Date {
    if (!date) {
      return null;
    }

    return add(date, {years: -years});
  }

  private _isArraysEqual(a: Array<any>, b: Array<any>): boolean {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) {
      return false;
    }

    for (let i = 0; i < a.length; ++i) {
      if (a[i] !== b[i]) {
        return false;
      }
    }

    return true;
  }
}
