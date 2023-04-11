import {Activity} from "./activity";
import {Injectable} from "@angular/core";
import {TranslateService} from "@ngx-translate/core";
import {Observable, of} from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class LeisureActivity implements Activity {
  readonly color = '#00bcd4';
  readonly displayName = this.translator.get('Leisure');
  readonly link = '';
  readonly isRunning = of(false);
  readonly lastActivityAt: Observable<Date | null> = of(null);

  constructor(
    private readonly translator: TranslateService,
  ) {
  }
}
