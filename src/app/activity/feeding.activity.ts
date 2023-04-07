import {Activity} from "./activity";
import {Injectable} from "@angular/core";
import {TranslateService} from "@ngx-translate/core";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class FeedingActivity implements Activity {
  constructor(
    private readonly translator: TranslateService,
  ) {
  }

  getColor(): string {
    return '#f48fb1';
  }

  getDisplayName(): Observable<string> {
    return this.translator.get('Feeding');
  }

  getLink(): string {
    return "/activities/feeding";
  }
}
