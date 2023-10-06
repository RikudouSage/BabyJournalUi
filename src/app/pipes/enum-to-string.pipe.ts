import { Pipe, PipeTransform } from '@angular/core';
import {Observable} from "rxjs";

@Pipe({
  name: 'enumToString'
})
export class EnumToStringPipe implements PipeTransform {

  transform<T>(value: T, converter: (enumCase: T) => Observable<string>): Observable<string> {
    return converter(value);
  }

}
