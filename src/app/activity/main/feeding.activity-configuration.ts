import {ActivityConfiguration, getDefaultIsRunning, getDefaultLastActivityAt} from "../activity-configuration";
import {Injectable} from "@angular/core";
import {TranslateService} from "@ngx-translate/core";
import {DatabaseService} from "../../services/database.service";
import {ActivityType} from "../../enum/activity-type.enum";
import {ActivityStreamService} from "../../services/activity-stream.service";
import {ApiService} from "../../services/api.service";
import {toObservable} from "../../helper/observables";
import {switchMap} from "rxjs/operators";
import {CalculateActivitySince, ParentalUnitSetting} from "../../enum/parental-unit-setting.enum";

@Injectable({
  providedIn: 'root',
})
export class FeedingActivityConfiguration implements ActivityConfiguration {

  color = '#f48fb1';
  displayName = this.translator.get('Feeding');
  link = '/activities/feeding';
  isRunning = getDefaultIsRunning(
    this.database,
    [ActivityType.FeedingBreast, ActivityType.FeedingBottle, ActivityType.FeedingSolid],
  );
  lastActivityAt = toObservable(this.api.getSettings())
    .pipe(
      switchMap(settings => {
        return getDefaultLastActivityAt(
          this.activityStreamService,
          [ActivityType.FeedingSolid, ActivityType.FeedingBottle, ActivityType.FeedingBreast],
          {
            useDate: (<CalculateActivitySince>settings[ParentalUnitSetting.CalculateFeedingSince]) === CalculateActivitySince.Start
              ? "startDate"
              : "endDate",
            joinInterval: <number>settings[ParentalUnitSetting.FeedingBreakLength] * 60,
          },
        );
      }),
    );

  constructor(
    private readonly translator: TranslateService,
    private readonly database: DatabaseService,
    private readonly activityStreamService: ActivityStreamService,
    private readonly api: ApiService,
  ) {
  }
}
