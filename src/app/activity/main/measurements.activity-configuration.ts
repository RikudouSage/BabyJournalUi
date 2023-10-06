import {ActivityConfiguration} from "../activity-configuration";
import {Observable, of} from "rxjs";
import {Injectable} from "@angular/core";
import {TranslateService} from "@ngx-translate/core";

@Injectable({
  providedIn: 'root',
})
export class MeasurementsActivityConfiguration implements ActivityConfiguration {
  color: string = '#7c4dff';
  displayName: Observable<string> = this.translator.get('Measurements');
  isRunning: Observable<boolean> = of(false);
  lastActivityAt: Observable<null> = of(null);
  link: string = '/activities/measurements';

  constructor(
    private readonly translator: TranslateService,
  ) {
  }
}
