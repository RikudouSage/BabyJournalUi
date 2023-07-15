import {Component, OnInit} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import {TitleService} from "../../../services/title.service";
import {UserManagerService} from "../../../services/user-manager.service";
import {lastValueFrom, Observable, of} from "rxjs";
import {Child} from "../../../entity/child.entity";
import {EncryptorService} from "../../../services/encryptor.service";
import {potentiallyEncryptedValue} from "../../../pipes/potentially-encrypted-value.pipe";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {TrackerComponent, TrackerOutputData} from "../../../components/tracker/tracker.component";
import {ActivityType} from "../../../enum/activity-type.enum";
import {DatabaseService} from "../../../services/database.service";
import {EncryptedValue} from "../../../dto/encrypted-value";
import {SleepingActivity, SleepingActivityRepository} from "../../../entity/sleeping-activity.entity";
import {Router} from "@angular/router";
import {InProgressManager} from "../../../services/in-progress-manager.service";

@Component({
  selector: 'app-sleeping',
  templateUrl: './sleeping-activity.component.html',
  styleUrls: ['./sleeping-activity.component.scss']
})
export class SleepingActivityComponent implements OnInit {
  public loading = true;
  public errorMessage: Observable<string> = of('');
  public form = new FormGroup({
    startTime: new FormControl<Date | null>(null, [Validators.required]),
    endTime: new FormControl<Date | null>(null, [Validators.required]),
    notes: new FormControl<string | null>(null),
    trackingJustFinished: new FormControl<boolean>(false),
  });

  constructor(
    private readonly translator: TranslateService,
    private readonly titleService: TitleService,
    private readonly userManager: UserManagerService,
    private readonly encryptor: EncryptorService,
    private readonly database: DatabaseService,
    private readonly repository: SleepingActivityRepository,
    private readonly router: Router,
    private readonly inProgressManager: InProgressManager,
  ) {
  }
  public async ngOnInit(): Promise<void> {
    const user = await this.userManager.getCurrentUser();
    const child = await this.encryptor.decryptEntity((await lastValueFrom(user.relationships.selectedChild)) as Child);

    this.titleService.title = this.translator.get(`{{childName}}'s sleeping`, {
      childName: potentiallyEncryptedValue(child.attributes.displayName),
    });

    const existingActivity = await this.inProgressManager.getInProgress(ActivityType.Sleeping);
    if (existingActivity !== null) {
      this.form.patchValue({
        startTime: existingActivity.startTime,
        notes: existingActivity.notes,
      });
    }

    this.form.valueChanges.subscribe(async changes => {
      const existingActivity = await this.inProgressManager.getInProgress(ActivityType.Sleeping);
      if (existingActivity === null || changes.trackingJustFinished) {
        return;
      }

      if (changes.startTime) {
        existingActivity.startTime = changes.startTime;
      }
      existingActivity.notes = changes.notes ?? null;

      await this.inProgressManager.saveInProgress(existingActivity);
    });

    this.loading = false;
  }

  public async save(tracker: TrackerComponent) {
    await tracker.finishTracking();
    if (!this.form.valid) {
      this.errorMessage = this.translator.get('Some required fields are not filled.');
      return;
    }

    const activity = new SleepingActivity();
    activity.attributes = {
      startTime: new EncryptedValue(await this.encryptor.encrypt((<Date>this.form.controls.startTime.value).toISOString())),
      endTime: new EncryptedValue(await this.encryptor.encrypt((<Date>this.form.controls.endTime.value).toISOString())),
      note: this.form.controls.notes.value ? new EncryptedValue(await this.encryptor.encrypt(this.form.controls.notes.value)) : null,
    };

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
    await this.inProgressManager.removeInProgress(ActivityType.Sleeping);
  }

  public async onTrackingStarted(startTime: Date) {
    await this.inProgressManager.saveInProgress({
      startTime: startTime,
      activity: ActivityType.Sleeping,
      mode: 'running',
      notes: this.form.controls.notes.value,
      data: {},
    });
    this.form.patchValue({
      trackingJustFinished: false,
    });
  }
}
