import {Component, OnInit} from '@angular/core';
import {TitleService} from "../../../services/title.service";
import {TranslateService} from "@ngx-translate/core";
import {ActivatedRoute, Router} from "@angular/router";
import {toPromise} from "../../../helper/observables";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {EncryptorService} from "../../../services/encryptor.service";
import {SleepingActivity, SleepingActivityRepository} from "../../../entity/sleeping-activity.entity";
import {Observable, of} from "rxjs";
import {BreakpointObserver, Breakpoints} from "@angular/cdk/layout";
import {map, shareReplay} from "rxjs/operators";
import {ConfirmDialog} from "../../../components/dialogs/confirm-dialog/confirm-dialog.component";
import {PumpingActivity} from "../../../entity/pumping-activity.entity";
import {findRouteParent} from "../../../helper/route-hierarchy";
import {MatDialog} from "@angular/material/dialog";
import {DatabaseService} from "../../../services/database.service";
import {EncryptedValue} from "../../../dto/encrypted-value";
import {toActivityStreamItem} from "../../../helper/activity-stream";
import {ActivityType} from "../../../enum/activity-type.enum";
import {UserManagerService} from "../../../services/user-manager.service";

@Component({
  selector: 'app-edit-sleeping',
  templateUrl: './edit-sleeping.component.html',
  styleUrls: ['./edit-sleeping.component.scss']
})
export class EditSleepingComponent implements OnInit {
  private currentRoute: string | null = null;
  private activity: SleepingActivity | null = null;

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
  });
  public errorMessage: Observable<string> = of('');

  constructor(
    private readonly titleService: TitleService,
    private readonly translator: TranslateService,
    private readonly route: ActivatedRoute,
    private readonly encryptor: EncryptorService,
    private readonly repository: SleepingActivityRepository,
    private readonly breakpointObserver: BreakpointObserver,
    private readonly dialog: MatDialog,
    private readonly database: DatabaseService,
    private readonly router: Router,
    private readonly userManager: UserManagerService,
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
        note: activity.attributes.note !== null ? activity.attributes.note.decrypted : null,
      });
      this.loading = false;
      this.activity = activity;
    });
  }

  public async save(): Promise<void> {
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
    }

    let childName: string | null = null;
    const user = await this.userManager.getCurrentUser();
    const child = await toPromise(user.relationships.selectedChild);
    if (child !== null && child.attributes.name !== null) {
      childName = await this.encryptor.decrypt(child.attributes.name.encrypted);
    }

    let updated = await toPromise(this.repository.update(this.activity, false));
    updated = await this.encryptor.decryptEntity(updated);
    await this.database.storeActivityStreamItem(toActivityStreamItem(
      updated,
      ActivityType.Sleeping,
      childName,
    ));
    await this.router.navigateByUrl(`/${findRouteParent(<string>this.currentRoute)}`);
  }

  public async confirmDelete(): Promise<void> {
    const dialog = this.dialog.open(ConfirmDialog, {
      data: {
        title: this.translator.get('Delete activity'),
        description: this.translator.get('Are you sure you want to delete this activity? You cannot take this action back.'),
      }
    });
    dialog.afterClosed().subscribe(async result => {
      if (result) {
        this.loading = true;
        const result = await toPromise(this.repository.delete(<SleepingActivity>this.activity));
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
