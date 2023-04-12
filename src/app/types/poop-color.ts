import {Observable} from "rxjs";

export interface PoopColor {
  color: string;
  name: Observable<string>;
}
