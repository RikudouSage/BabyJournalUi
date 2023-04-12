import {Component, OnInit} from '@angular/core';
import {UserManagerService} from "../../../services/user-manager.service";
import {TitleService} from "../../../services/title.service";
import {TranslateService} from "@ngx-translate/core";
import {lastValueFrom, Observable, of} from "rxjs";
import {Child} from "../../../entity/child.entity";
import {EncryptorService} from "../../../services/encryptor.service";
import {potentiallyEncryptedValue} from "../../../pipes/potentially-encrypted-value.pipe";
import {DatabaseService} from "../../../services/database.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {MatTabChangeEvent} from "@angular/material/tabs";
import {BottleContentType} from "../../../enum/bottle-content-type.enum";
import {TrackerComponent, TrackerOutputData} from "../../../components/tracker/tracker.component";
import {FeedingActivity, FeedingActivityRepository} from "../../../entity/feeding-activity.entity";
import {EncryptedValue} from "../../../dto/encrypted-value";
import {Router} from "@angular/router";
import {ActivityType} from "../../../enum/activity-type.enum";
import {FeedingType} from "../../../types/feeding-type.type";
import {EnumToStringService} from "../../../services/enum-to-string.service";
import {BreastIndex} from "../../../enum/breast-index.enum";

enum FeedingTypeIndex {
  Bottle,
  Nursing,
  Solid,
}

@Component({
  selector: 'app-feeding',
  templateUrl: './feeding-activity.component.html',
  styleUrls: ['./feeding-activity.component.scss']
})
export class FeedingActivityComponent implements OnInit {
  public BottleContentType = BottleContentType;
  protected readonly BreastIndex = BreastIndex;

  public feedingTypeIndex: FeedingTypeIndex = FeedingTypeIndex.Bottle;
  public breastIndex: BreastIndex = BreastIndex.Left;

  public bottleForm = new FormGroup({
    startTime: <FormControl<Date | null>>new FormControl(null, [Validators.required]),
    endTime: <FormControl<Date | null>>new FormControl(null, [Validators.required]),
    notes: <FormControl<string | null>>new FormControl(),
    contentType: <FormControl<BottleContentType | null>>new FormControl(null, [Validators.required]),
    amount: <FormControl<number | null>>new FormControl(null, [Validators.required, Validators.min(0)]),
    trackingJustFinished: new FormControl(false),
  });
  public leftBreastForm = new FormGroup({
    startTime: <FormControl<Date | null>>new FormControl(null, [Validators.required]),
    endTime: <FormControl<Date | null>>new FormControl(null, [Validators.required]),
    notes: <FormControl<string | null>>new FormControl(),
    trackingJustFinished: new FormControl(false),
  });
  public rightBreastForm = new FormGroup({
    startTime: <FormControl<Date | null>>new FormControl(null, [Validators.required]),
    endTime: <FormControl<Date | null>>new FormControl(null, [Validators.required]),
    notes: <FormControl<string | null>>new FormControl(),
    trackingJustFinished: new FormControl(false),
  });
  public solidFoodForm = new FormGroup({
    startTime: <FormControl<Date | null>>new FormControl(null, [Validators.required]),
    endTime: <FormControl<Date | null>>new FormControl(null, [Validators.required]),
    notes: <FormControl<string | null>>new FormControl(),
    trackingJustFinished: new FormControl(false),
  });

  public bottleErrorMessage: Observable<string> = of('');
  public leftBreastNursingErrorMessage: Observable<string> = of('');
  public rightBreastNursingErrorMessage: Observable<string> = of('');
  public solidErrorMessage: Observable<string> = of('');

  public loading = true;

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

    this.titleService.title = this.translator.get('Feeding {{childName}}', {
      childName: potentiallyEncryptedValue(child.attributes.displayName),
    });

    await this.initializeBottle();
    await this.initializeNursing();
    await this.initializeSolidFood();

