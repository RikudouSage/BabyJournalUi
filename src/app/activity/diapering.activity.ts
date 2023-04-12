import {Activity, getDefaultLastActivityAt} from "./activity";
import {TranslateService} from "@ngx-translate/core";
import {Injectable} from "@angular/core";
import {Observable, of} from "rxjs";
import {ApiService} from "../services/api.service";
import {ActivityType} from "../enum/activity-type.enum";

@Injectable({
  providedIn: 'root',
})
export class DiaperingActivity implements Activity {

  color = '#d500f9';
  displayName = this.translator.get('Diapering');
  link = '/activities/diapering';
  isRunning = of(false);
  // lastActivityAt: Observable<Date | null> = getDefaultLastActivityAt(this.api.getActivityStream(), [ActivityType.Diapering]);
  lastActivityAt = of(null);

  constructor(
    private readonly translator: TranslateService,
    private readonly api: ApiService,
  ) {
  }

}
