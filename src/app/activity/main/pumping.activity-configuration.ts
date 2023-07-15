import {ActivityConfiguration, getDefaultIsRunning, getDefaultLastActivityAt} from "../activity-configuration";
import {Observable} from "rxjs";
import {Injectable} from "@angular/core";
import {TranslateService} from "@ngx-translate/core";
import {ActivityType} from "../../enum/activity-type.enum";
import {ActivityStreamService} from "../../services/activity-stream.service";
import {toObservable} from "../../helper/observables";
import {switchMap} from "rxjs/operators";
import {CalculateActivitySince, ParentalUnitSetting} from "../../enum/parental-unit-setting.enum";
import {ApiService} from "../../services/api.service";
import {InProgressManager} from "../../services/in-progress-manager.service";

@Injectable({
  providedIn: 'root',
})
export class PumpingActivityConfiguration implements ActivityConfiguration {
  color: string = '#00897b';
  displayName: Observable<boolean> = this.translator.get('Pumping');
  isRunning: Observable<boolean> = getDefaultIsRunning(this.inProgressManager, [ActivityType.Pumping]);
  link: string = 'activities/pumping';
  lastActivityAt = toObservable(this.api.getSettings())
    .pipe(
      switchMap(settings => {
        return getDefaultLastActivityAt(
          this.activityStreamService,
          [ActivityType.Pumping],
          {
            useDate: (<CalculateActivitySince>settings[ParentalUnitSetting.CalculatePumpingSince]) === CalculateActivitySince.Start
              ? "startDate"
              : "endDate",
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
