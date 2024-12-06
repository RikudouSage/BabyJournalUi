import {ActivityConfiguration} from "../activity-configuration";
import {Observable, of} from "rxjs";
import {TranslateService} from "@ngx-translate/core";
import {Injectable} from "@angular/core";

@Injectable({
  providedIn: 'root',
})
export class LengthActivityConfiguration implements ActivityConfiguration {
  color: string = '#7c4dff';
  displayName: Observable<string> = this.translator.get('Length');
  isRunning: Observable<boolean> = of(false);
  lastActivityAt: Observable<null> = of(null);
  link: string = '/activities/measurements/length';

  constructor(
    private readonly translator: TranslateService,
  ) {
  }
}
