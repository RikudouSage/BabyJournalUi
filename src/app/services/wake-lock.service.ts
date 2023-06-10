import {Injectable} from '@angular/core';

interface WakeLockSentinel {
  released: boolean;
  type: 'screen';
  release(): Promise<undefined>;
}

@Injectable({
  providedIn: 'root'
})
export class WakeLockService {

  private wakeLock: WakeLockSentinel | null = null;
  private enabled: boolean = false;

  constructor() { }

  public isSupported(): boolean {
    return typeof (<any>navigator).wakeLock !== 'undefined';
  }

  public async requestWakeLock(): Promise<void> {
    if (!this.isSupported()) {
      return;
    }

    this.enabled = true;

    if (this.wakeLock !== null && !this.wakeLock.released) {
      return;
    }

    this.wakeLock = await (<any>navigator).wakeLock.request('screen');
  }

  public async release(): Promise<void> {
    this.enabled = false;
    await this.wakeLock?.release();
  }
}
