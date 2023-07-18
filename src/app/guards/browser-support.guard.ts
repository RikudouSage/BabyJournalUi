import {Injectable} from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  Router,
  RouterStateSnapshot,
  UrlTree
} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class BrowserSupportGuard implements CanActivate, CanActivateChild {

  constructor(
    private readonly router: Router,
  ) {
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    const features = [
      window.crypto,
      window.crypto.subtle,
      navigator.clipboard,
    ];

    for (const feature of features) {
      if (typeof feature === 'undefined') {
        return this.router.createUrlTree(['/unsupported-browser']);
      }
    }

    return true;
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    return this.canActivate(childRoute, state);
  }

}
