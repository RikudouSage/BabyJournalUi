import {Component, OnInit} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import {TitleService} from "../../../services/title.service";
import {FormControl, FormGroup} from "@angular/forms";
import {Observable, of} from "rxjs";
import {BreakpointObserver, Breakpoints} from "@angular/cdk/layout";
import {map, shareReplay} from "rxjs/operators";
import {BottleContentType} from "../../../enum/bottle-content-type.enum";
import {UserManagerService} from "../../../services/user-manager.service";
import {EncryptorService} from "../../../services/encryptor.service";
import {ActivityType} from "../../../enum/activity-type.enum";
import {EnumToStringService} from "../../../services/enum-to-string.service";
import {BreastIndex} from "../../../enum/breast-index.enum";
import {dateDiff} from "../../../helper/date";
import {
  ActivityStream,
  ActivityStreamService,
  BottleFeedingActivityStreamItem,
  BreastFeedingActivityStreamItem,
  DiaperingActivityStreamItem, LengthActivityStreamItem,
  PumpingActivityStreamItem,
  TemperatureActivityStreamItem,
  WeighingActivityStreamItem
} from "../../../services/activity-stream.service";
import {toPromise} from "../../../helper/observables";

interface CategorySummary {
  feeding: {
    bottle: {
      [type in BottleContentType]: number;
    };
    nursing: {
      [type in BreastIndex]: number;
    };
    total: {
      bottle: number;
      nursing: number;
      solid: number;
    };
  };
  diapering: {
    wet: number;
    poopy: number;
    dry: number;
    changes: number;
  };
  pumping: {
    [parentName: string]: {
      amount: {
        [breast in BreastIndex]: number;
      };
      time: {
        [BreastIndex.Left]: number;
        [BreastIndex.Right]: number;
      };
      total: {
        time: number;
        amount: number;
      };
    };
  };
  sleeping: number;
  temperature: {
    max: number;
    min: number;
  }
}

interface MeasurementValue {
  value: number;
  date: Date | null;
}

interface CurrentMeasurements {
  weight: MeasurementValue;
  length: MeasurementValue;
}

@Component({
  selector: 'app-summary',
  templateUrl: './activities-summary.component.html',
  styleUrls: ['./activities-summary.component.scss']
})
export class ActivitiesSummaryComponent implements OnInit {
  public readonly bottleContentTypeToString = this.enumToString.bottleContentTypeToString;
  public readonly breastIndexToString = this.enumToString.breastIndexToString;

  private readonly emptyMeasurements: CurrentMeasurements = {
    weight: {
      date: new Date(),
      value: 0,
    },
    length: {
      date: new Date(),
      value: 0,
    },
  };

  private readonly emptyCategorySummary: CategorySummary = {
    feeding: {
      bottle: {
        BreastMilk: 0,
        Formula: 0,
        Juice: 0,
        Water: 0,
      },
      nursing: {
        [BreastIndex.Left]: 0,
        [BreastIndex.Right]: 0,
      },
      total: {
        bottle: 0,
        nursing: 0,
        solid: 0,
      },
    },
    diapering: {
      wet: 0,
      dry: 0,
      changes: 0,
      poopy: 0,
    },
    pumping: {},
    sleeping: 0,
    temperature: {
      max: -1,
      min: -1,
    },
  };
  private fullActivityStream: ActivityStream | null = null;

  public changeDateForm = new FormGroup({
    date: <FormControl<Date>>new FormControl(new Date()),
  })
  public activityStream: ActivityStream = [];
  public filteredActivityStream: ActivityStream = [];
  public summary: CategorySummary = JSON.parse(JSON.stringify(this.emptyCategorySummary));
  public currentMeasurements: CurrentMeasurements = JSON.parse(JSON.stringify(this.emptyMeasurements));
  public loading = true;
  public childName: Observable<string> = this.translator.get('your child');
  public childBirthDate: Date | null = null;
  public isDateBeforeChildBirth: boolean | null = null;
  public hasAnyMeasurements: boolean = false;

  isHandset: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(
    private readonly breakpointObserver: BreakpointObserver,
    private readonly translator: TranslateService,
    private readonly titleService: TitleService,
    private readonly userManager: UserManagerService,
    private readonly encryptor: EncryptorService,
    private readonly enumToString: EnumToStringService,
    private readonly activityStreamService: ActivityStreamService,
  ) {
  }

