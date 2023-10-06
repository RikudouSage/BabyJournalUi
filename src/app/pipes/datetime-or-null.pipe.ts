import { Pipe, PipeTransform } from '@angular/core';
import {getBrowserLanguages} from "../helper/language";

@Pipe({
  name: 'datetimeOrNull'
})
export class DatetimeOrNullPipe implements PipeTransform {

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

    return new Intl.DateTimeFormat(getBrowserLanguages(), {
      dateStyle: "medium",
      timeStyle: 'short'
    }).format(value);
  }

}
