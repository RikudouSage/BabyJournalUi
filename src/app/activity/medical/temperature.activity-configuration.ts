import {ActivityConfiguration} from "../activity-configuration";
import {Injectable} from "@angular/core";
import {Observable, of} from "rxjs";
import {TranslateService} from "@ngx-translate/core";

@Injectable({
  providedIn: 'root'
})
export class TemperatureActivityConfiguration implements ActivityConfiguration {
  color: string = '#d32f2f';
  displayName: Observable<string> = this.translator.get('Temperature');
  isRunning: Observable<boolean> = of(false);
  lastActivityAt: Observable<null> = of(null);
  link: string = '/activities/health/temperature';

  constructor(
    private readonly translator: TranslateService,
  ) {
  }
}
