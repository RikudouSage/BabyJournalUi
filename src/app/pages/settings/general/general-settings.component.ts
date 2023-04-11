import {Component, OnInit} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import {TitleService} from "../../../services/title.service";
import {FormControl, FormGroup} from "@angular/forms";
import {DatabaseService} from "../../../services/database.service";
import {AppLanguage} from "../../../types/app-language";
import {lastValueFrom} from "rxjs";

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
  });

  constructor(
    private readonly translator: TranslateService,
    private readonly titleService: TitleService,
    private readonly database: DatabaseService,
  ) {
  }

  public async ngOnInit(): Promise<void> {
    this.titleService.title = this.translator.get('General settings');
    this.languageNames = {
      [AppLanguage.Default]: await lastValueFrom(this.translator.get('Automatic detection')),
      [AppLanguage.English]: this.getLanguageName(AppLanguage.English),
      [AppLanguage.Czech]: this.getLanguageName(AppLanguage.Czech),
    };

    this.settingsForm.controls.language.valueChanges.subscribe(language => {
      this.database.storeLanguage(language);
      if (language === AppLanguage.Default) {
        this.translator.use(navigator.languages[0]);
      } else {
        this.translator.use(language);
      }
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
