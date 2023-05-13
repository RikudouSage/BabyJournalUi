import {forkJoin, from, interval, Observable, startWith, switchMap} from "rxjs";
import {ActivityType} from "../enum/activity-type.enum";
import {map} from "rxjs/operators";
import {ActivityStreamItem, ActivityStreamService} from "../services/activity-stream.service";
import {DatabaseService} from "../services/database.service";
import {dateDiff} from "../helper/date";

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
  options: {
    timeInterval?: number,
    useDate?: 'startDate' | 'endDate',
    maxTimeAgo?: number,
  } = {},
): Observable<Date | null> {
  options.timeInterval ??= 60_000;
  options.useDate ??= 'startDate';
  options.maxTimeAgo ??= 2 * 24 * 60 * 60; // 2 days

  return interval(options.timeInterval).pipe(
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
        const previousDate = new Date(
          options.useDate === 'endDate'
            ? (previousValue.endTime ?? previousValue.startTime)
            : previousValue.startTime
        );
        const currentDate = new Date(currentValue.activityType);

        return previousDate.getTime() > currentDate.getTime() ? currentValue : previousValue;
      });
    }),
    map(value => {
      if (value === null) {
        return null;
      }
      const date = new Date(
        options.useDate === 'endDate'
          ? (value.endTime ?? value.startTime)
          : value.startTime,
      );
      const now = new Date();

      if (dateDiff(date, now) > <number>options.maxTimeAgo) {
        return null;
      }

      return date;
    }),
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
