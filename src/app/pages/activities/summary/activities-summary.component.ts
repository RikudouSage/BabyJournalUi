import {Component, OnInit} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import {TitleService} from "../../../services/title.service";

@Component({
  selector: 'app-summary',
  templateUrl: './activities-summary.component.html',
  styleUrls: ['./activities-summary.component.scss']
})
export class ActivitiesSummaryComponent implements OnInit {
  constructor(
    private readonly translator: TranslateService,
    private readonly titleService: TitleService,
  ) {
  }

  public async ngOnInit(): Promise<void> {
    this.titleService.title = this.translator.get('Activities summary');
  }

}
