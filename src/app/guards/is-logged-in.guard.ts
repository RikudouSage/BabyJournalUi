import {inject} from "@angular/core";
import {CanActivateFn, Router, UrlTree} from "@angular/router";
import {UserManagerService} from "../services/user-manager.service";

export const IsLoggedInGuard: CanActivateFn = (): boolean | UrlTree => {
  if (!inject(UserManagerService).isLoggedIn()) {
    return inject(Router).createUrlTree(['/auth/register']);
  }

  return true;
}
