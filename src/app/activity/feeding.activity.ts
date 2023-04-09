import {Activity} from "./activity";
import {Injectable} from "@angular/core";
import {TranslateService} from "@ngx-translate/core";
import {from, interval, switchMap} from "rxjs";
import {DatabaseService} from "../services/database.service";
import {map} from "rxjs/operators";
import {ActivityType} from "../enum/activity-type.enum";

@Injectable({
  providedIn: 'root',
})
export class FeedingActivity implements Activity {

  color = '#f48fb1';
  displayName = this.translator.get('Feeding');
  link = '/activities/feeding';
  // isRunning = from(this.database.getInProgress(ActivityType.Feeding)).pipe(
  //   map(value => value !== null),
  // );
  isRunning = interval(1_000).pipe(
    switchMap(() => from(this.database.getInProgress(ActivityType.Feeding))),
    map(value => value !== null),
  );

  constructor(
    private readonly translator: TranslateService,
    private readonly database: DatabaseService,
  ) {
  }
}