    this.loading = false;
  }

  public async initializeSolidFood(): Promise<void> {
    const existingActivity = await this.database.getInProgress(ActivityType.FeedingSolid);
    if (existingActivity !== null) {
      this.solidFoodForm.patchValue({
        startTime: existingActivity.startTime,
        notes: existingActivity.notes,
      });
    }

    this.solidFoodForm.valueChanges.subscribe(async changes => {
      const existingActivity = await this.database.getInProgress(ActivityType.FeedingSolid);
      if (existingActivity === null || changes.trackingJustFinished) {
        return;
      }
      if (changes.startTime) {
        existingActivity.startTime = changes.startTime;
      }
      existingActivity.notes = changes.notes ?? null;

      await this.database.saveInProgress(existingActivity);
    });
  }

  public async initializeNursing(): Promise<void> {
    this.breastIndex = await this.database.getLastNursingBreast();
    const existingActivity = await this.database.getInProgress(ActivityType.FeedingBreast);
    if (existingActivity !== null) {
      const index = <BreastIndex>existingActivity.data.breast;
      const form = index === BreastIndex.Left ? this.leftBreastForm : this.rightBreastForm;
      form.patchValue({
        startTime: existingActivity.startTime,
        notes: existingActivity.notes,
      });
    }

    this.leftBreastForm.valueChanges.subscribe(async changes => {
      const existingActivity = await this.database.getInProgress(ActivityType.FeedingBreast);
      if (existingActivity === null || existingActivity.data.breast !== BreastIndex.Left || changes.trackingJustFinished) {
        return;
      }
      if (changes.startTime) {
        existingActivity.startTime = changes.startTime;
      }
      existingActivity.notes = changes.notes ?? null;

      await this.database.saveInProgress(existingActivity);
    });
    this.rightBreastForm.valueChanges.subscribe(async changes => {
      const existingActivity = await this.database.getInProgress(ActivityType.FeedingBreast);
      if (existingActivity === null || existingActivity.data.breast !== BreastIndex.Right || changes.trackingJustFinished) {
        return;
      }
      if (changes.startTime) {
        existingActivity.startTime = changes.startTime;
      }
      existingActivity.notes = changes.notes ?? null;

      await this.database.saveInProgress(existingActivity);
    });
  }

  public async initializeBottle(): Promise<void> {
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

    this.bottleForm.controls.amount.valueChanges.subscribe(async value => {
      value ??= 50;
      await this.database.setLastBottleFeedingAmount(value);
    });
    this.bottleForm.controls.contentType.valueChanges.subscribe(async value => {
      value ??= BottleContentType.BreastMilk;
      await this.database.setLastBottleContentType(value);
    });

    const existingBottleActivity = await this.database.getInProgress(ActivityType.FeedingBottle);
    if (existingBottleActivity !== null) {
      this.bottleForm.patchValue({
        startTime: existingBottleActivity.startTime,
        contentType: existingBottleActivity.data.contentType,
        notes: existingBottleActivity.data.notes,
        amount: existingBottleActivity.data.amount,
      });
    }

    this.bottleForm.valueChanges.subscribe(async changes => {
      const existingBottleActivity = await this.database.getInProgress(ActivityType.FeedingBottle);
      if (existingBottleActivity === null || changes.trackingJustFinished) {
        return;
      }
      if (changes.startTime) {
        existingBottleActivity.startTime = changes.startTime;
      }
      existingBottleActivity.data.amount = changes.amount;
      existingBottleActivity.data.contentType = changes.contentType;
      existingBottleActivity.notes = changes.notes ?? null;

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

  public async onBottleTrackingFinished(result: TrackerOutputData) {
    this.bottleForm.patchValue({
      startTime: result.startTime,
      endTime: result.endTime,
      trackingJustFinished: true,
    });
    await this.database.removeInProgress(ActivityType.FeedingBottle);
  }

  public async onBottleTrackingStarted(startTime: Date) {
    await this.database.saveInProgress({
      startTime: startTime,
      activity: ActivityType.FeedingBottle,
      mode: 'running',
      notes: this.bottleForm.controls.notes.value,
      data: {
        amount: this.bottleForm.controls.amount.value,
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
      this.bottleErrorMessage = this.translator.get('Some required fields are not filled.');
      return;
    }

    const activity = new FeedingActivity();
    activity.attributes = {
      amount: new EncryptedValue(await this.encryptor.encrypt(String(this.bottleForm.controls.amount.value))),
      startTime: new EncryptedValue(await this.encryptor.encrypt((<Date>this.bottleForm.controls.startTime.value).toISOString())),
      endTime: new EncryptedValue(await this.encryptor.encrypt((<Date>this.bottleForm.controls.endTime.value).toISOString())),
      type: new EncryptedValue(await this.encryptor.encrypt(<FeedingType>'bottle')),
      note: this.bottleForm.controls.notes.value ? new EncryptedValue(await this.encryptor.encrypt(this.bottleForm.controls.notes.value)) : null,
      breakDuration: null,
      bottleContentType: new EncryptedValue(await this.encryptor.encrypt(<string>this.bottleForm.controls.contentType.value)),
      breast: null,
    }

    this.feedingActivityRepository.create(activity, false).subscribe(() => {
      this.router.navigateByUrl('/');
    });
  }

  public async onBreastTrackingFinished(result: TrackerOutputData, breast: BreastIndex): Promise<void> {
    (breast === BreastIndex.Left ? this.leftBreastForm : this.rightBreastForm).patchValue({
      startTime: result.startTime,
      endTime: result.endTime,
      trackingJustFinished: true,
    });
    await this.database.removeInProgress(ActivityType.FeedingBreast);
  }

  public async onBreastTrackingStarted(startTime: Date, breast: BreastIndex): Promise<void> {
    const form = breast === BreastIndex.Left ? this.leftBreastForm : this.rightBreastForm;
    await this.database.saveInProgress({
      startTime: startTime,
      activity: ActivityType.FeedingBreast,
      mode: 'running',
      notes: form.controls.notes.value,
      data: {
        breast: breast,
      },
    });
    form.patchValue({
      trackingJustFinished: false,
    });
  }

  public async saveBreastData(breastTracker: TrackerComponent, breast: BreastIndex): Promise<void> {
    const form = breast === BreastIndex.Left ? this.leftBreastForm : this.rightBreastForm;
    await breastTracker.finishTracking();
    if (!form.valid) {
      const message = this.translator.get('Some required fields are not filled.');
      if (breast === BreastIndex.Left) {
        this.leftBreastNursingErrorMessage = message;
      } else {
        this.rightBreastNursingErrorMessage = message;
      }
      return;
    }

    const activity = new FeedingActivity();
    activity.attributes = {
      amount: null,
      startTime: new EncryptedValue(await this.encryptor.encrypt((<Date>form.controls.startTime.value).toISOString())),
      endTime: new EncryptedValue(await this.encryptor.encrypt((<Date>form.controls.endTime.value).toISOString())),
      type: new EncryptedValue(await this.encryptor.encrypt(<FeedingType>'nursing')),
      note: form.controls.notes.value ? new EncryptedValue(await this.encryptor.encrypt(form.controls.notes.value)) : null,
      breakDuration: null,
      bottleContentType: null,
      breast: new EncryptedValue(await this.encryptor.encrypt(String(breast))),
    }

    this.feedingActivityRepository.create(activity, false).subscribe(() => {
      this.router.navigateByUrl('/');
    });
  }

  public async saveSelectedBreast(event: MatTabChangeEvent) {
    await this.database.saveLastNursingBreast(event.index);
  }

  public async saveSolidFoodData(tracker: TrackerComponent): Promise<void> {
    await tracker.finishTracking();
    if (!this.solidFoodForm.valid) {
      this.solidErrorMessage = this.translator.get('Some required fields are not filled.');
      return;
    }

    const activity = new FeedingActivity();
    activity.attributes = {
      amount: null,
      startTime: new EncryptedValue(await this.encryptor.encrypt((<Date>this.solidFoodForm.controls.startTime.value).toISOString())),
      endTime: new EncryptedValue(await this.encryptor.encrypt((<Date>this.solidFoodForm.controls.endTime.value).toISOString())),
      type: new EncryptedValue(await this.encryptor.encrypt(<FeedingType>'solid')),
      note: this.solidFoodForm.controls.notes.value ? new EncryptedValue(await this.encryptor.encrypt(this.solidFoodForm.controls.notes.value)) : null,
      breakDuration: null,
      bottleContentType: null,
      breast: null,
    }

    this.feedingActivityRepository.create(activity, false).subscribe(() => {
      this.router.navigateByUrl('/');
    });
  }

  public async onSolidFoodTrackingFinished(result: TrackerOutputData): Promise<void> {
    this.solidFoodForm.patchValue({
      startTime: result.startTime,
      endTime: result.endTime,
      trackingJustFinished: true,
    });
    await this.database.removeInProgress(ActivityType.FeedingSolid);
  }

  public async onSolidFoodTrackingStarted(startTime: Date) {
    await this.database.saveInProgress({
      startTime: startTime,
      activity: ActivityType.FeedingSolid,
      mode: 'running',
      notes: this.solidFoodForm.controls.notes.value,
      data: {},
    });
    this.solidFoodForm.patchValue({
      trackingJustFinished: false,
    });
  }
}
