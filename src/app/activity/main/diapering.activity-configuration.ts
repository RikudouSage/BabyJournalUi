import {ActivityConfiguration, getDefaultLastActivityAt} from "../activity-configuration";
import {TranslateService} from "@ngx-translate/core";
import {Injectable} from "@angular/core";
import {of} from "rxjs";
import {ActivityType} from "../../enum/activity-type.enum";
import {DatabaseService} from "../../services/database.service";
import {ActivityStreamService} from "../../services/activity-stream.service";

@Injectable({
  providedIn: 'root',
})
export class DiaperingActivityConfiguration implements ActivityConfiguration {

  color = '#d500f9';
  displayName = this.translator.get('Diapering');
  link = '/activities/diapering';
  isRunning = of(false);
  lastActivityAt = getDefaultLastActivityAt(this.activityStreamService, [ActivityType.Diapering]);

  constructor(
    private readonly translator: TranslateService,
    private readonly database: DatabaseService,
    private readonly activityStreamService: ActivityStreamService,
  ) {
  }

}
