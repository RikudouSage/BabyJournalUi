import {Pipe, PipeTransform} from '@angular/core';
import {Observable} from "rxjs";
import {map} from "rxjs/operators";

@Pipe({
  name: 'lowercaseFirst'
})
export class LowercaseFirstPipe implements PipeTransform {

  transform<T extends string|Observable<string>|null>(value: T): T {
    if (value === null) {
      return value;
    }

    const handler = (value: string): string => {
      if (value.length === 1) {
        return value.toLowerCase();
      }

      return value.charAt(0).toLowerCase() + value.substring(1);
    }

    if (typeof value === 'string') {
      return <T>handler(value);
    }

    return <T>value.pipe(
      map(value => handler(value)),
    );
  }

}
