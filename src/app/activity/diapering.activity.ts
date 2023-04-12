import {Activity, getDefaultLastActivityAt} from "./activity";
import {TranslateService} from "@ngx-translate/core";
import {Injectable} from "@angular/core";
import {from, iif, interval, of, startWith, switchMap, tap} from "rxjs";
import {ApiService} from "../services/api.service";
import {ActivityType} from "../enum/activity-type.enum";
import {DatabaseService} from "../services/database.service";

@Injectable({
  providedIn: 'root',
})
export class DiaperingActivity implements Activity {

  color = '#d500f9';
  displayName = this.translator.get('Diapering');
  link = '/activities/diapering';
  isRunning = of(false);
  lastActivityAt = interval(60_000).pipe(
    startWith(0),
    switchMap(() => from(this.database.getLastActivityDate(ActivityType.Diapering))),
    switchMap(value => iif(
      () => value === null,
      getDefaultLastActivityAt(this.api.getActivityStream(), [ActivityType.Diapering]),
      of(value),
    )),
    tap(value => {
      let subscription = getDefaultLastActivityAt(
        this.api.getActivityStream(),
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
    private readonly api: ApiService,
    private readonly database: DatabaseService,
  ) {
  }

}
