import {ActivityConfiguration, CancellationToken, getDefaultIsRunning, getDefaultLastActivityAt} from "./activity-configuration";
import {Injectable} from "@angular/core";
import {TranslateService} from "@ngx-translate/core";
import {DatabaseService} from "../services/database.service";
import {ActivityType} from "../enum/activity-type.enum";
import {ActivityStreamService} from "../services/activity-stream.service";

@Injectable({
  providedIn: 'root',
})
export class FeedingActivityConfiguration implements ActivityConfiguration {

  private currentCancellationToken: CancellationToken = {
    token: 0,
  };

  color = '#f48fb1';
  displayName = this.translator.get('Feeding');
  link = '/activities/feeding';
  // isRunning = from(this.database.getInProgress(ActivityType.Feeding)).pipe(
  //   map(value => value !== null),
  // );
  isRunning = this.isRunningFactory();
  lastActivityAt = getDefaultLastActivityAt(
    this.activityStreamService.getActivityStream(),
    [ActivityType.FeedingSolid, ActivityType.FeedingBottle, ActivityType.FeedingBreast],
  );

  constructor(
    private readonly translator: TranslateService,
    private readonly database: DatabaseService,
    private readonly activityStreamService: ActivityStreamService,
  ) {
  }

  reloadStatus(): void {
    ++this.currentCancellationToken.token;
    this.isRunning = this.isRunningFactory();
  }

  private isRunningFactory() {
    return getDefaultIsRunning(
      this.database,
      [ActivityType.FeedingBreast, ActivityType.FeedingBottle, ActivityType.FeedingSolid],
      this.currentCancellationToken,
    );
  }
}
