import {from, interval, Observable, startWith, switchMap} from "rxjs";
import {ActivityType} from "../enum/activity-type.enum";
import {map} from "rxjs/operators";
import {ActivityStream, ActivityStreamItem} from "../services/activity-stream.service";

export function getDefaultLastActivityAt(
  activityStream: Observable<Promise<ActivityStream>>,
  types: ActivityType[],
  timeInterval = 60_000,
): Observable<Date | null> {
  return interval(timeInterval).pipe(
    startWith(0),
    switchMap(() => activityStream),
    switchMap(value => from(value)),
    map(stream => {
      if (!stream.length) {
        return null;
      }
      const filtered = stream.filter(item => types.indexOf(item.activityType) > -1);

      if (!filtered.length) {
        return null;
      }

      return filtered.reduce((previousValue, currentValue): ActivityStreamItem => {
        const previousDate = new Date(previousValue.startTime);
        const currentDate = new Date(currentValue.activityType);

        return previousDate.getTime() > currentDate.getTime() ? currentValue : previousValue;
      });
    }),
    map(value => value !== null ? new Date(value.startTime) : null),
  )
}

export interface Activity {
  isRunning: Observable<boolean> | Promise<boolean>;
  displayName: Observable<boolean> | Promise<boolean>;
  color: string;
  link: string;
  lastActivityAt: Observable<Date | null>;
}
