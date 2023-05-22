import {Component, OnInit} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import {TitleService} from "../../../services/title.service";

@Component({
  selector: 'app-chatgpt-legal',
  templateUrl: './chatgpt-legal.component.html',
  styleUrls: ['./chatgpt-legal.component.scss']
})
export class ChatgptLegalComponent implements OnInit {
  constructor(
    private readonly translator: TranslateService,
    private readonly titleService: TitleService,
  ) {
  }
  public async ngOnInit(): Promise<void> {
    this.titleService.title = this.translator.get('ChatGPT plugin')
  }
}
