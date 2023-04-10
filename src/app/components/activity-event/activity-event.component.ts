import {Component, Input} from '@angular/core';
import {ActivityStreamItem} from "../../services/api.service";
import {ActivityType} from "../../enum/activity-type.enum";
import {BottleContentType} from "../../enum/bottle-content-type.enum";
import {Observable} from "rxjs";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-activity-event',
  templateUrl: './activity-event.component.html',
  styleUrls: ['./activity-event.component.scss']
})
export class ActivityEventComponent {
  @Input() activity: ActivityStreamItem;

  protected readonly ActivityType = ActivityType;

  constructor(
    private readonly translator: TranslateService,
  ) {
  }

  public bottleContentTypeToString(foodType: BottleContentType): Observable<string> {
    switch (foodType) {
      case BottleContentType.BreastMilk:
        return this.translator.get('breast milk');
      case BottleContentType.Formula:
        return this.translator.get('formula');
      case BottleContentType.Water:
        return this.translator.get('water');
    }
  }
}
