import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'languageName'
})
export class LanguageNamePipe implements PipeTransform {

  transform(language: string, locale: string): string {
    const intl = new Intl.DisplayNames(locale, {type: 'language'});
    return intl.of(language) ?? language;
  }

}
