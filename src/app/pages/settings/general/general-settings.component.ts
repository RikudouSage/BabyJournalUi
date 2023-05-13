import {Component, OnInit} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import {TitleService} from "../../../services/title.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {DatabaseService} from "../../../services/database.service";
import {AppLanguage} from "../../../types/app-language";
import {lastValueFrom, timer} from "rxjs";
import {ApiService} from "../../../services/api.service";
import {ParentalUnitSetting} from "../../../enum/parental-unit-setting.enum";
import {MatSnackBar} from "@angular/material/snack-bar";
import {toPromise} from "../../../helper/observables";

@Component({
  selector: 'app-general',
  templateUrl: './general-settings.component.html',
  styleUrls: ['./general-settings.component.scss']
})
export class GeneralSettingsComponent implements OnInit {
  protected readonly ParentalUnitSetting = ParentalUnitSetting;
  protected readonly AppLanguage = AppLanguage;

  public languageNames: {[key in AppLanguage]: string} | null = null;
  public saved = false;

  public settingsForm = new FormGroup({
    language: new FormControl<AppLanguage>(this.database.getLanguage()),
    [ParentalUnitSetting.FeedingBreakLength]: new FormControl<number | null>(null, [
      Validators.min(0),
    ]),
  });

  constructor(
    private readonly translator: TranslateService,
    private readonly titleService: TitleService,
    private readonly database: DatabaseService,
    private readonly api: ApiService,
    private readonly snackBar: MatSnackBar,
  ) {
  }

  public async ngOnInit(): Promise<void> {
    this.titleService.title = this.translator.get('General settings');
    this.languageNames = {
      [AppLanguage.Default]: await lastValueFrom(this.translator.get('Automatic detection')),
      [AppLanguage.English]: this.getLanguageName(AppLanguage.English),
      [AppLanguage.Czech]: this.getLanguageName(AppLanguage.Czech),
    };
    const settings = await this.api.getSettings();
    this.settingsForm.patchValue({
      [ParentalUnitSetting.FeedingBreakLength]: Number(settings[ParentalUnitSetting.FeedingBreakLength]),
    });
  }

  private getLanguageName(language: AppLanguage): string {
    if (language === AppLanguage.Default) {
      throw new Error("Unsupported");
    }

    const intl = new Intl.DisplayNames(language, {type: 'language'});
    return intl.of(language) ?? language;
  }

  public async save() {
    if (!this.settingsForm.valid || this.settingsForm.controls.language.value === null) {
      return;
    }

    this.database.storeLanguage(<AppLanguage>this.settingsForm.controls.language.value);
    await this.api.saveSettings({
      [ParentalUnitSetting.FeedingBreakLength]: this.settingsForm.controls[ParentalUnitSetting.FeedingBreakLength].value || 0
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
