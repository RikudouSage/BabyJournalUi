import {inject} from "@angular/core";
import {CanActivateFn, Router, UrlTree} from "@angular/router";
import {UserManagerService} from "../services/user-manager.service";
import {lastValueFrom} from "rxjs";

export const ChildIsSelectedGuard: CanActivateFn = async (): Promise<true | UrlTree> => {
  const user = await inject(UserManagerService).getCurrentUser();
  const currentChild = await lastValueFrom(user.relationships.selectedChild);
  if (currentChild === null) {
    return inject(Router).createUrlTree(['/children/select-child']);
  }

  return true;
}
