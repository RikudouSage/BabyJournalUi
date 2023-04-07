import {Activity} from "./activity";
import {Injectable} from "@angular/core";
import {TranslateService} from "@ngx-translate/core";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class MedicalActivity implements Activity {
  constructor(
    private readonly translator: TranslateService,
  ) {
  }

  getColor(): string {
    return "#d32f2f";
  }

  getDisplayName(): Observable<string> {
    return this.translator.get('Medical');
  }

  getLink(): string {
    return "";
  }

}
