import { Pipe, PipeTransform } from '@angular/core';
import {forkJoin, Observable, of, zip} from "rxjs";
import {TranslateService} from "@ngx-translate/core";
import {map} from "rxjs/operators";

@Pipe({
  name: 'secondsToDurationString'
})
export class SecondsToDurationStringPipe implements PipeTransform {
  constructor(
    private readonly translator: TranslateService,
  ) {
  }

  transform(value: number, format: 'short' | 'long' = 'long'): Observable<string> {
    const hourToSeconds = 60 * 60;
    const minuteToSeconds = 60;

    const hours = Math.floor(value / hourToSeconds);
    let remainder = value % hourToSeconds;
    const minutes = Math.floor(remainder / minuteToSeconds);
    remainder = remainder % minuteToSeconds;
    const seconds = remainder;

    if (!hours && !minutes) {
      return format === 'short'
        ? this.translator.get('{{count}}m', {count: 0})
        : this.translator.get('{{count}} seconds', {count: seconds});
    }

    const strings: Observable<string>[] = [];
    if (hours) {

      strings.push(
        format === 'short'
          ? this.translator.get('{{count}}h', {count: hours})
          : this.translator.get('{{count}} hours', {count: hours})
      );
    }
    if (minutes) {
      strings.push(
        format === 'short'
          ? this.translator.get('{{count}}m', {count: minutes})
          : this.translator.get('{{count}} minutes', {count: minutes})
      );
    }
    strings.push(
      format === 'short'
        ? of('')
        : this.translator.get('and').pipe(
          map(value => ` ${value} `),
        )
    );

    return zip(...strings)
      .pipe(
        map(values => {
          const joinString = values.pop();
          return values.join(`${joinString}`);
        })
      )
  }

}
