import { Pipe, PipeTransform } from '@angular/core';
import {dateDiff} from "../helper/date";

@Pipe({
  name: 'dateDiff'
})
export class DateDiffPipe implements PipeTransform {

  transform(start: Date | string, end: Date | string): number {
    if (typeof start === 'string') {
      start = new Date(start);
    }
    if (typeof end === 'string') {
      end = new Date(end);
    }
    return dateDiff(start, end);
  }

}
