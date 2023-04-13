import {ActivityConfiguration} from "./activity-configuration";
import {Injectable} from "@angular/core";
import {TranslateService} from "@ngx-translate/core";
import {Observable, of} from "rxjs";
import {DatabaseService} from "../services/database.service";

@Injectable({
  providedIn: 'root',
})
export class SleepingActivityConfiguration implements ActivityConfiguration {
  readonly color = '#1a237e';
  readonly displayName = this.translator.get('Sleeping');
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
