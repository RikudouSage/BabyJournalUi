import {Injectable, signal} from '@angular/core';
import {DatabaseService} from "./database.service";

@Injectable({
  providedIn: 'root'
})
export class GlobalOfflineModeService {
  public isOffline = signal(this.database.offlineMode);

  constructor(
    private readonly database: DatabaseService,
  ) {}

  public setOfflineMode(offline: boolean) {
    this.database.offlineMode = offline;
    this.isOffline.set(offline);
  }
}
