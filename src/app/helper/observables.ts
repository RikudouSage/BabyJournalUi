import {from, lastValueFrom, Observable} from "rxjs";

export function toPromise<T>(observable: Observable<T>): Promise<T> {
  return lastValueFrom(observable);
}

export function toObservable<T>(promise: Promise<T>): Observable<T> {
  return from(promise);
}
