import {Component, OnInit} from '@angular/core';
import {TitleService} from "../../../services/title.service";
import {TranslateService} from "@ngx-translate/core";
import {FeedingActivity, FeedingActivityRepository} from "../../../entity/feeding-activity.entity";
import {ActivatedRoute, Router} from "@angular/router";
import {DatabaseService} from "../../../services/database.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {EncryptorService} from "../../../services/encryptor.service";
import {toPromise} from "../../../helper/observables";
import {FeedingType} from "../../../types/feeding-type.type";
import {BottleContentType} from "../../../enum/bottle-content-type.enum";
import {BreastIndex} from "../../../enum/breast-index.enum";
import {Observable, of} from "rxjs";
import {BreakpointObserver, Breakpoints} from "@angular/cdk/layout";
import {map, shareReplay} from "rxjs/operators";
import {AppValidators} from "../../../helper/app-validators";
import {EnumToStringService} from "../../../services/enum-to-string.service";
import {EncryptedValue} from "../../../dto/encrypted-value";
import {findRouteParent} from "../../../helper/route-hierarchy";
import {toActivityStreamItem} from "../../../helper/activity-stream";
import {ActivityType} from "../../../enum/activity-type.enum";
import {UserManagerService} from "../../../services/user-manager.service";

@Component({
  selector: 'app-edit-feeding',
  templateUrl: './edit-feeding.component.html',
  styleUrls: ['./edit-feeding.component.scss']
})
export class EditFeedingComponent implements OnInit {
  public isHandset: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );
  public activity: FeedingActivity | null = null;
  public loading = true;
  public errorMessage: Observable<string> = of('');

  public form = new FormGroup({
    startTime: new FormControl<Date>(new Date(), [Validators.required]),
    endTime: new FormControl<Date>(new Date(), [Validators.required]),
    note: new FormControl<string | null>(null),
    type: new FormControl<FeedingType>('bottle'),
    bottleContentType: new FormControl<BottleContentType | null>(null),
    amount: new FormControl<number | null>(null),
    breast: new FormControl<BreastIndex | null>(null),
  }, [
    AppValidators.requiredIf(
      group => <FeedingType>group.controls['type'].value === 'bottle',
      'bottleContentType',
    ),
    AppValidators.requiredIf(
      group => <FeedingType>group.controls['type'].value === 'bottle',
      'amount',
    ),
    AppValidators.requiredIf(
      group => <FeedingType>group.controls['type'].value === 'nursing',
      'breast',
    ),
  ]);

  protected readonly BottleContentType = BottleContentType;
  protected readonly BreastIndex = BreastIndex;
  protected readonly bottleContentTypeToString = this.enumToString.bottleContentTypeToString;
  protected readonly breastIndexToString = this.enumToString.breastIndexToString;

  private currentRoute: string | null = null;

  constructor(
    private readonly titleService: TitleService,
    private readonly translator: TranslateService,
    private readonly feedingRepository: FeedingActivityRepository,
    private readonly route: ActivatedRoute,
    private readonly database: DatabaseService,
    private readonly encryptor: EncryptorService,
    private readonly breakpointObserver: BreakpointObserver,
    private readonly enumToString: EnumToStringService,
    private readonly router: Router,
    private readonly userManager: UserManagerService,
  ) {
  }

  public async ngOnInit(): Promise<void> {
    this.titleService.title = this.translator.get('Edit activity');

    this.route.url.subscribe(url => this.currentRoute = url.join('/'));
    this.route.params.subscribe(async params => {
      const id = <string>params['id'];
      let activity = await toPromise(this.feedingRepository.get(id));
      console.log(activity);
      activity = await this.encryptor.decryptEntity(activity);
      this.form.patchValue({
        startTime: new Date(activity.attributes.startTime.decrypted),
        endTime: new Date(activity.attributes.endTime.decrypted),
        note: activity.attributes.note?.decrypted ?? null,
        amount: activity.attributes.amount !== null ? Number(activity.attributes.amount.decrypted) : null,
        type: <FeedingType>activity.attributes.type.decrypted,
        breast: activity.attributes.breast !== null ? Number(activity.attributes.breast.decrypted) : null,
        bottleContentType: activity.attributes.bottleContentType ? <BottleContentType>activity.attributes.bottleContentType.decrypted : null,
      });
      this.loading = false;
      this.activity = activity;
    });
  }

  public async save() {
    this.loading = true;
    if (!this.form.valid) {
      this.errorMessage = this.translator.get('Some required fields are not filled.');
      this.loading = false;
      return;
    }

    if (this.activity === null) {
      // this shouldn't happen
      console.error('Activity is null');
      return;
    }

    const encrypt = this.encryptor.encrypt.bind(this);

    this.activity.attributes = {
      startTime: new EncryptedValue(await encrypt((<Date>this.form.controls.startTime.value).toISOString())),
      endTime: new EncryptedValue(await encrypt((<Date>this.form.controls.endTime.value).toISOString())),
      note: this.form.controls.note.value
        ? new EncryptedValue(await encrypt(this.form.controls.note.value))
        : null,
      type: new EncryptedValue(await encrypt(<FeedingType>this.form.controls.type.value)),
      bottleContentType: this.form.controls.bottleContentType.value
        ? new EncryptedValue(await encrypt(<BottleContentType>this.form.controls.bottleContentType.value))
        : null,
      amount: this.form.controls.amount.value !== null
        ? new EncryptedValue(await encrypt(String(this.form.controls.amount.value)))
        : null,
      breast: this.form.controls.breast.value !== null
        ? new EncryptedValue(await encrypt(String(this.form.controls.breast.value)))
        : null,
    }

    let activityType: ActivityType;
    switch (<FeedingType>this.form.controls.type.value) {
      case "bottle":
        activityType = ActivityType.FeedingBottle;
        break;
      case "nursing":
        activityType = ActivityType.FeedingBreast;
        break;
      case "solid":
        activityType = ActivityType.FeedingSolid;
        break;
    }

    let childName: string | null = null;

    const user = await this.userManager.getCurrentUser();
    const child = await toPromise(user.relationships.selectedChild);
    if (child !== null && child.attributes.name !== null) {
      childName = await this.encryptor.decrypt(child.attributes.name.encrypted);
    }
    let updated = await toPromise(this.feedingRepository.update(this.activity, false));
    updated = await this.encryptor.decryptEntity(updated);
    await this.database.storeActivityStreamItem(toActivityStreamItem(
      updated,
      activityType,
      childName,
    ));
    await this.router.navigateByUrl(`/${findRouteParent(<string>this.currentRoute)}`);
  }
}
