import {Component, OnInit} from '@angular/core';
import {TitleService} from "../../../services/title.service";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {
  constructor(
    private readonly titleService: TitleService,
    private readonly translator: TranslateService,
  ) {
  }

  public async ngOnInit(): Promise<void> {
    this.titleService.title = this.translator.get('About');
  }
}
