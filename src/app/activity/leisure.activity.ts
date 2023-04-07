import {Activity} from "./activity";
import {Injectable} from "@angular/core";
import {TranslateService} from "@ngx-translate/core";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class LeisureActivity implements Activity {
  constructor(
    private readonly translator: TranslateService,
  ) {
  }

  getColor(): string {
    return "#00bcd4";
  }

  getDisplayName(): Observable<string> {
    return this.translator.get('Leisure');
  }

  getLink(): string {
    return "";
  }

}
