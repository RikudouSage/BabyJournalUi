import {Activity} from "./activity";
import {TranslateService} from "@ngx-translate/core";
import {Injectable} from "@angular/core";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class DiaperingActivity implements Activity {

  constructor(
    private readonly translator: TranslateService,
  ) {
  }

  getColor(): string {
    return "#d500f9";
  }

  getDisplayName(): Observable<string> {
    return this.translator.get('Diapering');
  }

  getLink(): string {
    return "";
  }

}
