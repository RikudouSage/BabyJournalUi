import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'elapsedTime'
})
export class ElapsedTimePipe implements PipeTransform {

  transform(value: number | null): string {
    value ??= 0;

    const hourToSeconds = 60 * 60;
    const minuteToSeconds = 60;

    const hours = Math.floor(value / hourToSeconds);
    let remainder = value % hourToSeconds;
    const minutes = Math.floor(remainder / minuteToSeconds);
    remainder = remainder % minuteToSeconds;
    const seconds = remainder;

    let result = `${this.zeroPad(minutes)}:${this.zeroPad(seconds)}`;
    if (hours) {
      result = `${this.zeroPad(hours)}:${result}`;
    }

    return result;
  }

  private zeroPad(value: number): string {
    if (value < 10) {
      return `0${value}`;
    }

    return String(value);
  }

}
