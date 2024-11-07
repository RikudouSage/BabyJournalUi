import {Component, OnInit} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import {TitleService} from "../../../services/title.service";
import {timer} from "rxjs";
import {ActivityStreamService} from "../../../services/activity-stream.service";
import {DatabaseService} from "../../../services/database.service";
import {Router} from "@angular/router";
import {WakeLockService} from "../../../services/wake-lock.service";
import {GlobalOfflineModeService} from "../../../services/global-offline-mode.service";

@Component({
  selector: 'app-initial-loading',
  templateUrl: './full-data-refresh.component.html',
  styleUrls: ['./full-data-refresh.component.scss']
})
export class FullDataRefreshComponent implements OnInit {
  private readonly perPage = 500; // todo fetch from api

  public displayInfoMessage = false;

  public started: boolean = false;

  public running: boolean = false;
  public total: number = 0;
  public processed: number = 0;
  public processing: number = 0;
  public downloaded: number = 0;

  public max: number | null = null;

  public readonly wakeLockSupported: boolean = this.wakeLockService.isSupported();

  constructor(
    private readonly translator: TranslateService,
    private readonly titleService: TitleService,
    private readonly activityStreamService: ActivityStreamService,
    private readonly database: DatabaseService,
    private readonly router: Router,
    private readonly wakeLockService: WakeLockService,
    private readonly offlineMode: GlobalOfflineModeService,
  ) {
  }

  public async ngOnInit(): Promise<void> {
    this.titleService.title = this.translator.get('Synchronization');

    if (this.offlineMode.isOffline()) {
      await this.database.setInitialActivityStreamLoadFinished();
      await this.router.navigateByUrl('/');
      return;
    }

    this.activityStreamService.onFullSyncProgress.subscribe(progress => {
      this.running = progress.running;
      this.total = progress.total;
      this.processed = progress.currentFinished;
      this.processing = progress.currentInProgress;
      this.downloaded = progress.downloaded;
    });
  }

  public async start(pages: number | null): Promise<void> {
    await this.wakeLockService.requestWakeLock();

    this.started = true;
    this.displayInfoMessage = true;
    this.titleService.title = this.translator.get('Loading data');

    if (pages !== null) {
      this.max = pages * this.perPage;
    }

    this.activityStreamService.getFullActivityStream(pages).subscribe(async () => {
      await this.database.setInitialActivityStreamLoadFinished();
      await this.router.navigateByUrl('/');
    });

    await this.wakeLockService.release();
  }
}
