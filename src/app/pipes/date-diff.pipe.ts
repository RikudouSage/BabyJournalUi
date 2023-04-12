import { Pipe, PipeTransform } from '@angular/core';
import {dateDiff} from "../helper/date";

@Pipe({
  name: 'dateDiff'
})
export class DateDiffPipe implements PipeTransform {

  transform(start: Date | string | null, end: Date | string = new Date()): number {
    start ??= new Date();
    if (typeof start === 'string') {
      start = new Date(start);
    }
    if (typeof end === 'string') {
      end = new Date(end);
    }
    console.log(start, end);
    return dateDiff(start, end);
  }

}
