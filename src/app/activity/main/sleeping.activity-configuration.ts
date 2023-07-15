import {ActivityConfiguration, getDefaultIsRunning, getDefaultLastActivityAt} from "../activity-configuration";
import {Injectable} from "@angular/core";
import {TranslateService} from "@ngx-translate/core";
import {Observable} from "rxjs";
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
export class SleepingActivityConfiguration implements ActivityConfiguration {
  readonly color = '#1a237e';
  readonly displayName = this.translator.get('Sleeping');
  readonly link = '/activities/sleeping';
  readonly isRunning = getDefaultIsRunning(this.inProgressManager, [ActivityType.Sleeping]);
  readonly lastActivityAt: Observable<Date | null> = toObservable(this.api.getSettings())
    .pipe(
      switchMap(settings => {
        return getDefaultLastActivityAt(
          this.activityStream,
          [ActivityType.Sleeping],
          {
            useDate: (<CalculateActivitySince>settings[ParentalUnitSetting.CalculateSleepingSince]) === CalculateActivitySince.Start
              ? "startDate"
              : "endDate",
          },
        );
      }),
    );

  constructor(
    private readonly translator: TranslateService,
    private readonly inProgressManager: InProgressManager,
    private readonly activityStream: ActivityStreamService,
    private readonly api: ApiService,
  ) {
  }
}
