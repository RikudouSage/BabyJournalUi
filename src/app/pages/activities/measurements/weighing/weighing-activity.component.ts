import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Observable, of} from "rxjs";
import {BreakpointObserver, Breakpoints} from "@angular/cdk/layout";
import {map, shareReplay} from "rxjs/operators";
import {WeighingActivity, WeighingActivityRepository} from "../../../../entity/weighing-activity.entity";
import {UserManagerService} from "../../../../services/user-manager.service";
import {toPromise} from "../../../../helper/observables";
import {EncryptorService} from "../../../../services/encryptor.service";
import {TranslateService} from "@ngx-translate/core";
import {EncryptedValue} from "../../../../dto/encrypted-value";
import {Router} from "@angular/router";

@Component({
  selector: 'app-weighing-activity',
  templateUrl: './weighing-activity.component.html',
  styleUrls: ['./weighing-activity.component.scss']
})
export class WeighingActivityComponent implements OnInit {
  public form = new FormGroup({
    startTime: new FormControl<Date>(new Date(), [Validators.required]),
    weight: new FormControl<number>(0, [Validators.required, Validators.min(0)]),
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
    private readonly weightRepository: WeighingActivityRepository,
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
    const item = new WeighingActivity();
    item.attributes = {
      startTime: new EncryptedValue(await this.encryptor.encrypt((<Date>this.form.controls.startTime.value).toISOString())),
      weight: new EncryptedValue(await this.encryptor.encrypt(String(this.form.controls.weight.value))),
    };

    this.weightRepository.create(item, false).subscribe(() => {
      this.loading = false;
      this.router.navigateByUrl('/');
    });
  }

  public async ngOnInit(): Promise<void> {
    this.form.valueChanges.subscribe(() => this.errorMessage = of(''));

    const user = await this.userManager.getCurrentUser();
    const child = await this.encryptor.decryptEntity((await toPromise(user.relationships.selectedChild))!);

    this.weightRepository.collection({
      filters: {
        child: String(child.id),
      }
    }).subscribe(async weights => {
      if (!weights.length) {
        if (child.attributes.birthWeight !== null) {
          this.form.patchValue({
            weight: Number(child.attributes.birthWeight.decrypted),
          });
        }
        this.loading = false;
        return;
      }
      const decrypted: WeighingActivity[] = [];
      for (const weight of weights) {
        if (weight === null) {
          continue;
        }

        decrypted.push(await this.encryptor.decryptEntity(weight));
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
        weight: Number(sorted[0].attributes.weight.decrypted),
      });
      this.loading = false;
    });
  }
}
