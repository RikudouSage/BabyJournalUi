import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from "@angular/router";
import {UserManagerService} from "../services/user-manager.service";
import {lastValueFrom} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ChildIsSelectedGuard implements CanActivate {
  constructor(
    private readonly userManager: UserManagerService,
    private readonly router: Router,
  ) {
  }

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean | UrlTree> {
    const user = await this.userManager.getCurrentUser();
    const currentChild = await lastValueFrom(user.relationships.selectedChild);
    if (currentChild === null) {
      return this.router.createUrlTree(['/children/select-child']);
    }

    return true;
  }

}
