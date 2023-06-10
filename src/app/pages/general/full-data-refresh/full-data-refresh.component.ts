import {Component, OnInit} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import {TitleService} from "../../../services/title.service";
import {timer} from "rxjs";
import {ActivityStreamService} from "../../../services/activity-stream.service";
import {DatabaseService} from "../../../services/database.service";
import {Router} from "@angular/router";
import {WakeLockService} from "../../../services/wake-lock.service";

@Component({
  selector: 'app-initial-loading',
  templateUrl: './full-data-refresh.component.html',
  styleUrls: ['./full-data-refresh.component.scss']
})
export class FullDataRefreshComponent implements OnInit {
  public displayInfoMessage = false;

  public running: boolean = false;
  public total: number = 0;
  public processed: number = 0;

  public readonly wakeLockSupported: boolean = this.wakeLockService.isSupported();

  constructor(
    private readonly translator: TranslateService,
    private readonly titleService: TitleService,
    private readonly activityStreamService: ActivityStreamService,
    private readonly database: DatabaseService,
    private readonly router: Router,
    private readonly wakeLockService: WakeLockService,
  ) {
  }
  public async ngOnInit(): Promise<void> {
    this.titleService.title = this.translator.get('Loading data');
    timer(2_000).subscribe(() => this.displayInfoMessage = true);
    await this.wakeLockService.requestWakeLock();

    this.activityStreamService.onFullSyncProgress.subscribe(progress => {
      this.running = progress.running;
      this.total = progress.total;
      this.processed = progress.current;
    });
    this.activityStreamService.getFullActivityStream().subscribe(async () => {
      await this.database.setInitialActivityStreamLoadFinished();
      await this.router.navigateByUrl('/');
    });
  }
}
