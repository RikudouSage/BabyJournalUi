import {ActivityConfiguration} from "../activity-configuration";
import {AsyncValue} from "../../types/async-value";
import {Injectable} from "@angular/core";
import {TranslateService} from "@ngx-translate/core";
import {of} from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class MilestonesActivityConfiguration implements ActivityConfiguration {
  color: string = '#c2185b';
  displayName: AsyncValue<string> = this.translator.get('Milestones');
  isRunning: AsyncValue<boolean> = of(false);
  lastActivityAt: AsyncValue<Date | null> = of(null);
  link: string = '/activities/milestones';

  constructor(
    private readonly translator: TranslateService,
  ) {
  }
}
