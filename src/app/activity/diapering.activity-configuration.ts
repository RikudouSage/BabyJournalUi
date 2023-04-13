import {ActivityConfiguration, getDefaultLastActivityAt} from "./activity-configuration";
import {TranslateService} from "@ngx-translate/core";
import {Injectable} from "@angular/core";
import {from, iif, interval, of, startWith, switchMap, tap} from "rxjs";
import {ActivityType} from "../enum/activity-type.enum";
import {DatabaseService} from "../services/database.service";
import {ActivityStreamService} from "../services/activity-stream.service";

@Injectable({
  providedIn: 'root',
})
export class DiaperingActivityConfiguration implements ActivityConfiguration {

  color = '#d500f9';
  displayName = this.translator.get('Diapering');
  link = '/activities/diapering';
  isRunning = of(false);
  lastActivityAt = interval(60_000).pipe(
    startWith(0),
    switchMap(() => from(this.database.getLastActivityDate(ActivityType.Diapering))),
    switchMap(value => iif(
      () => value === null,
      getDefaultLastActivityAt(this.activityStreamService.getActivityStream(), [ActivityType.Diapering]),
      of(value),
    )),
    tap(value => {
      let subscription = getDefaultLastActivityAt(
        this.activityStreamService.getActivityStream(),
        [ActivityType.Diapering],
      ).subscribe(value => {
        subscription.unsubscribe();
        if (value === null) {
          return;
        }
        this.database.saveLastActivityDate(ActivityType.Diapering, value);
      });
    }),
  );
  constructor(
    private readonly translator: TranslateService,
    private readonly database: DatabaseService,
    private readonly activityStreamService: ActivityStreamService,
  ) {
  }

  reloadStatus(): void {
  }

}
