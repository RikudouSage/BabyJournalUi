import {Activity, getDefaultLastActivityAt} from "./activity";
import {Injectable} from "@angular/core";
import {TranslateService} from "@ngx-translate/core";
import {forkJoin, from, iif, interval, of, startWith, switchMap, tap} from "rxjs";
import {DatabaseService} from "../services/database.service";
import {map} from "rxjs/operators";
import {ActivityType} from "../enum/activity-type.enum";
import {ApiService} from "../services/api.service";

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
  isRunning = interval(10_000).pipe(
    startWith(0),
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
  lastActivityAt = interval(60_000).pipe(
    startWith(0),
    switchMap(() => from(this.database.getLastActivityDate(ActivityType.FeedingBottle))),
    switchMap(value => iif(
      () => value === null,
      getDefaultLastActivityAt(this.api.getActivityStream(), [ActivityType.FeedingSolid, ActivityType.FeedingBottle, ActivityType.FeedingBreast]),
      of(value),
    )),
    tap(value => {
      let subscription = getDefaultLastActivityAt(
        this.api.getActivityStream(),
        [ActivityType.FeedingSolid, ActivityType.FeedingBottle, ActivityType.FeedingBreast],
      ).subscribe(value => {
        subscription.unsubscribe();
        if (value === null) {
          return;
        }
        this.database.saveLastActivityDate(ActivityType.FeedingBreast, value);
        this.database.saveLastActivityDate(ActivityType.FeedingBottle, value);
        this.database.saveLastActivityDate(ActivityType.FeedingSolid, value);
      });
    }),
  );
  // from(this.database.getLastActivityDate(ActivityType.FeedingBottle))
  // .pipe(
  //   tap(() => {
  //     let subscription = getDefaultLastActivityAt(
  //       this.api.getActivityStream(),
  //       [ActivityType.FeedingSolid, ActivityType.FeedingBottle, ActivityType.FeedingBreast],
  //       1_000,
  //     ).subscribe(value => {
  //     })
  //   }),
  // )

  constructor(
    private readonly translator: TranslateService,
    private readonly database: DatabaseService,
    private readonly api: ApiService,
  ) {
  }
}
