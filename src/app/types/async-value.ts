import {Observable} from "rxjs";

export type AsyncValue<T> = Promise<T> | Observable<T>;
export type Resolvable<T> = AsyncValue<T> | T;
