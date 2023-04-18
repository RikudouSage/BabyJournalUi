export function getBrowserLanguages(): string[] {
  return navigator.languages.map(value => {
    return value.split('-')[0];
  })
}

export function getPrimaryBrowserLanguage(): string {
  return getBrowserLanguages()[0];
}
