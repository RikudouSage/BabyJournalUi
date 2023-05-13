import {Component, OnInit} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import {TitleService} from "../../../services/title.service";
import {ApiService} from "../../../services/api.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {
  CalculateActivitySince,
  DefaultParentalUnitSettings,
  ParentalUnitSetting
} from "../../../enum/parental-unit-setting.enum";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {timer} from "rxjs";
import {toPromise} from "../../../helper/observables";
import {EnumToStringService} from "../../../services/enum-to-string.service";

@Component({
  selector: 'app-activity',
  templateUrl: './activity-settings.component.html',
  styleUrls: ['./activity-settings.component.scss']
})
export class ActivitySettingsComponent implements OnInit {
  protected readonly ParentalUnitSetting = ParentalUnitSetting;
  protected readonly CalculateActivitySince = CalculateActivitySince;
  protected readonly calculateActivitySinceToString = this.enumToString.calculateActivitySinceToString;

  public saved = false;
  public form = new FormGroup({
    [ParentalUnitSetting.FeedingBreakLength]: new FormControl<number>(DefaultParentalUnitSettings[ParentalUnitSetting.FeedingBreakLength], [
      Validators.min(0),
    ]),
    [ParentalUnitSetting.CalculateFeedingSince]: new FormControl<CalculateActivitySince>(DefaultParentalUnitSettings[ParentalUnitSetting.CalculateFeedingSince], [
      Validators.required,
    ]),
    [ParentalUnitSetting.CalculateSleepingSince]: new FormControl<CalculateActivitySince>(DefaultParentalUnitSettings[ParentalUnitSetting.CalculateSleepingSince], [
      Validators.required,
    ]),
    [ParentalUnitSetting.CalculatePumpingSince]: new FormControl<CalculateActivitySince>(DefaultParentalUnitSettings[ParentalUnitSetting.CalculatePumpingSince], [
      Validators.required,
    ]),
  });
  public loaded: boolean = false;

  constructor(
    private readonly translator: TranslateService,
    private readonly titleService: TitleService,
    private readonly api: ApiService,
    private readonly snackBar: MatSnackBar,
    private readonly enumToString: EnumToStringService,
  ) {
  }

  public async ngOnInit(): Promise<void> {
    this.titleService.title = this.translator.get('Activity settings');

    const settings = await this.api.getSettings();
    this.form.patchValue({
      [ParentalUnitSetting.FeedingBreakLength]: Number(settings[ParentalUnitSetting.FeedingBreakLength]),
      [ParentalUnitSetting.CalculateFeedingSince]: <CalculateActivitySince>settings[ParentalUnitSetting.CalculateFeedingSince],
      [ParentalUnitSetting.CalculateSleepingSince]: <CalculateActivitySince>settings[ParentalUnitSetting.CalculateSleepingSince],
      [ParentalUnitSetting.CalculatePumpingSince]: <CalculateActivitySince>settings[ParentalUnitSetting.CalculatePumpingSince],
    });
    this.loaded = true;
  }

  public async save() {
    if (!this.form.valid) {
      return;
    }

    await this.api.saveSettings({
      [ParentalUnitSetting.FeedingBreakLength]: this.form.controls[ParentalUnitSetting.FeedingBreakLength].value || DefaultParentalUnitSettings[ParentalUnitSetting.FeedingBreakLength],
      [ParentalUnitSetting.CalculateFeedingSince]: this.form.controls[ParentalUnitSetting.CalculateFeedingSince].value || DefaultParentalUnitSettings[ParentalUnitSetting.CalculateFeedingSince],
      [ParentalUnitSetting.CalculateSleepingSince]: this.form.controls[ParentalUnitSetting.CalculateSleepingSince].value || DefaultParentalUnitSettings[ParentalUnitSetting.CalculateSleepingSince],
      [ParentalUnitSetting.CalculatePumpingSince]: this.form.controls[ParentalUnitSetting.CalculatePumpingSince].value || DefaultParentalUnitSettings[ParentalUnitSetting.CalculatePumpingSince],
    });

    const timeout = 3_000;

    this.saved = true;
    timer(timeout).subscribe(() => this.saved = false);
    this.snackBar.open(
      await toPromise(this.translator.get('Successfully saved!')),
      await toPromise(this.translator.get('Dismiss')),
      {
        duration: timeout,
      }
    );
  }
}
