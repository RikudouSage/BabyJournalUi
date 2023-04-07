import {Observable} from "rxjs";

export interface Activity {
  getDisplayName(): Observable<string> | Promise<string>;
  getColor(): string;
  getLink(): string;
}
