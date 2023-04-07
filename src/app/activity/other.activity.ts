import {Activity} from "./activity";
import {Injectable} from "@angular/core";
import {TranslateService} from "@ngx-translate/core";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class OtherActivity implements Activity {
  constructor(
    private readonly translator: TranslateService,
  ) {
  }

  getColor(): string {
    return "#616161";
  }

  getDisplayName(): Observable<string> {
    return this.translator.get('Other');
  }

  getLink(): string {
    return "";
  }
}
