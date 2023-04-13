import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'uppercaseFirst'
})
export class UppercaseFirstPipe implements PipeTransform {

  transform(value: string | null): string {
    if (value === '' || value === null) {
      return '';
    }
    if (value.length === 1) {
      return value.toUpperCase();
    }
    return value.charAt(0).toUpperCase() + value.substring(1);
  }

}
