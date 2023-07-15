import {ActivityConfiguration, getDefaultIsRunning, getDefaultLastActivityAt} from "../activity-configuration";
import {Injectable} from "@angular/core";
import {TranslateService} from "@ngx-translate/core";
import {ActivityType} from "../../enum/activity-type.enum";
import {ActivityStreamService, BottleFeedingActivityStreamItem} from "../../services/activity-stream.service";
import {ApiService} from "../../services/api.service";
import {toObservable} from "../../helper/observables";
import {switchMap} from "rxjs/operators";
import {CalculateActivitySince, ParentalUnitSetting} from "../../enum/parental-unit-setting.enum";
import {InProgressManager} from "../../services/in-progress-manager.service";

@Injectable({
  providedIn: 'root',
})
export class FeedingActivityConfiguration implements ActivityConfiguration {

  color = '#f48fb1';
  displayName = this.translator.get('Feeding');
  link = '/activities/feeding';
  isRunning = getDefaultIsRunning(
    this.inProgressManager,
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
            ignoreIf: item => {
              if (settings[ParentalUnitSetting.ConsiderWaterFeeding]) {
                return false;
              }
              return (<BottleFeedingActivityStreamItem>item).bottleContentType === 'Water';
            },
          },
        );
      }),
    );

  constructor(
    private readonly translator: TranslateService,
    private readonly inProgressManager: InProgressManager,
    private readonly activityStreamService: ActivityStreamService,
    private readonly api: ApiService,
  ) {
  }
}
