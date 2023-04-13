import {Component, OnInit} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import {TitleService} from "../../../services/title.service";
import {timer} from "rxjs";
import {ActivityStreamService} from "../../../services/activity-stream.service";
import {DatabaseService} from "../../../services/database.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-initial-loading',
  templateUrl: './full-data-refresh.component.html',
  styleUrls: ['./full-data-refresh.component.scss']
})
export class FullDataRefreshComponent implements OnInit {
  public displayInfoMessage = false;

  constructor(
    private readonly translator: TranslateService,
    private readonly titleService: TitleService,
    private readonly activityStreamService: ActivityStreamService,
    private readonly database: DatabaseService,
    private readonly router: Router,
  ) {
  }
  public async ngOnInit(): Promise<void> {
    this.titleService.title = this.translator.get('Loading data');
    timer(1_000).subscribe(() => this.displayInfoMessage = true);
    this.activityStreamService.getFullActivityStream().subscribe(async () => {
      await this.database.setInitialActivityStreamLoadFinished();
      await this.router.navigateByUrl('/');
    });
  }
}
