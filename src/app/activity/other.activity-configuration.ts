import {ActivityConfiguration} from "./activity-configuration";
import {Injectable} from "@angular/core";
import {TranslateService} from "@ngx-translate/core";
import {Observable, of} from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class OtherActivityConfiguration implements ActivityConfiguration {
  readonly color = '#616161';
  readonly displayName = this.translator.get('Other');
  readonly link = '';
  readonly isRunning = of(false);
  readonly lastActivityAt: Observable<Date | null> = of(null);

  constructor(
    private readonly translator: TranslateService,
  ) {
  }

  reloadStatus(): void {
  }
}
