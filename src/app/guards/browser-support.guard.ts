import {inject} from "@angular/core";
import {CanActivateFn, Router, UrlTree} from "@angular/router";

export const BrowserSupportGuard: CanActivateFn = (): true | UrlTree => {
  const features = [
    window.crypto,
    window.crypto.subtle,
    navigator.clipboard,
  ];

  for (const feature of features) {
    if (typeof feature === 'undefined') {
      return inject(Router).createUrlTree(['/unsupported-browser']);
    }
  }

  return true;
}
