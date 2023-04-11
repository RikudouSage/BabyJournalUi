import {Component, EventEmitter, HostListener, Input, OnInit, Output} from '@angular/core';
import {interval, Observable, Subscription} from "rxjs";
import {BreakpointObserver, Breakpoints} from "@angular/cdk/layout";
import {map, shareReplay} from "rxjs/operators";

export interface TrackingPausedEvent {
  elapsed: number;
}

interface WakeLockSentinel {
  released: boolean;
  type: 'screen';
  release(): Promise<undefined>;
}

export interface TrackerOutputData {
  startTime: Date;
  endTime: Date;
  elapsed: number;
  elapsedPaused: number;
}
@Component({
  selector: 'app-tracker',
  templateUrl: './tracker.component.html',
  styleUrls: ['./tracker.component.scss']
})
export class TrackerComponent implements OnInit {

  private wakeLock: WakeLockSentinel | null = null;

  private _startTime: Date | null = null;
  private _endTime: Date | null = null;
  private _finished = new EventEmitter<TrackerOutputData>();
  private _started = new EventEmitter<Date>();
  private _paused = new EventEmitter<TrackingPausedEvent>();
  private _startDateChanged = new EventEmitter<Date>();
  private _isPaused = false;

  private subscriptions: {
    tracking?: Subscription,
    paused?: Subscription,
  } = {
  }

  private initialized = true;

  public tracking = false;
  @Input() public elapsed = 0;
  @Input() public elapsedPaused = 0;

  public isHandset: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay(),
    );

  @Output() public get finished(): Observable<TrackerOutputData> {
    return this._finished;
  }
  @Output() public get started(): Observable<Date> {
    return this._started;
  }
  @Output() public get paused(): Observable<TrackingPausedEvent> {
    return this._paused;
  }
  @Output() public get startDateChanged(): Observable<Date> {
    return this._startDateChanged;
  }

  @Input() set startTime(time: Date | null) {
    if (time === this._startTime) {
      return;
    }
    this._startTime = time;
    if (time !== null && this.initialized) {
      this.elapsedPaused = 0;
      this.elapsed = Math.floor(((this.endTime ?? new Date()).getTime() - time.getTime()) / 1_000);
      if (!this.tracking && this.endTime === null) {
        this.startTracking();
      }
      if (this.endTime !== null) {
        this.finishTracking();
      }
    }
  }
  get startTime(): Date | null {
    return this._startTime;
  }

  @Input() set endTime(time: Date | null) {
    if (time === this._endTime) {
      return;
    }
    this._endTime = time;
    if (time !== null && this.initialized) {
      this.elapsedPaused = 0;
      if (this.tracking || this.startTime !== null) {
        this.finishTracking();
      }
      if (this.startTime !== null) {
        this.elapsed = Math.floor((time.getTime() - this.startTime.getTime()) / 1_000);
      }
    }
  }

  get endTime(): Date | null {
    return this._endTime;
  }

  @Input() set isPaused(isPaused: boolean) {
    this._isPaused = isPaused;

    if (!this.initialized) {
      return;
    }

    if (this._isPaused) {
      this.subscriptions.tracking?.unsubscribe();
      this.subscriptions.paused = interval(1_000).subscribe(() => {
        this.elapsedPaused += 1;
      });
      this._paused.next({
        elapsed: this.elapsed,
      });
    } else {
      this.subscriptions.paused?.unsubscribe();
      if (this.tracking) {
        this.startTracking();
      }
    }
  }

  get isPaused(): boolean {
    return this._isPaused;
  }

  constructor(
    private readonly breakpointObserver: BreakpointObserver,
  ) {
  }

  public async ngOnInit() {
  }

  public async startTracking(reset: boolean = false): Promise<void> {
    if (reset) {
      this._startTime = new Date();
      this._endTime = null;
      this.elapsed = 0;
      this.elapsedPaused = 0;
      this._started.next(this._startTime);
    }
    this.tracking = true;
    this.subscriptions.tracking?.unsubscribe();
    this.subscriptions.tracking = interval(1_000).subscribe(() => {
      this.elapsed += 1;
    });
    await this.requestWakeLock();
  }

  public async finishTracking() {
    this.initialized = false;
    if (this.endTime === null) {
      this.endTime = new Date();
    }
    if (this.startTime === null) {
      throw new Error("Start time cannot be null when finishing");
    }
    const result: TrackerOutputData = {
      startTime: this.startTime,
      endTime: this.endTime,
      elapsed: this.elapsed,
      elapsedPaused: this.elapsedPaused,
    }

    this.tracking = false;
    this._isPaused = false;
    this.subscriptions.paused?.unsubscribe();
    this.subscriptions.tracking?.unsubscribe();
    await this.wakeLock?.release();

    this._finished.next(result);
    this.initialized = true;
  }

  public async startTimeSelected(date: Date) {
    this.startTime = date;
    this._startDateChanged.next(date);
  }

  private async requestWakeLock(): Promise<void> {
    if (typeof (<any>navigator).wakeLock === 'undefined') {
      return;
    }
    if (this.wakeLock !== null && !this.wakeLock.released) {
      return;
    }
    this.wakeLock = await (<any>navigator).wakeLock.request('screen');
  }

  @HostListener('window:visibilitychange')
  public async onVisibilityChange(): Promise<void> {
    if (this.tracking && document.visibilityState === 'visible') {
      await this.requestWakeLock();
    }
  }
}
