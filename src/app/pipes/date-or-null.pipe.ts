import {Injectable, Pipe, PipeTransform} from '@angular/core';
import {getBrowserLanguages} from "../helper/language";

@Injectable({
  providedIn: "root",
})
@Pipe({
  name: 'dateOrNull'
})
export class DateOrNullPipe implements PipeTransform {
  transform(value: Date | string | null, labelOnNull: string | null = null, dateStyle: "full" | "long" | "medium" | "short" | null = null): string {
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
      dateStyle: dateStyle ?? undefined,
    }).format(value);
  }
}
