import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import { Observable } from 'rxjs';
import {DatabaseService} from "../services/database.service";

@Injectable({
  providedIn: 'root'
})
export class InitialLoadFinishedGuard implements CanActivate {

  constructor(
    private readonly router: Router,
    private readonly database: DatabaseService,
  ) {
  }

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean | UrlTree> {
    if (!await this.database.initialActivityStreamLoadFinished()) {
      return this.router.createUrlTree(['/full-data-refresh']);
    }

    return true;
  }

}
