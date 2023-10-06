import {Component, OnInit} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import {TitleService} from "../../../services/title.service";
import {UserManagerService} from "../../../services/user-manager.service";
import {EncryptorService} from "../../../services/encryptor.service";
import {toPromise} from "../../../helper/observables";
import {potentiallyEncryptedValue} from "../../../pipes/potentially-encrypted-value.pipe";
import {
  ActivityStream,
  ActivityStreamService,
  MilestoneActivityStreamItem
} from "../../../services/activity-stream.service";
import {ActivityType} from "../../../enum/activity-type.enum";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {NamedMilestone} from "../../../enum/named-milestone.enum";
import {EnumToStringService} from "../../../services/enum-to-string.service";
import {Observable, of} from "rxjs";
import {BreakpointObserver, Breakpoints} from "@angular/cdk/layout";
import {map, shareReplay} from "rxjs/operators";
import {MilestoneActivity, MilestoneActivityRepository} from "../../../entity/milestone-activity.entity";
import {EncryptedValue} from "../../../dto/encrypted-value";
import {User} from "../../../entity/user.entity";
import {Child} from "../../../entity/child.entity";

@Component({
  selector: 'app-milestones-activity',
  templateUrl: './milestones-activity.component.html',
  styleUrls: ['./milestones-activity.component.scss']
})
export class MilestonesActivityComponent implements OnInit {
  protected readonly NamedMilestone = NamedMilestone;
  protected readonly translatableNamedMilestoneName = this.enumToStringService.milestoneToString.bind(this);

  private user: User | null = null;
  private child: Child | null = null;

  public loading: boolean = true;
  public errorMessage: Observable<string> = of('');
  public activityStream: ActivityStream | null = null;

  public achievedNamedMilestones: NamedMilestone[] = [];

  public isHandset: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  public form = new FormGroup({
    name: new FormControl<string | null>(null, [Validators.required]),
    namedMilestone: new FormControl<NamedMilestone>(NamedMilestone.Custom),
    startTime: new FormControl<Date>(new Date(), [Validators.required]),
    note: new FormControl<string | null>(null),
  });

  constructor(
    private readonly breakpointObserver: BreakpointObserver,
    private readonly translator: TranslateService,
    private readonly titleService: TitleService,
    private readonly userManager: UserManagerService,
    private readonly encryptor: EncryptorService,
    private readonly activityStreamService: ActivityStreamService,
    private readonly enumToStringService: EnumToStringService,
    private readonly repository: MilestoneActivityRepository,
  ) {
  }
  public async ngOnInit(): Promise<void> {
    this.user = await this.userManager.getCurrentUser();
    this.child = await this.encryptor.decryptEntity((await toPromise(this.user.relationships.selectedChild))!);

    this.titleService.title = this.translator.get(`{{childName}}'s milestones`, {
      childName: potentiallyEncryptedValue(this.child.attributes.displayName),
    });

    await this.reload();
    this.form.controls.namedMilestone.valueChanges.subscribe(value => {
      if (value !== NamedMilestone.Custom) {
        this.enumToStringService.milestoneToString(value!).subscribe(translated => {
          this.form.patchValue({name: translated});
        });
      } else {
        this.form.patchValue({name: null});
      }
    });
  }

  public async onSubmit(): Promise<void> {
    if (!this.form.valid) {
      this.errorMessage = this.translator.get('Some required fields are not filled.');
      return;
    }

    const item = new MilestoneActivity();
    item.attributes = {
      startTime: new EncryptedValue(await this.encryptor.encrypt((<Date>this.form.controls.startTime.value).toISOString())),
      note: this.form.controls.note.value ? new EncryptedValue(await this.encryptor.encrypt(this.form.controls.note.value)) : null,
      predefinedMilestone: new EncryptedValue(await this.encryptor.encrypt(this.form.controls.namedMilestone.value!)),
      milestoneName: new EncryptedValue(await this.encryptor.encrypt(this.form.controls.name.value!)),
    };

    this.repository.create(item, false).subscribe(() => {
      this.reload().then(() => {
        this.form.patchValue({
          name: null,
          namedMilestone: NamedMilestone.Custom,
          note: null,
          startTime: new Date(),
        });
      });
    });
  }

  public async reload(): Promise<void> {
    this.loading = true;

    this.activityStream = (await toPromise(this.activityStreamService.getActivityStream()))
      .filter(item => item.activityType === ActivityType.Milestone);

    for (const item of this.activityStream) {
      const typedItem = item as MilestoneActivityStreamItem;
      if ((typedItem.predefinedMilestone ?? NamedMilestone.Custom) === NamedMilestone.Custom) {
        continue;
      }
      this.achievedNamedMilestones.push(typedItem.predefinedMilestone!);
    }
    this.activityStream = this.activityStream.slice(0, 99);

    this.loading = false;
  }
}
