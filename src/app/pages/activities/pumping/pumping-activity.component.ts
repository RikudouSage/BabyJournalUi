import {Component, OnInit} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import {TitleService} from "../../../services/title.service";
import {UserManagerService} from "../../../services/user-manager.service";
import {EncryptorService} from "../../../services/encryptor.service";
import {DatabaseService} from "../../../services/database.service";
import {Router} from "@angular/router";
import {PumpingActivity, PumpingActivityRepository} from "../../../entity/pumping-activity.entity";
import {BreastIndex} from "../../../enum/breast-index.enum";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {ActivityType} from "../../../enum/activity-type.enum";
import {MatTabChangeEvent} from "@angular/material/tabs";
import {Observable, of} from "rxjs";
import {TrackerComponent, TrackerOutputData} from "../../../components/tracker/tracker.component";
import {User, UserRepository} from "../../../entity/user.entity";
import {EncryptedValue} from "../../../dto/encrypted-value";

@Component({
  selector: 'app-pumping',
  templateUrl: './pumping-activity.component.html',
  styleUrls: ['./pumping-activity.component.scss']
})
export class PumpingActivityComponent implements OnInit {
  public form = new FormGroup({
    startTime: new FormControl<Date | null>(null, [Validators.required]),
    endTime: new FormControl<Date | null>(null, [Validators.required]),
    notes: new FormControl<string | null>(null),
    amount: new FormControl<number | null>(null),
    userId: new FormControl<string | null>(null, [Validators.required]),
    breast: new FormControl<BreastIndex>(BreastIndex.Left, [Validators.required]),
    trackingJustFinished: new FormControl<boolean>(false),
  });
  public errorMessage: Observable<string> = of('');
  public loading = true;

  constructor(
    private readonly translator: TranslateService,
    private readonly titleService: TitleService,
    private readonly userManager: UserManagerService,
    private readonly encryptor: EncryptorService,
    private readonly database: DatabaseService,
    private readonly router: Router,
    private readonly repository: PumpingActivityRepository,
    private readonly userRepository: UserRepository,
  ) {
  }
  public async ngOnInit(): Promise<void> {
    this.titleService.title = this.translator.get('Pumping');
    this.form.controls.breast.valueChanges.subscribe(
      async index => await this.database.saveLastPumpingBreast(index ?? BreastIndex.Left),
    );

    const lastParentId = await this.database.getLastPumpingParentId();
    if (lastParentId !== null) {
      this.form.patchValue({
        userId: lastParentId,
      });
    }

    this.form.patchValue({
      breast: await this.database.getLastPumpingBreast(),
    });
    const existingActivity = await this.database.getInProgress(ActivityType.Pumping);
    if (existingActivity !== null) {
      this.form.patchValue({
        startTime: existingActivity.startTime,
        notes: existingActivity.notes,
        amount: <number | null>existingActivity.data.amount,
        userId: <string>existingActivity.data.userId,
        breast: <BreastIndex>existingActivity.data.breast,
      });
    }

    this.form.valueChanges.subscribe(async changes => {
      const existingActivity = await this.database.getInProgress(ActivityType.Pumping);
      if (existingActivity === null || changes.trackingJustFinished) {
        return;
      }

      if (changes.startTime) {
        existingActivity.startTime = changes.startTime;
      }
      existingActivity.notes = changes.notes ?? null;
      existingActivity.data.breast = changes.breast;
      existingActivity.data.amount = changes.amount;
      existingActivity.data.userId = changes.userId;

      await this.database.saveInProgress(existingActivity);
    });

    this.loading = false;
  }

  public async saveSelectedBreast(event: MatTabChangeEvent): Promise<void> {
    this.form.patchValue({
      breast: event.index,
    });
  }

  public async save(tracker: TrackerComponent): Promise<void> {
    await tracker.finishTracking();
    if (!this.form.valid) {
      this.errorMessage = this.translator.get('Some required fields are not filled.');
      return;
    }

    const activity = new PumpingActivity();
    activity.attributes = {
      startTime: new EncryptedValue(await this.encryptor.encrypt((<Date>this.form.controls.startTime.value).toISOString())),
      endTime: new EncryptedValue(await this.encryptor.encrypt((<Date>this.form.controls.endTime.value).toISOString())),
      note: this.form.controls.notes.value ? new EncryptedValue(await this.encryptor.encrypt(this.form.controls.notes.value)) : null,
      amount: this.form.controls.amount.value ? new EncryptedValue(await this.encryptor.encrypt(String(this.form.controls.amount.value))) : null,
      breast: new EncryptedValue(await this.encryptor.encrypt(String(this.form.controls.breast.value))),
    };
    activity.relationships.pumpingParent = this.userRepository.get(<string>this.form.controls.userId.value);

    this.repository.create(activity, false).subscribe(() => {
      this.router.navigateByUrl('/');
    });
  }

  public async onTrackingFinished(result: TrackerOutputData) {
    this.form.patchValue({
      startTime: result.startTime,
      endTime: result.endTime,
      trackingJustFinished: true,
    });
    await this.database.removeInProgress(ActivityType.Pumping);
  }

  public async onTrackingStarted(startTime: Date) {
    await this.database.saveInProgress({
      startTime: startTime,
      activity: ActivityType.Pumping,
      mode: 'running',
      notes: this.form.controls.notes.value,
      data: {
        breast: this.form.controls.breast.value,
        amount: this.form.controls.amount.value,
        userId: this.form.controls.userId.value,
      },
    });
    this.form.patchValue({
      trackingJustFinished: false,
    });
  }

  public async parentChanged(user: User) {
    this.form.patchValue({
      userId: <string>user.id,
    });
    await this.database.saveLastPumpingParentId(<string>user.id);
  }
}
