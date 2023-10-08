import {inject} from "@angular/core";
import {CanActivateFn, Router, UrlTree} from "@angular/router";
import {ChildRepository} from "../entity/child.entity";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";

export const HasChildrenGuard: CanActivateFn = (): Observable<true | UrlTree> => {
  return inject(ChildRepository).collection().pipe(
    map(result => {
      if (result.totalItems < 1) {
        return inject(Router).createUrlTree(['/children/create-first']);
      }

      return true;
    }),
  );
}
