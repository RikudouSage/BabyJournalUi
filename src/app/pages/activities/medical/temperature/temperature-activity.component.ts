import { Component } from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Observable, of} from "rxjs";
import {BreakpointObserver, Breakpoints} from "@angular/cdk/layout";
import {map, shareReplay} from "rxjs/operators";
import {WeighingActivity, WeighingActivityRepository} from "../../../../entity/weighing-activity.entity";
import {UserManagerService} from "../../../../services/user-manager.service";
import {EncryptorService} from "../../../../services/encryptor.service";
import {TranslateService} from "@ngx-translate/core";
import {Router} from "@angular/router";
import {EncryptedValue} from "../../../../dto/encrypted-value";
import {toPromise} from "../../../../helper/observables";
import {
  TemperatureMeasuringActivity,
  TemperatureMeasuringActivityRepository
} from "../../../../entity/temperature-measuring-activity.entity";

@Component({
  selector: 'app-temperature-activity',
  templateUrl: './temperature-activity.component.html',
  styleUrls: ['./temperature-activity.component.scss']
})
export class TemperatureActivityComponent {
  public form = new FormGroup({
    startTime: new FormControl<Date>(new Date(), [Validators.required]),
    temperature: new FormControl<number>(36.6, [Validators.required, Validators.min(0)]),
  });
  public loading = false;
  public errorMessage: Observable<string> = of('');
  public isHandset: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(
    private readonly breakpointObserver: BreakpointObserver,
    private readonly temperatureRepository: TemperatureMeasuringActivityRepository,
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
    const item = new TemperatureMeasuringActivity();
    item.attributes = {
      startTime: new EncryptedValue(await this.encryptor.encrypt((<Date>this.form.controls.startTime.value).toISOString())),
      temperature: new EncryptedValue(await this.encryptor.encrypt(String(this.form.controls.temperature.value))),
    };

    this.temperatureRepository.create(item, false).subscribe(() => {
      this.loading = false;
      this.router.navigateByUrl('/');
    });
  }

  public async ngOnInit(): Promise<void> {
    this.form.valueChanges.subscribe(() => this.errorMessage = of(''));
  }
}
