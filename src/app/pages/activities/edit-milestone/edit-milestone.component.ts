import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Observable, of} from "rxjs";
import {BreakpointObserver, Breakpoints} from "@angular/cdk/layout";
import {map, shareReplay} from "rxjs/operators";
import {TitleService} from "../../../services/title.service";
import {TranslateService} from "@ngx-translate/core";
import {ActivatedRoute, Router} from "@angular/router";
import {DatabaseService} from "../../../services/database.service";
import {EncryptorService} from "../../../services/encryptor.service";
import {UserManagerService} from "../../../services/user-manager.service";
import {MatDialog} from "@angular/material/dialog";
import {EncryptedValue} from "../../../dto/encrypted-value";
import {toPromise} from "../../../helper/observables";
import {toActivityStreamItem} from "../../../helper/activity-stream";
import {ActivityType} from "../../../enum/activity-type.enum";
import {findRouteParent} from "../../../helper/route-hierarchy";
import {ConfirmDialog} from "../../../components/dialogs/confirm-dialog/confirm-dialog.component";
import {NamedMilestone} from "../../../enum/named-milestone.enum";
import {MilestoneActivity, MilestoneActivityRepository} from "../../../entity/milestone-activity.entity";
import {EnumToStringService} from "../../../services/enum-to-string.service";

@Component({
  selector: 'app-edit-milestone',
  templateUrl: './edit-milestone.component.html',
  styleUrls: ['./edit-milestone.component.scss']
})
export class EditMilestoneComponent implements OnInit {
  protected readonly NamedMilestone = NamedMilestone;
  protected readonly translatableNamedMilestoneName = this.enumToStringService.milestoneToString.bind(this);

  public loading: boolean = true;
  public form = new FormGroup({
    name: new FormControl<string | null>(null, [Validators.required]),
    namedMilestone: new FormControl<NamedMilestone>(NamedMilestone.Custom),
    startTime: new FormControl<Date>(new Date(), [Validators.required]),
    note: new FormControl<string | null>(null),
  });
  public errorMessage: Observable<string> = of('');
  public isHandset: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );


  private activity: MilestoneActivity | null = null;
  private currentRoute: string | null = null;

  constructor(
    private readonly titleService: TitleService,
    private readonly translator: TranslateService,
    private readonly repository: MilestoneActivityRepository,
    private readonly route: ActivatedRoute,
    private readonly database: DatabaseService,
    private readonly encryptor: EncryptorService,
    private readonly breakpointObserver: BreakpointObserver,
    private readonly router: Router,
    private readonly userManager: UserManagerService,
    private readonly dialog: MatDialog,
    private readonly enumToStringService: EnumToStringService,
  ) {
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

    this.activity.attributes = {
      startTime: new EncryptedValue(await this.encryptor.encrypt((<Date>this.form.controls.startTime.value).toISOString())),
      note: this.form.controls.note.value ? new EncryptedValue(await this.encryptor.encrypt(this.form.controls.note.value)) : null,
      predefinedMilestone: new EncryptedValue(await this.encryptor.encrypt(this.form.controls.namedMilestone.value!)),
      milestoneName: new EncryptedValue(await this.encryptor.encrypt(this.form.controls.name.value!)),
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
      ActivityType.Milestone,
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
        const result = await toPromise(this.repository.delete(this.activity!));
        if (!result) {
          this.errorMessage = this.translator.get('Failed to delete the activity.');
          this.loading = false;
          return;
        }

        await this.database.removeActivityStreamItem(<string>(this.activity!).id);
        await this.router.navigateByUrl(`/${findRouteParent(<string>this.currentRoute)}`);
      }
    });
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
        name: activity.attributes.milestoneName?.decrypted ?? null,
        namedMilestone: <NamedMilestone>activity.attributes.predefinedMilestone!.decrypted,
        note: activity.attributes.note?.decrypted ?? null,
      });
      this.loading = false;
      this.activity = activity;

      this.form.controls.namedMilestone.valueChanges.subscribe(value => {
        if (value !== NamedMilestone.Custom) {
          this.enumToStringService.milestoneToString(value!).subscribe(translated => {
            this.form.patchValue({name: translated});
          });
        } else {
          this.form.patchValue({name: null});
        }
      });
    });
  }
}
