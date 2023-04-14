import {Component, OnInit} from '@angular/core';
import {TitleService} from "../../../services/title.service";
import {TranslateService} from "@ngx-translate/core";
import {ActivatedRoute, Router} from "@angular/router";
import {DatabaseService} from "../../../services/database.service";
import {EncryptorService} from "../../../services/encryptor.service";
import {BreakpointObserver, Breakpoints} from "@angular/cdk/layout";
import {EnumToStringService} from "../../../services/enum-to-string.service";
import {UserManagerService} from "../../../services/user-manager.service";
import {MatDialog} from "@angular/material/dialog";
import {DiaperingActivity, DiaperingActivityRepository} from "../../../entity/diapering-activity.entity";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {WetDiaperQuantity} from "../diapering/diapering-activity.component";
import {PoopColor} from "../../../types/poop-color";
import {toPromise} from "../../../helper/observables";
import {Observable, of} from "rxjs";
import {map, shareReplay} from "rxjs/operators";
import {ConfirmDialog} from "../../../components/dialogs/confirm-dialog/confirm-dialog.component";
import {findRouteParent} from "../../../helper/route-hierarchy";
import {EncryptedValue} from "../../../dto/encrypted-value";
import {toActivityStreamItem} from "../../../helper/activity-stream";
import {ActivityType} from "../../../enum/activity-type.enum";

@Component({
  selector: 'app-edit-diaper',
  templateUrl: './edit-diapering.component.html',
  styleUrls: ['./edit-diapering.component.scss']
})
export class EditDiaperingComponent implements OnInit {
  private currentRoute: string | null = null;
  private activity: DiaperingActivity | null = null;

  public loading = true;
  public errorMessage: Observable<string> = of('');
  public form = new FormGroup({
    startTime: new FormControl<Date>(new Date(), [Validators.required]),
    note: new FormControl<string | null>(null),
    wet: new FormControl<boolean>(false),
    poopy: new FormControl<boolean>(false),
    quantity: new FormControl<WetDiaperQuantity | null>(null),
    poopColor: new FormControl<PoopColor | null>(null),
  });
  public isHandset: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(
    private readonly titleService: TitleService,
    private readonly translator: TranslateService,
    private readonly repository: DiaperingActivityRepository,
    private readonly route: ActivatedRoute,
    private readonly database: DatabaseService,
    private readonly encryptor: EncryptorService,
    private readonly breakpointObserver: BreakpointObserver,
    private readonly enumToString: EnumToStringService,
    private readonly router: Router,
    private readonly userManager: UserManagerService,
    private readonly dialog: MatDialog,
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
        note: activity.attributes.note?.decrypted ?? null,
        wet: Boolean(Number(activity.attributes.wet.decrypted)),
        poopy: Boolean(Number(activity.attributes.poopy.decrypted)),
        quantity: activity.attributes.quantity
          ? <WetDiaperQuantity>activity.attributes.quantity.decrypted
          : null,
        poopColor: activity.attributes.poopColor
          ? <PoopColor>JSON.parse(activity.attributes.poopColor.decrypted)
          : null,
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
      note: this.form.controls.note.value
        ? new EncryptedValue(await encrypt(this.form.controls.note.value))
        : null,
      wet: new EncryptedValue(await encrypt(String(Number(this.form.controls.wet.value)))),
      poopy: new EncryptedValue(await encrypt(String(Number(this.form.controls.poopy.value)))),
      quantity: this.form.controls.quantity.value
        ? new EncryptedValue(await encrypt(this.form.controls.quantity.value))
        : null,
      poopColor: this.form.controls.poopColor.value
        ? new EncryptedValue(await encrypt(JSON.stringify(this.form.controls.poopColor.value)))
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
      ActivityType.Diapering,
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
        const result = await toPromise(this.repository.delete(<DiaperingActivity>this.activity));
        if (!result) {
          this.errorMessage = this.translator.get('Failed to delete the activity.');
          this.loading = false;
          return;
        }

        await this.database.removeActivityStreamItem(<string>(<DiaperingActivity>this.activity).id);
        await this.router.navigateByUrl(`/${findRouteParent(<string>this.currentRoute)}`);
      }
    });
  }
}
