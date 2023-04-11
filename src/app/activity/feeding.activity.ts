import {Activity} from "./activity";
import {Injectable} from "@angular/core";
import {TranslateService} from "@ngx-translate/core";
import {forkJoin, from, interval, switchMap} from "rxjs";
import {DatabaseService} from "../services/database.service";
import {map, zip} from "rxjs/operators";
import {ActivityType} from "../enum/activity-type.enum";

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
    )),
    map(
      ([bottle, nursing]) =>
        bottle !== null || nursing !== null
    ),
  );

  constructor(
    private readonly translator: TranslateService,
    private readonly database: DatabaseService,
  ) {
  }
}
