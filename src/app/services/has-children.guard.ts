import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable} from 'rxjs';
import {ChildRepository} from "../entity/child.entity";
import {map} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class HasChildrenGuard implements CanActivate {
  constructor(
    private readonly childRepository: ChildRepository,
    private readonly router: Router,
  ) {
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    return this.childRepository.collection().pipe(
      map(result => {
        if (result.totalItems < 1) {
          return this.router.createUrlTree(['/children/create-first']);
        }

        return true;
      }),
    );
  }

}
