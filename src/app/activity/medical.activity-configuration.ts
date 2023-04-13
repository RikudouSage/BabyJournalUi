import {ActivityConfiguration} from "./activity-configuration";
import {Injectable} from "@angular/core";
import {TranslateService} from "@ngx-translate/core";
import {Observable, of} from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class MedicalActivityConfiguration implements ActivityConfiguration {
  readonly color = '#d32f2f';
  readonly displayName = this.translator.get('Medical');
  readonly link = '';
  readonly isRunning = of(false);
  readonly lastActivityAt: Observable<Date | null> = of(null);

  constructor(
    private readonly translator: TranslateService,
  ) {
  }
}
