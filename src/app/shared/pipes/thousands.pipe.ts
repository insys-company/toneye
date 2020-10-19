import { Pipe, PipeTransform } from '@angular/core';


/**
 * Example:
 * 1000 | value
 * returns:
 * 1 000
 */
@Pipe({
  name: 'thousandspipe',
  pure: true
})
export class ThousandsPipe implements PipeTransform {
  transform(value: number | string) {
    if (value == null) {
      return '0';
    }
    if (typeof value === 'string') {
      value = parseInt(value, 10);
    }
    if (value) {
      let str = String(value);
      if (str.length > 3) {
        let mass = str.split('');
        str = mass.reverse().join('');
        str = str.replace(/(\d{3})/g, '$1 ');
        mass = str.split('');
        str = mass.reverse().join('').trim();
        return str;
      } else { return str; }
    } else { return '0'; }
  }
}
