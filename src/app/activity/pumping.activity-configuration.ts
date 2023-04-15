import {ActivityConfiguration, getDefaultIsRunning, getDefaultLastActivityAt} from "./activity-configuration";
import {Observable} from "rxjs";
import {Injectable} from "@angular/core";
import {TranslateService} from "@ngx-translate/core";
import {DatabaseService} from "../services/database.service";
import {ActivityType} from "../enum/activity-type.enum";
import {ActivityStreamService} from "../services/activity-stream.service";

@Injectable({
  providedIn: 'root',
})
export class PumpingActivityConfiguration implements ActivityConfiguration {
  color: string = '#00897b';
  displayName: Observable<boolean> = this.translator.get('Pumping');
  isRunning: Observable<boolean> = getDefaultIsRunning(this.database, [ActivityType.Pumping]);
  lastActivityAt: Observable<Date | null> = getDefaultLastActivityAt(this.activityStreamService, [ActivityType.Pumping]);
  link: string = 'activities/pumping';

  constructor(
    private readonly translator: TranslateService,
    private readonly database: DatabaseService,
    private readonly activityStreamService: ActivityStreamService,
  ) {
  }
}
