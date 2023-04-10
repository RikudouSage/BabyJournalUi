import {Component, OnInit} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import {TitleService} from "../../../services/title.service";
import {ActivityStream, ApiService, FeedingActivityStreamItem} from "../../../services/api.service";
import {FormControl, FormGroup} from "@angular/forms";
import {lastValueFrom, Observable, of} from "rxjs";
import {BreakpointObserver, Breakpoints} from "@angular/cdk/layout";
import {map, shareReplay} from "rxjs/operators";
import {BottleContentType} from "../../../enum/bottle-content-type.enum";
import {UserManagerService} from "../../../services/user-manager.service";
import {EncryptorService} from "../../../services/encryptor.service";
import {ActivityType} from "../../../enum/activity-type.enum";
import {EnumToStringService} from "../../../services/enum-to-string.service";

interface CategorySummary {
  feeding: {
    bottle: {
      [type in BottleContentType]: number;
    },
    total: {
      bottle: number;
    }
  }
}

@Component({
  selector: 'app-summary',
  templateUrl: './activities-summary.component.html',
  styleUrls: ['./activities-summary.component.scss']
})
export class ActivitiesSummaryComponent implements OnInit {
  public readonly bottleContentTypeToString = this.enumToString.bottleContentTypeToString;

  private fullActivityStream: ActivityStream | null = null;
  public changeDateForm = new FormGroup({
    date: <FormControl<Date>>new FormControl(new Date()),
  })
  public activityStream: ActivityStream = [];
  public summary: CategorySummary = {
    feeding: {
      bottle: {
        BreastMilk: 0,
        Formula: 0,
        Juice: 0,
        Water: 0,
      },
      total: {
        bottle: 0,
      }
    },
  };
  public loading = true;
  public childName: Observable<string> = this.translator.get('your child');
  public childBirthDate: Date | null = null;
  public isDateBeforeChildBirth: boolean | null = null;

  isHandset: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(
    private readonly breakpointObserver: BreakpointObserver,
    private readonly translator: TranslateService,
    private readonly titleService: TitleService,
    private readonly apiService: ApiService,
    private readonly userManager: UserManagerService,
    private readonly encryptor: EncryptorService,
    private readonly enumToString: EnumToStringService,
  ) {
  }

  public async ngOnInit(): Promise<void> {
    this.titleService.title = this.translator.get('Activities summary');
    const user = await this.userManager.getCurrentUser();
    const child = await lastValueFrom(user.relationships.selectedChild);
    if (child !== null) {
      if (child.attributes.name !== null) {
        this.childName = of(await this.encryptor.decrypt(child.attributes.name.encrypted));
      }
      if (child.attributes.birthDay !== null) {
        this.childBirthDate = new Date(await this.encryptor.decrypt(child.attributes.birthDay.encrypted));
        this.isDateBeforeChildBirth = false;
      }
    }
    this.apiService.getActivityStream().subscribe(async activityStream => {
      this.fullActivityStream = await activityStream;
      this.reloadActivitiesForDate(this.changeDateForm.controls.date.value);
    });
    this.changeDateForm.controls.date.valueChanges.subscribe(date => this.reloadActivitiesForDate(date));
  }

  public datePickerFilter(date: Date | null): boolean {
    date ??= new Date();
    const now = new Date();
    const max = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);

    return date.getTime() < max.getTime();
  }

  private reloadActivitiesForDate(date: Date) {
    if (this.fullActivityStream === null) {
      return;
    }

    this.loading = true;
    this.activityStream = this.fullActivityStream.filter(item => {
      const activityDate = new Date(item.startTime);

      return date.getFullYear() === activityDate.getFullYear()
        && date.getMonth() === activityDate.getMonth()
        && date.getDate() === activityDate.getDate();
    });
    this.summary.feeding.bottle = {
      BreastMilk: 0,
      Formula: 0,
      Juice: 0,
      Water: 0,
    };
    this.summary.feeding.total.bottle = 0;

    for (const activity of this.activityStream) {
      if (activity.activityType === ActivityType.Feeding) {
        const typedActivity = <FeedingActivityStreamItem>activity;
        if (typedActivity.type === "bottle") {
          this.summary.feeding.bottle[<BottleContentType>typedActivity.bottleContentType] += Number(typedActivity.amount);
          this.summary.feeding.total.bottle += Number(typedActivity.amount);
        }
      }
    }

    if (this.childBirthDate !== null) {
      this.isDateBeforeChildBirth = date.getTime() < this.childBirthDate.getTime();
    }

    this.loading = false;
  }
}
