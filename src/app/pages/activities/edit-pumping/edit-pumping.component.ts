import {Component, OnInit} from '@angular/core';
import {TitleService} from "../../../services/title.service";
import {TranslateService} from "@ngx-translate/core";
import {ActivatedRoute, Router} from "@angular/router";
import {PumpingActivity, PumpingActivityRepository} from "../../../entity/pumping-activity.entity";
import {toPromise} from "../../../helper/observables";
import {EncryptorService} from "../../../services/encryptor.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {BreastIndex} from "../../../enum/breast-index.enum";
import {Observable, of} from "rxjs";
import {BreakpointObserver, Breakpoints} from "@angular/cdk/layout";
import {map, shareReplay} from "rxjs/operators";
import {EnumToStringService} from "../../../services/enum-to-string.service";
import {ConfirmDialog} from "../../../components/dialogs/confirm-dialog/confirm-dialog.component";
import {findRouteParent} from "../../../helper/route-hierarchy";
import {MatDialog} from "@angular/material/dialog";
import {DatabaseService} from "../../../services/database.service";
import {EncryptedValue} from "../../../dto/encrypted-value";
import {toActivityStreamItem} from "../../../helper/activity-stream";
import {ActivityType} from "../../../enum/activity-type.enum";
import {UserRepository} from "../../../entity/user.entity";
import {potentiallyEncryptedValue} from "../../../pipes/potentially-encrypted-value.pipe";

@Component({
  selector: 'app-edit-pumping',
  templateUrl: './edit-pumping.component.html',
  styleUrls: ['./edit-pumping.component.scss']
})
export class EditPumpingComponent implements OnInit {
  protected readonly BreastIndex = BreastIndex;
  protected readonly breastIndexToString = this.enumToString.breastIndexToString;
  protected readonly String = String;

  private currentRoute: string | null = null;
  private activity: PumpingActivity | null = null;

  public isHandset: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  public loading = true;
  public form = new FormGroup({
    startTime: new FormControl<Date>(new Date(), [Validators.required]),
    endTime: new FormControl<Date>(new Date(), [Validators.required]),
    note: new FormControl<string | null>(null),
    breast: new FormControl<BreastIndex>(BreastIndex.Left, [Validators.required]),
    amount: new FormControl<number | null>(null),
    parentId: new FormControl<string>('', [Validators.required]),
  });
  public errorMessage: Observable<string> = of('');

  constructor(
    private readonly titleService: TitleService,
    private readonly translator: TranslateService,
    private readonly repository: PumpingActivityRepository,
    private readonly route: ActivatedRoute,
    private readonly encryptor: EncryptorService,
    private readonly breakpointObserver: BreakpointObserver,
    private readonly enumToString: EnumToStringService,
    private readonly dialog: MatDialog,
    private readonly database: DatabaseService,
    private readonly router: Router,
    private readonly userRepository: UserRepository,
  ) {
  }
  public async ngOnInit(): Promise<void> {
    this.titleService.title = this.translator.get('Edit activity');
    this.route.url.subscribe(url => this.currentRoute = url.join('/'));
    this.route.params.subscribe(async params => {
      const id = <string>params['id'];
      let activity = await toPromise(this.repository.get(id));
      activity = await this.encryptor.decryptEntity(activity);
      this.form.patchValue({
        startTime: new Date(activity.attributes.startTime.decrypted),
        endTime: new Date(activity.attributes.endTime.decrypted),
        amount: activity.attributes.amount !== null ? Number(activity.attributes.amount.decrypted) : null,
        breast: Number(activity.attributes.breast.decrypted),
        note: activity.attributes.note !== null ? activity.attributes.note.decrypted : null,
        parentId: <string>(await toPromise(activity.relationships.pumpingParent)).id,
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
      breast: new EncryptedValue(await encrypt(String(this.form.controls.breast.value))),
      amount: this.form.controls.amount.value !== null
        ? new EncryptedValue(await encrypt(String(this.form.controls.amount.value)))
        : null,
    }
    const pumpingParent = await this.encryptor.decryptEntity(await toPromise(this.userRepository.get(<string>this.form.controls.parentId.value)));
    this.activity.relationships.pumpingParent = of(pumpingParent);

    let updated = await toPromise(this.repository.update(this.activity, false));
    updated = await this.encryptor.decryptEntity(updated);
    await this.database.storeActivityStreamItem(toActivityStreamItem(
      updated,
      ActivityType.Pumping,
      null,
      {parentName: potentiallyEncryptedValue(pumpingParent.attributes.displayName)},
    ));
    await this.router.navigateByUrl(`/${findRouteParent(<string>this.currentRoute)}`);
  }

  public async confirmDelete() {
    const dialog = this.dialog.open(ConfirmDialog, {
      data: {
        title: this.translator.get('Delete activity'),
        description: this.translator.get('Are you sure you want to delete this activity? You cannot take this action back.'),
      }
    });
    dialog.afterClosed().subscribe(async result => {
      if (result) {
        this.loading = true;
        const result = await toPromise(this.repository.delete(<PumpingActivity>this.activity));
        if (!result) {
          this.errorMessage = this.translator.get('Failed to delete the activity.');
          this.loading = false;
          return;
        }

        await this.database.removeActivityStreamItem(<string>(<PumpingActivity>this.activity).id);
        await this.router.navigateByUrl(`/${findRouteParent(<string>this.currentRoute)}`);
      }
    });
  }
}
