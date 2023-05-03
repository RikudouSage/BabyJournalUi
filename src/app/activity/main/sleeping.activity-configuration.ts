import {ActivityConfiguration, getDefaultIsRunning, getDefaultLastActivityAt} from "../activity-configuration";
import {Injectable} from "@angular/core";
import {TranslateService} from "@ngx-translate/core";
import {Observable} from "rxjs";
import {DatabaseService} from "../../services/database.service";
import {ActivityType} from "../../enum/activity-type.enum";
import {ActivityStreamService} from "../../services/activity-stream.service";

@Injectable({
  providedIn: 'root',
})
export class SleepingActivityConfiguration implements ActivityConfiguration {
  readonly color = '#1a237e';
  readonly displayName = this.translator.get('Sleeping');
  readonly link = '/activities/sleeping';
  readonly isRunning = getDefaultIsRunning(this.database, [ActivityType.Sleeping]);
  readonly lastActivityAt: Observable<Date | null> = getDefaultLastActivityAt(this.activityStream, [ActivityType.Sleeping]);

  constructor(
    private readonly translator: TranslateService,
    private readonly database: DatabaseService,
    private readonly activityStream: ActivityStreamService,
  ) {
  }
}
