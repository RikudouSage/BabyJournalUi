import {Component, OnInit} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import {TitleService} from "../../../services/title.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Observable, of} from "rxjs";
import {BreakpointObserver, Breakpoints} from "@angular/cdk/layout";
import {map, shareReplay} from "rxjs/operators";
import {PoopColor} from "../../../types/poop-color";
import {DiaperingActivity, DiaperingActivityRepository} from "../../../entity/diapering-activity.entity";
import {EncryptorService} from "../../../services/encryptor.service";
import {EncryptedValue} from "../../../dto/encrypted-value";
import {Router} from "@angular/router";
import {PoopColorsService} from "../../../services/poop-colors.service";

export type WetDiaperQuantity = 'small' | 'medium' | 'large';

@Component({
  selector: 'app-diapering',
  templateUrl: './diapering-activity.component.html',
  styleUrls: ['./diapering-activity.component.scss']
})
export class DiaperingActivityComponent implements OnInit {
  public isHandset: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  public diaperingForm = new FormGroup({
    startTime: new FormControl<Date>(new Date(), [Validators.required]),
    notes: new FormControl<string | null>(null),
    wet: new FormControl<boolean>(true),
    poopy: new FormControl<boolean>(false),
    trackingJustFinished: new FormControl<boolean>(false),
    quantity: new FormControl<WetDiaperQuantity | null>(null),
    poopColor: new FormControl<PoopColor | null>(null),
  });
  public errorMessage: Observable<string> = of('');
  public poopColors: PoopColor[] = this.poopColorsService.poopColors;
  public loading = false;

  constructor(
    private readonly translator: TranslateService,
    private readonly titleService: TitleService,
    private readonly breakpointObserver: BreakpointObserver,
    private readonly encryptor: EncryptorService,
    private readonly diaperingActivityRepository: DiaperingActivityRepository,
    private readonly router: Router,
    private readonly poopColorsService: PoopColorsService,
  ) {
  }
  public async ngOnInit(): Promise<void> {
    this.titleService.title = this.translator.get('Diapering');
  }

  public async togglePoopy(): Promise<void> {
    this.diaperingForm.patchValue({
      poopy: !this.diaperingForm.controls.poopy.value,
    });
  }

  public async toggleWet(): Promise<void> {
    this.diaperingForm.patchValue({
      wet: !this.diaperingForm.controls.wet.value,
    });
  }

  public async toggleDry(): Promise<void> {
    if (!this.diaperingForm.controls.wet.value && !this.diaperingForm.controls.poopy.value) {
      this.diaperingForm.patchValue({
        wet: true,
      });
    } else {
      this.diaperingForm.patchValue({
        wet: false,
        poopy: false,
      });
    }
  }

  public async saveDiaperingData(): Promise<void> {
    if (!this.diaperingForm.valid) {
      this.errorMessage = this.translator.get('Some required fields are not filled.');
      return;
    }

    this.loading = true;
    const item = new DiaperingActivity();
    item.attributes = {
      startTime: new EncryptedValue(await this.encryptor.encrypt((<Date>this.diaperingForm.controls.startTime.value).toISOString())),
      note: this.diaperingForm.controls.notes.value ? new EncryptedValue(await this.encryptor.encrypt(this.diaperingForm.controls.notes.value)) : null,
      wet: new EncryptedValue(await this.encryptor.encrypt(String(Number(this.diaperingForm.controls.wet.value)))),
      poopy: new EncryptedValue(await this.encryptor.encrypt(String(Number(this.diaperingForm.controls.poopy.value)))),
      poopColor: this.diaperingForm.controls.poopColor.value ? new EncryptedValue(await this.encryptor.encrypt(JSON.stringify(this.diaperingForm.controls.poopColor.value))) : null,
      quantity: this.diaperingForm.controls.quantity.value ? new EncryptedValue(await this.encryptor.encrypt(this.diaperingForm.controls.quantity.value)) : null,
    };

    this.diaperingActivityRepository.create(item, false).subscribe(() => {
      this.loading = false;
      this.router.navigateByUrl('/');
    });
  }
}
