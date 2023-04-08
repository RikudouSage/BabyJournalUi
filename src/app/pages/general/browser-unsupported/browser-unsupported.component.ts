import {Component, OnInit} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import {TitleService} from "../../../services/title.service";

@Component({
  selector: 'app-browser-unsupported',
  templateUrl: './browser-unsupported.component.html',
  styleUrls: ['./browser-unsupported.component.scss']
})
export class BrowserUnsupportedComponent implements OnInit {
  constructor(
    private readonly translator: TranslateService,
    private readonly titleService: TitleService,
  ) {
  }

  public ngOnInit(): void {
    this.titleService.title = this.translator.get('Device unsupported');
  }
}
