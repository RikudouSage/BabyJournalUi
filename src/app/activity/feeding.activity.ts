import {Activity} from "./activity";
import {Injectable} from "@angular/core";
import {TranslateService} from "@ngx-translate/core";
import {filter, forkJoin, from, interval, mergeMap, Observable, of, reduce, retry, switchMap} from "rxjs";
import {DatabaseService} from "../services/database.service";
import {map} from "rxjs/operators";
import {ActivityType} from "../enum/activity-type.enum";
import {ActivityStreamItem, ApiService} from "../services/api.service";

@Injectable({
  providedIn: 'root',
})
export class FeedingActivity implements Activity {

  color = '#f48fb1';
  displayName = this.translator.get('Feeding');
  link = '/activities/feeding';
  // isRunning = from(this.database.getInProgress(ActivityType.Feeding)).pipe(
  //   map(value => value !== null),
  // );
  isRunning = interval(1_000).pipe(
    switchMap(() => forkJoin(
      from(this.database.getInProgress(ActivityType.FeedingBottle)),
      from(this.database.getInProgress(ActivityType.FeedingBreast)),
      from(this.database.getInProgress(ActivityType.FeedingSolid)),
    )),
    map(
      ([bottle, nursing, solid]) =>
        bottle !== null || nursing !== null || solid !== null
    ),
  );
  lastActivityAt: Observable<Date | null> = this.api.getActivityStream().pipe(
    switchMap(value => from(value)),
    map(stream => {
      return stream
        .filter(item => [ActivityType.FeedingSolid, ActivityType.FeedingBreast, ActivityType.FeedingBottle].indexOf(item.activityType) > -1)
        .reduce((previousValue, currentValue): ActivityStreamItem => {
          const previousDate = new Date(previousValue.startTime);
          const currentDate = new Date(currentValue.activityType)

          return previousDate.getTime() > currentDate.getTime() ? previousValue : currentValue;
        });
    }),
    map(value => new Date(value.startTime)),
  );

  constructor(
    private readonly translator: TranslateService,
    private readonly database: DatabaseService,
    private readonly api: ApiService,
  ) {
  }
}
