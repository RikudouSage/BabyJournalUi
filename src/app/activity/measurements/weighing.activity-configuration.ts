import {ActivityConfiguration} from "../activity-configuration";
import {Injectable} from "@angular/core";
import {Observable, of} from "rxjs";
import {TranslateService} from "@ngx-translate/core";

@Injectable({
  providedIn: 'root',
})
export class WeighingActivityConfiguration implements ActivityConfiguration {
  color: string = '#7c4dff';
  displayName: Observable<string> = this.translator.get('Weight');
  isRunning: Observable<boolean> = of(false);
  lastActivityAt: Observable<null> = of(null);
  link: string = '/activities/measurements/weight';

  constructor(
    private readonly translator: TranslateService,
  ) {
  }
}
