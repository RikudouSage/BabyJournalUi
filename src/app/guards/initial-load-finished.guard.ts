import {inject} from '@angular/core';
import {CanActivateFn, Router, UrlTree} from '@angular/router';
import {DatabaseService} from "../services/database.service";

export const InitialLoadFinishedGuard: CanActivateFn = async (): Promise<true | UrlTree> => {
  if (!await inject(DatabaseService).initialActivityStreamLoadFinished()) {
    return inject(Router).createUrlTree(['/full-data-refresh']);
  }

  return true;
}