  public async ngOnInit(): Promise<void> {
    this.titleService.title = this.translator.get('Activities summary');
    const user = await this.userManager.getCurrentUser();
    let child = await toPromise(user.relationships.selectedChild);
    if (child !== null) {
      child = await this.encryptor.decryptEntity(child);
      if (child.attributes.name !== null) {
        this.childName = of(child.attributes.name.decrypted);
      }
      if (child.attributes.birthDay !== null) {
        this.childBirthDate = new Date(child.attributes.birthDay.decrypted);
        this.isDateBeforeChildBirth = false;
      }

      if (child.attributes.birthWeight !== null) {
        this.hasAnyMeasurements = true;
        this.currentMeasurements.weight = {
          value: Number(child.attributes.birthWeight.decrypted),
          date: child.attributes.birthDay !== null ? new Date(child.attributes.birthDay.decrypted) : null,
        }
      }
      if (child.attributes.birthHeight !== null) {
        this.hasAnyMeasurements = true;
        this.currentMeasurements.length = {
          value: Number(child.attributes.birthHeight.decrypted),
          date: child.attributes.birthHeight !== null ? new Date(child.attributes.birthHeight.decrypted) : null,
        };
      }
    }
    this.activityStreamService.getActivityStream().subscribe(async activityStream => {
      this.fullActivityStream = activityStream;
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

      if (item.activityType === ActivityType.Weighing) {
        return activityDate.getTime() <= new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999).getTime();
      }
      if (item.activityType === ActivityType.Length) {
        return activityDate.getTime() <= new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999).getTime();
      }

      return date.getFullYear() === activityDate.getFullYear()
        && date.getMonth() === activityDate.getMonth()
        && date.getDate() === activityDate.getDate();
    });
    this.summary = JSON.parse(JSON.stringify(this.emptyCategorySummary));

    let lastWeight: Date | null = null;
    let lastLength: Date | null = null;

    for (const activity of this.activityStream) {
      if (activity.activityType === ActivityType.FeedingBottle) {
        const typedActivity = <BottleFeedingActivityStreamItem>activity;
        if (typedActivity.type === "bottle") {
          this.summary.feeding.bottle[<BottleContentType>typedActivity.bottleContentType] += Number(typedActivity.amount);
          this.summary.feeding.total.bottle += Number(typedActivity.amount);
        }
      } else if (activity.activityType === ActivityType.FeedingBreast) {
        const typedActivity = <BreastFeedingActivityStreamItem>activity;
        const breast = <BreastIndex>Number(typedActivity.breast);
        const seconds = dateDiff(new Date(typedActivity.startTime), new Date(<string>typedActivity.endTime));
        this.summary.feeding.nursing[breast] += seconds;
        this.summary.feeding.total.nursing += seconds;
      } else if (activity.activityType === ActivityType.FeedingSolid) {
        this.summary.feeding.total.solid += 1;
      } else if (activity.activityType === ActivityType.Diapering) {
        const typedActivity = <DiaperingActivityStreamItem>activity;
        if (Boolean(Number(typedActivity.wet))) {
          this.summary.diapering.wet += 1;
        }
        if (Boolean(Number(typedActivity.poopy))) {
          this.summary.diapering.poopy += 1;
        }
        if (!Boolean(Number(typedActivity.wet)) && !Boolean(Number(typedActivity.poopy))) {
          this.summary.diapering.dry += 1;
        }
        this.summary.diapering.changes += 1;
      } else if (activity.activityType === ActivityType.Pumping) {
        const typedActivity = <PumpingActivityStreamItem>activity;
        const parent = typedActivity.parentName;
        const breast = <BreastIndex>Number(typedActivity.breast);
        const amount = typedActivity.amount !== null ? Number(typedActivity.amount) : null;
        const seconds = dateDiff(new Date(typedActivity.startTime), new Date(<string>typedActivity.endTime));

        this.summary.pumping[parent] ??= {
          amount: {
            [BreastIndex.Left]: 0,
            [BreastIndex.Right]: 0,
          },
          time: {
            [BreastIndex.Left]: 0,
            [BreastIndex.Right]: 0,
          },
          total: {
            time: 0,
            amount: 0,
          },
        };

        this.summary.pumping[parent].amount[breast] += amount ?? 0;
        this.summary.pumping[parent].time[breast] += seconds;
        this.summary.pumping[parent].total.time += seconds;
        this.summary.pumping[parent].total.amount += amount ?? 0;
      } else if (activity.activityType === ActivityType.Sleeping) {
        const seconds = dateDiff(new Date(activity.startTime), new Date(<string>activity.endTime));
        this.summary.sleeping += seconds;
      } else if (activity.activityType === ActivityType.Weighing) {
        const activityDate = new Date(activity.startTime);
        if (lastWeight === null || activityDate.getTime() > lastWeight.getTime()) {
          this.currentMeasurements.weight = {
            date: activityDate,
            value: Number((<WeighingActivityStreamItem>activity).weight),
          };
        }
        lastWeight = activityDate;
        this.hasAnyMeasurements = true;
      } else if (activity.activityType === ActivityType.Length) {
        const activityDate = new Date(activity.startTime);
        if (lastLength === null || activityDate.getTime() > lastLength.getTime()) {
          this.currentMeasurements.length = {
            date: activityDate,
            value: Number((<LengthActivityStreamItem>activity).length),
          };
        }
        lastLength = activityDate;
        this.hasAnyMeasurements = true;
      } else if (activity.activityType === ActivityType.Temperature) {
        const temperature = Number((<TemperatureActivityStreamItem>activity).temperature);
        if (temperature < this.summary.temperature.min || this.summary.temperature.min < 0) {
          this.summary.temperature.min = temperature;
        }
        if (temperature > this.summary.temperature.max || this.summary.temperature.max < 0) {
          this.summary.temperature.max = temperature;
        }
      }
    }

    this.filteredActivityStream = this.activityStream.filter(item => {
      const activityDate = new Date(item.startTime);

      return date.getFullYear() === activityDate.getFullYear()
        && date.getMonth() === activityDate.getMonth()
        && date.getDate() === activityDate.getDate();
    });

    if (this.childBirthDate !== null) {
      this.isDateBeforeChildBirth = date.getTime() < this.childBirthDate.getTime();
    }

    this.loading = false;
  }

  public stringNumberToBreastIndex(string: string): BreastIndex {
    return <BreastIndex>Number(string);
  }
}
