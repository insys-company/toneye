import * as moment from 'moment';
import 'moment-timezone';

export class DateTime {
  private static isoDateFormat = 'YYYY-MM-DD HH:mm:ss';
  private static localTimezone = 'UTC';
  private static utcTimezone = 'UTC';
  private utcTimeUnix: number;

  constructor (
    unixUtcTime?: number
  ) {
      this.utcTimeUnix = unixUtcTime != null
        ? this.utcTimeUnix = unixUtcTime
        : Math.round(new Date().getTime() / 1000);
  }


  static fromSeconds(seconds: number): Date {
    const zeroDate = new Date(1970, 0, 0);
    zeroDate.setSeconds(seconds || 0);
    return zeroDate;
  }

  static toSeconds(date: Date): number {
    const zeroDate = new Date(1970, 0, 0);
    return (date.getTime() - zeroDate.getTime()) / 1000;
  }

  /**Date in CET timezone */
  static fromLocalDate(date: Date): DateTime {
    const unixTime = moment(date).utc().unix();
    return new DateTime(Math.round(unixTime));
  }

  static roundToDate(date: Date) {
    const local = DateTime.fromLocalDate(date).toLocalMoment();
    const today = local
      .subtract(local.hours(), 'hours')
      .subtract(local.minutes(), 'minutes')
      .subtract(local.seconds(), 'seconds')
      .subtract(local.milliseconds(), 'milliseconds');

    return today;
  }


  formatLocal(formatString: string) {
    return this.toLocalMoment().format(formatString);
  }

  toLocalMoment() {
    return moment(this.toUtcMoment().local()
    .format(DateTime.isoDateFormat));
  }

  toUtcMoment() {
    return moment.tz(this.utcTimeUnix * 1000, DateTime.utcTimezone);
  }

  toLocalDate() {
    return this.toLocalMoment().toDate();
  }

  toUtcDate() {
    return this.toUtcMoment().toDate();
  }

  toUtcUnix() {
    return this.utcTimeUnix;
  }

  roundToUtcDateMoment() {
    const d = this.toLocalMoment();
    return d
      .subtract(d.hours())
      .subtract(d.minutes())
      .subtract(d.seconds())
      .subtract(d.milliseconds())
      .utc();
  }

  getDifferenceInDays(timestamp1: number, timestamp2: number): number {
    const timeOneDay = 86400;
    const timeDiff = timestamp2 - timestamp1;
    let diffDays;
    if (timeDiff > timeOneDay) {
      diffDays = Math.ceil(timeDiff / timeOneDay);
    } else if (timeDiff < -timeOneDay) {
      diffDays = Math.floor(timeDiff / timeOneDay);
    } else {
      diffDays = 0;
    }
    return diffDays;
  }

  getDateAfterAdd(timestamp1: number, timestamp2: number): number {
    return new DateTime(timestamp1).toUtcMoment().add(+timestamp2, 'day').valueOf() / 1000;
  }
}
