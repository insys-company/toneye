import { Pipe, PipeTransform } from '@angular/core';
import { DateTime } from '../utils';
import * as _ from 'underscore';

/*
* Convert unix-formatted datetime value to string
* Takes format argument that defaults to DD.MM.YYYY HH:mm
* Example:
* 1484562317 | unixdate
* returns:
* 16.01.2017 10:25 CET
*/
@Pipe({
  name: 'unixdate',
  pure: true
})
export class UnixDatePipe implements PipeTransform {
  private listMonth = {
    'January': 'январь',
    'February': 'февраль',
    'March': 'март',
    'April': 'апрель',
    'May': 'май',
    'June': 'июнь',
    'July': 'июль',
    'August': 'август',
    'September': 'сентябрь',
    'October': 'октябрь',
    'November': 'ноябрь',
    'December': 'декабрь',
  };
  transform(timestamp: number, format?: string, note?: boolean, daysAdd?: number, ruMonth?: boolean) {
    if (!timestamp) {
      return null;
    }
    const f = format ? format : 'DD.MM.YY HH:mm';
    const n = note ? note : false;

    if (daysAdd) {
      timestamp = this.getDateAfterAdd(timestamp, daysAdd);
    }
    if (note) {
      const diffDays = this.getDifferenceInDays(Math.round(+new Date() / 1000), timestamp);
      return new DateTime(timestamp).formatLocal(f) + ' (' + 'something' + ')';
    } else {
      
      if (ruMonth) {
        const y = new DateTime(timestamp).formatLocal('YYYY');
        const m = new DateTime(timestamp).formatLocal('MMMM');
        const ruName = _.find(this.listMonth, (ruM: string, enM: string) => {
          return m === enM;
        });

        if (ruName != null) {
          return (ruName + ' ' + y).toUpperCase();
        }
        return new DateTime(timestamp).formatLocal(f);
      } else {
        return new DateTime(timestamp).formatLocal(f);
      }
    }
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
