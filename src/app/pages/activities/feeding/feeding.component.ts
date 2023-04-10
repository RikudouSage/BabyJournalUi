import {AfterContentInit, AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {UserManagerService} from "../../../services/user-manager.service";
import {TitleService} from "../../../services/title.service";
import {TranslateService} from "@ngx-translate/core";
import {filter, lastValueFrom, Observable, of, pairwise} from "rxjs";
import {Child} from "../../../entity/child.entity";
import {EncryptorService} from "../../../services/encryptor.service";
import {potentiallyEncryptedValue} from "../../../pipes/potentially-encrypted-value.pipe";
import {DatabaseService} from "../../../services/database.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {MatTabChangeEvent} from "@angular/material/tabs";
import {BottleContentType} from "../../../enum/bottle-content-type.enum";
import {TrackerComponent, TrackerOutputData, TrackingPausedEvent} from "../../../components/tracker/tracker.component";
import {FeedingActivity, FeedingActivityRepository} from "../../../entity/feeding-activity.entity";
import {EncryptedValue} from "../../../dto/encrypted-value";
import {Router} from "@angular/router";
import {ActivityType} from "../../../enum/activity-type.enum";
import {FeedingType} from "../../../types/feeding-type.type";
import {map} from "rxjs/operators";
import {EnumToStringService} from "../../../services/enum-to-string.service";

enum FeedingTypeIndex {
  Bottle,
  Nursing,
  Solid,
}

@Component({
  selector: 'app-feeding',
  templateUrl: './feeding.component.html',
  styleUrls: ['./feeding.component.scss']
})
export class FeedingComponent implements OnInit {
  public BottleContentType = BottleContentType;

  public feedingTypeIndex: FeedingTypeIndex = FeedingTypeIndex.Bottle;

  public bottleForm = new FormGroup({
    startTime: <FormControl<Date | null>>new FormControl(null, [Validators.required]),
    endTime: <FormControl<Date | null>>new FormControl(null, [Validators.required]),
    notes: <FormControl<string | null>>new FormControl(),
    contentType: <FormControl<BottleContentType | null>>new FormControl(null, [Validators.required]),
    amount: <FormControl<number | null>>new FormControl(null, [Validators.required, Validators.min(0)]),
    trackingJustFinished: new FormControl(false),
  });

  public errorMessage: Observable<string> = of('');

  public bottleContentTypeToString = this.enumToString.bottleContentTypeToString;

  constructor(
    private readonly userManager: UserManagerService,
    private readonly titleService: TitleService,
    private readonly translator: TranslateService,
    private readonly encryptor: EncryptorService,
    private readonly database: DatabaseService,
    private readonly feedingActivityRepository: FeedingActivityRepository,
    private readonly router: Router,
    private readonly enumToString: EnumToStringService,
  ) {
  }

  public async ngOnInit(): Promise<void> {
    const user = await this.userManager.getCurrentUser();
    const child = await this.encryptor.decryptEntity((await lastValueFrom(user.relationships.selectedChild)) as Child);

    this.bottleForm.patchValue({
      amount: await this.database.getLastBottleFeedingAmount() ?? 50,
      contentType: await this.database.getLastBottleContentType() ?? BottleContentType.BreastMilk,
    });
    switch (await this.database.getLastOpenedFeedingType() ?? 'bottle') {
      case "bottle":
        this.feedingTypeIndex = FeedingTypeIndex.Bottle;
        break;
      case "solid":
        this.feedingTypeIndex = FeedingTypeIndex.Solid;
        break;
      case "nursing":
        this.feedingTypeIndex = FeedingTypeIndex.Nursing;
        break;
    }

    this.titleService.title = this.translator.get('Feeding {{childName}}', {
      childName: potentiallyEncryptedValue(child.attributes.displayName),
    });

    this.bottleForm.controls.amount.valueChanges.subscribe(async value => {
      value ??= 50;
      await this.database.setLastBottleFeedingAmount(value);
    });
    this.bottleForm.controls.contentType.valueChanges.subscribe(async value => {
      value ??= BottleContentType.BreastMilk;
      await this.database.setLastBottleContentType(value);
    });

    const existingBottleActivity = await this.database.getInProgress(ActivityType.Feeding);
    if (existingBottleActivity !== null) {
      this.bottleForm.patchValue({
        startTime: existingBottleActivity.startTime,
        contentType: existingBottleActivity.data.contentType,
        notes: existingBottleActivity.data.notes,
        amount: existingBottleActivity.data.amount,
      });
    }

    this.bottleForm.valueChanges.subscribe(async changes => {
      const existingBottleActivity = await this.database.getInProgress(ActivityType.Feeding);
      if (existingBottleActivity === null || changes.trackingJustFinished) {
        return;
      }
      if (changes.startTime) {
        existingBottleActivity.startTime = changes.startTime;
      }
      existingBottleActivity.data.amount = changes.amount;
      existingBottleActivity.data.contentType = changes.contentType;
      existingBottleActivity.data.notes = changes.notes;

      await this.database.saveInProgress(existingBottleActivity);
    });
  }

  public async saveSelectedTab(event: MatTabChangeEvent): Promise<void> {
    let feedingType: FeedingType;
    switch (event.index as FeedingTypeIndex) {
      case FeedingTypeIndex.Nursing:
        feedingType = 'nursing';
        break;
      case FeedingTypeIndex.Bottle:
        feedingType = 'bottle';
        break;
      case FeedingTypeIndex.Solid:
        feedingType = 'solid';
        break;
    }

    await this.database.saveLastOpenedFeedingType(feedingType);
  }

  public async onTimerReset(newDate: Date): Promise<void> {
    this.bottleForm.patchValue({
      startTime: newDate,
    });
  }

  public async onBottleTrackingFinished(result: TrackerOutputData) {
    this.bottleForm.patchValue({
      startTime: result.startTime,
      endTime: result.endTime,
      trackingJustFinished: true,
    });
    await this.database.removeInProgress(ActivityType.Feeding);
  }

  public async onBottleTrackingStarted(startTime: Date) {
    await this.database.saveInProgress({
      startTime: startTime,
      activity: ActivityType.Feeding,
      mode: 'running',
      data: {
        amount: this.bottleForm.controls.amount.value,
        notes: this.bottleForm.controls.notes.value,
        contentType: this.bottleForm.controls.contentType.value,
      },
    });
    this.bottleForm.patchValue({
      trackingJustFinished: false,
    });
  }

  public async saveBottleData(bottleTracker: TrackerComponent) {
    await bottleTracker.finishTracking();
    if (!this.bottleForm.valid) {
      this.errorMessage = this.translator.get('Some required fields are not filled.');
      return;
    }

    const activity = new FeedingActivity();
    activity.attributes = {
      amount: new EncryptedValue(await this.encryptor.encrypt(String(this.bottleForm.controls.amount.value))),
      startTime: new EncryptedValue(await this.encryptor.encrypt((<Date>this.bottleForm.controls.startTime.value).toISOString())),
      endTime: new EncryptedValue(await this.encryptor.encrypt((<Date>this.bottleForm.controls.endTime.value).toISOString())),
      type: new EncryptedValue(await this.encryptor.encrypt('bottle')),
      note: this.bottleForm.controls.notes.value ? new EncryptedValue(await this.encryptor.encrypt(this.bottleForm.controls.notes.value)) : null,
      breakDuration: null,
      bottleContentType: new EncryptedValue(await this.encryptor.encrypt(<string>this.bottleForm.controls.contentType.value)),
    }

    this.feedingActivityRepository.create(activity, false).subscribe(result => {
      this.router.navigateByUrl('/');
    });
  }
}
