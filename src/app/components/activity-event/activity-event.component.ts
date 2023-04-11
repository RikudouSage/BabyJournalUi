import {Component, Input} from '@angular/core';
import {ActivityStreamItem} from "../../services/api.service";
import {ActivityType} from "../../enum/activity-type.enum";
import {BottleContentType} from "../../enum/bottle-content-type.enum";
import {Observable} from "rxjs";
import {TranslateService} from "@ngx-translate/core";
import {EnumToStringService} from "../../services/enum-to-string.service";
import {BreastIndex} from "../../enum/breast-index.enum";

@Component({
  selector: 'app-activity-event',
  templateUrl: './activity-event.component.html',
  styleUrls: ['./activity-event.component.scss']
})
export class ActivityEventComponent {
  @Input() activity: ActivityStreamItem;

  protected readonly ActivityType = ActivityType;
  public readonly bottleContentTypeToString = this.enumToString.bottleContentTypeToString;
  public readonly breastIndexToString = this.enumToString.breastIndexToString;

  constructor(
    private readonly translator: TranslateService,
    private readonly enumToString: EnumToStringService,
  ) {
  }

  public stringNumberToBreastIndex(string: string): BreastIndex {
    return <BreastIndex>Number(string);
  }
}
