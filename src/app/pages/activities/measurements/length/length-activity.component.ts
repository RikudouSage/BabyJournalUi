import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Observable, of} from "rxjs";
import {BreakpointObserver, Breakpoints} from "@angular/cdk/layout";
import {map, shareReplay} from "rxjs/operators";
import {UserManagerService} from "../../../../services/user-manager.service";
import {EncryptorService} from "../../../../services/encryptor.service";
import {TranslateService} from "@ngx-translate/core";
import {Router} from "@angular/router";
import {EncryptedValue} from "../../../../dto/encrypted-value";
import {toPromise} from "../../../../helper/observables";
import {LengthActivity, LengthActivityRepository} from "../../../../entity/length-activity.entity";

@Component({
  selector: 'app-length-activity',
  templateUrl: './length-activity.component.html',
  styleUrls: ['./length-activity.component.scss']
})
export class LengthActivityComponent implements OnInit {
  public form = new FormGroup({
    startTime: new FormControl<Date>(new Date(), [Validators.required]),
    length: new FormControl<number>(0, [Validators.required, Validators.min(0)]),
  });
  public loading = true;
  public errorMessage: Observable<string> = of('');
  public isHandset: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(
    private readonly breakpointObserver: BreakpointObserver,
    private readonly lengthRepository: LengthActivityRepository,
    private readonly userManager: UserManagerService,
    private readonly encryptor: EncryptorService,
    private readonly translator: TranslateService,
    private readonly router: Router,
  ) {
  }

  public async onSubmit(): Promise<void> {
    if (!this.form.valid) {
      this.errorMessage = this.translator.get('Some required fields are not filled.');
      return;
    }

    this.loading = true;
    const item = new LengthActivity();
    item.attributes = {
      startTime: new EncryptedValue(await this.encryptor.encrypt((<Date>this.form.controls.startTime.value).toISOString())),
      length: new EncryptedValue(await this.encryptor.encrypt(String(this.form.controls.length.value))),
    };

    this.lengthRepository.create(item, false).subscribe(() => {
      this.loading = false;
      this.router.navigateByUrl('/');
    });
  }

  public async ngOnInit(): Promise<void> {
    this.form.valueChanges.subscribe(() => this.errorMessage = of(''));

    const user = await this.userManager.getCurrentUser();
    const child = await this.encryptor.decryptEntity((await toPromise(user.relationships.selectedChild))!);

    this.lengthRepository.collection({
      filters: {
        child: String(child.id),
      }
    }).subscribe(async lengths => {
      if (!lengths.length) {
        if (child.attributes.birthHeight !== null) {
          this.form.patchValue({
            length: Number(child.attributes.birthHeight.decrypted),
          });
        }
        this.loading = false;
        return;
      }
      const decrypted: LengthActivity[] = [];
      for (const length of lengths) {
        if (length === null) {
          continue;
        }

        decrypted.push(await this.encryptor.decryptEntity(length));
      }

      const sorted = decrypted.sort((a, b) => {
        const aDate = new Date(a.attributes.startTime.decrypted);
        const bDate = new Date(b.attributes.startTime.decrypted);

        if (aDate.getTime() === bDate.getTime()) {
          return 0;
        }

        return aDate.getTime() > bDate.getTime() ? -1 : 1;
      });

      this.form.patchValue({
        length: Number(sorted[0].attributes.length.decrypted),
      });
      this.loading = false;
    });
  }
}
