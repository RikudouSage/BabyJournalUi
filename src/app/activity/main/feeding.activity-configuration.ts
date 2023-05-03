import {ActivityConfiguration, getDefaultIsRunning, getDefaultLastActivityAt} from "../activity-configuration";
import {Injectable} from "@angular/core";
import {TranslateService} from "@ngx-translate/core";
import {DatabaseService} from "../../services/database.service";
import {ActivityType} from "../../enum/activity-type.enum";
import {ActivityStreamService} from "../../services/activity-stream.service";

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
  lastActivityAt = getDefaultLastActivityAt(
    this.activityStreamService,
    [ActivityType.FeedingSolid, ActivityType.FeedingBottle, ActivityType.FeedingBreast],
  );

  constructor(
    private readonly translator: TranslateService,
    private readonly database: DatabaseService,
    private readonly activityStreamService: ActivityStreamService,
  ) {
  }
}
