import {forkJoin, from, interval, Observable, startWith, switchMap} from "rxjs";
import {ActivityType} from "../enum/activity-type.enum";
import {map} from "rxjs/operators";
import {ActivityStreamItem, ActivityStreamService} from "../services/activity-stream.service";
import {DatabaseService} from "../services/database.service";

export function getDefaultIsRunning(
  database: DatabaseService,
  types: ActivityType[],
  timeInterval = 10_000,
): Observable<boolean> {
  return interval(timeInterval).pipe(
    startWith(0),
    switchMap(() => {
      const inProgress = types.map(activityType => from(database.getInProgress(activityType)));
      return forkJoin(...inProgress);
    }),
    map(results => {
      for (const result of results) {
        if (result !== null) {
          return true;
        }
      }
      return false;
    }),
  );
}

export function getDefaultLastActivityAt(
  activityStream: ActivityStreamService,
  types: ActivityType[],
  timeInterval = 60_000,
): Observable<Date | null> {
  return interval(timeInterval).pipe(
    startWith(0),
    switchMap(() => activityStream.getActivityStream()),
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

export interface ActivityConfiguration {
  isRunning: Observable<boolean> | Promise<boolean>;
  displayName: Observable<boolean> | Promise<boolean>;
  color: string;
  link: string;
  lastActivityAt: Observable<Date | null>;

  // reloadStatus(): void;
}
