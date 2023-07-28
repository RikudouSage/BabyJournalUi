import {Component, Inject, OnInit} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import {TitleService} from "../../../services/title.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {DatabaseService} from "../../../services/database.service";
import {AppLanguage} from "../../../types/app-language";
import {lastValueFrom, timer} from "rxjs";
import {getPrimaryBrowserLanguage} from "../../../helper/language";
import {MatSnackBar} from "@angular/material/snack-bar";
import {toPromise} from "../../../helper/observables";
import {UnitConverterService} from "../../../services/units/unit-converter.service";
import {WEIGHT_UNIT_CONVERTER} from "../../../dependency-injection/injection-tokens";
import {UnitConverter} from "../../../services/units/unit-converter";

interface Unit {
  units: string[];
  names: string[];
}

@Component({
  selector: 'app-general',
  templateUrl: './general-settings.component.html',
  styleUrls: ['./general-settings.component.scss']
})
export class GeneralSettingsComponent implements OnInit {
  public readonly AppLanguage = AppLanguage;
  public languageNames: {[key in AppLanguage]: string} | null = null;
  public weightUnits: {[key: string]: Unit} | null = null;
  public saved: boolean = false;

  public settingsForm = new FormGroup({
    language: new FormControl<AppLanguage>(this.database.getLanguage(), [Validators.required]),
    weightUnit: new FormControl<string>(this.database.getWeightUnit(), [Validators.required]),
  });

  constructor(
    private readonly translator: TranslateService,
    private readonly titleService: TitleService,
    private readonly database: DatabaseService,
    private readonly snackBar: MatSnackBar,
    @Inject(WEIGHT_UNIT_CONVERTER) private readonly weightUnitConverters: UnitConverter[],
  ) {
  }

  public async ngOnInit(): Promise<void> {
    this.titleService.title = this.translator.get('General settings');
    this.languageNames = {
      [AppLanguage.Default]: await lastValueFrom(this.translator.get('Automatic detection')),
      [AppLanguage.English]: this.getLanguageName(AppLanguage.English),
      [AppLanguage.Czech]: this.getLanguageName(AppLanguage.Czech),
    };

    this.weightUnits = {};
    for (const converter of this.weightUnitConverters) {
      this.weightUnits[converter.id] = {
        units: converter.units,
        names: await Promise.all(converter.names.map(async item => await toPromise(this.translator.get(item)))),
      }
    }
  }

  private getLanguageName(language: AppLanguage): string {
    if (language === AppLanguage.Default) {
      throw new Error("Unsupported");
    }

    const intl = new Intl.DisplayNames(language, {type: 'language'});
    return intl.of(language) ?? language;
  }

  public async save(): Promise<void> {
    if (!this.settingsForm.valid) {
      // todo handle errors
      return;
    }

    const language = this.settingsForm.controls.language.value!;
    const weightUnit = this.settingsForm.controls.weightUnit.value!;

    this.database.storeLanguage(language);
    if (language === AppLanguage.Default) {
      this.translator.use(getPrimaryBrowserLanguage());
    } else {
      this.translator.use(language);
    }
    this.database.setWeightUnit(weightUnit);

    const timeout = 5_000;
    this.saved = true;
    timer(timeout).subscribe(() => this.saved = false);
    this.snackBar.open(
      await toPromise(this.translator.get('Successfully saved! App restart might be needed.')),
      await toPromise(this.translator.get('Dismiss')),
      {
        duration: timeout,
      },
    );
  }
}
