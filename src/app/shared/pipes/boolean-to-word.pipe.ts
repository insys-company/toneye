import { Pipe, PipeTransform } from '@angular/core';
import { LocaleText } from 'src/locale/locale';

@Pipe({
  name: 'booleanToWord',
})
export class BooleanToWordPipe implements PipeTransform {
  transform(value: boolean): string {
    return value ? LocaleText.yes : LocaleText.no;
  }
}
