import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'timeOrNull'
})
export class TimeOrNullPipe implements PipeTransform {
  transform(value: Date | string | null, labelOnNull: string | null = null): string {
    if (value === null) {
      if (labelOnNull === null) {
        throw new Error("Label cannot be null for null values");
      }
      return labelOnNull;
    }

    if (typeof value === 'string') {
      value = new Date(value);
    }

    return new Intl.DateTimeFormat(navigator.languages.concat(), {
      dateStyle: undefined,
      timeStyle: 'short'
    }).format(value);
  }
}
