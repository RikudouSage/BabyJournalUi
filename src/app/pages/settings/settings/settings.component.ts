import {Component, OnInit} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import {TitleService} from "../../../services/title.service";

@Component({
  selector: 'app-general',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  constructor(
    private readonly translator: TranslateService,
    private readonly titleService: TitleService,
  ) {
  }

  ngOnInit(): void {
    this.titleService.title = this.translator.get('Settings');
  }

}
