import { Pipe, PipeTransform } from '@angular/core';
import {Observable} from "rxjs";
import {TranslateService} from "@ngx-translate/core";
import {map} from "rxjs/operators";
import {DateOrNullPipe} from "./date-or-null.pipe";

@Pipe({
  name: 'relativeDate'
})
export class RelativeDatePipe implements PipeTransform {
  constructor(
    private readonly translator: TranslateService,
    private readonly datePipe: DateOrNullPipe,
  ) {
  }
  transform(value: Date | string, uppercaseFirst: boolean = false): Observable<string> {
    if (typeof value === 'string') {
      value = new Date(value);
    }

    const now = new Date();
    const yesterday = new Date(now.getTime() - 86_400_000);

    const minToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0).getTime();
    const maxToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).getTime();

    const minYesterday = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 0, 0, 0).getTime();
    const maxYesterday = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59).getTime();

    const uppercaseFirstMap = map(
      (value: string) => uppercaseFirst ? value.charAt(0).toUpperCase() + value.substring(1) : value,
    );

    const valueTimestamp = value.getTime();
    if (valueTimestamp >= minToday && valueTimestamp <= maxToday) {
      return this.translator.get('today').pipe(uppercaseFirstMap);
    }

    if (valueTimestamp >= minYesterday && valueTimestamp <= maxYesterday) {
      return this.translator.get('yesterday').pipe(uppercaseFirstMap);
    }

    return this.translator.get('on {{date}}', {
      date: this.datePipe.transform(value),
    }).pipe(uppercaseFirstMap);
  }

}
