import { Injectable } from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from "@angular/common/http";
import {Observable} from "rxjs";
import {UserManagerService} from "./user-manager.service";

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private readonly userManager: UserManagerService,
  ) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!req.headers.has('X-No-User-Id')) {
      req = req.clone({
        headers: req.headers.set('X-User-Id', this.userManager.getUserId()),
      });
    } else {
      req = req.clone({
        headers: req.headers.delete('X-No-User-Id'),
      });
    }
    return next.handle(req);
  }

}
