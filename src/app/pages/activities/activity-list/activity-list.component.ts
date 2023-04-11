import {Component, Inject, OnInit} from '@angular/core';
import {TitleService} from "../../../services/title.service";
import {UserManagerService} from "../../../services/user-manager.service";
import {EncryptorService} from "../../../services/encryptor.service";
import {EncryptedValue} from "../../../dto/encrypted-value";
import {Activity} from "../../../activity/activity";
import {ACTIVITIES} from "../../../dependency-injection/injection-tokens";
import {ActivityStream, ApiService} from "../../../services/api.service";
import {ActivityType} from "../../../enum/activity-type.enum";
import {BottleContentType} from "../../../enum/bottle-content-type.enum";
import {Observable} from "rxjs";
import {TranslateService} from "@ngx-translate/core";
import {dateToYmd} from "../../../helper/date";

interface DateSortedActivityStream {
  [key: string]: ActivityStream;
}

@Component({
  selector: 'app-activity-list',
  templateUrl: './activity-list.component.html',
  styleUrls: ['./activity-list.component.scss']
})
export class ActivityListComponent implements OnInit {
  private readonly limit = 100;

  public activities: Activity[] = [];
  public activityStream: DateSortedActivityStream;
  public dates: string[] = [];

  constructor(
    private readonly titleService: TitleService,
    private readonly userManager: UserManagerService,
    private readonly encryptor: EncryptorService,
    private readonly api: ApiService,
    private readonly translator: TranslateService,
    @Inject(ACTIVITIES) private readonly activityObjects: Activity[],
  ) {
  }

  public async ngOnInit(): Promise<void> {
    this.userManager.getCurrentUser().then(user => {
      user.relationships.selectedChild.subscribe(async child => {
        if (child === null) {
          return;
        }
        child = await this.encryptor.decryptEntity(child);
        this.titleService.title = child.attributes.displayName instanceof EncryptedValue
          ? child.attributes.displayName.decrypted
          : child.attributes.displayName;

        this.activities = this.activityObjects;
      });
    });

    this.api.getActivityStream().subscribe(async result => {
      const activities: DateSortedActivityStream = {};
      const stream = await result;
      let i = 0;
      for (const activity of stream) {
        if (i > this.limit) {
          break;
        }
        const date = new Date(activity.startTime);
        const dateString = dateToYmd(date);
        if (typeof activities[dateString] === 'undefined') {
          this.dates.push(dateString);
          activities[dateString] = [];
        }

        activities[dateString].push(activity);
        ++i;
      }

      console.log(activities);
      this.activityStream = activities;
    });
  }
}
