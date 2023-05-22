import {AppLanguage} from "../types/app-language";

export function getBrowserLanguages(): string[] {
  return navigator.languages.map(value => {
    return value.split('-')[0];
  })
}

export function getPrimaryBrowserLanguage(): string {
  return getBrowserLanguages()[0];
}

export function getFirstSupportedLanguage(): AppLanguage {
  for (const language of getBrowserLanguages()) {
    if (Object.values(AppLanguage).includes(<any>language)) {
      return <AppLanguage>language;
    }
  }

  return AppLanguage.English;
}
