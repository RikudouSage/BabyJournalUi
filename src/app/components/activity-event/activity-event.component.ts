import {Component, Input} from '@angular/core';
import {ActivityType} from "../../enum/activity-type.enum";
import {TranslateService} from "@ngx-translate/core";
import {EnumToStringService} from "../../services/enum-to-string.service";
import {BreastIndex} from "../../enum/breast-index.enum";
import {ActivityStreamItem} from "../../services/activity-stream.service";

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

  public wetPoopyToBool(stringValue: string | null): boolean {
    return Boolean(Number(stringValue));
  }
}
