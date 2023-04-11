import { Pipe, PipeTransform } from '@angular/core';
import {Observable, zip} from "rxjs";
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

  transform(value: number): Observable<string> {
    const hourToSeconds = 60 * 60;
    const minuteToSeconds = 60;

    const hours = Math.floor(value / hourToSeconds);
    let remainder = value % hourToSeconds;
    const minutes = Math.floor(remainder / minuteToSeconds);
    remainder = remainder % minuteToSeconds;
    const seconds = remainder;

    if (!hours && !minutes) {
      return this.translator.get('{{count}} seconds', {count: seconds});
    }

    const strings: Observable<string>[] = [];
    if (hours) {
      strings.push(this.translator.get('{{count}} hours', {count: hours}));
    }
    if (minutes) {
      strings.push(this.translator.get('{{count}} minutes', {count: minutes}));
    }
    strings.push(this.translator.get('and'));

    return zip(...strings)
      .pipe(
        map(values => {
          const joinString = values.pop();
          return values.join(` ${joinString} `);
        })
      )
  }

}
