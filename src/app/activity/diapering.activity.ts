import {Activity} from "./activity";
import {TranslateService} from "@ngx-translate/core";
import {Injectable} from "@angular/core";
import {Observable, of} from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class DiaperingActivity implements Activity {

  readonly color = '#d500f9';
  readonly displayName = this.translator.get('Diapering');
  readonly link = '';
  readonly isRunning = of(false);
  readonly lastActivityAt: Observable<Date | null> = of(null);

  constructor(
    private readonly translator: TranslateService,
  ) {
  }

}
