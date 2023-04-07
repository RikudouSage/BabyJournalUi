import {Activity} from "./activity";
import {Injectable} from "@angular/core";
import {TranslateService} from "@ngx-translate/core";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class SleepingActivity implements Activity {
  constructor(
    private readonly translator: TranslateService,
  ) {
  }

  getColor(): string {
    return "#1a237e";
  }

  getDisplayName(): Observable<string> {
    return this.translator.get('Sleeping');
  }

  getLink(): string {
    return "";
  }

}
