import {Component, OnInit} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import {TitleService} from "../../../services/title.service";
import {FormControl, FormGroup} from "@angular/forms";
import {DatabaseService} from "../../../services/database.service";
import {AppLanguage} from "../../../types/app-language";
import {lastValueFrom} from "rxjs";
import {getPrimaryBrowserLanguage} from "../../../helper/language";
import {MatSnackBar} from "@angular/material/snack-bar";
import {toPromise} from "../../../helper/observables";
import {GlobalOfflineModeService} from "../../../services/global-offline-mode.service";

@Component({
  selector: 'app-general',
  templateUrl: './general-settings.component.html',
  styleUrls: ['./general-settings.component.scss']
})
export class GeneralSettingsComponent implements OnInit {
  public readonly AppLanguage = AppLanguage;
  public languageNames: {[key in AppLanguage]: string} | null = null;

  public settingsForm = new FormGroup({
    language: <FormControl<AppLanguage>>new FormControl(this.database.getLanguage()),
    offlineMode: new FormControl(this.offlineMode.isOffline()),
  });

  constructor(
    private readonly translator: TranslateService,
    private readonly titleService: TitleService,
    private readonly database: DatabaseService,
    private readonly snackBar: MatSnackBar,
    private readonly offlineMode: GlobalOfflineModeService,
  ) {
  }

  public async ngOnInit(): Promise<void> {
    this.titleService.title = this.translator.get('General settings');
    this.languageNames = {
      [AppLanguage.Default]: await lastValueFrom(this.translator.get('Automatic detection')),
      [AppLanguage.English]: this.getLanguageName(AppLanguage.English),
      [AppLanguage.Czech]: this.getLanguageName(AppLanguage.Czech),
      [AppLanguage.Italian]: this.getLanguageName(AppLanguage.Italian),
    };

    this.settingsForm.controls.language.valueChanges.subscribe(async language => {
      this.database.storeLanguage(language);
      if (language === AppLanguage.Default) {
        this.translator.use(getPrimaryBrowserLanguage());
      } else {
        this.translator.use(language);
      }

      this.snackBar.open(
        await toPromise(this.translator.get('Successfully saved! App restart might be needed.')),
        await toPromise(this.translator.get('Dismiss')),
        {
          duration: 10_000,
        },
      );
    });
    this.settingsForm.controls.offlineMode.valueChanges.subscribe(async offline => {
      this.offlineMode.setOfflineMode(offline ?? false);
      this.snackBar.open(
        await toPromise(this.translator.get('Successfully saved!')),
        await toPromise(this.translator.get('Dismiss')),
        {
          duration: 10_000,
        },
      );
    });
  }

  private getLanguageName(language: AppLanguage): string {
    if (language === AppLanguage.Default) {
      throw new Error("Unsupported");
    }

    const intl = new Intl.DisplayNames(language, {type: 'language'});
    return intl.of(language) ?? language;
  }

}
